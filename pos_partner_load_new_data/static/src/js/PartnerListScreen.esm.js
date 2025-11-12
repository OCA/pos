/** @odoo-module **/

import {Gui} from "point_of_sale.Gui";
import PartnerListScreen from "point_of_sale.PartnerListScreen";
import Registries from "point_of_sale.Registries";
import {isConnectionError} from "point_of_sale.utils";
import {onWillStart} from "@odoo/owl";

export const UpdatedPartnerListScreen = (OriginalPartnerListScreen) =>
    class extends OriginalPartnerListScreen {
        setup() {
            super.setup();

            onWillStart(async () => {
                this.env.pos
                    .loadPartnersBackground(
                        this.env.pos.prepare_new_partners_domain(),
                        0,
                        "write_date desc"
                    )
                    .then(() => {
                        if (this.env.pos.synch.status !== "connected") {
                            Gui.setSyncStatus("connected", this.env.pos.synch.pending);
                        }
                    })
                    .catch((error) => {
                        if (isConnectionError(error)) {
                            Gui.setSyncStatus("error", this.env.pos.synch.pending);
                        }
                        throw error;
                    });
            });
        }
    };

Registries.Component.extend(PartnerListScreen, UpdatedPartnerListScreen);
