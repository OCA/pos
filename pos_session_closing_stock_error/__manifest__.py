# Copyright 2020 Druidoo - Iván Todorovich
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Point of Sale - Prevent closing sessions with stock errors",
    "summary": "Prevent closing PoS Sessions that have stock errors",
    "version": "12.0.1.0.1",
    "development_status": "Beta",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Druidoo, Odoo Community Association (OCA)",
    "maintainers": ["ivantodorovich"],
    "license": "LGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/pos_config_views.xml",
    ],
}
