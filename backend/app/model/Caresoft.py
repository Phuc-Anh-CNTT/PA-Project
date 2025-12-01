from dataclasses import dataclass, field
from http.client import HTTPException
from typing import List, Optional, Union, Any

from ..core.SqlServerPA import engine, Base

from collections import defaultdict
from sqlalchemy.orm import Session
from datetime import date, datetime
from sqlalchemy import Date, text, func, and_, or_, Column, Boolean, String, DateTime, Integer

import pandas as pd
import traceback


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
	ticket_priority: str
	requester_id: int
	group_id: int
	service_id: int
	assignee_id: Optional[int]
	ticket_subject: str
	custom_fields: List[CustomField] = field(default_factory=list)

	def __init__(self, status: str, ticket_comment_is_public: int, ticket_source: str, type: int, phone: str,
				 ticket_comment: str, requester_id: int, group_id: int, service_id: int,
				 assignee_id: Optional[int] = None, ticket_priority: Optional[str] = None,
				 ticket_subject: str = None, custom_fields: List[CustomField] = None):
		self.type = type
		self.status = status
		self.ticket_comment_is_public = ticket_comment_is_public
		self.ticket_source = ticket_source
		self.phone = phone
		self.ticket_comment = ticket_comment
		self.requester_id = requester_id
		self.ticket_priority = ticket_priority
		self.group_id = group_id
		self.service_id = service_id
		self.assignee_id = assignee_id
		self.ticket_subject = ticket_subject
		self.custom_fields = custom_fields


class Ticket_PA(Base):
	__tablename__ = "new_data_daily"
	__table_args__ = {"autoload_with": engine}
	tong_gia_tri_don_hang = None
	ngay_nhan = None
	phone = None
	tinh_trang_sp = None
	serial = None
	ten_khach = None
	ma_khach = None
	dia_chi_nhan_bh = None
	so_phieu_nhan = None


class Employee(Base):
	__tablename__ = "nhan_vien"
	__table_args__ = {"autoload_with": engine}
	__allow_unmapped__ = True

	Id = Column(Integer, primary_key=True, autoincrement=True)
	Code = Column(Integer)
	Name = Column(String)
	Mobile = Column(String)
	JobCode = Column(String)
	LastJobCode = Column(String, default=None)
	Created_at = Column(DateTime)
	Modified_at = Column(DateTime, default=None)


class don_hang_ban(Base):
	__tablename__ = "don_hang_ban"
	__table_args__ = {"autoload_with": engine}
	__allow_unmapped__ = True

	CustomerId: Column(String)
	CustomerName: Column(String)
	Person: Column(String)
	Tel: Column(String)
	DocDate: Column(Date)
	DocNo: Column(String)
	JobCode: Column(String)
	TTGH: Column(String)
	Created_at: datetime
	Modified_at: datetime
	da_tao_phieu: Column(Boolean, default=False)
	da_tao_ZNS: Column(Boolean, default=False)


class don_hang_BH(Base):
	__tablename__ = "tra_hang_bh"
	__table_args__ = {"autoload_with": engine}
	__allow_unmapped__ = True

	ma_khach: Integer
	ten_khach: String
	sdt: String
	so_phieu_nhan: String
	so_phieu_tra: String
	ngay_tra: datetime
	serial_nhan: String
	serial_tra: String
	chenh_lech_ngay_tra_ngay_hen_tra: Integer
	so_don_hang: String
	CreatedAt: datetime
	da_tao_phieu: Column(Boolean, default=False)
	da_tao_ZNS: Column(Boolean, default=False)


def get_list_phone(db: Session):
	try:
		phones = []
		for i in db.query(Employee.Mobile).all():
			phones.append(i)

		return phones
	except Exception as e:
		print(f"[ERROR][get phone] {str(e)}")
		return None


