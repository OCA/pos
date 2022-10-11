{
    "name": "POS Report Engine",
    "version": "14.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "POS Report Engine",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/assets.xml",
    ],
    "qweb": [
        "static/src/xml/Chrome.xml",
        "static/src/xml/ChromeWidgets/PosReportsButton.xml",
        "static/src/xml/Screens/PosReportsScreen/PosReportsScreen.xml",
        "static/src/xml/Screens/PosReportsScreen/PosReportButtonList.xml",
        "static/src/xml/Screens/PosReportsScreen/PosReportButton.xml",
        "static/src/xml/Screens/PosReportsScreen/PosReportContainer.xml",
        "static/src/xml/Screens/PosReportsScreen/PosReportInputsController.xml",
        "static/src/xml/Screens/PosReportsScreen/ReportInputs/PosReportTextInput.xml",
        "static/src/xml/Screens/PosReportsScreen/ReportInputs/PosReportDatePickerInput.xml",
        "static/src/xml/Screens/PosReportsScreen/ReportInputs/PosReportDateTimePickerInput.xml",
    ],
    "installable": True,
}
