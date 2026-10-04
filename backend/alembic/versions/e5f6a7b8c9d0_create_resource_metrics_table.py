"""Create resource_metrics table

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-08-10 23:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'resource_metrics',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('resource_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('cpu_utilization', sa.Float(), nullable=False),
        sa.Column('memory_utilization', sa.Float(), nullable=False),
        sa.Column('storage_utilization', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('network_utilization', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['resource_id'], ['cloud_resources.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resource_metrics_resource_id'), 'resource_metrics', ['resource_id'], unique=False)
    op.create_index(op.f('ix_resource_metrics_timestamp'), 'resource_metrics', ['timestamp'], unique=False)
    op.create_index('ix_resource_metrics_res_time', 'resource_metrics', ['resource_id', 'timestamp'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_resource_metrics_res_time', table_name='resource_metrics')
    op.drop_index(op.f('ix_resource_metrics_timestamp'), table_name='resource_metrics')
    op.drop_index(op.f('ix_resource_metrics_resource_id'), table_name='resource_metrics')
    op.drop_table('resource_metrics')
