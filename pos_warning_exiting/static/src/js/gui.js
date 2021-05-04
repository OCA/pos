/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define("pos_warning_exiting.gui", function (require){

    "use strict";
    var core = require("web.core");
    var rpc = require('web.rpc');
    var utils = require('web.utils');
    var gui = require("point_of_sale.gui");

    var _t = core._t;
    var round_pr = utils.round_precision;


    var _super_close_ = gui.Gui.prototype.close;

    gui.Gui.prototype.close = function(){
        var self = this;
        var draft_orders_description = [];
        var order_jsons = this.pos.db.get_unpaid_orders();

        order_jsons.forEach(function (order_json) {
            if (order_json.pos_session_id === self.pos.pos_session.id && order_json.lines.length) {
                var order_description = _t("Order #") + order_json.sequence_number;
                // Lazy depedency to pos_restaurant
                // to display table information
                if (order_json.table) {
                    order_description += _t(" - Table: ") + order_json.table.name;
                }
                draft_orders_description.push(order_description);
            }
        });

        if (draft_orders_description.length) {
            this.show_popup("confirm", {
                "title": _t("Draft Orders"),
                "body":  _t(
                     "You have some draft unpaid orders." +
                     " You can exit temporarily the Point of Sale, but you" +
                     " will loose that orders if you close the session: ") +
                     draft_orders_description.join(", "),
                "confirm": function() {
                    self.check_connection_and_close();
                },
            });
        } else {
            this.check_connection_and_close();
        }
    };

    gui.Gui.prototype.check_connection_and_close = function(){
            // We check the Network connection before closing
            // making a search read on the current pos.session
            var self = this;
            var params = {
                model: 'pos.session',
                method: 'search_read',
                domain: [['id', '=', self.pos.pos_session.id]],
                fields: ['state'],
            };

            rpc.query(params)
            .then(function(sessions){
                _super_close_.call(self);
            })
            .fail(function(error, event){
                event.preventDefault();
                self.show_popup("confirm", {
                    "title": _t("Network Connection Lost"),
                    "body":  _t(
                        "It seems that you do not have a network connection at the moment." +
                        " If you close this window, it will not be possible to re-sell" +
                        " until you get your connection back."),
                    "confirm": function() {
                        _super_close_.call(self);
                    },
                });
            });
    }


});



