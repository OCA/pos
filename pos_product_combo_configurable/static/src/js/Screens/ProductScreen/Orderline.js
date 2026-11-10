/* Copyright 2026 Acysos S.L.
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
 */

odoo.define("pos_product_combo_configurable.Orderline", function (require) {
    "use strict";

    const Orderline = require("point_of_sale.Orderline");
    const Registries = require("point_of_sale.Registries");

    const PosComboOrderlineComponent = (Orderline) =>
        class PosComboOrderlineComponent extends Orderline {
            onClickEditCombo() {
                this.trigger("click-edit-combo", {orderline: this.props.line});
            }
        };

    Registries.Component.extend(Orderline, PosComboOrderlineComponent);

    return PosComboOrderlineComponent;
});