def count_ticket(db: Session):
	results = []
	try:
		baohanh = db.query(
			don_hang_BH.ma_khach,
			don_hang_BH.ten_khach,
			don_hang_BH.sdt,
			don_hang_BH.so_phieu_nhan,
			don_hang_BH.so_phieu_tra,
			don_hang_BH.ngay_tra,
			don_hang_BH.serial_nhan,
			don_hang_BH.serial_tra,
			don_hang_BH.chenh_lech_ngay_tra_ngay_hen_tra,
			don_hang_BH.so_don_hang,
			don_hang_BH.da_tao_phieu
		).filter(and_(
			don_hang_BH.CreatedAt >= datetime(2025, 11, 1),
			don_hang_BH.da_tao_phieu == 0,
			don_hang_BH.da_tao_ZNS == 0,
		))

		rows = baohanh.all()

		grouped = defaultdict(list)
		for r in rows:
			grouped[(r.so_phieu_nhan, r.ngay_tra.date())].append(r)

		# Xác định các nhóm có nhiều so_phieu_tra khác nhau
		invalid_keys = set()
		for key, items in grouped.items():
			so_phieu_tras = {i.so_phieu_tra for i in items}
			if len(so_phieu_tras) > 1:
				invalid_keys.add(key)

		for r in rows:
			if (r.so_phieu_nhan, r.ngay_tra.date()) in invalid_keys:
				name = None
			else:
				name = r.ten_khach

			sodonhang = r.so_don_hang if r.so_don_hang else ""

			kind = 74238 if r.chenh_lech_ngay_tra_ngay_hen_tra >= 14 else 74239

			results.append(
				Ticket(
					status="new",
					ticket_comment_is_public=0,
					ticket_source="API",
					type=0,
					phone=r.sdt,
					ticket_comment=f"Phiếu khảo sát chất lượng bảo hành cho {r.ten_khach} với số phiếu: {r.so_phieu_tra} \n",
					requester_id=240444945,
					group_id=12390,
					ticket_priority="Low",
					service_id=95098188,
					assignee_id=None,
					ticket_subject="Phiếu đánh giá chất lượng dịch vụ sau Bảo hành cho số phiếu trả: " + r.so_phieu_tra,
					custom_fields=[
						CustomField(id="10699", value=r.so_phieu_tra),  # Phieu xuat tra bh
						CustomField(id="10487", value=r.so_phieu_nhan),  # So phieu nhan
						CustomField(id="5395", value=sodonhang),  # so don hang web
						CustomField(id="5403", value=168259),  # yeu cau xu ly
						CustomField(id="5419", value=79220),  # ket qua xu ly
						CustomField(id="5421", value=kind),  # doi tuong danh gia
						CustomField(id="10700", value=r.ngay_tra.date().strftime("%Y/%m/%d")),  # ngay tra
						CustomField(id="5418", value=74209),  # phan loai phieu ghi
						CustomField(id="10264", value=r.ma_khach),  # ma khach bravo
						CustomField(id="10657", value=name),
					]
				)
			)

		query = db.query(
			don_hang_ban.CustomerId,
			don_hang_ban.Person,
			don_hang_ban.CustomerName,
			don_hang_ban.Tel,
			don_hang_ban.DocDate,
			don_hang_ban.DocNo,
			don_hang_ban.JobCode,
			don_hang_ban.TTGH,
			don_hang_ban.Created_at,
			don_hang_ban.Modified_at,
			don_hang_ban.da_tao_phieu
		).filter(
			and_(
				don_hang_ban.da_tao_phieu == 0,
				don_hang_ban.da_tao_ZNS == 0,
				don_hang_ban.JobCode != "KDPP",
				or_(don_hang_ban.Modified_at != don_hang_ban.Created_at,
					don_hang_ban.TTGH == "Đã giao hàng"),
				don_hang_ban.Created_at >= datetime(2025, 11, 1),
			)
		)

		rows = query.all()

		for r in rows:
			name = None
			serviceID = 95098188
			if r.Created_at != r.Modified_at or r.TTGH == "Đã giao hàng":
				if not r.Tel or len(r.Tel) != 10 or r.Tel == '0000000000' or r.Tel.startswith(
					("024", "1900", "1800")) or not r.Tel.startswith("0"):
					comment = "số điện thoại không đạt điều kiện gửi ZNS:" + str(r.Tel)
					serviceID = 95098303

				elif r.Tel in get_list_phone(db):
					comment = "Đơn hàng dùng số điện thoại nhân viên!"
					serviceID = 95098303
				else:
					comment = ""
					name = r.Person

				results.append(
					Ticket(
						status="new",
						ticket_comment_is_public=0,
						ticket_source="API",
						type=0,
						phone=r.Tel,
						ticket_comment=f"Phiếu khảo sát chât lượng cho {r.Person} với đơn hàng số: {r.DocNo} \n" + comment,
						requester_id=240444945,
						group_id=12390,
						ticket_priority="Low",
						service_id=serviceID,
						assignee_id=None,
						ticket_subject="Phiếu đánh giá chất lượng dịch vụ sau Bán hàng cho đơn hàng: " + r.DocNo,
						custom_fields=[
							CustomField(id="5395", value=r.DocNo),  # so don hang web
							CustomField(id="5403", value=168259),  # yeu cau xu ly
							CustomField(id="5419", value=79220),  # ket qua xu ly
							CustomField(id="5418", value=74209),  # phan loai phieu ghi
							CustomField(id="5421", value=74232),  # phan loai khach hang
							CustomField(id="10605", value=r.DocDate.strftime("%Y/%m/%d")),  # ngay mua
							CustomField(id="10264", value=r.CustomerId),  # ma khach bravo
							CustomField(id="10657", value=name),
							CustomField(id="0000", value=r.CustomerName)
						]
					)
				)

		# Export to Excel as requested
		try:
			data = []
			for t in results:
				row = {
					"status": t.status,
					"ticket_comment_is_public": t.ticket_comment_is_public,
					"ticket_source": t.ticket_source,
					"type": t.type,
					"phone": t.phone,
					"ticket_comment": t.ticket_comment,
					"requester_id": t.requester_id,
					"group_id": t.group_id,
					"service_id": t.service_id,
					"assignee_id": t.assignee_id,
					"ticket_subject": t.ticket_subject,
					"se_tao_phieu": False,  # mặc định
				}
				if t.custom_fields:
					has_don_hang_ban = any(f.id == "5395" for f in t.custom_fields)
					for f in t.custom_fields:
						row[f"custom_{f.id}"] = f.value
						if has_don_hang_ban and f.id == "10657":
							row["se_tao_phieu"] = f.value is not None
				data.append(row)
			df = pd.DataFrame(data)
			df.to_excel("tickets_output.xlsx", index=False)
			print("[INFO] Tickets saved to tickets_output.xlsx")
		except Exception as err:
			print(f"[ERROR] Failed to export Excel: {err}")
	except Exception as e:
		print(f"[ERROR][count_ticket] {str(e)}")
		return None


