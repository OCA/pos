/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_selection.EditListPopup", function (require) {
    "use strict";

    const EditListPopup = require("point_of_sale.EditListPopup");
    const Registries = require("point_of_sale.Registries");

    const LotSelectEditListPopup = (EditListPopup) =>
        class extends EditListPopup {
            constructor() {
                super(...arguments);
                if (this.props.title === this.env._t("Lot/Serial Number(s) Required")) {
                    this.props.lots = this.env.session.lots;
                }
            }
        };

    Registries.Component.extend(EditListPopup, LotSelectEditListPopup);
    return EditListPopup;
});
