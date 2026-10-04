import sys
import os

from src.mcp_server import mcp_server, app, run_stdio

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--http":
        import uvicorn
        port = int(os.getenv("PORT", 8000))
        uvicorn.run("mcp.server:app", host="0.0.0.0", port=port, reload=False)
    else:
        run_stdio()
