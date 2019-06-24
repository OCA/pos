# Copyright 2019 Martronic SA (https://www.martronic.ch)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import tools, _, api, fields, models
from odoo.exceptions import ValidationError

class OrdersUnified(models.Model):
    _name = "orders.unified"
    _auto = False
    _order = 'date_order desc'

    @api.model
    def _get_targets(self):
        sales = list(map(lambda x: ('sale.order,'+str(x.id), x.name), self.env["sale.order"].search([])))
        sales += list(map(lambda x: ('pos.order,'+str(x.id), x.name), self.env["pos.order"].search([])))
        return sales

    item_id = fields.Integer('Item ID', readonly=True)
    real_order_id = fields.Reference(selection='_get_targets', readonly=True, string="Order")
    partner_id = fields.Many2one('res.partner', 'Partner', readonly=True)
    team_id = fields.Many2one('crm.team', 'Sales Channel', readonly=True, oldname='section_id')
    analytic_account_id = fields.Many2one('account.analytic.account', 'Analytic Account', readonly=True)
    pricelist_id = fields.Many2one('product.pricelist', 'Pricelist', readonly=True)
    company_id = fields.Many2one('res.company', 'Company', readonly=True)
    user_id = fields.Many2one('res.users', 'Salesperson', readonly=True)
    state = fields.Selection([
        ('draft', 'Quotation'),
        ('sent', 'Quotation Sent'),
        ('sale', 'Sales Order'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
        ('paid', 'Paid'),
        ('invoiced', 'Invoiced')
        ], string='Status', readonly=True)
    date_order = fields.Datetime('Date Order', readonly=True)
    confirmation_date = fields.Datetime('Confirmation Date', readonly=True)
    name = fields.Char('Order Reference', readonly=True)
    warehouse_id = fields.Many2one('stock.warehouse', string='Warehouse',
        readonly=True)
    model = fields.Char('Model', readonly=True)

    @api.model_cr
    def init(self):
        tools.drop_view_if_exists(self.env.cr, 'orders_unified')
        self.env.cr.execute("""CREATE or REPLACE VIEW orders_unified as (
SELECT
    cast(row_number() over() as integer) as id,
    bar.item_id,
    bar.model || ',' || bar.item_id AS real_order_id,
    bar.partner_id,
    bar.team_id,
    bar.analytic_account_id,
    bar.pricelist_id,
    bar.company_id,
    bar.user_id,
    bar.state,
    bar.date_order,
    bar.confirmation_date,
    bar.name,
    bar.create_date,
    bar.warehouse_id,
    bar.model
FROM (
        (
        SELECT
            so.id AS item_id,
            so.partner_id,
            so.team_id,
            so.analytic_account_id,
            so.pricelist_id,
            so.company_id,
            so.user_id,
            so.state,
            so.date_order,
            so.confirmation_date,
            so.name,
            so.create_date,
            so.warehouse_id,
            'sale.order' AS model
        FROM
            sale_order AS so
        ) union (
        SELECT
            po.id,
            po.partner_id,
            pc.crm_team_id AS team_id,
            NULL AS analytic_account_id,
            po.pricelist_id,
            po.company_id,
            po.user_id,
            po.state,
            po.date_order,
            po.date_order AS confirmation_date,
            po.name,
            po.create_date,
            sw.id AS warehouse_id,
            'pos.order' AS model
        FROM
            pos_order AS po
            LEFT JOIN pos_session ps ON ps.id = po.session_id
            LEFT JOIN pos_config pc ON pc.id = ps.config_id
            LEFT JOIN stock_location sl ON sl.id = pc.stock_location_id
            LEFT JOIN stock_warehouse sw ON sw.lot_stock_id = sl.id
        )
    ) AS bar
)""")


class OrderLinesUnified(models.Model):
    _name = "order.lines.unified"
    _auto = False
    _order = 'date_order desc'

    @api.model
    def _get_targets(self):
        sales = list(map(lambda x: ('sale.order,'+str(x.id), x.name), self.env["sale.order"].search([])))
        sales += list(map(lambda x: ('pos.order,'+str(x.id), x.name), self.env["pos.order"].search([])))
        return sales

    item_id = fields.Integer('Item ID', readonly=True)
    name = fields.Char('Name', readonly=True)
    order_id = fields.Reference(selection='_get_targets', readonly=True, string="Order")
    salesman_id = fields.Many2one('res.users', readonly=True)
    order_partner_id = fields.Many2one('res.partner', readonly=True)
    date_order = fields.Datetime('Date Order', readonly=True)
    confirmation_date = fields.Datetime('Confirmation Date', readonly=True)
    product_id = fields.Many2one('product.product', 'Product', readonly=True)
    product_uom_qty = fields.Float('Qty Ordered', readonly=True)
    qty_delivered = fields.Float('Qty Delivered', readonly=True)
    qty_invoiced = fields.Float('Qty Invoiced', readonly=True)
    qty_to_invoice = fields.Float('Qty To Invoice', readonly=True)
    price_total = fields.Float('Total', readonly=True)
    price_subtotal = fields.Float('Untaxed Total', readonly=True)
    amt_to_invoice = fields.Float('Amount To Invoice', readonly=True)
    amt_invoiced = fields.Float('Amount Invoiced', readonly=True)
    product_uom = fields.Many2one('product.uom', 'Unit of Measure', readonly=True)
    state = fields.Selection([
        ('draft', 'Quotation'),
        ('sent', 'Quotation Sent'),
        ('sale', 'Sales Order'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
        ('paid', 'Paid'),
        ('invoiced', 'Invoiced')
        ], string='Status', readonly=True)
    route_id = fields.Many2one('stock.location.route', string='Route', readonly=True)
    model = fields.Char('Model', readonly=True)

    @api.model_cr
    def init(self):
        tools.drop_view_if_exists(self.env.cr, 'order_lines_unified')
        self.env.cr.execute("""CREATE or REPLACE VIEW order_lines_unified as (
SELECT
    cast(row_number() over() as integer) as id,
    bar.item_id,
    bar.name,
    bar.order_id,
    bar.order_partner_id,
    bar.salesman_id,
    bar.date_order,
    bar.confirmation_date,
    bar.product_id,
    bar.product_uom_qty,
    bar.qty_delivered,
    bar.qty_invoiced,
    bar.qty_to_invoice,
    bar.price_total,
    bar.price_subtotal,
    bar.amt_to_invoice,
    bar.amt_invoiced,
    bar.product_uom,
    bar.state,
    bar.route_id,
    bar.model
FROM (
        (
        SELECT
            sol.id AS item_id,
            sol.name,
            'sale.order,' || s.item_id AS order_id,
            s.user_id AS salesman_id,
            s.partner_id AS order_partner_id,
            s.date_order,
            s.confirmation_date,
            sol.product_id,
            sol.product_uom_qty,
            sol.qty_delivered,
            sol.qty_invoiced,
            sol.qty_to_invoice,
            sol.price_total,
            sol.price_subtotal,
            sol.amt_to_invoice,
            sol.amt_invoiced,
            sol.product_uom,
            sol.state,
            sol.route_id,
            'sale.order' AS model
        FROM
            sale_order_line AS sol
            LEFT JOIN orders_unified s on (sol.order_id = s.item_id AND s.model = 'sale.order')
        ) union (
        SELECT
            pol.id AS item_id,
            pol.name,
            'pos.order,' || s.item_id AS order_id,
            s.user_id AS salesman_id,
            s.partner_id AS order_partner_id,
            pol.create_date,
            pol.create_date AS confirmation_date,
            pol.product_id,
            pol.qty AS product_uom_qty,
            pol.qty AS qty_delivered,
            pol.qty AS qty_invoiced,
            pol.qty AS qty_to_invoice,
            pol.price_subtotal_incl AS price_total,
            pol.price_subtotal,
            0.0 AS amt_to_invoice,
            pol.price_subtotal_incl AS amt_invoiced,
            t.uom_id AS product_uom,
            s.state,
            NULL AS route_id,
            'pos.order' AS model
        FROM
            pos_order_line AS pol
            LEFT JOIN product_product p ON p.id = pol.product_id
            LEFT JOIN product_template t ON t.id = p.product_tmpl_id
            LEFT JOIN orders_unified s on (pol.order_id=s.item_id AND s.model = 'pos.order')
        )
    ) AS bar
)""")


class SaleReport(models.Model):
    _inherit = "sale.report"

    @api.model
    def _get_targets(self):
        sales = list(map(lambda x: ('sale.order,'+str(x.id), x.name), self.env["sale.order"].search([])))
        sales += list(map(lambda x: ('pos.order,'+str(x.id), x.name), self.env["pos.order"].search([])))
        return sales

    item_id = fields.Integer('Item Real ID', readonly=True)
    order_id = fields.Reference(selection='_get_targets', readonly=True, string="Order")
    salesman_id = fields.Many2one('res.users', readonly=True)
    order_partner_id = fields.Many2one('res.partner', readonly=True)
    route_id = fields.Many2one('stock.location.route', string='Route', readonly=True)
    state = fields.Selection(selection_add=[('paid', 'Paid'), ('invoiced', 'Invoiced')])
    model = fields.Selection([
        ('sale.order',_('Sale Order')),
        ('pos.order', _('POS Order'))], string='Line Model', readonly=True)

    def _select(self):
        select_str = super(SaleReport, self)._select()
        select_str = select_str.replace('s.date_order as date',
            'l.date_order as date')
        select_str += """,
        min(l.item_id) as item_id,
        l.order_id AS order_id,
        s.user_id AS salesman_id,
        s.partner_id AS order_partner_id,
        min(l.route_id) AS route_id,
        l.model"""
        return select_str

    def _from(self):
        from_str = super(SaleReport, self)._from()
        from_str = from_str.replace('sale_order_line', 'order_lines_unified')
        from_str = from_str.replace('join sale_order s on (l.order_id=s.id)',
            'left join orders_unified s on (l.order_id = s.real_order_id)')
        from_str = from_str.replace('join res_partner', 'left join res_partner')
        return from_str

    def _group_by(self):
        group_by_str = super(SaleReport, self)._group_by().replace('GROUP BY', '')
        group_by_str = 'GROUP BY l.id,'+group_by_str+',l.model'
        group_by_str = group_by_str.replace('s.date_order', 'l.date_order')
        return group_by_str

    @api.model_cr
    def init(self):
        return super(SaleReport, self).init()
