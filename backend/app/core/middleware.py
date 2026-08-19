from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
from app.core.security import decode_access_token
import logging

logger = logging.getLogger(__name__)

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = decode_access_token(token)
                if payload and "org_id" in payload:
                    request.state.org_id = payload.get("org_id")
                    request.state.user_id = payload.get("sub")
            except Exception as e:
                logger.error(f"Error parsing token in middleware: {e}")
                
        if not hasattr(request.state, "org_id"):
            request.state.org_id = None
        if not hasattr(request.state, "user_id"):
            request.state.user_id = None
            
        response = await call_next(request)
        return response
