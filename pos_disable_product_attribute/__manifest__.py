# Copyright 2023 Emanuel Cino
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Point of Sale - Disable product attributes",
    "summary": "Exclude some product attributes from the POS configurator popup",
    "version": "16.0.1.0.0",
    "development_status": "Alpha",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Emanuel Cino, Odoo Community Association (OCA)",
    "maintainers": ["ecino"],
    "license": "AGPL-3",
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "data": ["views/product_attribute_view.xml"],
}
