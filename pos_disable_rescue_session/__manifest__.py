# Copyright 2023 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "PoS disable rescue session",
    "summary": "Add an option to disable the rescue session per pos config",
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "Akretion,Odoo Community Association (OCA)",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/assets.xml",
        "views/pos_config_view.xml",
    ],
    "qweb": [
        "static/src/xml/RescueSessionUnavailableErrorPopup.xml",
    ],
}
