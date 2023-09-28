# Copyright 2023 Ooops404
# License AGPL-3 - See https://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point Of Sale - Customer Required Fields",
    "summary": "Set required customer fields in POS interface using "
    "Web Field Required Invisible Readonly Manager module",
    "version": "14.0.1.0.0",
    "category": "Point Of Sale",
    "author": "Ilyas, Ooops404, Odoo Community Association (OCA)",
    "maintainers": ["ilyasprogrammer"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale", "web_field_required_invisible_manager"],
    "data": ["views/templates.xml", "views/views.xml"],
    "installable": True,
}
