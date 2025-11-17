from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session
from database import engine, get_session
from models import Stock, get_stocks, create_stock, update_stock, delete_stock

app = FastAPI(title="Stock Market API")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Routes ----------------
@app.get("/stocks/")
def read_stocks(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return get_stocks(session, skip, limit)

@app.post("/stocks/")
def add_stock(stock: Stock, session: Session = Depends(get_session)):
    return create_stock(session, stock)

@app.put("/stocks/{stock_id}")
def edit_stock(stock_id: int, stock: Stock, session: Session = Depends(get_session)):
    updated = update_stock(session, stock_id, stock.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Stock not found")
    return updated

@app.delete("/stocks/{stock_id}")
def remove_stock(stock_id: int, session: Session = Depends(get_session)):
    deleted = delete_stock(session, stock_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Stock not found")
    return {"ok": True}
