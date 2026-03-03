from pydantic import BaseModel
from typing import List

class CodeRequest(BaseModel):
    code: str
    input_array: List[int]
    algorithm: str