import sys

from loguru import logger

logger.remove()

logger.add(sys.stdout, level="INFO", format="{time} | {level} -> {message}")
logger.add(sys.stderr, level="WARNING", format="{time} | {level} -> {message}")
