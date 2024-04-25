# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "POS Sales Reports by Category only",
    "summary": "Show Sales Reports by Category",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point of Sale",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "version": "16.0.1.0.0",
    "depends": ["pos_daily_sales_reports"],
    "data": [
        "views/res_config_settings.xml",
        "views/point_of_sale_view.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            (
                "after",
                "pos_daily_sales_reports/static/src/xml/SaleDetailsReport.xml",
                "pos_daily_sales_reports_category_only/static/src/xml/SaleDetailsReport.xml",
            )
        ],
    },
}
