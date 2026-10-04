"""Create cloud_resources table

Revision ID: d4e5f6a7b8c9
Revises: c2a3efb6ddb4
Create Date: 2026-08-10 23:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c2a3efb6ddb4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'cloud_resources',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('provider_type', sa.String(length=50), nullable=False),
        sa.Column('region', sa.String(length=50), nullable=False),
        sa.Column('cpu_utilization', sa.Float(), nullable=False),
        sa.Column('memory_utilization', sa.Float(), nullable=False),
        sa.Column('storage_utilization', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('network_utilization', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('current_capacity', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('estimated_cost', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cloud_resources_user_id'), 'cloud_resources', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_cloud_resources_user_id'), table_name='cloud_resources')
    op.drop_table('cloud_resources')
