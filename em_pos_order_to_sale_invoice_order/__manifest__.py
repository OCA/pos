# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "PoS Order To Sale and Invoice Order",
    "version": "15.0.1.0.1",
    "author": "GRAP,Odoo Community Association (OCA),Sempai Space",
    "category": "Point Of Sale",
    "license": "AGPL-3",
    "depends": ["point_of_sale","sale"],
    "installable" : True,
    "maintainers": ["legalsylvain","estebanmonge"],
    "development_status": "Production/Stable",
    "website": "https://github.com/OCA/pos",
    "data": [
        "views/view_pos_config.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "em_pos_order_to_sale_invoice_order/static/src/js/PosOrderToSaleOrderButton.js",
            "em_pos_order_to_sale_invoice_order/static/src/js/PosOrderToSaleOrderPopup.js",
            "em_pos_order_to_sale_invoice_order/static/src/js/PosSeeSaleOrdersButton.js",
        ],
    "web.assets_qweb": [
        "em_pos_order_to_sale_invoice_order/static/src/xml/PosSeeSaleOrdersButton.xml",
        "em_pos_order_to_sale_invoice_order/static/src/xml/PosOrderToSaleOrderButton.xml",
        "em_pos_order_to_sale_invoice_order/static/src/xml/PosOrderToSaleOrderPopup.xml",
     ],
    },
}
