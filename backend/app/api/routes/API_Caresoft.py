from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI
from apscheduler.schedulers.background import BackgroundScheduler
import requests

router = APIRouter(prefix="/api_caresoft", tags=["api_caresoft"])
scheduler = BackgroundScheduler()


@router.get("/test")
async def test():
	return {"test": "test"}


@router.post("/Add_data")
async def add_data(data: dict):
	return {"data": data}


@asynccontextmanager
async def lifespan(app: FastAPI):
	# Startup
	scheduler.add_job(call_api, "cron", hour=3, minute=0)
	scheduler.start()
	yield
	# Shutdown
	scheduler.shutdown()


def call_api():
	url = "https://api.example.com/data"
	response = requests.get(url)
	if response.status_code == 200:
		print("API Data:", response.json())
	else:
		print("Failed to call API")
