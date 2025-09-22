from dataclasses import dataclass, field
from typing import List, Optional, Union
from ..core.SqlServerPA import engine, Base

from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import Date, text, func


@dataclass
class CustomField:
	id: str
	value: Union[str, int]

	def __init__(self, id: str, value):
		self.id = id
		self.value = value


@dataclass
class Ticket:
	status: str
	ticket_comment_is_public: int
	ticket_source: str
	type: int
	phone: str
	ticket_comment: str
	requester_id: int
	group_id: int
	assignee_id: Optional[int]
	ticket_subject: str
	custom_fields: List[CustomField] = field(default_factory=list)

	def __init__(self, status: str, ticket_comment_is_public: int, ticket_source: str, type: int, phone: str,
				 ticket_comment: str, requester_id: int, group_id: int, assignee_id: Optional[int] = None,
				 ticket_subject: str = None, custom_fields: List[CustomField] = None):
		self.type = type
		self.status = status
		self.ticket_comment_is_public = ticket_comment_is_public
		self.ticket_source = ticket_source
		self.phone = phone
		self.ticket_comment = ticket_comment
		self.requester_id = requester_id
		self.group_id = group_id
		self.assignee_id = assignee_id
		self.ticket_subject = ticket_subject
		self.custom_fields = custom_fields


class Ticket_PA(Base):
	__tablename__ = "new_data_daily"
	__table_args__ = {"autoload_with": engine}


def get_all_ticket(db: Session, sent=0, limit=None):
	result = []

	query = db.query(
		Ticket_PA.so_phieu_nhan,
		Ticket_PA.dia_chi_nhan_bh,
		Ticket_PA.ma_khach,
		Ticket_PA.ten_khach,
		Ticket_PA.serial,
		Ticket_PA.tinh_trang_sp,
		Ticket_PA.phone,
		Ticket_PA.ngay_nhan,
		Ticket_PA.tong_gia_tri_don_hang
	).filter(
		Ticket_PA.trigger_date == text("CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)")
	)

	if sent == 0:
		query = query.filter(Ticket_PA.made_ticket == 0)

	if limit:
		query = query.limit(limit)

	rows_done = query.all()

	for r in rows_done:
		result.append(
			Ticket(
				status="new",
				ticket_comment_is_public=0,
				ticket_source="API",
				type=0,
				phone=r.phone,
				ticket_comment="Số điện thoại khách: " + r.phone,
				requester_id=189722415,
				group_id=12390,
				assignee_id=None,
				ticket_subject="Testing for: " + r.so_phieu_nhan,
				# ticket_subject="Hoàn thành bảo hành cho phiếu: " + r.so_phieu_nhan,
				custom_fields=[
					CustomField(id="5403", value=76164),  # yeu cau xu ly
					CustomField(id="5405", value=73912),  # phan loai ho tro
					CustomField(id="5419", value=74223),  # ket qua xu ly
					CustomField(id="5418", value=74208),  #
					CustomField(id="5529", value=r.dia_chi_nhan_bh),  # co so nhan
					CustomField(id="10264", value=r.ma_khach),  # ma khach bravo
					CustomField(id="10442", value=r.tinh_trang_sp),  # ket qua xu ly
					CustomField(id="10487", value=r.so_phieu_nhan),  # so phieu
					CustomField(id="10488", value=r.ngay_nhan.strftime("%Y/%m/%d")),  # ngay nhan
					CustomField(id="10657", value=r.ten_khach),
					CustomField(id="10635", value=r.tong_gia_tri_don_hang)
				]
			)
		)
	return result


def update_ticket(db: Session, so_phieus: list[str]):
	if so_phieus:
		updated_rows = db.query(Ticket_PA).filter(Ticket_PA.so_phieu_nhan.in_(so_phieus)).update(
			{Ticket_PA.made_ticket: 1}, synchronize_session=False)
		db.commit()
		return updated_rows > 0
	return False
