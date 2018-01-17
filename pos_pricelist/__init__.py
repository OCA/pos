# -#- coding: utf-8 -#-
##############################################################################
# Point Of Sale - Pricelist for POS Odoo
# Copyright (C) 2014 Taktik (http://www.taktik.be)
# @author Adil Houmadi <ah@taktik.be>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
from . import models
from openerp import SUPERUSER_ID


def set_pos_line_taxes(cr, registry):
    # <GRAP> migrate from grap_change_account_move_line
    # Test if pos_tax is installed
    cr.execute("""
        SELECT count(*)
        FROM ir_module_module
        WHERE name = 'pos_tax' and state != 'uninstalled';""")
    if not cr.fetchone()[0]:
        return

    # Populate pos_order_line.pline_tax_rel
    cr.execute("""
        INSERT INTO pline_tax_rel
                (pos_line_id, tax_id)
            SELECT poltr.orderline_id, poltr.tax_id
            FROM pos_order_line_tax_rel poltr""")

    # Populate pos_order_tax
    cr.execute("""
        INSERT INTO pos_order_tax
                (create_uid, create_date, name, tax, amount, write_uid,
                pos_order, base, write_date)
            SELECT max(poltr.create_uid) as create_uid,
                max(poltr.create_date) as create_date,
                at.name,
                poltr.tax_id as tax,
                sum(poltr.amount_tax) as amount,
                max(poltr.write_uid) as write_uid,
                pol.order_id as pos_order,
                sum(poltr."baseHT") as base,
                max(poltr.write_date) as write_date
            FROM pos_order_line_tax_rel poltr
            INNER JOIN pos_order_line pol ON pol.id = poltr.orderline_id
            INNER JOIN account_tax at on at.id = poltr.tax_id
            GROUP BY pol.order_id, poltr.tax_id, at.name""")
