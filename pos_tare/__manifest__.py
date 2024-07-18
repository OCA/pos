# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point Of Sale - Tare",
    "summary": "Manage Tare in Point Of Sale module",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "author": "GRAP, Le Nid, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["fkawala", "legalsylvain"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/view_pos_config.xml",
        "views/view_pos_order.xml",
        "views/view_product_template.xml",
        "data/barcode_rule.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_tare/static/src/css/*.css",
            "pos_tare/static/src/js/**/*.js",
            "pos_tare/static/src/xml/**/*.xml",
        ],
    },
    "demo": [
        "demo/product_product.xml",
    ],
    "installable": True,
}
