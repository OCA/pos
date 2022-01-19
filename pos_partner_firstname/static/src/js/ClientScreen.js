odoo.define("pos_partner_firstname.ClientScreen", function (require) {
    "use strict";

    const ClientScreen = require("point_of_sale.ClientListScreen");
    const Registries = require("point_of_sale.Registries");

    const PosClientScreen = (ClientScreen) =>
        class extends ClientScreen {
            back() {
                super.back();
                if (this.props.client) {
                    if (this.props.client.id === this.state.selectedClient.id) {
                        this.props.client.name = this.state.selectedClient.name;
                    }
                }
            }
        };
    Registries.Component.extend(ClientScreen, PosClientScreen);
    return ClientScreen;
});
