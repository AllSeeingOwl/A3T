"""Add questions table, synced one-way from the A3T-Q&A-Database Google Sheet

The sheet's "Master Database" tab is the source of truth. A Google Apps Script
bound to the sheet (scripts/sheets_sync/Code.gs) upserts every row into this
table, keyed on the sheet's ID column, and deletes rows removed from the sheet.

Revision ID: 002
Revises: 001
Create Date: 2026-11-21 00:00:00.000000

"""
from alembic import op

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        create table public.questions (
            id                    text primary key,
            deck_theme            text,
            sequence              text,
            category              text,
            difficulty            text,
            question_type         text,
            question              text not null,
            answer                text,
            link                  text,
            notes                 text,
            connection_type       text,
            franchise             text,
            status                text,
            safety_checks_passed  boolean not null default false,
            sub_theme             text,
            readiness_status      text,
            primary_pillar        text,
            sheet_row             integer,
            synced_at             timestamptz not null default now(),
            created_at            timestamptz not null default now()
        )
    """)
    op.execute("create index questions_primary_pillar_idx on public.questions (primary_pillar)")
    op.execute("create index questions_deck_theme_idx on public.questions (deck_theme)")
    # No policies: only the service role (backend and sheet sync) can read or write.
    op.execute("alter table public.questions enable row level security")


def downgrade():
    op.execute("drop table if exists public.questions")
