# © 2023 FactorLibre - Juan Carlos Bonilla <juancarlos.bonilla@factorlibre.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "POS Fiscal Position",
    "summary": "POS fiscal position improvements",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "author": "FactorLibre, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "security/pos_config_security.xml",
        "views/res_config_settings_view.xml",
    ],
    "assets": {
        "point_of_sale.assets": ["pos_fiscal_position/static/src/js/**/*"],
    },
    "installable": True,
    "auto_install": False,
    "application": False,
}
