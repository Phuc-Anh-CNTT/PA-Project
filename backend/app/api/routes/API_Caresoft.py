from contextlib import asynccontextmanager
from tqdm import tqdm

from apscheduler.triggers.cron import CronTrigger
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import APIRouter, FastAPI, Depends
from pytz import timezone

from ...core.SqlServerPA import *
from apscheduler.schedulers.background import BackgroundScheduler

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

logging.basicConfig(
	filename="caresoft_error.log",
	level=logging.ERROR,
	format="%(asctime)s - %(levelname)s - %(message)s"
)


@router.get("/test")
async def test():
	return {"test": "test"}


@router.get("/test_caresoft")
async def test_caresoft():
	return await call_api_from_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
	scheduler.add_job(
		call_api_from_db,
		CronTrigger(hour=7, minute=30)
	)
	scheduler.start()
	yield
	scheduler.shutdown()


async def call_api_from_db():
	print("Chay r ne", flush=True)
	BATCH_SIZE = 10
	tickets = []
	db = next(get_db())
	done = []
	try:
		tickets = get_all_ticket(db, sent=0)

		# Chia tickets thành batch 10
		for i in range(0, len(tickets), BATCH_SIZE):
			batch = tickets[i:i + BATCH_SIZE]

			# wrap make_ticket với semaphore để giới hạn concurrency
			semaphore = asyncio.Semaphore(BATCH_SIZE)

			async def limited_make_ticket(ticket):
				async with semaphore:
					return await make_ticket(ticket)

			tasks = [limited_make_ticket(t) for t in batch]

			# Chạy batch song song
			results = []
			for f in tqdm(asyncio.as_completed(tasks), total=len(tasks),
						  desc=f"Processing batch {i // BATCH_SIZE + 1}"):
				resp, status = await f
				results.append((resp, status))

			# Xử lý kết quả batch
			for (resp, status), t in zip(results, batch):
				if status:
					done.append(t.custom_fields[7].value)

		# Update ticket cuối cùng
		if done:
			way = update_ticket(db, so_phieus=done)
			if way is False:
				logging.error("Update ticket failed for so_phieus: %s", done)

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

	except httpx.RequestError as e:
		logging.error("Request error: %s | Payload: %s", e, payload)
		print("[DEBUG] asdict failed:", e, flush=True)
		return {"error": str(e)}, False
