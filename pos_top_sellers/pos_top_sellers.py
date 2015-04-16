# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2015 initOS GmbH & Co. KG (<http://www.initos.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp.osv import orm, fields
from openerp.tools.translate import _
from datetime import datetime, timedelta
from openerp.tools import DEFAULT_SERVER_DATE_FORMAT
from lxml import etree


class pos_top_sellers_product_report(orm.Model):
    _name = 'pos.top.sellers.product.report'

    # Create no table. Everything is created dynamically in this model
    _auto = False

    _columns = dict(date = fields.char(string='', readonly=True))

    def get_product_code_for_id(self, cr, uid, id, context=None):
        prod = self.pool['product.product'].browse(cr, uid, id, context)
        return prod.default_code

    def get_product_id_for_code(self, cr, uid, default_code, context=None):
        ids = self.pool['product.product'].search(cr, uid, [('default_code','=', default_code)], context)
        return ids[0] if ids else 0

    def fields_view_get(self, cr, uid, view_id=None, view_type='form', context=None, toolbar=False):
        res = super(pos_top_sellers_product_report, self).\
            fields_view_get(cr, uid, view_id=view_id, view_type=view_type,
                            context=context, toolbar=toolbar)

        if view_type == 'tree':
            shop_model = self.pool['sale.shop']
            shop_ids = shop_model.search(cr, uid, [])
            arch = etree.XML(res['arch'])
            tree = arch.xpath("//tree")
            for shop in shop_model.browse(cr, uid, shop_ids):
                # create fields for shop
                qty_key = 'qty_' + str(shop.id)
                res['fields'].update({
                    qty_key: dict(
                        string=shop.name,
                        type='integer',
                        readonly='True'
                    )
                })

                # add field to tree
                etree.SubElement(tree[0], 'field', dict(
                    name=qty_key
                ))
            res['arch'] = etree.tostring(arch)
        return res

    def _get_context_date_range(self, cr, uid, context=None):
        """
        Check date range from context and create date range for the past
        30 days if date range is missing in context.
        """
        date_from = context and context.get('list_date_range_bar_start')
        date_to = context and context.get('list_date_range_bar_end')
        if not date_to:
            date_to = fields.date.context_today(self, cr, uid, context=context)

        if not date_from:
            timestamp = datetime.strptime(date_to, DEFAULT_SERVER_DATE_FORMAT)
            timestamp -= timedelta(days=30)
            date_from = fields.date.context_today(self, cr, uid, context=context, timestamp=timestamp)

        return (date_from, date_to)

    def search(self, cr, user, args, offset=0, limit=None, order=None, context=None, count=False):
        product_id = context and context.get('my_res_id')
        date_from, date_to = self._get_context_date_range(cr, user, context=context)
        res = []

        if product_id and date_from and date_to:
            d0 = datetime.strptime(date_from, DEFAULT_SERVER_DATE_FORMAT)
            d1 = datetime.strptime(date_to, DEFAULT_SERVER_DATE_FORMAT)

            # range depends on number of days in date range
            num_days = abs((d1 - d0).days)+1
            res = range(1, 1+2+num_days)

        return res

    def read(self, cr, user, ids, fields=None, context=None, load='_classic_read'):
        # create empty result lines
        res = [dict(id=id) for id in ids]
        product_id = context and context.get('my_res_id')
        date_from, date_to = self._get_context_date_range(cr, user, context=context)

        if not (product_id and date_from and date_to):
            return res

        # first two lines are summary of sales and stock
        res[0].update(date=_('Sold'))
        res[1].update(date=_('Currently in stock'))

        # remaining lines are sales top statistics per date
        for shop_id in self.pool['sale.shop'].search(cr, user, [], context=context):
            sql='''
            select
               date_trunc('day', dd)::date as date
              ,COALESCE(pd.qty, 0) as qty
            from generate_series
                    ( %(date_from)s
                    , %(date_to)s
                    , '1 day'::interval) as dd
            left join (
              select
                 po.date_order::date as date
                ,sum(pol.qty) as qty
              from pos_order_line pol
              join pos_order po
                on po.id = pol.order_id
              join product_product pp
                on pp.id = product_id
              join product_template pt
                on pp.product_tmpl_id = pt.id
              where pt.list_price > 0 and
                shop_id = %(shop_id)s and product_id = %(product_id)s
              group by
                po.date_order::date
            ) as pd
            on pd.date = dd.date
            order by
              date desc
            '''
            cr.execute(sql, dict(shop_id=shop_id, product_id=product_id,
                                 date_from=date_from, date_to=date_to))
            query_result = cr.fetchall()

            qty_key = 'qty_' + str(shop_id)

            line_id=2
            for date, qty in query_result:
                res[line_id].update({
                    'date': date,
                    qty_key: qty
                })
                total_qty = res[0].get(qty_key, 0) + qty
                res[0].update({qty_key: total_qty})
                line_id += 1

            ctx = dict(context or {})
            ctx.update({'shop': shop_id,
                        'states': ('done',),
                        'what': ('in', 'out')})
            product = self.pool['product.product'].browse(cr, user, product_id, context=ctx)
            res[1].update({qty_key: product.qty_available})


        # postprocess
        for line in res[2:]:
            # transform date format
            # fixme: note this uses the server locale not the user language set in odoo
            #        to really do this right we need to format this in JS on the client side
            date = datetime.strptime(line['date'], '%Y-%m-%d')
            line['date'] = date.strftime('%A, %x')

        return res

