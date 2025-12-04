from contextlib import asynccontextmanager

import pytz
from tqdm import tqdm

from apscheduler.triggers.cron import CronTrigger
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import APIRouter, FastAPI, Depends
from pytz import timezone

from ...core.SqlServerPA import *

import os
import json
import logging
from dataclasses import asdict
from dotenv import load_dotenv
from ...model.Caresoft import *
import asyncio
import httpx

router = APIRouter(prefix="/caresoft", tags=["caresoft"])
scheduler = AsyncIOScheduler(timezone=timezone("Asia/Ho_Chi_Minh"))
load_dotenv()
API_CS_URL = os.getenv("CARESOFT_API_URL")
API_CS_TOKEN = os.getenv("CARESOFT_API_TOKEN")
API_KH_MAKE = os.getenv("CARESOFT_KH_MAKE")
API_KH_CHECK = os.getenv("CARESOFT_KH_CHECK")

logging.basicConfig(
    filename="caresoft_error.log",
    level=logging.ERROR,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


@router.get("/test")
async def test_caresoft():
    return count_ticket(next(get_db()))


async def do_something():
    print("Already doing something")
    await asyncio.gather(
        call_api("kscl_banhang"),
        call_api("kscl_baohanh")
    )


async def bao_nhan_bh():
    print(f"bao nhan BH luc: {datetime.now()}")
    await asyncio.gather(
        call_api("baohanh"),
        call_api("kscl_banhang"),
        call_api("kscl_baohanh")
    )


# scheduler
@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        bao_nhan_bh,
        IntervalTrigger(hours=1),
        next_run_time=datetime.now()
    )

    # scheduler.add_job(
    # 	do_something,
    # 	CronTrigger(hour=7, minute=0, timezone=pytz.timezone("Asia/Ho_Chi_Minh"))
    # )

    scheduler.start()
    yield
    scheduler.shutdown()


async def call_api(kind: str, loop: bool = False):
    print(f"[DEBUG] call_api for {kind} run at: {datetime.now()}", flush=True)
    BATCH_SIZE = 10
    tickets = []
    db = next(get_db())
    done = []
    zns = []
    success_count = 0
    fail_count = 0
    try:
        if kind == "baohanh":
            tickets = get_all_ticket(db, sent=0, limit=None)
        elif kind == "kscl_banhang":
            tickets = make_rate_ticket(db, sent=0, limit=None)
        elif kind == "kscl_baohanh":
            tickets = make_kscl_saubh(db, sent=0, limit=None)
            tickets = list({ticket.custom_fields[0].value: ticket for ticket in tickets}.values())
        else:
            tickets = []

        for i in range(0, len(tickets), BATCH_SIZE):
            batch = tickets[i:i + BATCH_SIZE]
            # wrap make_ticket với semaphore để giới hạn concurrency
            semaphore = asyncio.Semaphore(BATCH_SIZE)

            async def limited_make_ticket(ticket):
                async with semaphore:
                    exists = await check_user(str(ticket.phone))
                    if not exists:
                        created = await create_user(ticket)
                        if not created:
                            return ticket, {"error": "User creation failed"}, False
                        ticket.requester_id = created
                    else:
                        ticket.requester_id = exists.get("id")

                        user = next((cf.value for cf in ticket.custom_fields if str(cf.id) == "10657"), None)
                        username_diff = (user != exists.get("username"))
                        phone_diff = (ticket.phone != exists.get("phone_no"))

                        if (username_diff or phone_diff) and ticket.phone != "0989313229":
                            if phone_diff:
                                deleted = await update_user(id=str(exists.get("id")), name=user, delphone=True)

                                if not deleted:
                                    return ticket, {"error": "User deletion!!! failed"}, False

                            update = await update_user(id=str(exists.get("id")), name=user, data=exists, phone=ticket.phone)

                            if not update:
                                return ticket, {"error": "User update failed"}, False

                    resp, ok = await make_ticket(ticket)
                    return ticket, resp, ok

            tasks = [limited_make_ticket(t) for t in batch]
            for f in tqdm(asyncio.as_completed(tasks), total=len(tasks),
                          desc=f"Processing batch {i // BATCH_SIZE + 1}"):
                try:
                    ticket, resp, ok = await f
                    if ok:
                        done.append(ticket.custom_fields[0].value)
                        zns.append(ticket.custom_fields[1].value)
                        print(f"[SUCCESS] {ticket.custom_fields[0].value}")
                        success_count += 1
                    else:
                        print(f"[FAILED] {ticket.custom_fields[0].value}: {resp}")
                        logging.error(f"Ticket failed: {ticket.custom_fields[0].value} | {resp}")
                        fail_count += 1
                except Exception as e:
                    print(f"[DEBUG] fail in tqdm: {e}")
                    fail_count += 1

        print(f"[SUMMARY] {success_count} ticket(s) of {kind} created successfully, {fail_count} failed.")

        if done:
            if kind == "baohanh":
                way = update_ticket(db, so_phieus=done)
                if way is False:
                    logging.error("Update ticket failed for so_phieus: %s", done)

            elif kind == "kscl_banhang":
                way = ud_rate_ticket(db, so_don_hangs=done)
                if way is False:
                    logging.error("Update ticket failed for so_don_hangs: %s", done)
                check_ZNS(db, done, zns, kind)
            elif kind == "kscl_baohanh":
                way = update_saubh(db, bh=done)
                if way is False:
                    logging.error("Update ticket failed for so_don_hangs: %s", done)
                check_ZNS(db, done, zns, kind)
            else:
                pass

        if fail_count > 0:
            if not loop:
                print("Do again !", flush=True)
                await call_api(kind, True)

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logging.error("Error processing tickets for kind '%s': %s\nTraceback:\n%s", kind, str(e), error_details)
        print(f"[DEBUG] Exception in call_api {kind}: {e}\n{error_details}\n", flush=True)

    finally:
        db.close()
        return {"ticket": tickets}


