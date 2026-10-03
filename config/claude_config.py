import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CLAUDE_MODEL = "claude-3-5-sonnet-20241022"
MAX_TOKENS = 2048
TEMPERATURE = 0.7
