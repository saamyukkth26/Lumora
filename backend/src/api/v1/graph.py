from fastapi import APIRouter, HTTPException
from src.knowledge_graph import client as kg
from src.knowledge_graph.schema import new_id
from src.models.graph import GraphNode, GraphEdge, SubGraph, GraphQuery, NodeCreate, EdgeCreate
from datetime import datetime, timezone

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/nodes", response_model=list[dict])
async def list_nodes(node_type: str | None = None, limit: int = 200, skip: int = 0):
    nodes = await kg.get_all_nodes(node_type=node_type, limit=limit + skip)
    return nodes[skip:]


@router.get("/edges", response_model=list[dict])
async def list_edges(node_id: str | None = None, limit: int = 500):
    return await kg.get_all_edges(node_id=node_id, limit=limit)


@router.get("/subgraph/{node_id}", response_model=dict)
async def get_subgraph(node_id: str, depth: int = 1):
    return await kg.get_subgraph(node_id, depth=min(depth, 3))


@router.post("/query", response_model=dict)
async def query_graph(query: GraphQuery):
    # For NetworkX fallback, delegate to get_subgraph or node listing
    nodes = await kg.get_all_nodes(node_type=query.node_type, limit=query.limit)
    edges = await kg.get_all_edges(limit=query.limit)
    return {"nodes": nodes, "edges": edges}


@router.post("/nodes", response_model=dict)
async def create_node(node: NodeCreate):
    node_id = new_id()
    await kg.add_node(node_id, node.label, node.node_type, node.properties)
    return {"node_id": node_id, "label": node.label, "node_type": node.node_type}


@router.post("/edges", response_model=dict)
async def create_edge(edge: EdgeCreate):
    edge_id = await kg.add_edge(edge.source_id, edge.target_id, edge.relation, edge.weight, edge.properties)
    return {"edge_id": edge_id, "source_id": edge.source_id, "target_id": edge.target_id, "relation": edge.relation}


@router.delete("/nodes/{node_id}")
async def delete_node(node_id: str):
    await kg.delete_node(node_id)
    return {"deleted": True, "node_id": node_id}


@router.get("/export", response_model=dict)
async def export_graph():
    return await kg.export_graph()
