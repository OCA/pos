from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    total_fixed_discount = fields.Float("Fixed Discount", readonly=True)
    total_percent_discount = fields.Float("Percent Discount", readonly=True)
    total_percent_discount_amount = fields.Monetary(
        "Percent Discount Amount", readonly=True
    )
    total_percent_discount_string = fields.Char(
        compute="_compute_total_percent_discount_string", readonly=True
    )

    def _compute_total_percent_discount_string(self):
        for r in self:
            r.total_percent_discount_string = (
                "%"
                + "%g" % r.total_percent_discount
                + "(%s)"
                % self._format_currency_amount(
                    r.total_percent_discount_amount, self.currency_id
                )
            )

    def _format_currency_amount(self, amount, currency_id):
        pre = currency_id.position == "before"
        symbol = "{symbol}".format(symbol=currency_id.symbol or "")
        return "{pre}{0}{post}".format(
            amount, pre=symbol if pre else "", post=symbol if not pre else ""
        )

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        res["total_fixed_discount"] = ui_order.get("total_fixed_discount")
        res["total_percent_discount"] = ui_order.get("total_percent_discount")
        res["total_percent_discount_amount"] = ui_order.get(
            "total_percent_discount_amount"
        )
        return res

    @api.model
    def distribute_decimals(self, *arg, **kwarg):  # noqa: C901
        total = sum([r["price"] for r in kwarg["lines"]])
        numbers = []
        for line in kwarg["lines"]:
            a = line["price"] - (line["manual_discount"] * line["price"] / 100)
            part = line["price"] / total
            fixed_disc = kwarg["amount"] * part
            numbers.append(a - fixed_disc)
        result = []
        done_ins = []
        for i in range(len(numbers)):
            num1 = numbers[i]
            frac1 = int(str(num1).split(".")[1])
            whole1 = int(str(num1).split(".")[0])
            if frac1 == 0:
                result.append(whole1)
                done_ins.append(i)
        for i in range(len(numbers)):
            num1 = numbers[i]
            frac1 = int(str(num1).split(".")[1])
            whole1 = int(str(num1).split(".")[0])
            for j in range(len(numbers)):
                if i == j or i in done_ins or j in done_ins:
                    continue
                num2 = numbers[j]
                frac2 = int(str(num2).split(".")[1])
                whole2 = int(str(num2).split(".")[0])
                decimal_sum = frac1 + frac2

                if decimal_sum in [10, 100]:
                    if (((whole1 + 1) % 2) == 0) and (((whole2 + 1) % 2) == 0):
                        if frac1 > frac2:
                            result.extend([whole1 + 1, whole2])
                            done_ins.extend([i, j])
                        if frac1 <= frac2:
                            result.extend([whole1, whole2 + 1])
                            done_ins.extend([i, j])
                    elif ((whole1 + 1) % 2) != 0 and ((whole2 + 1) % 2) != 0:
                        if frac1 > frac2:
                            result.extend([whole1 + 1, whole2])
                            done_ins.extend([i, j])
                        if frac1 <= frac2:
                            result.extend([whole1, whole2 + 1])
                            done_ins.extend([i, j])
                    elif ((whole1 + 1) % 2) == 0:
                        result.extend([whole1 + 1, whole2])
                        done_ins.extend([i, j])
                    elif ((whole2 + 1) % 2) == 0:
                        result.extend([whole1, whole2 + 1])
                        done_ins.extend([i, j])
                else:
                    continue
        for i in range(len(numbers)):
            if i not in done_ins:
                result.append(numbers[i])
        fin_res = []
        for ind in range(len(result)):
            orig_price = kwarg["lines"][ind]["price"]
            after_man_disc = (
                orig_price - orig_price * kwarg["lines"][ind]["manual_discount"] / 100
            )
            abs_disc = after_man_disc - result[ind]
            fin = round(abs_disc * 100 / after_man_disc, 2)
            fin_res.append(fin)
        return fin_res


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    fixed_discount = fields.Float("Fixed Discount")
    fixed_discount_relative = fields.Float(
        "Fixed Discount Rel.", help="Based on product price"
    )
    fixed_discount_relative_amount = fields.Monetary(
        "Fixed Disc. Amount", help="Based on product price"
    )
    percent_discount = fields.Float("Percent Discount")
    percent_discount_relative = fields.Float(
        "Percent Discount Rel.", help="Based on product price"
    )
    percent_discount_relative_amount = fields.Monetary(
        "Percent Disc. Amount", help="Based on product price"
    )

    @api.depends("qty", "price_unit", "manual_discount", "fixed_discount")
    def _compute_relative_discounts(self):
        super(PosOrderLine, self)._compute_relative_discounts()
        for rec in self:
            subtotal = rec.qty * rec.price_unit
            rec.fixed_discount_relative_amount = subtotal * rec.fixed_discount / 100
            rec.fixed_discount_relative = (
                100 * rec.fixed_discount_relative_amount / subtotal
            )
            rec.percent_discount_relative_amount = subtotal * rec.percent_discount / 100
            rec.percent_discount_relative = (
                100 * rec.percent_discount_relative_amount / subtotal
            )
