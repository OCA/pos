/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.devices", function (require) {
    "use strict";

    var devices = require("point_of_sale.devices");

    var customer_display_2_20 = require("pos_customer_display.customer_display_2_20");

    var ProxyDeviceSuper = devices.ProxyDevice;

    devices.ProxyDevice = devices.ProxyDevice.extend({
        init: function (parent, options) {
            var res = ProxyDeviceSuper.prototype.init.call(this, parent, options);
            this.customer_display_proxy = false;
            return res;
        },

        load_customer_display_format_file: function () {
            if (this.pos.config.customer_display_format == "2_20") {
                this.customer_display_proxy = new customer_display_2_20.CustomerDisplay_2_20(
                    this
                );
            } else {
                console.warn(
                    "No Javascript file found for the Customer Display format" +
                        this.config.customer_display_format
                );
            }
        },

        send_text_customer_display: function (data) {
            if (this.customer_display_proxy) {
                if (this.pos.config.iface_customer_display) {
                    return this.message("send_text_customer_display", {
                        text_to_display: JSON.stringify(data),
                    });
                } else if (
                    this.pos.config.epos_customer_display &&
                    this.pos.config.epson_printer_ip
                ) {
                    return this._epos_send_display_soap_request(
                        this.pos.config.epson_printer_ip,
                        data
                    );
                }
            }
        },

        _epos_send_display_soap_request: function (epos_printer_ip, data) {
            /* I could use the JS lib 'epos-2.12.0.js' supplied by the module
               'pos_epson_printer' in Odoo v14
               but this JS lib is not supplied any more in Odoo v15, so this module will be
               easier to port to newer versions of Odoo if we don't use that JS lib */
            var body_xml =
                '<epos-display xmlns="http://www.epson-pos.com/schemas/2012/09/epos-display">';
            body_xml += "<reset/>";
            body_xml += '<cursor type="none"/>';
            body_xml += '<text x="1" y="1" lang="mul">' + data[0] + "</text>";
            body_xml += '<text x="1" y="2" lang="mul">' + data[1] + "</text>";
            body_xml += "</epos-display>";
            // Config params in header
            var header_xml =
                '<parameter xmlns="http://www.epson-pos.com/schemas/2012/09/epos-display">';
            header_xml += "<devid>local_display</devid>";
            header_xml += "<timeout>1000</timeout>";
            header_xml += "</parameter>";
            // Build the full XML
            var entire_xml =
                '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">';
            entire_xml += "<s:Header>" + header_xml + "</s:Header>";
            entire_xml += "<s:Body>" + body_xml + "</s:Body></s:Envelope>";
            // Build the URL
            var url =
                window.location.protocol +
                "//" +
                epos_printer_ip +
                "/cgi-bin/eposDisp/service.cgi";
            // Prepare the SOAP request to the ePOS printer
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            // Set HTTP headers
            xhr.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
            xhr.setRequestHeader("SOAPAction", '""');
            // Define the callback function
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        // Get XML answer to my SOAP request
                        var answer = xhr.responseXML;
                        var xml_response = answer
                            .getElementsByTagName("response")[0]
                            .getAttribute("success");
                        // If it fails, log a warning
                        if (!/^(1|true)$/.test(xml_response)) {
                            console.warn(
                                "pos_customer_display: ePOS local_display error. xml_response = " +
                                    xml_response
                            );
                        }
                    } else {
                        console.warn(
                            "pos_customer_display: ePOS local_display error. HTTP error code = " +
                                xhr.status
                        );
                    }
                }
            };
            // Fire SOAP request to Epson ePOS Printer
            xhr.send(entire_xml);
        },

        _prepare_line: function (left_part, right_part) {
            if (left_part === false) {
                left_part = "";
            }
            if (right_part === false) {
                right_part = "";
            }
            var line_length = this.pos.config.customer_display_line_length;
            var max_left_length = line_length;
            if (right_part.length !== 0) {
                max_left_length -= right_part.length;
            }
            var result = left_part.substring(0, max_left_length - 1);
            result = result.padEnd(max_left_length);
            if (right_part.length !== 0) {
                result += right_part.padStart(line_length - result.length);
            }
            return result;
        },

        prepare_message_orderline: function (order_line, action) {
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_orderline(
                    order_line,
                    action
                );
            }
        },

        prepare_message_payment: function () {
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_payment();
            }
        },

        prepare_message_welcome: function () {
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_welcome();
            }
        },

        prepare_message_close: function () {
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_close();
            }
        },

        prepare_message_client: function (client) {
            if (this.customer_display_proxy) {
                return this.customer_display_proxy._prepare_message_client(client);
            }
        },
    });
});
