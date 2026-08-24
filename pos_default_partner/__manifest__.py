# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

{
    "name": "Point Of Sale Default Partner",
    "summary": "Add a default customer in pos order",
    "license": "AGPL-3",
    "version": "18.0.1.0.0",
    "author": "FactorLibre, Odoo Community Association (OCA)",
    "category": "Point of sale",
    "depends": ["point_of_sale"],
    "data": ["views/res_config_settings_view.xml"],
    "website": "https://github.com/OCA/pos",
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_default_partner/static/src/js/**/*.js",
        ]
    },
}
