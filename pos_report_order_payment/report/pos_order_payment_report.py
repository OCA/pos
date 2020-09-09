# Copyright 2020 Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models, fields, tools


class PosOrderPaymentReport(models.Model):
    _name = 'report.pos.order.payment'
    _description = "Point of Sale Order Payments Report"
    _auto = False
    _order = 'date desc'

    date = fields.Datetime(
        string='Order Date',
        readonly=True,
    )
    state = fields.Selection(
        [
            ('draft', 'New'),
            ('paid', 'Paid'),
            ('done', 'Posted'),
            ('invoiced', 'Invoiced'),
            ('cancel', 'Cancelled'),
        ],
        string='Status',
        readonly=True,
    )
    order_id = fields.Many2one(
        'pos.order',
        string='Order',
        readonly=True,
    )
    session_id = fields.Many2one(
        'pos.session',
        string='Session',
        readonly=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Customer',
        readonly=True,
    )
    pricelist_id = fields.Many2one(
        'product.pricelist',
        string='Pricelist',
        readonly=True,
    )
    user_id = fields.Many2one(
        'res.users',
        string='Salesperson',
        readonly=True,
    )
    location_id = fields.Many2one(
        'stock.location',
        string='Location',
        readonly=True,
    )
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        readonly=True,
    )
    journal_id = fields.Many2one(
        'account.journal',
        string='Journal',
        readonly=True,
    )
    config_id = fields.Many2one(
        'pos.config',
        string='Point of Sale',
        readonly=True,
    )
    pos_categ_id = fields.Many2one(
        'pos.category',
        string='PoS Category',
        readonly=True,
    )
    product_id = fields.Many2one(
        'product.product',
        string='Product',
        readonly=True,
    )
    product_tmpl_id = fields.Many2one(
        'product.template',
        string='Product Template',
        readonly=True,
    )
    product_categ_id = fields.Many2one(
        'product.category',
        string='Product Category',
        readonly=True,
    )
    payment_journal_id = fields.Many2one(
        "account.journal",
        string="Payment Journal",
        readonly=True,
    )
    payment_amount = fields.Float(
        string="Paid Amount",
        readonly=True,
    )
    invoiced = fields.Boolean(
        readonly=True,
    )

    def _select(self):
        return """
            SELECT
                ROW_NUMBER() OVER() AS id,
                s.date_order AS date,
                s.id as order_id,
                s.partner_id AS partner_id,
                s.state AS state,
                s.user_id AS user_id,
                s.location_id AS location_id,
                s.company_id AS company_id,
                s.sale_journal AS journal_id,
                l.product_id AS product_id,
                pt.categ_id AS product_categ_id,
                p.product_tmpl_id,
                ps.config_id,
                pt.pos_categ_id,
                s.pricelist_id,
                s.session_id,
                s.invoice_id IS NOT NULL AS invoiced,
                st.journal_id AS payment_journal_id,
                st.amount AS payment_amount
        """

    def _from(self):
        return """
            FROM pos_order_line AS l
            LEFT JOIN pos_order s ON (s.id = l.order_id)
            LEFT JOIN product_product p ON (l.product_id = p.id)
            LEFT JOIN product_template pt ON (p.product_tmpl_id = pt.id)
            LEFT JOIN uom_uom u ON (u.id = pt.uom_id)
            LEFT JOIN pos_session ps ON (s.session_id = ps.id)
            INNER JOIN (%s) st ON (st.pos_line_id = l.id)
        """ % (self._payment_query())

    def _payment_query(self):
        """
        Returns a query that distributes the pos.order payments
        among the pos.order.lines
        """
        return """
            SELECT
                pol.id AS pos_line_id,
                sl.id AS statement_line_id,
                st.journal_id AS journal_id,
                (
                    sl.amount / po.amount_total * pol.price_subtotal_incl
                ) AS amount
            FROM pos_order_line AS pol
            INNER JOIN pos_order AS po
                ON pol.order_id = po.id
            INNER JOIN account_bank_statement_line AS sl
                ON pol.order_id = sl.pos_statement_id
            INNER JOIN account_bank_statement AS st
                ON st.id = sl.statement_id
        """

    def _group_by(self):
        return ""

    def _having(self):
        return ""

    @api.model_cr
    def init(self):
        tools.drop_view_if_exists(self._cr, self._table)
        self._cr.execute("""
            CREATE OR REPLACE VIEW %s AS (
                %s
                %s
                %s
                %s
            )
        """ % (
            self._table,
            self._select(), self._from(), self._group_by(), self._having(),
        ))
