from pydantic import BaseModel
from typing import List, Any

class CodeRequest(BaseModel):
    code: str
    input_array: List[int]
    algorithm: str

class ReviewRequest(BaseModel):
    code: str
    trace: List[Any] = []