#!/usr/bin/env bash
set -e

# Script to start the A3T Question-Validator MCP Server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

MODE="${1:-stdio}"

echo "Starting A3T Question-Validator MCP Server (Mode: ${MODE})..."

if [ "${MODE}" = "--http" ] || [ "${MODE}" = "http" ]; then
    python3 -m src.mcp_server --http
else
    python3 -m src.mcp_server
fi
