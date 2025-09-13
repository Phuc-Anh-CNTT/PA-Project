from sqlalchemy import func, case
from ..core.SqlServerPA import engine, Base
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, date


def normalize_date(value):
	if isinstance(value, datetime):
		return value.date()
	if isinstance(value, date):
		return value
	return date.min


class PhieuBH(Base):
	__tablename__ = "tra_hang_bh"
	__table_args__ = {"autoload_with": engine}


class PhieuNo(Base):
	__tablename__ = "no_hang_bh"
	__table_args__ = {"autoload_with": engine}


class Phieu:
	def __init__(self, id, phieu_nhan, khach, serial, product, phone, description, taken_date, primised_date, done_date,
				 status, amount):
		self.id = id
		self.phieu_nhan = phieu_nhan
		self.khach = khach
		self.serial = serial
		self.phone = phone
		self.product = product
		self.description = description
		self.taken_date = taken_date
		self.primised_date = primised_date
		self.done_date = done_date
		self.status = status
		self.amount = amount

	def to_dict(self):
		return {
			"id": self.id,
			"phieu_nhan": self.phieu_nhan,
			"khach": self.khach,
			"serial": self.serial,
			"product": self.product,
			"phone": self.phone,
			"description": self.description,
			"taken_date": self.taken_date,
			"primised_date": self.primised_date,
			"done_date": self.done_date,
			"status": self.status,
			"amount": self.amount
		}


STATUS_MAP = {
	"Đang xử lý": "Processing",
	"Đã hoàn thành xử lý": "Completed",
	"Đã tiếp nhận": "Received",
}


def get_phieu_by_id(db: Session, phieu_id: str, limit: int = 50) -> List[Phieu]:
	result = []

	# Lấy từ bảng đã hoàn thành
	rows_done = (
		db.query(
			PhieuBH.id,
			PhieuBH.so_phieu_nhan,
			PhieuBH.ten_khach,
			PhieuBH.serial_nhan,
			PhieuBH.ten_hang_nhan,
			PhieuBH.sdt,
			PhieuBH.ten_hang_nhan,
			PhieuBH.mo_ta_loi_luc_tiep_nhan,
			PhieuBH.ngay_nhan,
			PhieuBH.ngay_hen_tra,
			PhieuBH.ngay_tra,
		)
		.filter(PhieuBH.so_phieu_nhan == phieu_id)
		.limit(limit)
		.all()
	)

	for r in rows_done:
		result.append(
			Phieu(
				id=r.id,
				phieu_nhan=r.so_phieu_nhan,
				khach=r.ten_khach,
				serial=r.serial_nhan,
				phone=r.sdt,
				product=r.ten_hang_nhan,
				description=r.mo_ta_loi_luc_tiep_nhan,
				taken_date=r.ngay_nhan,
				primised_date=r.ngay_hen_tra,
				done_date=r.ngay_tra,
				status="Done",
				amount=1
			)
		)

	# Lấy từ bảng chưa hoàn thành
	rows_not_done = (
		db.query(
			PhieuNo.id,
			PhieuNo.so_phieu_nhan,
			PhieuNo.ten_khach,
			PhieuNo.serial,
			PhieuNo.ten_hang,
			PhieuNo.dien_thoai,
			PhieuNo.tinh_trang_kiem_tra,
			PhieuNo.ngay_nhan,
			PhieuNo.ngay_hen_tra,
			PhieuNo.tinh_trang,
		)
		.filter(PhieuNo.so_phieu_nhan == phieu_id)
		.limit(limit)
		.all()
	)

	if rows_not_done:
		# Kiểm tra nếu tất cả tình trạng đều là "Đã hoàn thành xử lý"
		all_completed = all(r.tinh_trang == "Đã hoàn thành xử lý" for r in rows_not_done)

		for r in rows_not_done:
			result.append(
				Phieu(
					id=r.id,
					phieu_nhan=r.so_phieu_nhan,
					khach=r.ten_khach,
					serial=r.serial,
					phone=r.dien_thoai,
					product=r.ten_hang,
					description=r.tinh_trang_kiem_tra,
					taken_date=r.ngay_nhan,
					primised_date=r.ngay_hen_tra,
					done_date=None,
					status="Taking" if all_completed else STATUS_MAP.get(r.tinh_trang, r.tinh_trang),
					amount=1
				)
			)

	return result


