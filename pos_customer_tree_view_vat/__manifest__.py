# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Vat Tree",
    "summary": """Point of Sale: Show VAT number at Customer Tree View""",
    "version": "16.0.1.0.1",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "maintainers": ["mileo"],
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale.assets": [
            (
                "after",
                "point_of_sale/static/src/xml/Screens/PartnerListScreen/PartnerLine.xml",
                "pos_customer_tree_view_vat/static/src/xml/partner_line.xml",
            ),
            (
                "after",
                "point_of_sale/static/src/xml/Screens/PartnerListScreen/PartnerListScreen.xml",
                "pos_customer_tree_view_vat/static/src/xml/partner_list_screen.xml",
            ),
        ]
    },
}
