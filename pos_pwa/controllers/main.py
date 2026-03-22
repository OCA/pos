import logging

from odoo import http
from odoo.http import request
from odoo.tools import file_open

_logger = logging.getLogger(__name__)


class PosPWAController(http.Controller):
    @http.route(
        "/pos/service-worker.js",
        type="http",
        auth="public",
        methods=["GET"],
        readonly=True,
    )
    def pos_service_worker(self):
        """Serve the POS Service Worker with correct scope headers."""
        with file_open("pos_pwa/static/src/js/pos_sw.js") as f:
            body = f.read()
        return request.make_response(
            body,
            headers=[
                ("Content-Type", "application/javascript"),
                ("Service-Worker-Allowed", "/pos"),
                ("Cache-Control", "no-cache"),
            ],
        )

    @http.route(
        ["/pos/pwa_manifest", "/pos/manifest.webmanifest"],
        type="http",
        auth="public",
        methods=["GET"],
        readonly=True,
    )
    def pos_manifest(self):
        """Return the PWA manifest for the POS application."""
        import json

        manifest = self._get_pos_manifest()
        body = json.dumps(manifest)
        return request.make_response(
            body,
            headers=[
                ("Content-Type", "application/manifest+json"),
            ],
        )

    def _get_pos_manifest(self):
        """Build the POS PWA manifest dictionary."""
        return {
            "name": "Odoo POS",
            "short_name": "POS",
            "scope": "/pos",
            "start_url": "/pos/ui",
            "display": "standalone",
            "background_color": "#222222",
            "theme_color": "#714B67",
            "prefer_related_applications": False,
            "icons": [
                {
                    "src": "/point_of_sale/static/src/img/favicon.ico",
                    "sizes": "48x48",
                    "type": "image/x-icon",
                },
                {
                    "src": "/pos_pwa/static/description/icon.svg",
                    "sizes": "any",
                    "type": "image/svg+xml",
                },
            ],
        }

    @http.route(
        "/pos/offline",
        type="http",
        auth="public",
        methods=["GET"],
        readonly=True,
    )
    def pos_offline(self):
        """Offline fallback page - served as static HTML.

        This page is pre-cached by the Service Worker during install.
        It must not depend on QWeb rendering (server may be unreachable).
        """
        with file_open("pos_pwa/static/src/html/offline.html") as f:
            body = f.read()
        return request.make_response(
            body,
            headers=[
                ("Content-Type", "text/html; charset=utf-8"),
            ],
        )
