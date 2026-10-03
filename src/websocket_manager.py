import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger("a3t_websocket_manager")


class ConnectionManager:
    """
    Manages WebSocket connections and room-based broadcasting for A3T multiplayer games.
    """
    def __init__(self):
        # game_id_str -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, game_id: str):
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = []
        self.active_connections[game_id].append(websocket)
        logger.info("WebSocket connected to room %s", game_id)

    def disconnect(self, websocket: WebSocket, game_id: str):
        if game_id in self.active_connections:
            if websocket in self.active_connections[game_id]:
                self.active_connections[game_id].remove(websocket)
            if not self.active_connections[game_id]:
                del self.active_connections[game_id]
        logger.info("WebSocket disconnected from room %s", game_id)

    async def broadcast_to_game(self, game_id: str, event: str, data: Dict[str, Any]):
        """
        Broadcast an event and data dictionary to all connected WebSockets in a game session room.
        """
        if game_id not in self.active_connections:
            return

        message = {
            "event": event,
            "data": data
        }

        stale_connections = []
        for connection in self.active_connections[game_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning("Error sending message on websocket: %s", str(e))
                stale_connections.append(connection)

        for conn in stale_connections:
            self.disconnect(conn, game_id)


manager = ConnectionManager()
