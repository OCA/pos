/**
Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define("pos_place.models", function (require) {
    "use strict";

    const {PosGlobalState, Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const PosPlaceGlobalState = (PosGlobalState) =>
        class PosPlaceGlobalState extends PosGlobalState {
            async _processData(loadedData) {
                await super._processData(...arguments);
                this.places = loadedData["pos.place"];
                this.place_by_id = loadedData.place_by_id;
            }
        };

    Registries.Model.extend(PosGlobalState, PosPlaceGlobalState);

    const PosPlaceOrder = (Order) =>
        class PosPlaceOrder extends Order {
            // @override
            export_as_JSON() {
                const json = super.export_as_JSON(...arguments);
                json.place = this.get_place();
                return json;
            }
            // @override
            init_from_JSON(json) {
                super.init_from_JSON(...arguments);
                this.set_place(json.place);
            }
            // @override
            export_for_printing() {
                const json = super.export_for_printing(...arguments);
                json.place = this.get_place();
                return json;
            }

            get_place() {
                return {name: "coincoin ! "};
                /*            Return this.get("current_place") || this.db.load("current_place");*/
            }
            set_place(place) {
                /*            This.set("current_place", place);
            this.db.save("current_place", place || null);*/
            }
        };
    Registries.Model.extend(Order, PosPlaceOrder);

    /*    Var models = require("point_of_sale.models");
    var _super_order = models.Order.prototype;

    // Load pos.place model
    models.load_models({
        model: "pos.place",
        loaded: function (self, places) {
            self.places = [];
            for (var i = 0; i < places.length; i++) {
                self.places.push(places[i]);
            }
        },
    });

    // Make place persistent in the session
    models.PosModel = models.PosModel.extend({
        get_place: function () {
            return this.get("current_place") || this.db.load("current_place");
        },
        set_place: function (place) {
            this.set("current_place", place);
            this.db.save("current_place", place || null);
        },
    });

    models.Order = models.Order.extend({
        export_for_printing: function () {
            var res = _super_order.export_for_printing.apply(this, arguments);
            res.place = this.pos.get_place();
            return res;
        },

        export_as_JSON: function () {
            var json = _super_order.export_as_JSON.apply(this, arguments);
            var place = this.pos.get_place();
            json.place_id = place ? place.id : false;
            return json;
        },
    });*/
});
