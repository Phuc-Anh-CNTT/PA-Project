from math import ceil
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi import Body, HTTPException
from pydantic import BaseModel

from ...core.SqlServerPA import *
from ...model.Phieubh import *

router = APIRouter(prefix="/kqbh", tags=["kqbh"])


@router.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    data = get_phieu_by_id(db, "WN25-005913", limit=5)
    return data


@router.post("/get-kqbh-by-key")
def get_kqbh_by_key(req: dict = Body(...), db: Session = Depends(get_db)):
    try:
        keyword: str = req.get("keyword")
        limit: int = req.get("limit", 20)

        if not keyword or not isinstance(keyword, str):
            raise HTTPException(status_code=400, detail="keyword không hợp lệ")

        if '-' in keyword:
            data = get_phieu_by_id(db, keyword, limit=limit)
            kind = "id"
        else:
            data = get_phieu_by_sdt_grouped(db, keyword, limit=limit)
            kind = "phone"

        # Xử lý mask serial và sdt
        if data is None:
            data = []
        else:
            for d in data:
                if d.serial and d.serial is not None:
                    d.serial = mask_half(d.serial)
                if d.phone:
                    d.phone = mask_half(d.phone)

            data = sorted(
                data,
                key=lambda x: normalize_date(x.taken_date) or normalize_date(x.done_date),
                reverse=True
            )

        return {"kind": kind, "data": data}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


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


def get_phieu_by_sdt_grouped(db: Session, sdt: str, limit: int = 50) -> List[Phieu]:
    raw_result = get_phieu_by_sdt(db, sdt, limit)

    grouped = {}
    for phieu in raw_result:
        key = phieu.phieu_nhan
        if key not in grouped:
            grouped[key] = phieu
        else:
            # Nếu đã có phiếu này, update trạng thái theo quy tắc
            if phieu.status == "Done":
                grouped[key].status = "Done"
            # Tăng amount
            # grouped[key].amount += phieu.amount

    return list(grouped.values())
