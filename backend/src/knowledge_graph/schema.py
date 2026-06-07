from pydantic import BaseModel
from typing import Any
from datetime import datetime, timezone
import uuid

NODE_TYPES = {"concept", "document", "person", "event", "place", "topic", "paper"}
RELATION_TYPES = {"related_to", "mentions", "authored_by", "cites", "part_of", "derived_from", "contradicts"}


def new_id() -> str:
    return str(uuid.uuid4())[:8]
