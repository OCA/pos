/** @odoo-module */
/*
    Copyright 2023 Dixmit
    Copyright 2022 Camptocamp
    Copyright 2025 Nathan Kirui
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/

import {onWillStart, useState} from "@odoo/owl";
import {ConnectionLostError} from "@web/core/network/rpc_service";
import {EditListInput} from "@point_of_sale/app/store/select_lot_popup/edit_list_input/edit_list_input";
import {EditListPopup} from "@point_of_sale/app/store/select_lot_popup/select_lot_popup";
import {ErrorPopup} from "@point_of_sale/app/errors/popups/error_popup";

import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(EditListInput.prototype, {
    setup() {
        super.setup();
        // Prevent typing but allow selection from datalist
        this.onKeyDown = this.onKeyDown.bind(this);
    },

    get_lot_name(lot) {
        // Display lot name with available quantity if present
        if (lot.quantity !== undefined) {
            return `${lot.name} (Qty: ${lot.quantity})`;
        }
        return lot.name;
    },

    onKeyDown(event) {
        // Allow navigation keys: Tab, Enter, Escape, Arrow keys
        const allowedKeys = [
            "Tab",
            "Enter",
            "Escape",
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
        ];

        // Block all other keyboard input (typing)
        if (!allowedKeys.includes(event.key)) {
            event.preventDefault();
            return false;
        }
    },
});

patch(EditListPopup.prototype, {
    setup() {
        super.setup();
        this.data = useState({
            lots: this.env.services.pos.selectedProduct.available_lot_for_pos_ids || [],
        });
        onWillStart(this.onWillStart);
    },

    async onWillStart() {
        if (this.props.title === _t("Lot/Serial Number(s) Required")) {
            try {
                const pos = this.env.services.pos;
                let locationId = null;

                // The picking_type_id is stored as [id, name] array
                // We need to fetch the full picking type record to get the location
                if (
                    Array.isArray(pos.config.picking_type_id) &&
                    pos.config.picking_type_id[0]
                ) {
                    const pickingTypeId = pos.config.picking_type_id[0];

                    // Fetch the picking type to get the source location
                    const pickingTypes = await this.env.services.orm.call(
                        "stock.picking.type",
                        "read",
                        [[pickingTypeId], ["default_location_src_id"]]
                    );

                    if (pickingTypes && pickingTypes[0]?.default_location_src_id) {
                        locationId = pickingTypes[0].default_location_src_id[0];
                    }
                }

                // Fallback: try stock_location_id from config
                if (!locationId && pos.config.stock_location_id) {
                    locationId = pos.config.stock_location_id[0];
                }

                // Fetch fresh lot data filtered by this specific warehouse location
                const lots = await this.env.services.orm.call(
                    "product.product",
                    "get_available_lots_for_pos",
                    [[pos.selectedProduct.id], pos.company.id, locationId]
                );

                this.data.lots = lots;
                pos.selectedProduct.available_lot_for_pos_ids = lots;
            } catch (error) {
                if (error instanceof ConnectionLostError) {
                    return;
                }
                throw error;
            }
        }
    },

    async confirm() {
        // Validate: if no lots are available, prevent adding to cart
        if (this.data.lots && this.data.lots.length === 0) {
            await this.env.services.popup.add(ErrorPopup, {
                title: _t("No Lots Available"),
                body: _t(
                    "This product requires a lot/serial number, but none are available at this location. Please contact your manager to create lot numbers or add stock."
                ),
            });
            return; // Don't add to cart
        }

        // Call the parent confirm to handle normal validation
        await super.confirm();
    },
});
