"""Sentry must never be started with settings that send players' data."""
from unittest import mock

from api import observability


def test_sentry_stays_off_without_dsn(monkeypatch):
    monkeypatch.delenv("SENTRY_DSN", raising=False)
    with mock.patch.object(observability.sentry_sdk, "init") as init:
        assert observability.init_sentry() is False
    init.assert_not_called()


def test_sentry_collects_no_personal_data(monkeypatch):
    monkeypatch.setenv("SENTRY_DSN", "https://key@o1.ingest.de.sentry.io/1")
    with mock.patch.object(observability.sentry_sdk, "init") as init:
        assert observability.init_sentry() is True
    data = init.call_args.kwargs["data_collection"]
    assert data["user_info"] is False
    assert data["http_bodies"] == []
    assert data["stack_frame_variables"] is False
    for key in ("cookies", "url_query_params"):
        assert data[key] == {"mode": "off"}
    assert data["http_headers"] == {"request": {"mode": "off"}}
    assert data["gen_ai"] == {"inputs": False, "outputs": False}
    assert "send_default_pii" not in init.call_args.kwargs
