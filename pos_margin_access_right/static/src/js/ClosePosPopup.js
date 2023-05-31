odoo.define("pos_margin_access_right.ClosePosPopup", function (require) {
    "use strict";
    const Registries = require("point_of_sale.Registries");
    const ClosePosPopup = require("point_of_sale.ClosePosPopup");

    const PosMarClosePosPopup = (ClosePosPopup) =>
        class extends ClosePosPopup {
            setup() {
                super.setup();
            }
            getManagerRole() {
                const isAccessibleToEveryUser =
                    this.env.pos.config.is_margins_costs_accessible_to_every_user;
                const isCashierManager = this.env.pos.get_cashier().role === "manager";
                return isAccessibleToEveryUser || isCashierManager;
            }
            getShowDiffRole(pm) {
                if (this.getManagerRole()) return pm.type == "bank" && pm.number !== 0;
            }
            async confirm() {
                const absDifferences = Object.entries(this.state.payments).map((pm) =>
                    Math.abs(pm[1].difference)
                );
                if (
                    this.hasDifference() &&
                    Math.max(...absDifferences) <= this.amountAuthorizedDiff
                )
                    this.closeSession();
                else super.confirm();
            }
        };
    Registries.Component.extend(ClosePosPopup, PosMarClosePosPopup);
    return ClosePosPopup;
});
