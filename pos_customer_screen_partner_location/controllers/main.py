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
        return request.render(
            "pos_customer_screen_partner_location.customer_screen_pos",
            {
                "partner": partner,
                "config_id": pos_config_id,
            },
        )