STATUS_ORDER = {
	"Đã tiếp nhận": 1,
	"Đang xử lý": 2,
	"Đã hoàn thành xử lý": 3,
}


def get_phieu_by_sdt(db: Session, sdt: str, limit: int = 50) -> List[Phieu]:
	result = []

	rows_done = (
		db.query(
			PhieuBH.id,
			PhieuBH.so_phieu_nhan,
			PhieuBH.ten_khach,
			PhieuBH.serial_nhan,
			PhieuBH.ten_hang_tra,
			PhieuBH.sdt,
			PhieuBH.mo_ta_loi_luc_tiep_nhan,
			PhieuBH.ngay_nhan,
			PhieuBH.ngay_hen_tra,
			PhieuBH.ngay_tra,
			func.count(PhieuBH.so_phieu_nhan).over(partition_by=PhieuBH.so_phieu_nhan).label("amount"),
		)
		.filter(PhieuBH.sdt == sdt)
		.limit(limit)
		.all()
	)

	for r in rows_done:
		result.append(
			Phieu(
				id=r.id,
				phieu_nhan=r.so_phieu_nhan,
				khach=r.ten_khach,
				serial=r.serial_nhan,
				phone=r.sdt,
				product=r.ten_hang_tra,
				description=r.mo_ta_loi_luc_tiep_nhan,
				taken_date=r.ngay_nhan,
				primised_date=r.ngay_hen_tra,
				done_date=r.ngay_tra,
				status="Done",
				amount=r.amount,
			)
		)

	subq = (
		db.query(
			PhieuNo.so_phieu_nhan.label("so_phieu_nhan"),
			func.min(
				case(
					(PhieuNo.tinh_trang == "Đã tiếp nhận", 1),
					(PhieuNo.tinh_trang == "Đang xử lý", 2),
					(PhieuNo.tinh_trang == "Đã hoàn thành xử lý", 3),
					else_=99,
				)
			).label("min_level"),
		)
		.filter(PhieuNo.dien_thoai == sdt)
		.group_by(PhieuNo.so_phieu_nhan)
		.subquery()
	)

	rows_not_done = (
		db.query(
			PhieuNo.id,
			PhieuNo.so_phieu_nhan,
			PhieuNo.ten_khach,
			PhieuNo.serial,
			PhieuNo.ten_hang,
			PhieuNo.dien_thoai,
			PhieuNo.tinh_trang_kiem_tra,
			PhieuNo.ngay_nhan,
			PhieuNo.ngay_hen_tra,
			PhieuNo.tinh_trang,
			func.count(PhieuNo.so_phieu_nhan)
			.over(partition_by=PhieuNo.so_phieu_nhan)
			.label("amount"),
		)
		.join(subq, PhieuNo.so_phieu_nhan == subq.c.so_phieu_nhan)
		.filter(
			case(
				(PhieuNo.tinh_trang == "Đã tiếp nhận", 1),
				(PhieuNo.tinh_trang == "Đang xử lý", 2),
				(PhieuNo.tinh_trang == "Đã hoàn thành xử lý", 3),
				else_=99,
			)
			== subq.c.min_level
		)
		.all()
	)

	for r in rows_not_done:
		result.append(
			Phieu(
				id=r.id,
				phieu_nhan=r.so_phieu_nhan,
				khach=r.ten_khach,
				serial=r.serial,
				phone=r.dien_thoai,
				product=r.ten_hang,
				description=r.tinh_trang_kiem_tra,
				taken_date=r.ngay_nhan,
				primised_date=r.ngay_hen_tra,
				done_date=None,
				status=STATUS_MAP.get(r.tinh_trang, r.tinh_trang),
				amount=r.amount
			)
		)

	return result
