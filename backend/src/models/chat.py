from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class ModelConfig(BaseModel):
    model: str = "claude-sonnet-4-6"
    temperature: float = 0.7
    max_tokens: int = 2048


class Source(BaseModel):
    source_id: str
    title: str
    url: str = ""
    snippet: str = ""
    relevance_score: float = 0.0
    doc_id: str = ""


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000)
    session_id: str = ""
    model_config_: ModelConfig = Field(default_factory=ModelConfig, alias="model_config")

    class Config:
        populate_by_name = True


class ChatMessage(BaseModel):
    message_id: str
    role: Literal["user", "assistant"]
    content: str
    sources: list[Source] = []
    agent_steps: list[str] = []
    timestamp: datetime
    tokens_used: int = 0


class ChatSession(BaseModel):
    session_id: str
    messages: list[ChatMessage] = []
    created_at: datetime
    updated_at: datetime


class SessionSummary(BaseModel):
    session_id: str
    message_count: int
    last_message: str = ""
    updated_at: datetime
