from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.core.database import get_session

session_deps = Annotated[Session, Depends(get_session)]
