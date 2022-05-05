// Copyright 2022 Coop IT Easy SCRLfs
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

odoo.define("pos_customer_wallet.screens", function (require) {
    "use strict";
    var screens = require("point_of_sale.screens");

    screens.PaymentScreenWidget.include({
        customer_changed: function () {
            var self = this;
            var client = this.pos.get_client();

            if (client) {
                this.pos.load_partners_by_ids([client.id]).then(function () {
                    // Update the client list as well, because it may now be out
                    // of date.
                    var clientlist = self.gui.screen_instances["clientlist"];
                    clientlist.partner_cache = new screens.DomCache();
                    clientlist.render_list(
                        self.pos.db.get_partners_sorted(1000)
                    );

                    // Because this function is run asynchronously, the client
                    // could have changed in the meantime. Check whether it's
                    // still the same before proceeding.
                    if (self.pos.get_client() == client) {
                        // Override outdated partner model on the order with a
                        // newer one. The old one will be garbage-collected.
                        self.pos
                            .get_order()
                            .set_client(
                                self.pos.db.get_partner_by_id(client.id)
                            );
                    }
                });
            }

            this._super();
        },
    });
});