def make_kscl_saubh(db: Session, sent: int = 0, limit: Optional[int] = None):
	results = []

	try:
		query = db.query(
			don_hang_BH.ma_khach,
			don_hang_BH.ten_khach,
			don_hang_BH.sdt,
			don_hang_BH.so_phieu_nhan,
			don_hang_BH.so_phieu_tra,
			don_hang_BH.ngay_tra,
			don_hang_BH.serial_nhan,
			don_hang_BH.serial_tra,
			don_hang_BH.chenh_lech_ngay_tra_ngay_hen_tra,
			don_hang_BH.so_don_hang,
			don_hang_BH.da_tao_phieu
		).filter(and_(
			don_hang_BH.CreatedAt >= datetime(2025, 11, 4),
			don_hang_BH.da_tao_phieu == 0,
			don_hang_BH.da_tao_ZNS == 0,
		))

		if sent is not None:
			query = query.filter(don_hang_BH.da_tao_phieu == sent)

		if limit:
			query = query.limit(limit)

		rows = query.all()

		grouped = defaultdict(list)
		for r in rows:
			grouped[(r.so_phieu_nhan, r.ngay_tra.date())].append(r)

		# Xác định các nhóm có nhiều so_phieu_tra khác nhau
		invalid_keys = set()
		for key, items in grouped.items():
			so_phieu_tras = {i.so_phieu_tra for i in items}
			if len(so_phieu_tras) > 1:
				invalid_keys.add(key)

		for r in rows:
			name = r.ten_khach
			serviceID = 95098188

			if (r.so_phieu_nhan, r.ngay_tra.date()) in invalid_keys:
				name = None

			if not r.sdt or len(r.sdt) != 10 or r.sdt.startswith(
				("024", "1900", "1800")) or not r.sdt.startswith("0"):
				name = None
				serviceID = 95098303

			normalized_sdt = "".join(ch for ch in r.sdt if ch.isdigit())
			if not normalized_sdt or set(normalized_sdt) == {"0"} or set(normalized_sdt) == {"1"}:
				continue

			sodonhang = r.so_don_hang if r.so_don_hang else ""

			kind = 74238 if r.chenh_lech_ngay_tra_ngay_hen_tra >= 14 else 74239

			results.append(
				Ticket(
					status="new",
					ticket_comment_is_public=0,
					ticket_source="API",
					type=0,
					phone=r.sdt[:10],
					ticket_comment=f"Phiếu khảo sát chất lượng bảo hành cho {r.ten_khach} với số phiếu: {r.so_phieu_tra} \n",
					requester_id=240444945,
					group_id=12390,
					ticket_priority="Low",
					service_id=serviceID,
					assignee_id=None,
					ticket_subject="Phiếu đánh giá chất lượng dịch vụ sau Bảo hành cho số phiếu trả: " + r.so_phieu_tra,
					custom_fields=[
						CustomField(id="10699", value=r.so_phieu_tra),  # Phieu xuat tra bh
						CustomField(id="10657", value=name),
						CustomField(id="10487", value=r.so_phieu_nhan),  # So phieu nhan
						CustomField(id="5395", value=sodonhang),  # so don hang web
						CustomField(id="5403", value=168259),  # yeu cau xu ly
						CustomField(id="5419", value=79220),  # ket qua xu ly
						CustomField(id="5421", value=kind),  # doi tuong danh gia
						CustomField(id="10700", value=r.ngay_tra.date().strftime("%Y/%m/%d")),  # ngay tra
						CustomField(id="5418", value=74209),  # phan loai phieu ghi
						CustomField(id="10264", value=r.ma_khach),  # ma khach bravo
					]
				)
			)
			print(
				f'{r.so_phieu_nhan} - {r.so_phieu_tra} - {r.ngay_tra.date().strftime("%Y/%m/%d")} - {name}')

		return results

	except Exception as e:
		print(f"[ERROR][make_BH_ticket] {str(e)}")
		return []


