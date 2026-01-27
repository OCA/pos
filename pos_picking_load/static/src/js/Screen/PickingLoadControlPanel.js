odoo.define("pos_picking_load.PickingLoadControlPanel", function (require) {
    "use strict";
    /* eslint-disable no-undef */

    const {useAutofocus, useListener} = require("@web/core/utils/hooks");
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const PickingLoadFetcher = require("pos_picking_load.PickingLoadFetcher");
    const contexts = require("point_of_sale.PosContext");
    const {useState} = owl;

    class PickingLoadControlPanel extends PosComponent {
        setup() {
            super.setup();
            this.orderManagementContext = useState(contexts.orderManagement);
            useListener("clear-search", this._onClearSearch);
            useAutofocus();
            PickingLoadFetcher.setSearchDomain(this._computeDomain());
        }
        onInputKeydown(event) {
            if (event) {
                this.trigger("search", this._computeDomain());
            }
        }

        _computeDomain() {
            const input = this.orderManagementContext.searchString.trim();
            if (!input) return "";
            return input;
        }
        _onClearSearch() {
            this.orderManagementContext.searchString = "";
            this.onInputKeydown({key: "Enter"});
        }
    }
    PickingLoadControlPanel.template = "PickingLoadControlPanel";

    Registries.Component.add(PickingLoadControlPanel);

    return PickingLoadControlPanel;
});
