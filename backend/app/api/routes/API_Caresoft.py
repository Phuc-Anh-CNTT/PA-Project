from contextlib import asynccontextmanager
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
from datetime import datetime
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


@router.get("/test_caresoft")
async def test_caresoft():
	return await call_api("kscl_banhang")


async def do_something():
	await asyncio.gather(
		call_api("baohanh"),
		call_api("kscl_banhang"),
		call_api("kscl_baohanh")
	)


# scheduler
@asynccontextmanager
async def lifespan(app: FastAPI):
	scheduler.add_job(
		do_something,
		IntervalTrigger(hours=1),
		next_run_time=datetime.now()
	)
	scheduler.start()
	yield
	scheduler.shutdown()


async def call_api(kind: str):
	print(f"[DEBUG] call_api run at: {datetime.now()}", flush=True)
	BATCH_SIZE = 10
	tickets = []
	db = next(get_db())
	done = []
	try:
		if kind == "baohanh":
			tickets = get_all_ticket(db, sent=0, limit=None)
		elif kind == "kscl_banhang":
			tickets = make_rate_ticket(db, sent=0, limit=5)
		elif kind == "kscl_baohanh":
			tickets = make_kscl_saubh(db, sent=0, limit=5)
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
							return {"error": "User creation failed"}, False
						else:
							ticket.requester_id = created
					else:
						ticket.requester_id = exists.get("id")
						user = next((cf.value for cf in ticket.custom_fields if str(cf.id) == "10657"), None)

						if user != exists.get("username ") and ticket.phone != '0989313229':
							update = await update_user(str(exists.get("id")), user)
							if not update:
								return {"error": "User update failed"}, False

					return await make_ticket(ticket)

			tasks = [limited_make_ticket(t) for t in batch]

			# Chạy batch song song
			results = []
			for f in tqdm(asyncio.as_completed(tasks), total=len(tasks),
						  desc=f"Processing batch {i // BATCH_SIZE + 1}"):
				resp, status = await f
				results.append((resp, status))

			for (resp, status), t in zip(results, batch):
				if status:
					done.append(t.custom_fields[0].value)
				else:
					print(status, resp, t.custom_fields[0].value)

		# Update ticket Thanh cong
		if done:
			if kind == "baohanh":
				way = update_ticket(db, so_phieus=done)
				if way is False:
					logging.error("Update ticket failed for so_phieus: %s", done)

			elif kind == "kscl_banhang":
				way = ud_rate_ticket(db, so_don_hangs=done)
				if way is False:
					logging.error("Update ticket failed for so_don_hangs: %s", done)
			elif kind == "kscl_baohanh":
				way = update_saubh(db, bh=done)
				if way is False:
					logging.error("Update ticket failed for so_don_hangs: %s", done)

			else:
				pass

	except Exception as e:
		logging.error("Error processing tickets: %s", e)
		print(f"[DEBUG] Exception in call_api: {e}", flush=True)

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
		# print("[DEBUG] API response:", result)

		if result.get("code") != "ok":
			logging.error("Ticket create failed | Response: %s | Payload: %s", result, payload)
			return result, False  # thêm status False
		else:
			return result, True  # thêm status True

	except httpx.HTTPStatusError as e:
		error_text = e.response.text if e.response else "No response body"
		print(f"[DEBUG] HTTP error ({e.response.status_code}): {error_text}", flush=True)
		logging.error("HTTP error %s | Response: %s | Payload: %s", e.response.status_code, error_text, payload)

		return {"error": error_text}, False

	except httpx.RequestError as e:
		logging.error("Request error: %s | Payload: %s", e, payload)
		print(f"[DEBUG] Request failed: {e}", flush=True)
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

		async with httpx.AsyncClient() as client:
			response = await client.post(API_KH_MAKE, headers=headers, data=payload)

		response.raise_for_status()
		result = response.json()

		if result.get("code") != "ok":
			logging.error("User create failed | Response: %s | Payload: %s", result, payload)
			return False
		else:
			contact_id = result.get("contact", {}).get("id")
			print("[DEBUG] Created user id:", contact_id, flush=True)
			return contact_id

	except httpx.RequestError as e:
		logging.error("Request error: %s | Payload: %s", e, payload)
		print("[DEBUG] make failed:", e, flush=True)
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


async def update_user(id: str, name: str):
	headers = {
		"Authorization": f"Bearer {API_CS_TOKEN}",
		"Accept": "application/json",
		"Content-Type": "application/json"
	}

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
			return False
		else:
			logging.error("Unexpected response: %s", result)
			return False

	except httpx.RequestError as e:
		print("[DEBUG] check failed:", e, flush=True)
		return {"error": str(e)}, False
