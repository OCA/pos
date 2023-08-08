from collections import defaultdict

from odoo import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def _payment_fields(self, order, ui_paymentline):
        fields = super()._payment_fields(order, ui_paymentline)
        if not ui_paymentline.get("coupon_data"):
            return fields
        coupon_id = ui_paymentline.get("coupon_data").get("coupon", {}).get("coupon_id")
        fields.update({"coupon_id": coupon_id})
        return fields

    def apply_redeem_amount(self, coupons_data):
        for coupon_id, amount in coupons_data.items():
            card = self.env["loyalty.card"].browse(coupon_id)
            if card:
                card.points -= amount

    def retrieve_coupon_data(self, order):
        payments = [
            payment[2] for payment in order.get("data", {}).get("statement_ids", {})
        ]
        coupons_data = {
            e.get("coupon").get("coupon_id"): e.get("amount")
            for e in list(map(lambda x: x.get("coupon_data"), payments))
            if e
        }
        return coupons_data

    @api.model
    def _process_order(self, order, draft, existing_order):
        order_id = super()._process_order(order, draft, existing_order)
        order_db = self.browse(order_id)

        is_loyalty = order_db.payment_ids.filtered(
            lambda x: x.payment_method_id.used_for_loyalty_program
        )
        if order and order_db.amount_total > 0 and is_loyalty:
            data = self.retrieve_coupon_data(order)
            self.apply_redeem_amount(data)
        return order_id

    @api.model
    def get_loy_card_reports_from_order(self, order_ids):
        card_ids = (
            self.env["pos.order"].browse(order_ids).mapped("payment_ids.coupon_id")
        )
        loy_cards = self.env["loyalty.card"].search([("id", "in", card_ids.ids)])
        if not loy_cards:
            return False
        report_per_program = {}
        coupon_per_report = defaultdict(list)
        for coupon in loy_cards:
            trigger = "create"
            if coupon.points == 0:
                trigger = "points_reach"
            if (
                coupon.program_id not in report_per_program
                or not report_per_program[coupon.program_id]
            ):
                report_per_program[
                    coupon.program_id
                ] = coupon.program_id.communication_plan_ids.filtered(
                    lambda c, trig=trigger: c.trigger == trig
                ).pos_report_print_id
            for report in report_per_program[coupon.program_id]:
                coupon_per_report[report.id].append(coupon.id)
        return {"coupon_report": coupon_per_report}
