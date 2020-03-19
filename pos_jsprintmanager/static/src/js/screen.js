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
        },

        print_web: function() {
            if (this.jspmWSStatus) {
                var outputFormat = 'esc-pos'
                if (outputFormat == 'esc-pos'){
                    //Create a ClientPrintJob
                    var cpj = new JSPM.ClientPrintJob()
                    cpj.clientPrinter = new JSPM.DefaultPrinter();
                    //Set content to print...
                    //Create ESP/POS commands for sample label
                    var esc = '\x1B'; //ESC byte in hex notation
                    var newLine = '\x0A'; //LF byte in hex notation

                    var cmds = esc + "@"; //Initializes the printer (ESC @)
                    cmds += esc + '!' + '\x38'; //Emphasized + Double-height + Double-width mode selected (ESC ! (8 + 16 + 32)) 56 dec => 38 hex
                    cmds += 'BEST DEAL STORES'; //text to print
                    cmds += newLine + newLine;
                    cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
                    cmds += 'COOKIES                   5.00';
                    cmds += newLine;
                    cmds += 'MILK 65 Fl oz             3.78';
                    cmds += newLine + newLine;
                    cmds += 'SUBTOTAL                  8.78';
                    cmds += newLine;
                    cmds += 'TAX 5%                    0.44';
                    cmds += newLine;
                    cmds += 'TOTAL                     9.22';
                    cmds += newLine;
                    cmds += 'CASH TEND                10.00';
                    cmds += newLine;
                    cmds += 'CASH DUE                  0.78';
                    cmds += newLine + newLine;
                    cmds += esc + '!' + '\x18'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
                    cmds += '# ITEMS SOLD 2';
                    cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
                    cmds += newLine + newLine;
                    cmds += '11/03/13  19:53:17';

                    cpj.printerCommands = cmds;
                    //Send print job to printer!
                    cpj.sendToClient();
                } else {
                    //generate an image of HTML content through html2canvas utility
                    var ticket = document.getElementsByClassName('pos-sale-ticket')[0]
                    html2canvas(ticket, {scale: 10, width: 900}).then(function (canvas) {
                        //Create a ClientPrintJob
                        var cpj = new JSPM.ClientPrintJob();
                        cpj.clientPrinter = new JSPM.DefaultPrinter();
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

            }
            this.pos.get_order()._printed = true;
        },
    })
});
