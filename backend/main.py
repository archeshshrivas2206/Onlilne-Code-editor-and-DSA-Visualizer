import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import CodeRequest, ReviewRequest
from executor import execute_user_code

# Load .env
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="DSA Visualiser API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/run")
def run_code(request: CodeRequest):
    return execute_user_code(
        request.code,
        request.input_array,
        request.algorithm,
    )


@app.post("/review")
async def review_code(request: ReviewRequest):
    """
    Agentic AI Code Review endpoint.
    Runs 6 analysis tools in parallel then calls Gemini 2.0 Flash
    to produce a structured review report.
    """
    from agent.review_agent import run_review
    report = await run_review(request.code, request.trace)
    return report