from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI, Depends

from ...core.SqlServerPA import *
from apscheduler.schedulers.background import BackgroundScheduler

import os
import json
import requests
from dataclasses import asdict
from dotenv import load_dotenv
from ...model.Caresoft import *

router = APIRouter(prefix="/caresoft", tags=["caresoft"])
scheduler = BackgroundScheduler()
load_dotenv()
API_CS = os.getenv("caresoft_API")


@router.get("/test")
async def test():
	return {"test": "test"}


@router.get("/Add_caresoft_ticket")
async def add_data(db: Session = Depends(get_db)):
	data = get_all_ticket(db)

	return data


@asynccontextmanager
async def lifespan(app: FastAPI):
	# Startup
	# scheduler.add_job(call_api, "cron", hour=3, minute=0)
	scheduler.start()
	yield
	# Shutdown
	scheduler.shutdown()


def make_ticket(data: Ticket):
	if not API_CS:
		raise ValueError("API token (caresoft_API) not found in .env")

	headers = {
		"Authorization": f"Bearer {API_CS}",
		"Content-Type": "application/json"
	}
	payload = json.dumps(asdict(data), ensure_ascii=False)
	try:
		response = requests.post(API_CS, headers=headers, data=payload)
		response.raise_for_status()
	except requests.exceptions.RequestException as e:
		raise Exception(f"Failed to send request to caresoft API: {e}")
	return response.json()
