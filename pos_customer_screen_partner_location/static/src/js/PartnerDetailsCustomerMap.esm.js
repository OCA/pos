/** @odoo-module alias=pos_customer_screen_partner_location.PartnerDetailsCustomerMap **/

import {
    ConnectionAbortedError,
    ConnectionLostError,
} from "@web/core/network/rpc_service";
import PartnerDetailsEdit from "point_of_sale.PartnerDetailsEdit";
import Registries from "point_of_sale.Registries";
import {identifyError} from "point_of_sale.utils";

const PartnerDetailsCustomerMap = (PartnerDetailsEdit) =>
    class PartnerDetailsCustomerMap extends PartnerDetailsEdit {
        setup() {
            super.setup();
        }

        async customerMap() {
            this.customer_display = window.open(
                `/customer_screen_location/${this.props.partner.id}/${this.env.pos.config.id}/`,
                "Customer Display",
                "height=600,width=900"
            );
            this.customer_display.addEventListener("message", (event) => {
                if (event.data.tag === "set_data") {
                    for (const [key, value] of Object.entries(event.data.result)) {
                        this.props.partner[key] = value;
                        if (Array.isArray(value)) {
                            this.changes[key] = value[0];
                        } else {
                            this.changes[key] = value;
                        }
                    }
                    this.customer_display.close();
                }
                if (event.data.tag === "close") {
                    this.customer_display.close();
                    if (event.data.message) {
                        this.showPopup("ErrorPopup", {
                            title: this.env._t("Error"),
                            body: event.data.message,
                        });
                    }
                }
            });
        }

        async openCustomerMap() {
            try {
                if (this.accessToMap) {
                    await this.customerMap();
                } else {
                    await this.showPopup("ErrorPopup", {
                        title: this.env._t("Map Error"),
                        body: this.env._t("Cannot access map functions!"),
                    });
                }
            } catch (e) {
                console.warn(e);
                if (
                    identifyError(e) instanceof ConnectionLostError ||
                    ConnectionAbortedError
                ) {
                    await this.showPopup("OfflineErrorPopup", {
                        title: this.env._t("Network Error"),
                        body: this.env._t(
                            "Cannot access product information screen if offline."
                        ),
                    });
                } else {
                    await this.showPopup("ErrorPopup", {
                        title: this.env._t("Unknown error"),
                        body: this.env._t(
                            "An unknown error prevents us from loading product information."
                        ),
                    });
                }
            }
        }
    };

Registries.Component.extend(PartnerDetailsEdit, PartnerDetailsCustomerMap);

export default PartnerDetailsCustomerMap;
