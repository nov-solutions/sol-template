import sys

import settings.components.allauth  # noqa
import settings.components.base  # noqa
import settings.components.logging_settings  # noqa
import settings.components.mail  # noqa
import settings.components.metrics  # noqa
import settings.components.redis  # noqa
import settings.components.sentry  # noqa
import settings.components.spectacular  # noqa
import settings.components.stripe  # noqa
import settings.components.user  # noqa
from settings.utils import flatten_module_attributes

flatten_module_attributes(
    module=sys.modules[__name__],
    imports=list(sys.modules.keys()),
    prefix="settings.",
)
