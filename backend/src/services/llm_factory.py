from __future__ import annotations
from src.config import Settings
from src.utils.logging import get_logger

logger = get_logger(__name__)


def get_llm(settings: Settings, streaming: bool = False):
    """Return a LangChain BaseChatModel. Priority: Azure → Gemini → Anthropic → OpenAI."""
    if settings.use_azure:
        from langchain_openai import AzureChatOpenAI
        logger.info(f"Using Azure OpenAI: {settings.azure_openai_deployment}")
        return AzureChatOpenAI(
            azure_deployment=settings.azure_openai_deployment,
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            streaming=streaming,
            max_tokens=4096,
        )
    elif settings.use_gemini:
        from langchain_google_genai import ChatGoogleGenerativeAI
        logger.info(f"Using Google Gemini: {settings.google_gemini_model}")
        return ChatGoogleGenerativeAI(
            model=settings.google_gemini_model,
            google_api_key=settings.google_api_key,
            streaming=streaming,
            max_output_tokens=4096,
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
    raise ValueError("No LLM configured. Set AZURE_OPENAI_API_KEY or GOOGLE_API_KEY in .env")


def get_llm_from_keys(
    anthropic_key: str = "",
    openai_key: str = "",
    google_key: str = "",
    model: str = "gpt-4o-mini",
    streaming: bool = False,
):
    """Per-request LLM override. Falls back to server-side config."""
    if google_key:
        from langchain_google_genai import ChatGoogleGenerativeAI
        gemini_model = model if model.startswith("gemini") else "gemini-2.5-flash"
        return ChatGoogleGenerativeAI(
            model=gemini_model,
            google_api_key=google_key,
            streaming=streaming,
            max_output_tokens=4096,
        )
    elif anthropic_key:
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(model=model, api_key=anthropic_key, streaming=streaming, max_tokens=4096)
    elif openai_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o-mini", api_key=openai_key, streaming=streaming)

    from src.config import get_settings
    return get_llm(get_settings(), streaming=streaming)
