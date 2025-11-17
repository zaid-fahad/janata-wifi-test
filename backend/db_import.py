import json
from datetime import datetime
from sqlmodel import SQLModel, Session
from database import engine
from models import Stock

JSON_PATH = "stock_market_data.json"

def parse_float(value):
    try:
        return float(value)
    except:
        return 0.0

def import_json():
    # Create table if not exists
    SQLModel.metadata.create_all(engine)

    with open(JSON_PATH) as f:
        data = json.load(f)

    stocks = [
        Stock(
            date=datetime.strptime(item["date"], "%Y-%m-%d").date(),
            trade_code=item["trade_code"],
            high=parse_float(item["high"]),
            low=parse_float(item["low"]),
            open=parse_float(item["open"]),
            close=parse_float(item["close"]),
            volume=parse_float(item["volume"]),
        )
        for item in data
    ]

    with Session(engine) as session:
        for s in stocks:
            session.add(s)
        session.commit()
    print(f"Imported {len(stocks)} rows")

if __name__ == "__main__":
    import_json()
