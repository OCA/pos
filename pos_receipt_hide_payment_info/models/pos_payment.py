# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosPayment(models.Model):
    _inherit = "pos.payment"

    hide_payment_info_in_receipt = fields.Boolean(
        related="payment_method_id.hide_payment_info_in_receipt"
    )
    ticket = fields.Char(compute="_compute_ticket")

    def _compute_ticket(self):
        for rec in self:
            rec.ticket = (
                "POI: 01865196 \n"
                "TICKET CLIENT\n"
                "-------------------------------------- \n"
                "HOUBEN 1930 \n"
                "-------------------------------------- \n"
                "Terminal: 117954EQ \n"
                "Commercant: 38137927 \n"
                "Periode: 0045\n "
                "Transaction: 00000298 \n"
                "Bancontact (A0000001761010) \n"
                "Carte: xxxxxxxxxxxx8271 \n"
                "Numero de sequence carte: 1 \n"
                "Valide jusqu'au: 31/05/28\n "
                "Rondiat/Ives \n"
                "PAIEMENT \n"
                "Date: 27/11/2025 11:49\n "
                "Code d'autorisation: 804885\n "
                "REF: 3376634140063886 \n"
                "Total: 77,69 EUR \n"
                "Contact \n"
                "Methode de lecture: PUCE VERIFIE PAR CODE"
            )
