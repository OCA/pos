# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from .hooks import post_init_hook
try:
    from . import models
except ImportError:  # pragma: no-cover
    import logging
    _logger = logging.getLogger(__name__)
    _logger.debug("Missing dependency", exc_info=True)
