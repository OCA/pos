# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "PoS Order Margin",
    "summary": "Margin on PoS Order",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "author": "GRAP, FactorLibre, Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/res_config_settings_view.xml",
        "views/view_pos_order.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_margin/static/src/xml/*.xml",
            "pos_margin/static/src/js/models.esm.js",
            "pos_margin/static/src/js/OrderSummaryMargin.esm.js",
            "pos_margin/static/src/css/*.css",
        ],
    },
    "installable": True,
}
