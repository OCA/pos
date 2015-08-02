# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2015 Aserti Global Solutions (http://www.aserti.es/).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
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
__name__ = "Copy the product taxes to the pos.line"


def migrate(cr, version):
        cr.execute("""insert into pline_tax_rel
                    select l.id, t.id
                    from pos_order_line l
                    join pos_order o on l.order_id = o.id
                    join product_taxes_rel rel on rel.prod_id = l.product_id
                    join account_tax t on rel.tax_id = t.id
                    where t.company_id = o.company_id""")
