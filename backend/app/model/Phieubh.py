from sqlalchemy import func, or_, Column, Integer, String, DateTime, Table, select
from app.core.SqlServerPA import engine, Base
from sqlalchemy.orm import Session
from typing import List, Dict, Any


class PhieuBH(Base):
    __tablename__ = "tra_hang_bh"
    __table_args__ = {"autoload_with": engine}


def get_kqbh_by_id(db: Session, so_phieu_nhan: str, limit: int = 50) -> List[Dict[str, Any]]:
    rows = (
        db.query(
            PhieuBH.id,
            PhieuBH.so_phieu_nhan,
            PhieuBH.ten_khach,
            PhieuBH.serial_nhan,
            PhieuBH.ten_hang_nhan,
            PhieuBH.sdt,
            PhieuBH.mo_ta_loi_luc_tiep_nhan,
            PhieuBH.ngay_nhan,
            PhieuBH.ngay_hen_tra,
            PhieuBH.ngay_tra,
        )
        .filter(PhieuBH.so_phieu_nhan.like(f"%{so_phieu_nhan}%"))
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "so_phieu_nhan": r.so_phieu_nhan,
            "ten_khach": r.ten_khach,
            "serial": r.serial_nhan,
            "product": r.ten_hang_nhan,
            "sdt": r.sdt,
            "mo_ta_loi_luc_tiep_nhan": r.mo_ta_loi_luc_tiep_nhan,
            "ngay_nhan": r.ngay_nhan,
            "ngay_hen_tra": r.ngay_hen_tra,
            "ngay_tra": r.ngay_tra,
        }
        for r in rows
    ]


def get_kqbh_by_sdt(db: Session, sdt: str, limit: int = 50) -> List[Dict[str, Any]]:
    # Subquery: group theo so_phieu_nhan, đếm số lượng
    subq = (
        db.query(
            PhieuBH.so_phieu_nhan.label("so_phieu_nhan"),
            func.count(PhieuBH.id).label("so_luong"),
            func.min(PhieuBH.id).label("min_id")  # lấy 1 id đại diện
        )
        .filter(PhieuBH.sdt.like(f"%{sdt}%"))
        .group_by(PhieuBH.so_phieu_nhan)
        .subquery()
    )

    # Join với bảng chính chỉ lấy 1 bản ghi đại diện theo min_id
    rows = (
        db.query(
            PhieuBH.id,
            PhieuBH.so_phieu_nhan,
            PhieuBH.ten_khach,
            PhieuBH.sdt,
            PhieuBH.ngay_nhan,
            PhieuBH.ngay_hen_tra,
            PhieuBH.ngay_tra,
            subq.c.so_luong
        )
        .join(subq, PhieuBH.id == subq.c.min_id)
        .limit(limit)
        .all()
    )

    result = [
        {
            "id": r.id,
            "so_phieu_nhan": r.so_phieu_nhan,
            "ten_khach": r.ten_khach,
            "sdt": r.sdt,
            "ngay_nhan": r.ngay_nhan,
            "ngay_hen_tra": r.ngay_hen_tra,
            "ngay_tra": r.ngay_tra,
            "so_luong": r.so_luong,
        }
        for r in rows
    ]
    return result