def make_rate_ticket(db: Session, sent: int = 0, limit: Optional[int] = None) -> list[Ticket]:
	results = []
	try:
		query = db.query(
			don_hang_ban.CustomerId,
			don_hang_ban.Person,
			don_hang_ban.Tel,
			don_hang_ban.DocDate,
			don_hang_ban.DocNo,
			don_hang_ban.JobCode,
			don_hang_ban.TTGH,
			don_hang_ban.Created_at,
			don_hang_ban.Modified_at
		).filter(
			and_(
				don_hang_ban.da_tao_phieu == 0,
				don_hang_ban.da_tao_ZNS == 0,
				don_hang_ban.JobCode != "KDPP",
				or_(
					don_hang_ban.Modified_at != don_hang_ban.Created_at,
					don_hang_ban.TTGH == "Đã giao hàng"
				),
				don_hang_ban.Created_at >= datetime(2025, 11, 4),
			)
		)

		if sent is not None:
			query = query.filter(don_hang_ban.da_tao_phieu == sent)

		if limit:
			query = query.limit(limit)

		rows = query.all()

		for r in rows:
			name = None
			serviceID = 95098188
			if r.Created_at != r.Modified_at or r.TTGH == "Đã giao hàng":
				normalized_sdt = "".join(ch for ch in r.Tel if ch.isdigit())
				if not normalized_sdt or set(normalized_sdt) == {"0"} or set(normalized_sdt) != {"1"}:
					continue

				elif not r.Tel or len(r.Tel) != 10 or r.Tel.startswith(
					("024", "1900", "1800")) or not r.Tel.startswith("0"):
					comment = "số điện thoại không đạt điều kiện gửi ZNS:" + str(r.Tel)
					serviceID = 95098303

				elif r.Tel in get_list_phone(db):
					comment = "Đơn hàng dùng số điện thoại nhân viên!"
					serviceID = 95098303
				else:
					comment = ""
					name = r.Person

				results.append(
					Ticket(
						status="new",
						ticket_comment_is_public=0,
						ticket_source="API",
						type=0,
						phone=r.Tel,
						ticket_comment=f"Phiếu khảo sát chât lượng cho {r.Person} với đơn hàng số: {r.DocNo} \n" + comment,
						requester_id=240444945,
						group_id=12390,
						ticket_priority="Low",
						service_id=serviceID,
						assignee_id=None,
						ticket_subject="Phiếu đánh giá chất lượng dịch vụ sau Bán hàng cho đơn hàng: " + r.DocNo,
						custom_fields=[
							CustomField(id="5395", value=r.DocNo),  # so don hang web
							CustomField(id="10657", value=name),
							CustomField(id="5403", value=168259),  # yeu cau xu ly
							CustomField(id="5419", value=79220),  # ket qua xu ly
							CustomField(id="5418", value=74209),  # phan loai phieu ghi
							CustomField(id="5421", value=74232),  # phan loai khach hang
							CustomField(id="10605", value=r.DocDate.strftime("%Y/%m/%d")),  # ngay mua
							CustomField(id="10264", value=r.CustomerId),  # ma khach bravo
							CustomField(id="10657", value=name),
						]
					)
				)
				print(
					f'{r.DocNo} - {r.DocDate.strftime("%Y/%m/%d")} - {r.Tel} - {r.CustomerId} - {name if name is not None else "None"}')

		return results

	except Exception as e:
		print(f"[ERROR][make_rate_ticket] Type: {type(e).__name__}, Message: {str(e)}")
		print(traceback.format_exc())
	return []


