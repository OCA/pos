/*
 Copyright (C) 2015-Today GRAP (http://www.grap.coop)
 @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
 Copyright 2020 Akretion France (http://www.akretion.com/)
 @author: Alexis de Lattre <alexis.delattre@akretion.com>
 License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_customer_display.CustomerDisplayPaymentScreen", function (require) {
    "use strict";

    const PaymentScreen = require("point_of_sale.PaymentScreen");
    const Registries = require("point_of_sale.Registries");

    const CustomerDisplayPaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            constructor() {
                super(...arguments);
                this.env.pos.proxy.send_text_customer_display(
                    this.env.pos.proxy.prepare_message_payment()
                );
            }

            addNewPaymentLine({detail: paymentMethod}) {
                var res = super.addNewPaymentLine({detail: paymentMethod});
                this.env.pos.proxy.send_text_customer_display(
                    this.env.pos.proxy.prepare_message_payment()
                );
                return res;
            }

            _updateSelectedPaymentline() {
                var res = super._updateSelectedPaymentline();
                this.env.pos.proxy.send_text_customer_display(
                    this.env.pos.proxy.prepare_message_payment()
                );
                return res;
            }
        };

    Registries.Component.extend(PaymentScreen, CustomerDisplayPaymentScreen);

    return CustomerDisplayPaymentScreen;

    // TODO migrate
    //    screens.ClientListScreenWidget.include({

    //        save_changes: function(){
    //            if(this.has_client_changed()){
    //                this.pos.proxy.send_text_customer_display(
    //                    this.pos.proxy.prepare_message_client(this.new_client)
    //                );
    //            }
    // we disable the send of message, during the call of _super()
    // because when selecting customer, all lines are recomputed
    // and so a message is sent for each lines
    // causing useless flashes
    //            this.pos.send_message_customer_display = false;
    //            var res = this._super();
    //            this.pos.send_message_customer_display = true;
    //            return res;
    //        },
    //    });
});
