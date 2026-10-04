from api.db import fix_database_url


def test_fix_database_url_postgres_prefix():
    url = "postgres://user:pass@host:5432/dbname"
    expected = "postgresql+psycopg2://user:pass@host:5432/dbname"
    assert fix_database_url(url) == expected


def test_fix_database_url_postgresql_prefix():
    url = "postgresql://user:pass@host:5432/dbname"
    expected = "postgresql+psycopg2://user:pass@host:5432/dbname"
    assert fix_database_url(url) == expected


def test_fix_database_url_already_explicit_driver():
    url = "postgresql+psycopg2://user:pass@host:5432/dbname"
    assert fix_database_url(url) == url


def test_fix_database_url_sqlite():
    url = "sqlite:///./test.db"
    assert fix_database_url(url) == url
