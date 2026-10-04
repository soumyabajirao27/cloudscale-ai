"""ORM models package.

Importing models here registers them on ``Base.metadata`` so Alembic's
``--autogenerate`` can discover every table.

Any future model must be imported here as well.
"""

from app.models.base import BaseModel
from app.models.metric import ResourceMetric
from app.models.resource import CloudResource
from app.models.user import User

__all__ = ["BaseModel", "CloudResource", "ResourceMetric", "User"]



