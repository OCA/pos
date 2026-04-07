# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point Of Sale Default Partner",
    "summary": "Add a default customer in pos order",
    "license": "AGPL-3",
    "version": "16.0.1.0.2",
    "author": "FactorLibre, Odoo Community Association (OCA)",
    "category": "Point of sale",
    "depends": ["point_of_sale"],
    "data": ["views/res_config_settings_view.xml"],
    "website": "https://github.com/OCA/pos",
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_default_partner/static/src/js/**/*.js",
        ]
    },
}
