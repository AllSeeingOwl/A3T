"""Initial schema for A3T

Revision ID: 001
Revises:
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create games table
    op.create_table(
        'games',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('host_id', sa.String(length=36), nullable=False),
        sa.Column('deck_id', sa.String(length=255), nullable=False),
        sa.Column('pin', sa.String(length=6), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('pin')
    )

    # Create players table
    op.create_table(
        'players',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('game_id', sa.String(length=36), sa.ForeignKey('games.id'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('is_host', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create answers table
    op.create_table(
        'answers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('game_id', sa.String(length=36), sa.ForeignKey('games.id'), nullable=False),
        sa.Column('player_id', sa.String(length=36), sa.ForeignKey('players.id'), nullable=False),
        sa.Column('question_id', sa.String(length=255), nullable=False),
        sa.Column('answer_text', sa.Text(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('submitted_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('answers')
    op.drop_table('players')
    op.drop_table('games')