def get_all_ticket(db: Session, sent=0, limit=None):
	try:
		result = []

		query = (db.query(
			Ticket_PA.so_phieu_nhan,
			Ticket_PA.dia_chi_nhan_bh,
			Ticket_PA.ma_khach,
			Ticket_PA.ten_khach,
			Ticket_PA.serial,
			Ticket_PA.tinh_trang_sp,
			Ticket_PA.phone,
			Ticket_PA.ngay_nhan,
			Ticket_PA.tong_gia_tri_don_hang
		))

		# query = query.filter(
		# 	# Ticket_PA.trigger_date == text("CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)")
		# 	Ticket_PA.so_phieu_nhan == "TEST-003"
		# )

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
					ticket_comment="- Số phiếu tiếp nhận: " + str(r.so_phieu_nhan)
								   + "\n - Ngày tiếp nhận: " + r.ngay_nhan.strftime("%Y-%m-%d")
								   + "\n - Mô tả sản phẩm: " + str(r.tinh_trang_sp)
								   + "\n - Địa điểm xuất trả: " + str(r.dia_chi_nhan_bh)
								   + "\n - Chi phi dịch vụ/ linh kiện: " + str(
						r.tong_gia_tri_don_hang if r.tong_gia_tri_don_hang is not None else 0),
					requester_id=240444945,
					group_id=12390,
					service_id=95096527,
					assignee_id=None,
					ticket_subject="Thông báo trả hàng bảo hành sửa chữa phiếu: " + r.so_phieu_nhan,
					custom_fields=[
						CustomField(id="10487", value=r.so_phieu_nhan),  # so phieu
						CustomField(id="5403", value=168259),  # yeu cau xu ly
						CustomField(id="5405", value=73912),  # phan loai ho tro
						CustomField(id="5419", value=79217),  # ket qua xu ly
						CustomField(id="5418", value=74208),  #
						CustomField(id="5529", value=r.dia_chi_nhan_bh),  # co so nhan
						CustomField(id="10264", value=r.ma_khach),  # ma khach bravo
						CustomField(id="10442", value=r.tinh_trang_sp),  # ket qua xu ly
						CustomField(id="10488", value=r.ngay_nhan.strftime("%Y/%m/%d")),  # ngay nhan
						CustomField(id="10657", value=r.ten_khach),
						CustomField(id="10635",
									value=r.tong_gia_tri_don_hang if r.tong_gia_tri_don_hang is not None else 0)
					]
				)
			)
		return result
	except Exception as e:
		print(f"[ERROR][get_all_ticket] {str(e)}")
		return []


