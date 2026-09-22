from fastapi import APIRouter

from app.services.llm_service import generate_response

router = APIRouter(prefix="/debug", tags=["debug"])


@router.post("/llm-test")
def test_llm_connection() -> dict[str, str]:
    response = generate_response(
        [{"role": "user", "content": "Explain what a Python function is in one sentence."}]
    )
    return {"response": response}