from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def button_show_wizard_pay_in_invoice(self):
        action = self._get_action_wizard_pay_invoice()
        action["context"]["pos_pay_invoice_type"] = "vendor"
        action["context"]["pos_pay_invoice_domain"] = "in_invoice"
        return action

    def button_show_wizard_pay_out_refund(self):
        action = self._get_action_wizard_pay_invoice()
        action["context"]["pos_pay_invoice_type"] = "vendor"
        action["context"]["pos_pay_invoice_domain"] = "out_refund"
        return action

    def button_show_wizard_pay_out_invoice(self):
        action = self._get_action_wizard_pay_invoice()
        action["context"]["pos_pay_invoice_type"] = "customer"
        action["context"]["pos_pay_invoice_domain"] = "out_invoice"
        return action

    def _get_action_wizard_pay_invoice(self):
        cash_journal = self.cash_journal_id
        action = self.env["ir.actions.actions"]._for_xml_id(
            "pos_session_pay_invoice.action_pos_invoice_in_control"
        )
        action["context"] = {
            "active_ids": cash_journal.ids,
            "active_name": cash_journal._name,
            "pos_session_id": self.id,
        }
        return action
