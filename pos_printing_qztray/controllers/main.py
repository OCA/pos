import base64
import io

from escpos.printer import Dummy
from PIL import Image

from odoo import http
from odoo.http import request


class PosEscposController(http.Controller):
    @http.route("/pos/escpos/render-image", type="jsonrpc", auth="user")
    def render_any_report(self, png_base64, width_mm=80):
        p = Dummy()
        try:
            img_bytes = base64.b64decode(png_base64)
            img = Image.open(io.BytesIO(img_bytes))
        except Exception as e:
            return {"error": f"Invalid image: {e}"}
        img = img.convert("1")
        if width_mm == 58:
            target_width = 384
        else:
            target_width = 576
        w_percent = target_width / float(img.width)
        h_size = int(float(img.height) * float(w_percent))
        img = img.resize((target_width, h_size), Image.LANCZOS)
        try:
            p.set(align="center")
            p.image(img)
            p.textln("")
        except Exception as e:
            return {"error": f"ESC/POS image error: {e}"}
        p.cut()
        return base64.b64encode(p.output).decode("utf-8")

    @http.route("/pos/escpos/receipt", type="jsonrpc", auth="user")
    def render_template(self, order_id):
        order = request.env["pos.order"].search(
            [("pos_reference", "ilike", "%" + order_id + "%")], limit=1
        )
        if not order.exists():
            return {"error": "Order not found"}
        company = order.company_id
        currency = order.currency_id
        LINE_WIDTH = 46
        p = Dummy()
        self._get_logo(p, company, LINE_WIDTH)
        self._get_header(p, company)
        self._get_order_info(p, order, LINE_WIDTH)
        self._get_order_lines(p, order, currency, LINE_WIDTH)
        self._get_payments(p, order, currency, LINE_WIDTH)
        self._get_tax_detail(p, order, currency, LINE_WIDTH)
        self._get_footer(p, order, LINE_WIDTH)

        p.cut()
        return base64.b64encode(p.output).decode("utf-8")

    def _table_columns(self, p, text_list, widths, align):
        cols = []
        for i, text in enumerate(text_list):
            width = widths[min(i, len(widths) - 1)]
            alignment = align[min(i, len(align) - 1)]
            text = str(text)

            # Recortar si excede
            if len(text) > width:
                text = text[:width]

            # Alinear
            if alignment == "right":
                text = text.rjust(width)
            elif alignment == "center":
                text = text.center(width)
            else:
                text = text.ljust(width)

            cols.append(text)

        p.textln("".join(cols))

    def _get_logo(self, p, company, LINE_WIDTH):
        if company.logo:
            image_data = base64.b64decode(company.logo)
            p.set(align="center")
            p.image(io.BytesIO(image_data))
            p.textln("")
            p.textln("" * LINE_WIDTH)

    def _get_header(self, p, company):
        p.set(align="center", bold=True, width=2, height=2)
        p.textln(company.name)
        if company.vat:
            p.textln(company.vat)
        p.set(align="center")
        if company.phone:
            p.textln(request.env._("Tel: %(phone)s", phone=company.phone))
        if company.email:
            p.textln(company.email)
        if company.website:
            p.textln(company.website)

    def _get_order_info(self, p, order, LINE_WIDTH):
        p.textln("" * LINE_WIDTH)
        p.set(align="center")
        p.textln(request.env._("Served by %(name)s", name=order.user_id.name))
        p.textln(order.name)

        if order.tracking_number:
            p.set(double_height=True, double_width=True)
            p.textln(order.tracking_number)
            p.set(normal_textsize=True)
        if order.partner_id:
            p.textln("" * LINE_WIDTH)
            p.set(bold=True)
            p.textln(request.env._("CUSTOMER"))
            p.set(normal_textsize=True)
            p.textln(order.partner_id.display_name)
            p.textln(order.partner_id.street or "")
            p.textln(f"{order.partner_id.city or ''} {order.partner_id.zip or ''}")
            p.textln(order.partner_id.country_id.display_name or "")
            p.textln(order.partner_id.vat or "")
            p.textln("" * LINE_WIDTH)

        p.textln("" * LINE_WIDTH)
        p.textln("" * LINE_WIDTH)

    def _get_order_lines(self, p, order, currency, LINE_WIDTH):
        for line in order.lines:
            name = line.product_id.display_name[:30]
            line_amount = line.price_subtotal_incl
            price = f"{line.price_unit:.2f}"

            if currency.position == "after":
                line_amount = f"{line_amount:.2f} {currency.symbol}"
                price = f"{price} {currency.symbol}"
            else:
                line_amount = f"{currency.symbol} {line_amount:.2f}"
                price = f"{currency.symbol} {price}"

            qty_measure = line.product_id.uom_id.name or request.env._("unit(s)")
            spaces = (LINE_WIDTH - 1) - len(name) - len(price)

            p.set(align="left", bold=True)
            p.textln(f"{name}{' ' * spaces}{line_amount}")
            p.set(bold=False, width=1, height=1)
            p.textln(
                request.env._(
                    "%(qty).2f %(um)s x %(price)s",
                    qty=line.qty,
                    um=qty_measure,
                    price=price,
                )
            )

        p.set(align="center")
        p.textln("-" * LINE_WIDTH)

        p.set(align="left", bold=True, width=1, height=1)
        if currency.position == "after":
            amount_total = f"{order.amount_total:.2f} {currency.symbol}"
        else:
            amount_total = f"{currency.symbol} {order.amount_total:.2f}"

        total_label = request.env._("TOTAL")
        spaces = LINE_WIDTH - len(total_label) - len(amount_total)
        p.set(custom_size=True, width=1, height=2)
        p.textln(f"{total_label}{' ' * spaces}{amount_total}")
        p.set(align="left", bold=False, normal_textsize=True)

    def _get_payments(self, p, order, currency, LINE_WIDTH):
        payments = []
        change_lines = []

        for pmt in order.payment_ids:
            if pmt.is_change:
                change_lines.append(pmt)
            else:
                payments.append(pmt)

        for pmt in payments:
            p.set(align="left", bold=False, width=1, height=1)
            name = pmt.payment_method_id.display_name[:30] or ""

            if currency.position == "after":
                amt = f"{pmt.amount:.2f} {currency.symbol}"
            else:
                amt = f"{currency.symbol} {pmt.amount:.2f}"

            spaces = LINE_WIDTH - len(name) - len(amt)
            p.textln(f"{name}{' ' * spaces}{amt}")

        for pmt in change_lines:
            p.set(bold=True, width=2, height=2)
            name = request.env._("CHANGE")
            if currency.position == "after":
                amt = f"{pmt.amount:.2f} {currency.symbol}"
            else:
                amt = f"{currency.symbol} {pmt.amount:.2f}"

            spaces = LINE_WIDTH - len(name) - len(amt)
            p.textln(f"{name}{' ' * spaces}{amt}")

        p.set(normal_textsize=True)
        p.textln("-" * LINE_WIDTH)

    def _get_tax_detail(self, p, order, currency, LINE_WIDTH):
        tax_summary = {}
        for line in order.lines:
            base = line.price_subtotal
            total = line.price_subtotal_incl
            tax_amount = total - base

            for tax in line.tax_ids_after_fiscal_position:
                if tax.name not in tax_summary:
                    tax_summary[tax.description] = {"base": 0.0, "tax": 0.0}
                tax_summary[tax.description]["base"] += base
                tax_summary[tax.description]["tax"] += tax_amount

        if not tax_summary:
            return

        p.textln("")
        p.textln("-" * LINE_WIDTH)

        widths = [20, 12, 12]
        align = ["left", "center", "center"]

        for tax_name, amounts in tax_summary.items():
            base = amounts["base"]
            tax_amt = amounts["tax"]

            if currency.position == "after":
                base_str = f"{base:.2f} {currency.symbol}"
                tax_str = f"{tax_amt:.2f} {currency.symbol}"
            else:
                base_str = f"{currency.symbol} {base:.2f}"
                tax_str = f"{currency.symbol} {tax_amt:.2f}"

            row = [
                tax_name[:20],
                base_str,
                tax_str,
            ]
            column_titles = [
                request.env._("Tax"),
                request.env._("Base"),
                request.env._("Tax Amount"),
            ]
            self._table_columns(p, column_titles, widths, ["left", "center", "center"])
            self._table_columns(p, row, widths, align)

        p.textln("-" * LINE_WIDTH)

    def _get_footer(self, p, order, LINE_WIDTH):
        p.set(align="center")
        p.textln(order.pos_reference)
        p.textln(order.date_order.strftime("%Y-%m-%d %H:%M:%S"))
        if order.company_id.point_of_sale_use_ticket_qr_code:
            p.textln("")
            p.textln(request.env._("Need an invoice? Scan the QR code"))
            p.qr(f"{request.httprequest.host_url}pos/receipt/{order.id}", size=8)
            p.textln(request.env._("Code: ") + (order.ticket_code or ""))
