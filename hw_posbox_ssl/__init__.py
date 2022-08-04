import logging
import ssl
import werkzeug.serving
from odoo.service.server import \
    ThreadedWSGIServerReloadable, LoggingBaseWSGIServerMixIn
from odoo.tools.config import config

_logger = logging.getLogger(__name__)


class PatchedThreadedWSGIServer(werkzeug.serving.ThreadedWSGIServer):
    def __init__(self, host, port, app, handler=None,
                 passthrough_errors=False, ssl_context=None, fd=None):
        ctx = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
        cert_name = config.get(
            'posbox_ssl_cert', '/home/pi/ssl.cert')
        cert_key = config.get(
            'posbox_ssl_key', '/home/pi/ssl.key')
        ssl_context = 'adhoc'
        try:
            ctx = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
            ctx.load_cert_chain(cert_name, cert_key)
            ssl_context = ctx
        except FileNotFoundError:
            _logger.warn(
                "SSL certificate (%s) or key (%s) not found, "
                "using adhoc certificate",
                cert_name, cert_key
            )
        return super(PatchedThreadedWSGIServer, self).__init__(
            host, port, app, handler=handler,
            passthrough_errors=passthrough_errors,
            ssl_context=ssl_context,
            fd=fd
        )


ThreadedWSGIServerReloadable.__bases__ = (
    LoggingBaseWSGIServerMixIn,
    PatchedThreadedWSGIServer
)
