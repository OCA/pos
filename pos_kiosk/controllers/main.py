import werkzeug.utils

from odoo import http
from odoo.http import request
from odoo.osv.expression import AND


class PosKioskController(http.Controller):
    @http.route(["/pos_kiosk/web", "/pos_kiosk/ui"], type="http", auth="user")
    def pos_kiosk_web(self, config_id=False, **k):
        domain = [
            ("state", "in", ["opening_control", "opened"]),
            ("user_id", "=", request.session.uid),
            ("rescue", "=", False),
        ]

        if config_id:
            domain = AND([domain, [("config_id", "=", config_id)]])
        pos_session = request.env["pos.session"].sudo().search(domain, limit=1)

        if not pos_session and config_id:
            domain = [
                ("state", "in", ["opening_control", "opened"]),
                ("rescue", "=", False),
                ("config_id", "=", int(config_id)),
            ]
            pos_session = request.env["pos.session"].sudo().search(domain, limit=1)

        if not pos_session:
            return werkzeug.utils.redirect(
                "/web#action=point_of_sale.action_client_pos_menu"
            )

        company = pos_session.company_id
        session_info = request.env["ir.http"].session_info()
        session_info["user_context"]["allowed_company_ids"] = company.ids
        session_info["user_companies"] = {
            "current_company": (company.id, company.name),
            "allowed_companies": [(company.id, company.name)],
        }
        context = {
            "session_info": session_info,
            "login_number": pos_session.login(),
        }

        response = request.render("pos_kiosk.index", context)
        response.headers["Cache-Control"] = "no-store"
        return response
