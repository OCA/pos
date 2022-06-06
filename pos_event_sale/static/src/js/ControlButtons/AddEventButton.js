/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.AddEventButton", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const {useListener} = require("web.custom_hooks");
    const Registries = require("point_of_sale.Registries");

    class AddEventButton extends PosComponent {
        constructor() {
            super(...arguments);
            useListener("click", this.onClick);
        }
        async onClick() {
            await this.showPopup("EventSelectorPopup", {});
        }
    }
    AddEventButton.template = "AddEventButton";

    ProductScreen.addControlButton({
        component: AddEventButton,
        condition: function () {
            return this.env.pos.config.iface_event_sale;
        },
    });

    Registries.Component.add(AddEventButton);
    return AddEventButton;
});
