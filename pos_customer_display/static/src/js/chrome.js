/*
 Copyright 2020 Akretion France (http://www.akretion.com/)
 @author: Alexis de Lattre <alexis.delattre@akretion.com>
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.Chrome", function (require) {
    "use strict";

    const Chrome = require("point_of_sale.Chrome");
    const Registries = require("point_of_sale.Registries");

    const PosCustomerDisplay = (Chrome) =>
        class extends Chrome {
            async _closePos() {
                //  Var msg = this.env.pos.proxy.customer_display_proxy._prepare_message_close();
                //  console.log(msg);
                // TODO find a way to display the msg upon POS closing
                await super._closePos();
            }
        };

    Registries.Component.extend(Chrome, PosCustomerDisplay);

    return Chrome;
});
