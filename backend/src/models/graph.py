from pydantic import BaseModel, Field
from typing import Any
from datetime import datetime


class GraphNode(BaseModel):
    node_id: str
    label: str
    node_type: str  # "concept" | "document" | "person" | "event" | "place" | "topic"
    properties: dict[str, Any] = {}
    created_at: datetime | None = None


class GraphEdge(BaseModel):
    edge_id: str
    source_id: str
    target_id: str
    relation: str  # "related_to" | "mentions" | "authored_by" | "cites" | "part_of"
    weight: float = 1.0
    properties: dict[str, Any] = {}


class SubGraph(BaseModel):
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []


class GraphQuery(BaseModel):
    cypher: str | None = None
    node_type: str | None = None
    relation: str | None = None
    limit: int = Field(default=50, le=500)


class NodeCreate(BaseModel):
    label: str
    node_type: str = "concept"
    properties: dict[str, Any] = {}


class EdgeCreate(BaseModel):
    source_id: str
    target_id: str
    relation: str = "related_to"
    weight: float = 1.0
    properties: dict[str, Any] = {}
