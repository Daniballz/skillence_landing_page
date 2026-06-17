from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint


class ReqAndResLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:

        # process request and get a response
        response = await call_next(request)

        user_public_id = getattr(request.state, "public_id", None)

        # log the req and res
        logger.info(
            {
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "public_id": user_public_id,
            }
        )
        return response
