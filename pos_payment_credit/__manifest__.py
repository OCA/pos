# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale Payment Credit",
    "version": "18.0.1.0.0",
    "category": "Point Of Sale",
    "author": "Trobz, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/payment_method_view.xml",
        "views/res_partner_view.xml",
        "wizard/pos_make_payment_views.xml",
    ],
    "demo": [
        "demo/pos_payment_credit_demo.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_payment_credit/static/src/app/*",
            "pos_payment_credit/static/src/overrides/**/*",
        ],
    },
    "installable": True,
}
