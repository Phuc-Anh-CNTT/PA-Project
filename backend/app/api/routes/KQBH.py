from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from math import ceil
from fastapi import Body, HTTPException
from sqlalchemy.orm import Session
from app.core.SqlServerPA import *
from app.model.Phieubh import *
from fastapi import Form

from backend.app.model.Phieubh import get_kqbh_by_id, get_kqbh_by_sdt

router = APIRouter(prefix="/kqbh", tags=["kqbh"])


@router.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    data = get_kqbh_by_id(db, "WN25-005000", limit=5)
    return data


@router.post("/get-kqbh-by-key")
def get_kqbh_by_key(req: dict = Body(...), db: Session = Depends(get_db)):
    try:
        keyword: str = req.get("keyword")
        limit: int = req.get("limit", 20)

        if not keyword or not isinstance(keyword, str):
            raise HTTPException(status_code=400, detail="keyword không hợp lệ")

        if '-' in keyword:
            data = get_kqbh_by_id(db, keyword, limit=limit)
            kind = "id"
        else:
            data = get_kqbh_by_sdt(db, keyword, limit=limit)
            kind = "phone"

        # Xử lý mask serial và sdt
        for d in data:
            if "serial" in d and d["serial"]:
                d["serial"] = mask_half(d["serial"])
            if "sdt" in d and d["sdt"]:
                d["sdt"] = mask_half(d["sdt"])

        return {"kind": kind, "data": data}

    except HTTPException as he:
        raise he  # Bắt HTTPException để trả đúng status code
    except Exception as e:
        print("Lỗi khi xử lý get-kqbh-by-key:", e)
        raise HTTPException(status_code=500, detail="Lỗi server nội bộ")


# Schema để nhận dữ liệu từ POST body
class SearchRequest(BaseModel):
    phoneNumber: Optional[str] = None
    sophieunhan: Optional[str] = None


@router.get("/search1")
async def search_kqbh():
    return {
        "message": "Search OK",
        }


@router.post("/search")
def kqbh_search(request: SearchRequest):
    # Ở đây bạn có thể query DB, tạm mock
    mock_data = [
        {"id": 1, "sophieunhan": "SP001", "customerName": "Nguyễn Văn A", "phoneNumber": "0901234567"},
        {"id": 2, "sophieunhan": "SP002", "customerName": "Trần Thị B", "phoneNumber": "0912345678"},
    ]

    # Nếu có phoneNumber thì lọc theo phoneNumber
    if request.phoneNumber:
        results = [x for x in mock_data if x["phoneNumber"] == request.phoneNumber]
    # Nếu có số phiếu thì lọc theo sophieunhan
    elif request.sophieunhan:
        results = [x for x in mock_data if x["sophieunhan"] == request.sophieunhan]
    else:
        results = mock_data

    if not results:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin")

    return {"results": results}


def mask_half(value: str) -> str:
    if not value:
        return value
    n = len(value)
    half = ceil(n / 2)
    return "*" * half + value[half:]

