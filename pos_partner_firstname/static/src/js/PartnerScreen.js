odoo.define("pos_partner_firstname.PartnerListScreen", function (require) {
    "use strict";

    const PartnerListScreen = require("point_of_sale.PartnerListScreen");
    const Registries = require("point_of_sale.Registries");

    const PosPartnerListScreen = (PartnerListScreen) =>
        class extends PartnerListScreen {
            back() {
                super.back();
                if (this.props.partner) {
                    if (this.props.partner.id === this.state.selectedPartner.id) {
                        this.props.partner.name = this.state.selectedPartner.name;
                    }
                }
            }
        };
    Registries.Component.extend(PartnerListScreen, PosPartnerListScreen);
    return PartnerListScreen;
});
