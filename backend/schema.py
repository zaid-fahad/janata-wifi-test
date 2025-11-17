from pydantic import BaseModel
from datetime import date

class StockResponse(BaseModel):
    id: int
    date: date
    trade_code: str
    high: float
    low: float
    open: float
    close: float
    volume: float

    class Config:
        orm_mode = True  # allows reading from SQLModel objects
