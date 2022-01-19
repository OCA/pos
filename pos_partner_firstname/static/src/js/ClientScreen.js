odoo.define("pos_partner_firstname.ClientScreen", function (require) {
    "use strict";

    var ClientScreenEdit = require("point_of_sale.ClientListScreen");
    const Registries = require("point_of_sale.Registries");

    const PosClientScreenEdit = (ClientScreenEdit) =>
        class extends ClientScreenEdit {
            back() {
                super.back();
                if (this.props.client) {
                    if (this.props.client.id == this.state.selectedClient.id) {
                        this.props.client.name = this.state.selectedClient.name;
                    }
                }
            }
        };
    Registries.Component.extend(ClientScreenEdit, PosClientScreenEdit);
    return ClientScreenEdit;
});
