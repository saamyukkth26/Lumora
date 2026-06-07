from functools import lru_cache
from src.config import get_settings, Settings
from fastapi import Header, HTTPException


def get_settings_dep() -> Settings:
    return get_settings()


async def get_anthropic_key(x_anthropic_key: str = Header(default="")) -> str:
    return x_anthropic_key


async def get_openai_key(x_openai_key: str = Header(default="")) -> str:
    return x_openai_key
