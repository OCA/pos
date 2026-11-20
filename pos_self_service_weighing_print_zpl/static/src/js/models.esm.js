/** @odoo-module **/
// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {Gui} from "point_of_sale.Gui";
import {Model} from "point_of_sale.Registries";
import {PosGlobalState} from "point_of_sale.models";

const IPP_PRINTER_URL = "http://localhost:8631/printers/";

const SSWPrintZPLPosGlobalState = (PosGlobalState_) =>
    class extends PosGlobalState_ {
        async print_barcode_label(title, barcode, value_str) {
            const printer_name = this.config.barcode_label_printer_name;
            if (!printer_name) {
                return Gui.showPopup("ErrorPopup", {
                    title: this.env._t("Missing Printer Name"),
                    body: this.env._t(
                        "Please enter the printer name in the PoS configuration"
                    ),
                });
            }
            const zpl_string = this.get_zpl_barcode_label(
                title,
                barcode,
                value_str,
                this.config.barcode_label_width,
                this.config.barcode_label_height,
                this.config.barcode_label_offset_x,
                this.config.barcode_label_offset_y
            );
            const result = await window.ippPrint(
                IPP_PRINTER_URL + printer_name,
                "text/plain",
                zpl_string
            );
            if (result.statusCode !== "successful-ok") {
                return Gui.showPopup("ErrorPopup", {
                    title: this.env._t("Print Error"),
                    body: result["operation-attributes-tag"]["status-message"],
                });
            }
        }

        get_zpl_barcode_label(
            title,
            barcode,
            value_str,
            label_width,
            label_height,
            label_offset_x,
            label_offset_y
        ) {
            // Generate a ZPL string to represent a label with the following
            // layout:
            //
            //  ----------------------------
            // |           title            |
            // |                            |
            // |   || | || | ||| || || ||   |
            // |   || | || | ||| || || ||   |
            // |   || | || | ||| || || ||   |
            // | 0 || 123456 || 789012 ||   |
            // |                            |
            // |         value_str          |
            //  ----------------------------
            //
            // There is no external margin, as this can be completely set by
            // the label size and offset from pos.config. The inner (vertical)
            // spacing is relative to the label height, as are the font sizes.
            // All sizes are in points. The real size (in mm) depends on the
            // printer resolution.
            //
            // Ratios relative to 1 being the label width or height
            const TITLE_HEIGHT_RATIO = 0.16;
            const BARCODE_HEIGHT_RATIO = 0.6;
            // Don't fill the full width with the barcode, or the first digit
            // will be outside of the label.
            const BARCODE_WIDTH_RATIO = 0.8;
            const VALUE_STR_HEIGHT_RATIO = 0.12;
            const VERTICAL_SPACING_RATIO =
                (1 -
                    TITLE_HEIGHT_RATIO -
                    BARCODE_HEIGHT_RATIO -
                    VALUE_STR_HEIGHT_RATIO) /
                2;
            // Number of modules in an EAN-13 barcode (non-configurable)
            const NUM_BARCODE_MODULES = 95;
            // Ratio between the barcode module size and the height of the
            // barcode digits (including some padding)
            const BARCODE_DIGITS_HEIGHT_RATIO = 10;
            // Multiply the ratios by the label height.
            const title_font_size = Math.round(label_height * TITLE_HEIGHT_RATIO);
            const value_str_font_size = Math.round(
                label_height * VALUE_STR_HEIGHT_RATIO
            );
            const vertical_spacing = Math.round(label_height * VERTICAL_SPACING_RATIO);
            const title_offset_x = label_offset_x;
            const title_offset_y = label_offset_y;
            const barcode_max_width = label_width * BARCODE_WIDTH_RATIO;
            // As the barcode is only scalable in integer steps, its size
            // (width ratio) should be rounded down. Use the highest possible
            // value for the barcode module width that will fit the label
            // width (with some margin to allow for the first digit).
            const barcode_module_width = Math.floor(
                barcode_max_width / NUM_BARCODE_MODULES
            );
            const barcode_width = barcode_module_width * NUM_BARCODE_MODULES;
            const barcode_height = Math.round(label_height * BARCODE_HEIGHT_RATIO);
            // Add some vertical space for the digits (the font size depends
            // on the module width).
            const barcode_height_value =
                barcode_height - BARCODE_DIGITS_HEIGHT_RATIO * barcode_module_width;
            // Center the barcode horizontally on the label.
            const barcode_offset_x =
                label_offset_x + Math.round((label_width - barcode_width) / 2);
            const barcode_offset_y =
                title_offset_y + title_font_size + vertical_spacing;
            const value_str_offset_x = label_offset_x;
            const value_str_offset_y =
                barcode_offset_y + barcode_height + vertical_spacing;
            // The barcode must not contain the check digit.
            const bare_barcode = barcode.substring(0, barcode.length - 1);
            return (
                `~SD${this.config.barcode_label_darkness}` +
                `^XA` +
                `^CI28` +
                `^CF0,${title_font_size}` +
                `^FO${title_offset_x},${title_offset_y}` +
                // Center the text and use the maximum hanging indent to
                // ensure that any overflowing text will not be printed.
                `^FB${label_width},1,,C,9999` +
                `^FD${title}\\&^FS` +
                `^BY${barcode_module_width},,${barcode_height_value}` +
                `^FO${barcode_offset_x},${barcode_offset_y}` +
                `^BE^FD${bare_barcode}^FS` +
                `^CF0,${value_str_font_size}` +
                `^FO${value_str_offset_x},${value_str_offset_y}` +
                // Same way to center the text as for the title
                `^FB${label_width},1,,C,9999` +
                `^FD${value_str}\\&^FS` +
                `^XZ`
            );
        }
    };

Model.extend(PosGlobalState, SSWPrintZPLPosGlobalState);
