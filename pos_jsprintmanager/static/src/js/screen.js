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
                //generate an image of HTML content through html2canvas utility
                html2canvas(document.getElementsByClassName('pos-receipt-container')[0], { scale: 5 }).then(function (canvas) {

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
            this.pos.get_order()._printed = true;
        },
    })
});
