from typing import TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import math

T = TypeVar('T')

async def paginate(db: AsyncSession, query, params) -> dict:
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.limit(params.size).offset(params.offset)
    result = await db.execute(query)
    items = result.scalars().all()
    if not isinstance(items, list):
        items = list(items)

    return {
        "items": items,
        "total": total,
        "page": params.page,
        "size": params.size,
        "pages": math.ceil(total / params.size) if total > 0 else 0
    }
