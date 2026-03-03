from fastapi import FastAPI
from models import CodeRequest
from executor import execute_user_code
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run")
def run_code(request: CodeRequest):
    return execute_user_code(
        request.code,
        request.input_array,
        request.algorithm
    )