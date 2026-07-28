import os
import sys

# Ensure backend root is in sys.path when running script directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base

from app.api.expense_router import router as expense_router
from app.api.budget_router import router as budget_router
from app.api.analytics_router import router as analytics_router
from app.api.agent_router import router as agent_router
from app.api.ocr_router import router as ocr_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SpendWise AI API",
    description="Autonomous AI Agent backend for personal expense management",
    version="1.0.0"
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(expense_router)
app.include_router(budget_router)
app.include_router(analytics_router)
app.include_router(agent_router)
app.include_router(ocr_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "SpendWise AI Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
