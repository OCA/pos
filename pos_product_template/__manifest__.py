{
    "name": "POS - Product Template",
    "version": "14.0.1.0.0",
    "category": "Point Of Sale",
    "author": "Akretion,Odoo Community Association (OCA)",
    "summary": "Manage Product Template in Front End Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "view/view.xml",
    ],
    "qweb": [
        "static/src/xml/Popup/AttributeValueSelector.xml",
        "static/src/xml/Popup/SelectVariantPopup.xml",
        "static/src/xml/ProductScreen/ProductTemplateItem.xml",
    ],
    "demo": [
        "demo/product_attribute_value.xml",
        "demo/product_template_attribute_line.xml",
    ],
    "installable": True,
}
