"""Error reporting with Sentry.

Sentry stays off unless SENTRY_DSN is set, so local runs and tests send nothing.
"""
import os

import sentry_sdk


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
        # Players' IP addresses and request details stay out of Sentry.
        send_default_pii=False,
    )
    return True
