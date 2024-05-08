# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 David Vidal <david.vidal@tecnativa.com>
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale Order Return",
    "version": "14.0.1.0.4",
    "category": "Point Of Sale",
    "author": "La Louve, "
    "GRAP, "
    "Tecnativa, "
    "Lambda IS, "
    "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/pos",
    "development_status": "Alpha",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "security/ir.model.access.csv",
        "wizard/pos_partial_return_wizard_view.xml",
        "views/pos_order_view.xml",
        "views/product_product_view.xml",
    ],
    "demo": [
        "demo/product_product.xml",
    ],
    "installable": True,
}
