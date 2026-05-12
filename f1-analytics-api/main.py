import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="F1 Analytics OS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data():
    with open("data.json", "r") as f:
        return json.load(f)

@app.get("/api/kpis")
def get_kpis():
    data = load_data()
    return {"data": data.get("kpis", [])}

@app.get("/api/sponsors")
def get_sponsors():
    data = load_data()
    return {"data": data.get("sponsors", [])}

@app.get("/api/fans")
def get_fans():
    data = load_data()
    return {"data": data.get("team_social", [])}

@app.get("/api/merch")
def get_merch():
    data = load_data()
    return {"data": data.get("merch", [])}
