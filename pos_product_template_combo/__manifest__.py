# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Product Template Combo",
    "summary": """
        Combo functionality based on product template""",
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "point_of_sale",
        "pos_product_template",
    ],
    "data": [
        "views/assets.xml",
        "views/product_template.xml",
        "views/product_template_combo_category.xml",
        "views/product_template_combo_category_option.xml",
        "security/product_template.xml",
        "security/product_template_combo_category.xml",
        "security/product_template_combo_category_option.xml",
    ],
    "qweb": [
        "static/src/xml/SelectComboPopup/SelectComboPopup.xml",
        "static/src/xml/SelectComboPopup/CategoryOptionButton.xml",
        "static/src/xml/SelectComboPopup/CategoryQtyOptionButton.xml",
        "static/src/xml/SelectComboPopup/ComboCategoryController.xml",
    ],
}
