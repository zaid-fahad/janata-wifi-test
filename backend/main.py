import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOCK_DATA = []


def load_with_pandas(path: str):
    df = pd.read_json(path)
    return df.to_dict(orient="records")



@app.on_event("startup")
async def startup():
    global STOCK_DATA
    STOCK_DATA = load_with_pandas("stock_market_data.json")
    print("Loaded:", len(STOCK_DATA))


@app.get("/data")
async def get_data():
    return {
        "total_count": len(STOCK_DATA),
        "data": STOCK_DATA        
    }
