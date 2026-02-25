# Copyright 2026 Therp BV <https://therp.nl>.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo import models
from odoo.osv.expression import AND


class PosSession(models.Model):
    _inherit = "pos.session"

    def _get_partners_domain(self):
        domain = super()._get_partners_domain()
        return AND([domain, [("pos_pay_on_account", "=", True)]])

    def _loader_params_res_partner(self):
        # include boolean in the search list for fields
        params = super()._loader_params_res_partner()
        fields = params["search_params"].setdefault("fields", [])
        if "pos_pay_on_account" not in fields:
            fields.append("pos_pay_on_account")
        return params

    def _get_pos_ui_res_partner(self, params):
        """When limited_partners_loading=True, core overwrites the domain, so we
        apply a final filter on the loaded partner payload"""
        partners = super()._get_pos_ui_res_partner(params)
        return [p for p in partners if p.get("pos_pay_on_account")]

    def get_pos_ui_res_partner_by_params(self, custom_search_params):
        """
        Ensure restriction also applies to 'Search More'
        """
        custom_search_params = dict(custom_search_params or {})
        domain = custom_search_params.get("domain", [])
        custom_search_params["domain"] = AND(
            [domain, [("pos_pay_on_account", "=", True)]]
        )
        # Ensure our boolean is present so the filter can work
        # though we enforce it in the domain anyway.
        # Nevertheless, better safe than sorry
        fields = custom_search_params.get("fields") or []
        if "pos_pay_on_account" not in fields:
            custom_search_params["fields"] = list(fields) + ["pos_pay_on_account"]
        partners = super().get_pos_ui_res_partner_by_params(custom_search_params)
        return [p for p in partners if p.get("pos_pay_on_account")]