async def make_ticket(data):
    if not API_CS_URL or not API_CS_TOKEN:
        raise ValueError("API URL or Token not found in .env")

    headers = {
        "Authorization": f"Bearer {API_CS_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        payload = json.dumps({"ticket": asdict(data)}, ensure_ascii=False, default=str)

        async with httpx.AsyncClient() as client:
            response = await client.post(API_CS_URL, headers=headers, data=payload)
        response.raise_for_status()
        result = response.json()
        # print("[DEBUG] API payload:", payload, flush=True)

        if result.get("code") != "ok":
            logging.error("Ticket create failed | Response: %s | Payload: %s", result, payload)
            return result, False  # thêm status False
        else:
            print("[DEBUG] Ticket created: " + data.custom_fields[0].value)
            return result, True  # thêm status True

    except httpx.HTTPStatusError as e:
        error_text = e.response.text if e.response else "No response body"
        print(f"[DEBUG] HTTP error ({e.response.status_code}): {error_text}", flush=True)
        logging.error("HTTP error %s | Response: %s | Payload: %s\n", e.response.status_code, error_text, payload)

        return {"error": error_text}, False

    except httpx.RequestError as e:
        logging.error("Request error: %s | Payload: %s", e, payload)
        print(f"[DEBUG] Request failed: {e} \n", flush=True)
        return {"error": str(e)}, False


async def create_user(data: Ticket):
    if not API_KH_MAKE or not API_CS_TOKEN:
        raise ValueError("API URL or Token not found in .env")

    headers = {
        "Authorization": f"Bearer {API_CS_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        cf_10657 = next(
            (cf.value for cf in data.custom_fields if str(cf.id) == "10657"),
            None
        )

        payload = json.dumps({
            "contact": {
                "phone_no": str(data.phone),
                "username": cf_10657
            }
        }, ensure_ascii=False, default=str)

        print(payload)

        async with httpx.AsyncClient() as client:
            response = await client.post(API_KH_MAKE, headers=headers, data=payload)

        response.raise_for_status()
        result = response.json()

        if result.get("code") != "ok":
            if result.get("message") == "phone_no already exist":
                return
            error_message = result.get("message", "Unknown error")
            logging.error("User create failed | Code: %s | Message: %s | Response: %s | Payload: %s",
                          result.get("code"), error_message, result, payload)
            print(
                f"[DEBUG] User create failed | Code: {result.get('code')} | Message: {error_message} | Payload: {payload}",
                flush=True)
            return False
        else:
            contact_id = result.get("contact", {}).get("id")
            print("[DEBUG] Successfully Created user id:", contact_id, flush=True)
            return contact_id

    except httpx.RequestError as e:
        logging.error("Request error: %s | Payload: %s", e, payload)
        print("[DEBUG] create user failed:", e, flush=True)
        return False


async def check_user(phone: str):
    if not API_KH_CHECK or not API_CS_TOKEN:
        raise ValueError("API URL or Token not found in .env")

    headers = {
        "Authorization": f"Bearer {API_CS_TOKEN}",
        "Accept": "application/json"
    }

    try:
        url = f"{API_KH_CHECK}?phoneNo={phone}"
        print("[DEBUG] Request URL:", url, flush=True)
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
        # print(f"Response: {response}")

        result = response.json()

        if response.status_code == 200 and result.get("code") == "ok":
            return result.get("contact")
        elif response.status_code == 400 and result.get("message") == "Not found user":
            return False
        else:
            logging.error("Unexpected response: %s", result)
            return False

    except httpx.RequestError as e:
        print("[DEBUG] check failed:", e, flush=True)

        return False


async def update_user(id: str, name: str, data=None, phone: str = None, delphone: bool = False):
    headers = {
        "Authorization": f"Bearer {API_CS_TOKEN}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    if delphone:
        payload = {
            "contact": {
                "username": name,
                "phone_no": None,
                "phone_no2": None,
                "phone_no3": None
            }
        }
    else:
        if data and phone and data.get("phone_no") != phone:
            print("""################################################
            UPDATE
            ################################################""")
            payload = {
                "contact": {
                    "username": name,
                    "phone_no": phone,
                    "phone_no2": data.get("phone_no") if data.get("phone_no2") == phone else data.get("phone_no2"),
                    "phone_no3": data.get("phone_no3") if data.get("phone_no2") == phone else data.get("phone_no")
                }
            }
            print(payload)
        else:
            payload = {
                "contact": {
                    "username": name
                }
            }

    try:
        url = f"{API_KH_MAKE.rstrip('/')}/{id}"
        async with httpx.AsyncClient() as client:
            response = await client.put(url, headers=headers, json=payload)

        result = response.json()
        if response.status_code == 200 and result.get("code") == "ok":
            return True

        elif response.status_code == 400 and result.get("message") == "Not found user":
            print("not found user", result, flush=True)
            return False
        else:
            logging.error("Unexpected response: %s", result)
            print("Unexpected response: ", result, flush=True)
            return False

    except httpx.RequestError as e:
        print("[DEBUG] check failed:", e, flush=True)
        return {"error": str(e)}, False
