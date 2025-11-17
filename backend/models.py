from sqlmodel import SQLModel, Field, select, Session
from datetime import date

class Stock(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: date
    trade_code: str
    high: float
    low: float
    open: float
    close: float
    volume: float

#CRUD
def get_stocks(session: Session, skip: int = 0, limit: int = 100):
    return session.exec(select(Stock).offset(skip).limit(limit)).all()

def create_stock(session: Session, stock: Stock):
    session.add(stock)
    session.commit()
    session.refresh(stock)
    return stock

def update_stock(session: Session, stock_id: int, data: dict):
    stock = session.get(Stock, stock_id)
    if not stock:
        return None
    for key, value in data.items():
        setattr(stock, key, value)
    session.add(stock)
    session.commit()
    session.refresh(stock)
    return stock

def delete_stock(session: Session, stock_id: int):
    stock = session.get(Stock, stock_id)
    if not stock:
        return None
    session.delete(stock)
    session.commit()
    return stock
