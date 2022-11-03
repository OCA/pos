# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

import base64
import tempfile

from odoo import _, api, fields, models
from odoo.exceptions import Warning
from odoo.tools.misc import xlwt


class PosReportsXlxsMixin(models.TransientModel):
    _name = "pos.report.xlxs.mixin"

    date_start = fields.Date(
        string="Date Start",
        required=True,
        default=fields.Date.context_today,
    )
    date_end = fields.Date(
        string="Date End",
        required=True,
        default=fields.Date.context_today,
    )
    company_id = fields.Many2one(
        string="Company",
        comodel_name="res.company",
        required=True,
    )
    rel_xls = fields.Binary(
        string="XLS",
        readonly=True,
    )
    rel_xls_filename = fields.Char(
        string="Rel Xls Filename",
        size=128,
        readonly=True,
    )

    @api.onchange("date_start", "date_end")
    def _onchange_dates(self):
        self.validate_dates()

    def set_report_header(self, worksheet):
        style0 = xlwt.easyxf("font: bold on;")
        worksheet.write(0, 0, "Date Start", style0)
        worksheet.write(0, 1, f'{self.date_start.strftime("%d/%m/%Y")}')
        worksheet.write(1, 0, "Date End", style0)
        worksheet.write(1, 1, f'{self.date_end.strftime("%d/%m/%Y")}')
        worksheet.write(2, 0, "Company", style0)
        worksheet.write(2, 1, f"{self.company_id.name}")

    def get_titles_style(self):
        return "font: bold on; pattern: pattern solid, fore_colour gray25;"

    def set_columns_title(self, worksheet, titles):
        style_titles = xlwt.easyxf(self.get_titles_style())

        column_position = 0
        for title in titles:
            worksheet.write(4, column_position, title, style_titles)
            column_position += 1

    def set_data_lines(self, worksheet, data):
        line_position = 5
        for line in data:
            column_position = 0
            for column_data in line:
                worksheet.write(line_position, column_position, column_data)
                column_position += 1
            line_position += 1

    def validate_dates(self):
        if self.date_start > self.date_end:
            raise Warning(_("Date start can not be superior than date end!"))

    def validate_title_and_data_size(self, titles, data):
        if data and (len(titles) != len(data[0])):
            raise Warning(
                _("Columns title and lines columns must have the same lenght!")
            )

    def validate_report_infos(self, titles, data):
        self.validate_dates()
        self.validate_title_and_data_size(titles, data)

    def generate_xlxs_report(self, file_name, sheet_name, titles, data):
        self.validate_report_infos(titles, data)
        workbook = xlwt.Workbook()
        worksheet = workbook.add_sheet(sheet_name)

        self.set_report_header(worksheet)
        self.set_columns_title(worksheet, titles)
        self.set_data_lines(worksheet, data)

        with tempfile.TemporaryFile() as file_data:
            workbook.save(file_data)
            with tempfile.TemporaryFile() as base64_data:
                file_data.seek(0)
                base64.encode(file_data, base64_data)
                base64_data.seek(0)

                self.rel_xls = base64_data.read()
                self.rel_xls_filename = f"{file_name}.xls"

    def get_form_data(self, module_name, view_id):
        this = self.browse(self.id)
        data_obj = self.env["ir.model.data"]
        form = data_obj.get_object_reference(module_name, view_id)
        return form, this
