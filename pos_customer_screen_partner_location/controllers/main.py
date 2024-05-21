from werkzeug.exceptions import BadRequest

from odoo import http
from odoo.http import request


class CustomerScreenPartnerLocation(http.Controller):
    @http.route(
        "/customer_screen_location/<int:partner_id>/<int:pos_config_id>/",
        type="http",
        auth="user",
        website=True,
    )
    def customer_screen_location(self, partner_id, pos_config_id):
        partner = request.env["res.partner"].browse(partner_id)
        config = request.env["pos.config"].browse(pos_config_id)
        if not (partner.exists() and config.exists()):
            raise BadRequest("Partner or POS config is not available")
        return request.render(
            "pos_customer_screen_partner_location.customer_screen_pos",
            {
                "partner": partner,
                "config_id": config.id,
            },
        )