def update_ticket(db: Session, so_phieus: list[str]):
	try:
		if so_phieus:
			updated_rows = db.query(Ticket_PA).filter(Ticket_PA.so_phieu_nhan.in_(so_phieus)).update(
				{Ticket_PA.made_ticket: 1}, synchronize_session=False)
			db.commit()
			return updated_rows > 0
		return False
	except Exception as e:
		print(f"[ERROR][update] {str(e)}")
		return False


def ud_rate_ticket(db: Session, so_don_hangs: list[str]):
	try:
		print(so_don_hangs)
		if so_don_hangs:
			ud_rows = db.query(don_hang_ban).filter(don_hang_ban.DocNo.in_(so_don_hangs)).update(
				{don_hang_ban.da_tao_phieu: True}, synchronize_session=False)
			db.commit()
			return ud_rows > 0
		return False
	except Exception as e:
		print(f"[ERROR][ud_rate_ticket] {str(e)}")
		return False


def update_saubh(db: Session, bh: list[str]):
	try:
		if bh:
			ud_tics = db.query(don_hang_BH).filter(don_hang_BH.so_phieu_tra.in_(bh)).update(
				{don_hang_BH.da_tao_phieu: True}, synchronize_session=False)
			db.commit()
			return ud_tics > 0
	except Exception as e:
		print(f"[ERROR][update_saubh] {str(e)}")
		return False


def check_ZNS(db: Session, ZNS: list[str], name: list[str], type: str):
	if not ZNS:
		return False

	success = False
	for i, j in zip(ZNS, name):
		try:
			if not j:
				continue

			if type == "kscl_banhang":
				up_zns = db.query(don_hang_ban).filter(don_hang_ban.DocNo == i).update(
					{don_hang_ban.da_tao_ZNS: True}, synchronize_session=False)
			elif type == "kscl_baohanh":
				up_zns = db.query(don_hang_BH).filter(don_hang_BH.so_phieu_tra == i).update(
					{don_hang_BH.da_tao_ZNS: True}, synchronize_session=False)
			else:
				up_zns = 0

			if up_zns == 0:
				print(f"[WARN] Không có record nào cập nhật được cho {i}, name: {j}")
				continue

			db.commit()
			success = True

		except Exception as e:
			db.rollback()
			raise HTTPException(status=400, reason=f"Lỗi khi cập nhật ZNS cho {i}: {str(e)}")

	return success
