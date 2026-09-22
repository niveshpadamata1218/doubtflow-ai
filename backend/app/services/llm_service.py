import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.config import settings


def generate_response(messages: list[dict[str, str]]) -> str:
    """Send chat messages to Ollama and return the generated text."""
    request_body = json.dumps(
        {
            "model": settings.ollama_model,
            "messages": messages,
            "stream": False,
        }
    ).encode("utf-8")
    request = Request(
        f"{settings.ollama_host.rstrip('/')}/api/chat",
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=120) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError) as error:
        raise RuntimeError("Could not connect to Ollama") from error

    try:
        return result["message"]["content"]
    except (KeyError, TypeError) as error:
        raise RuntimeError("Ollama returned an unexpected response") from error