class pos_top_sellers_shop_report(orm.Model):
    _name = 'pos.top.sellers.shop.report'

    # We do not have columns. Everything is created dynamically in this model
    _auto = False

    # by default list the top 40 products
    _top_ten_limit = 40

    def fields_view_get(self, cr, uid, view_id=None, view_type='form', context=None, toolbar=False):
        res = super(pos_top_sellers_shop_report, self).\
            fields_view_get(cr, uid, view_id=view_id, view_type=view_type,
                            context=context, toolbar=toolbar)

        if view_type == 'tree':
            shop_model = self.pool['sale.shop']
            shop_ids = shop_model.search(cr, uid, [])
            arch = etree.XML(res['arch'])
            tree = arch.xpath("//tree")
            for shop in shop_model.browse(cr, uid, shop_ids):
                # create fields for shop
                product_key = 'product_id_' + str(shop.id)
                qty_key = 'qty_' + str(shop.id)
                res['fields'].update({
                    product_key: dict(
                        string=shop.name,
                        type='many2one',
                        relation='product.product',
                        readonly='True',
                    ),
                    qty_key: dict(
                        string=_('QT'),
                        type='integer',
                        readonly='True'
                    )
                })

                # add field to tree
                etree.SubElement(tree[0], 'field', dict(
                    name=product_key,
                    widget="pos_top_sellers_product_col",
                ))
                etree.SubElement(tree[0], 'field', dict(
                    name=qty_key
                ))

            res['arch'] = etree.tostring(arch)
        return res

    def search(self, cr, user, args, offset=0, limit=None, order=None, context=None, count=False):
        # ignore sorting, limit etc
        return range(1,1+self._top_ten_limit)

    def read(self, cr, user, ids, fields=None, context=None, load='_classic_read'):

        date_from = context and context.get('list_date_range_bar_start')
        date_to = context and context.get('list_date_range_bar_end')

        # create empty result lines
        res = [dict(id=id) for id in ids]
        limit = len(res)

        for shop_id in self.pool['sale.shop'].search(cr, user, [], context=context):
            sql='''
            select
               product_id
              ,COALESCE(default_code, pt.name)
              ,sum(pol.qty) as qty
            from pos_order_line pol
            join pos_order po
              on po.id = pol.order_id
            join product_product pp
              on pp.id = product_id
            join product_template pt
              on pp.product_tmpl_id = pt.id
            where pt.list_price > 0 and
              shop_id = %(shop_id)s
            '''

            if date_from:
                sql += '''and po.date_order::date >= %(date_from)s '''

            if date_to:
                sql += '''and po.date_order::date <= %(date_to)s '''

            sql += \
            '''
            group by
               product_id
              ,COALESCE(default_code, pt.name)
            order by
              qty desc
            fetch first %(limit)s rows only
            '''
            cr.execute(sql, dict(shop_id=shop_id, limit=limit,
                                 date_from=date_from, date_to=date_to))

            product_key = 'product_id_' + str(shop_id)
            qty_key = 'qty_' + str(shop_id)

            line_id=0
            for product_id, default_code, qty in cr.fetchall():
                res[line_id].update({
                    product_key: (product_id, default_code),
                    qty_key: qty
                })
                line_id += 1

        return res
