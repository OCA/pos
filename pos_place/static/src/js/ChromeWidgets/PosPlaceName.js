odoo.define("pos_place.PosPlaceName", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class PosPlaceName extends PosComponent {
        async selectPosPlace() {
            const placesList = this.env.pos.places.map((place) => {
                return {
                    id: place.id,
                    item: place,
                    label: place.code ? place.code + " - " + place.name : place.name,
                    isSelected: place.id === this.env.pos.get_place().id,
                };
            });
            const {confirmed, payload: place} = await this.showPopup("SelectionPopup", {
                title: this.env._t("Select Place"),
                list: placesList,
            });

            if (!confirmed) {
                return;
            }
            this.env.pos.set_place(place);
        }

        get placename() {
            const place = this.env.pos.get_place();
            return place.id ? place.name : this.env._t("Select Place");
        }
        get placecode() {
            const place = this.env.pos.get_place();
            return place.id ? place.code : this.env._t("?");
        }
    }
    PosPlaceName.template = "PosPlaceName";

    Registries.Component.add(PosPlaceName);

    return PosPlaceName;
});
