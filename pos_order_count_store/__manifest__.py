# Copyright 2019  Coop IT Easy SC (<http://www.coopiteasy.be>)
# - Elouan LE BARS - <houssine@coopiteasy.be>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "POS Order Count Store",
    "summary": "Store pos_order_count to improve reporting.",
    "version": "12.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Odoo Community Association (OCA),"
              " Coop IT Easy SC",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "pre_init_hook": "pre_compute_pos_order_count",
    "data": [],
}
