# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point Of Sale - Picking Load",
    "summary": "Load and confirm stock pickings via Point Of Sale",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "author": "GRAP,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["legalsylvain"],
    "development_status": "Beta",
    "depends": [
        "sale_stock",
        "point_of_sale",
    ],
    "data": [
        "views/view_pos_config.xml",
        "views/view_sale_order.xml",
        "views/view_stock_picking.xml",
        "views/view_stock_picking_type.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "/pos_picking_load/static/src/css/pos_picking_load.css",
            "/pos_picking_load/static/src/js/LoadPickingButtonWidget.js",
            "/pos_picking_load/static/src/xml/LoadPickingButtonWidget.xml",
            "/pos_picking_load/static/src/xml/screen/LoadPickingScreenWidget.xml",
            "/pos_picking_load/static/src/xml/screen/PickingLoadControlPanel.xml",
            "/pos_picking_load/static/src/xml/screen/PickingLoadList.xml",
            "/pos_picking_load/static/src/xml/screen/PickingLoadRow.xml",
            "/pos_picking_load/static/src/js/Screen/LoadPickingScreenWidget.js",
            "/pos_picking_load/static/src/js/Screen/PickingLoadControlPanel.js",
            "/pos_picking_load/static/src/js/Screen/PickingLoadFetcher.js",
            "/pos_picking_load/static/src/js/Screen/PickingLoadList.js",
            "/pos_picking_load/static/src/js/Screen/PickingLoadRow.js",
            "/pos_picking_load/static/src/js/db.js",
        ]
    },
    "installable": True,
}
