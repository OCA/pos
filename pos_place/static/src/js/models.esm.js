/** @odoo-module **/

import {Order, PosGlobalState} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const OverloadPosGlobalState = (PosGlobalState) =>
    class extends PosGlobalState {
        async _processData(loadedData) {
            await super._processData(...arguments);
            this.places = loadedData["pos.place"];
            this.place_by_id = loadedData.place_by_id;
            this.enable_place = loadedData.enable_place;
            this.set_place(this.place_by_id.false);
        }
        set_place(place) {
            this.current_place = place;
            this.get_order_list().forEach(function (order) {
                order.place = place;
            });
        }
        get_place() {
            return this.current_place;
        }
    };
Registries.Model.extend(PosGlobalState, OverloadPosGlobalState);

const OverloadOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        constructor(obj, options) {
            super(...arguments);
            if (!options.json) {
                this.place = this.pos.get_place();
            }
        }

        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            this.place = this.pos.place_by_id[json.place_id];
        }

        export_as_JSON() {
            const json = super.export_as_JSON(...arguments);
            json.place_id = this.place ? this.place.id : false;
            return json;
        }
    };

Registries.Model.extend(Order, OverloadOrder);
