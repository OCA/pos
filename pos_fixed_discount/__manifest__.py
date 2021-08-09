# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Point of Sale Fixed Discounts",
    "summary": "Allow to apply discounts with fixed amount",
    "version": "14.0.1.0.1",
    "development_status": "Beta",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "TAKOBI, Odoo Community Association (OCA)",
    "maintainers": ["eLBati"],
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": ["pos_discount"],
    "data": ["views/pos_templates.xml"],
    "qweb": ["static/src/xml/discount_templates.xml"],
}
