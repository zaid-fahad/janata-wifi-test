from sqlmodel import SQLModel, Field, select, Session
from datetime import datetime, date

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
    # Convert fields before adding
    for key, value in stock.dict().items():
        if key == "date":
            # convert string to date
            if isinstance(value, str):
                setattr(stock, key, datetime.strptime(value, "%Y-%m-%d").date())
        elif key in ["open", "high", "low", "close", "volume"]:
            # convert string/other to float
            setattr(stock, key, float(value))
    session.add(stock)
    session.commit()
    session.refresh(stock)
    return stock

def update_stock(session: Session, stock_id: int, data: dict):
    stock = session.get(Stock, stock_id)
    if not stock:
        return None
    
    for key, value in data.items():
        if key == "date":
            # convert string to date
            if isinstance(value, str):
                value = datetime.strptime(value, "%Y-%m-%d").date()
        elif key in ["open", "high", "low", "close", "volume"]:
            # convert string/other to float
            value = float(value)
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


