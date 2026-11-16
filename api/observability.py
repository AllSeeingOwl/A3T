"""Error reporting with Sentry.

Sentry stays off unless SENTRY_DSN is set, so local runs and tests send nothing.
"""
import os

import sentry_sdk

# Recent sentry-sdk versions ignore send_default_pii in favour of data_collection,
# whose defaults send request bodies, headers, cookies, query strings, user info
# and local variables. For A3T that would include players' answers and admin
# credentials, so every category is switched off; errors keep their stack traces.
PRIVATE_DATA_COLLECTION = {
    "user_info": False,
    "cookies": {"mode": "off"},
    "http_headers": {"request": {"mode": "off"}},
    "http_bodies": [],
    "url_query_params": {"mode": "off"},
    "stack_frame_variables": False,
    # Prompts and responses from the Anthropic integration
    "gen_ai": {"inputs": False, "outputs": False},
    "database_query_data": False,
    "queues": False,
}


def init_sentry() -> bool:
    """Start Sentry if SENTRY_DSN is set. Returns True when it was started."""
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return False

    sentry_sdk.init(
        dsn=dsn,
        environment=os.getenv("ENVIRONMENT", "production"),
        # Render sets RENDER_GIT_COMMIT on every deploy, so each error shows
        # which commit it came from.
        release=os.getenv("RENDER_GIT_COMMIT"),
        # Share of requests traced for performance data (0 turns it off).
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        data_collection=PRIVATE_DATA_COLLECTION,
    )
    return True
