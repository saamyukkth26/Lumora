from __future__ import annotations
from src.config import Settings
from src.utils.logging import get_logger

logger = get_logger(__name__)


def get_llm(settings: Settings, streaming: bool = False):
    """Return a LangChain BaseChatModel. Prefers Azure OpenAI, then Anthropic, then OpenAI."""
    if settings.use_azure:
        from langchain_openai import AzureChatOpenAI
        logger.info(f"Using Azure OpenAI deployment: {settings.azure_openai_deployment}")
        return AzureChatOpenAI(
            azure_deployment=settings.azure_openai_deployment,
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            streaming=streaming,
            max_tokens=4096,
        )
    elif settings.anthropic_api_key:
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=settings.default_model,
            api_key=settings.anthropic_api_key,
            streaming=streaming,
            max_tokens=4096,
        )
    elif settings.openai_api_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.openai_api_key,
            streaming=streaming,
        )
    raise ValueError(
        "No LLM configured. Set AZURE_OPENAI_API_KEY + AZURE_OPENAI_ENDPOINT in .env"
    )


def get_llm_from_keys(
    anthropic_key: str = "",
    openai_key: str = "",
    model: str = "gpt-4o-mini",
    streaming: bool = False,
):
    """Per-request LLM override. Falls back to server-side Azure config."""
    settings_fallback = None

    if anthropic_key:
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model=model, api_key=anthropic_key, streaming=streaming, max_tokens=4096)
    elif openai_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o-mini", api_key=openai_key, streaming=streaming)

    # No per-request key supplied — use server Azure config
    from src.config import get_settings
    return get_llm(get_settings(), streaming=streaming)
