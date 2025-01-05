import logging
import structlog


def format_message_with_kwargs(logger, log_method, event_dict):
    event_dict["event"] = event_dict["event"].format(**event_dict)
    return event_dict


# Step 1: Set Up Standard logging Configuration

logging.basicConfig(level=logging.INFO, format="%(message)s %(key)s", handlers=[
    logging.StreamHandler(),  # Console logging
    logging.FileHandler("crypto.log")  # File logging
])


# Step 2: Configure structlog to use logging

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        format_message_with_kwargs,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.stdlib.render_to_log_kwargs,
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

# Make the logger available for other modules to import
logger = structlog.get_logger()
