# Copyright 2023 Emanuel Cino <ecino@compassion.ch>
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point Of Sale - Disable Product Variants",
    "summary": "Allows to selectively enable or disable product variants in POS",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "development_status": "Beta",
    "author": "Emanuel Cino, " "Odoo Community Association (OCA)",
    "maintainers": ["ecino"],
    "license": "AGPL-3",
    "installable": True,
    "depends": ["point_of_sale"],
    "data": ["views/product_views.xml"],
    "post_init_hook": "set_pos_availability_on_variant",
}
