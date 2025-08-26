from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Table,
    create_engine,
    MetaData
)
from urllib.parse import quote_plus
from sqlalchemy.orm import sessionmaker, declarative_base
import urllib

password = quote_plus("Abcd@1234")
params = urllib.parse.quote_plus(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=115.146.126.146,52022;"
    "DATABASE=PhucAnh_Views;"
    "UID=PhucAnhPM;"
    f"PWD={password};"
    "TrustServerCertificate=yes;"
)

DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"autocommit": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency: tạo session để dùng trong route
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

