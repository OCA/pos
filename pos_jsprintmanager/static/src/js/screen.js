/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */


odoo.define("pos_jsprintmanager.screen", function (require) {
    "use strict";

    var core = require('web.core');
    var _t = core._t;
    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var screens = require('point_of_sale.screens');

    screens.ReceiptScreenWidget.include({

        //Check JSPM WebSocket status
        jspmWSStatus: function() {
            if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Open)
                return true;
            else if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Closed) {
                alert('JSPrintManager (JSPM) is not installed or not running! Download JSPM Client App from https://neodynamic.com/downloads/jspm');
                return false;
            }
            else if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.BlackListed) {
                alert('JSPM has blacklisted this website!');
                return false;
            }
        },

        init: function(parent,options){
            this._super(parent,options);
            JSPM.JSPrintManager.auto_reconnect = true;
            JSPM.JSPrintManager.start();
            var jspmWSStatus = this.jspmWSStatus()
            JSPM.JSPrintManager.WS.onStatusChanged = function () {
                if (jspmWSStatus) {
                    //get client installed printers
                    JSPM.JSPrintManager.getPrinters().then(function (myPrinters) {
                        var options = '';
                        for (var i = 0; i < myPrinters.length; i++) {
                            options += '<option>' + myPrinters[i] + '</option>';
                        }
                        $('#installedPrinterName').html(options);
                    })
                }
            }

            // Variables definition
            this.esc = '\x1B'; //ESC byte in hex notation
            this.line_feed = '\x0A'; //LF byte in hex notation

            this.page_width = this.pos.config.jsprintmanager_page_width;
            this.qty_width =  this.pos.config.jsprintmanager_qty_width;
            this.price_width = this.pos.config.jsprintmanager_price_width;
            this.totals_width = this.pos.config.jsprintmanager_totals_width;
            this.name_width = this.page_width - this.qty_width - this.price_width;

        },
        center_align_string: function(s, width) {
            return s.padStart(
                Math.floor((width - s.length) / 2 + s.length),
                ' '
            );
        },
        right_align_string: function(s, width) {
            return s.padStart(width, ' ');
        },
        get_escpos_receipt_cmds: function() {
            var cmds = '';
            var order = this.pos.get_order();
            var receipt = order.export_for_printing();
            var orderlines = order.get_orderlines();
            var paymentlines = order.get_paymentlines();

            //Initializes the printer (ESC @)
            cmds += this.esc + "@";
            cmds += this.esc + "\x70" + "\x00"; // Drawer kick, pin 2 (first drawer)
            cmds += this.esc + "1\x02" // Codepage 850

            // Header of receipt with Company data
            cmds += receipt.company.contact_address ? receipt.company.contact_address + this.line_feed : "";
            cmds += receipt.company.phone ? _t("Tel: ") + receipt.company.phone + this.line_feed : "";
            cmds += receipt.company.vat ? _t("VAT: ") + receipt.company.vat + this.line_feed : "";
            cmds += receipt.company.email ? receipt.company.email + this.line_feed : "";
            cmds += receipt.company.website ? receipt.company.website + this.line_feed : "";
            cmds += receipt.company.header ? receipt.company.header + this.line_feed : "";
            cmds += this.line_feed + this.line_feed;

            // Date and Order ID
            cmds += this.center_align_string(
                receipt.date.localestring + ' ' + receipt.name,
                this.page_width
            );
            cmds += this.line_feed + this.line_feed;

            // Order Lines
            for (const line of orderlines) {
                let name = line.get_product().display_name;
                let qty = "" + line.get_quantity_str_with_unit();
                let price = "" + this.format_currency(line.get_display_price());

                cmds += name.substring(0, this.name_width).padEnd(this.name_width, ' ');
                cmds += this.right_align_string(qty, this.qty_width);
                cmds += this.right_align_string(price, this.price_width);
                cmds += this.line_feed;

                if (line.discount > 0) {
                    cmds += _(' - with a ') + line.discountStr + '% ' + _(' discount');
                    cmds += this.line_feed;
                }
            }
            cmds += this.line_feed;

            // Subtotal
            var total_without_tax = this.format_currency(order.get_total_without_tax());
            cmds += _t("Subtotal: ").padEnd(this.totals_width, ' ');
            cmds += this.right_align_string(this.format_currency(order.get_total_without_tax()), this.totals_width)
            cmds += this.line_feed;

            // Taxes
            for (const taxdetail of order.get_tax_details()) {
                cmds += taxdetail.name.padEnd(this.totals_width, ' ');
                cmds += this.right_align_string(this.format_currency(taxdetail.amount), this.totals_width);
            }
            cmds += this.line_feed;

            // Discount
            if (order.get_total_discount() > 0) {
                cmds += _t("Discount: ").padEnd(this.totals_width, ' ');
                cmds += this.right_align_string(this.format_currency(order.get_total_discount()), this.totals_width);
            }
            cmds += this.line_feed;

            // Total amount
            cmds += this.esc + '!' + '\x10'; // Double-height
            cmds += _t("Total: ").padEnd(this.totals_width, ' ');
            cmds += this.right_align_string(this.format_currency(order.get_total_with_tax()), this.totals_width);
            cmds += this.esc + '!' + '\x00'; // Normal character
            cmds += this.line_feed + this.line_feed;


            // Payment Lines
            for (const line of paymentlines) {
                cmds += line.name.padEnd(this.totals_width, ' ');
                cmds += this.right_align_string(this.format_currency(line.get_amount()), this.totals_width);
            }
            cmds += this.line_feed;


            // Change
            cmds += _t("Change: ").padEnd(this.totals_width, ' ');
            cmds += this.right_align_string(this.format_currency(order.get_change()), this.totals_width);
            cmds += this.line_feed;

            return cmds

        },
        get_escpos_card_receipt_cmds: function () {
            var cmds = '';
            /* To be inherited */
            return cmds
        },
        get_escpos_receipt_cmds_footer: function () {
            var cmds = '';
            var order = this.pos.get_order();
            var receipt = order.export_for_printing();

            if (receipt.footer) {
                cmds += receipt.footer;
            }

            cmds += this.line_feed + this.line_feed + this.line_feed + this.line_feed; // Space before cut
            cmds += "\x1dV\x00"; // Full cut
            cmds += this.line_feed + this.line_feed;

            return cmds
        },
        print_web: function() {
            if (this.jspmWSStatus && this.pos.config.use_jsprintmanager == true) {
                var outputFormat = this.pos.config.jsprintmanager_output_format;
                var default_printer = this.pos.config.jsprintmanager_default_receipt_printer;
                console.log(outputFormat)
                //Create a ClientPrintJob
                var cpj = new JSPM.ClientPrintJob();
                if (default_printer) {
                    cpj.clientPrinter = new JSPM.InstalledPrinter(default_printer);
                } else {
                    cpj.clientPrinter = new JSPM.DefaultPrinter();
                }
                if (outputFormat == 'escpos'){
                    //Set content to print...
                    //Create ESP/POS commands for sample label
                    var cmds = [
                        this.get_escpos_receipt_cmds(),
                        this.get_escpos_card_receipt_cmds(),
                        this.get_escpos_receipt_cmds_footer()
                    ].join("")
                    cpj.printerCommands = cmds;
                    //Send print job to printer!
                    cpj.sendToClient();
                } else {
                    //generate an image of HTML content through html2canvas utility
                    var ticket = document.getElementsByClassName('pos-sale-ticket')[0]
                    html2canvas(ticket, {scale: 10, width: 900}).then(function (canvas) {
                        //Set content to print...
                        var b64Prefix = "data:image/png;base64,";
                        var imgBase64DataUri = canvas.toDataURL("image/png");
                        var imgBase64Content = imgBase64DataUri.substring(b64Prefix.length, imgBase64DataUri.length);
                        var myImageFile = new JSPM.PrintFile(imgBase64Content, JSPM.FileSourceType.Base64, 'myFileToPrint.png', 1);
                        //add file to print job
                        cpj.files.push(myImageFile);
                        //Send print job to printer!
                        cpj.sendToClient();
                    });
                }
                this.pos.get_order()._printed = true;
            } else {
                return this._super();
            }

        },
    })
});

