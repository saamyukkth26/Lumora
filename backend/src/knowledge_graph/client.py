from __future__ import annotations
import json
from pathlib import Path
from typing import Any
from src.utils.logging import get_logger

logger = get_logger(__name__)

_graph = None  # networkx.DiGraph
_neo4j_driver = None
_use_neo4j = False
_graph_path = "./data/graph.json"


async def init_graph(
    neo4j_uri: str = "",
    neo4j_user: str = "neo4j",
    neo4j_password: str = "",
    fallback_path: str = "./data/graph.json",
) -> None:
    global _graph, _neo4j_driver, _use_neo4j, _graph_path
    _graph_path = fallback_path

    if neo4j_uri:
        try:
            from neo4j import AsyncGraphDatabase
            _neo4j_driver = AsyncGraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
            await _neo4j_driver.verify_connectivity()
            _use_neo4j = True
            logger.info("Connected to Neo4j AuraDB")
            return
        except Exception as e:
            logger.warning(f"Neo4j unavailable ({e}), falling back to NetworkX")

    import networkx as nx
    path = Path(fallback_path)
    if path.exists():
        data = json.loads(path.read_text())
        _graph = nx.node_link_graph(data)
        logger.info(f"Loaded NetworkX graph: {_graph.number_of_nodes()} nodes, {_graph.number_of_edges()} edges")
    else:
        _graph = nx.DiGraph()
        logger.info("Created new NetworkX graph")


def _save_graph() -> None:
    if _graph is None:
        return
    import networkx as nx
    Path(_graph_path).parent.mkdir(parents=True, exist_ok=True)
    data = nx.node_link_data(_graph)
    Path(_graph_path).write_text(json.dumps(data, default=str))


async def add_node(node_id: str, label: str, node_type: str, properties: dict = {}) -> None:
    if _use_neo4j and _neo4j_driver:
        async with _neo4j_driver.session() as session:
            await session.run(
                "MERGE (n {node_id: $id}) SET n.label = $label, n.type = $type, n += $props",
                id=node_id, label=label, type=node_type, props=properties,
            )
    else:
        _graph.add_node(node_id, label=label, node_type=node_type, **properties)
        _save_graph()


async def add_edge(source_id: str, target_id: str, relation: str, weight: float = 1.0, properties: dict = {}) -> str:
    import uuid
    edge_id = str(uuid.uuid4())[:8]
    if _use_neo4j and _neo4j_driver:
        async with _neo4j_driver.session() as session:
            await session.run(
                f"MATCH (a {{node_id: $src}}), (b {{node_id: $tgt}}) "
                f"MERGE (a)-[r:{relation.upper()}]->(b) SET r.weight = $w, r.edge_id = $eid",
                src=source_id, tgt=target_id, w=weight, eid=edge_id,
            )
    else:
        _graph.add_edge(source_id, target_id, relation=relation, weight=weight, edge_id=edge_id, **properties)
        _save_graph()
    return edge_id


async def get_all_nodes(node_type: str | None = None, limit: int = 200) -> list[dict]:
    if _use_neo4j and _neo4j_driver:
        query = "MATCH (n) WHERE $type IS NULL OR n.type = $type RETURN n LIMIT $limit"
        async with _neo4j_driver.session() as session:
            result = await session.run(query, type=node_type, limit=limit)
            return [dict(r["n"]) async for r in result]
    else:
        nodes = []
        for nid, data in list(_graph.nodes(data=True))[:limit]:
            if node_type and data.get("node_type") != node_type:
                continue
            nodes.append({"node_id": nid, **data})
        return nodes


async def get_all_edges(node_id: str | None = None, limit: int = 500) -> list[dict]:
    if _use_neo4j and _neo4j_driver:
        query = "MATCH (a)-[r]->(b) WHERE $nid IS NULL OR a.node_id = $nid OR b.node_id = $nid RETURN a.node_id, b.node_id, r LIMIT $limit"
        async with _neo4j_driver.session() as session:
            result = await session.run(query, nid=node_id, limit=limit)
            return [{"source_id": r["a.node_id"], "target_id": r["b.node_id"], **dict(r["r"])} async for r in result]
    else:
        edges = []
        for src, tgt, data in list(_graph.edges(data=True))[:limit]:
            if node_id and src != node_id and tgt != node_id:
                continue
            edges.append({"source_id": src, "target_id": tgt, **data})
        return edges


async def get_subgraph(node_id: str, depth: int = 1) -> dict:
    if _use_neo4j and _neo4j_driver:
        query = f"MATCH (n {{node_id: $id}})-[r*0..{depth}]-(m) RETURN n, r, m"
        async with _neo4j_driver.session() as session:
            result = await session.run(query, id=node_id)
            nodes, edges = {}, []
            async for record in result:
                for n in [record.get("n"), record.get("m")]:
                    if n:
                        nd = dict(n)
                        nodes[nd.get("node_id", "")] = nd
            return {"nodes": list(nodes.values()), "edges": edges}
    else:
        import networkx as nx
        if node_id not in _graph:
            return {"nodes": [], "edges": []}
        ego = nx.ego_graph(_graph, node_id, radius=depth, undirected=True)
        nodes = [{"node_id": n, **data} for n, data in ego.nodes(data=True)]
        edges = [{"source_id": s, "target_id": t, **data} for s, t, data in ego.edges(data=True)]
        return {"nodes": nodes, "edges": edges}


async def delete_node(node_id: str) -> None:
    if _use_neo4j and _neo4j_driver:
        async with _neo4j_driver.session() as session:
            await session.run("MATCH (n {node_id: $id}) DETACH DELETE n", id=node_id)
    else:
        if node_id in _graph:
            _graph.remove_node(node_id)
            _save_graph()


async def export_graph() -> dict:
    nodes = await get_all_nodes(limit=10000)
    edges = await get_all_edges(limit=50000)
    return {"nodes": nodes, "edges": edges}
