/** @odoo-module alias=pos_partner_location_abstract.PartnerDetailsMapEdit **/

import {
    ConnectionAbortedError,
    ConnectionLostError,
} from "@web/core/network/rpc_service";
import PartnerDetailsEdit from "point_of_sale.PartnerDetailsEdit";
import Registries from "point_of_sale.Registries";
import {identifyError} from "point_of_sale.utils";

const {useState} = owl;

const PartnerDetailsMapEdit = (PartnerDetailsEdit) =>
    class PartnerDetailsMapEdit extends PartnerDetailsEdit {
        setup() {
            super.setup();
            this.changes = useState({
                ...this.changes,
                partner_latitude: this.props.partner.partner_latitude || "",
                partner_longitude: this.props.partner.partner_longitude || "",
            });
        }

        get accessToMap() {
            return false;
        }

        async partnerMap() {
            const {confirmed, payload} = await this.showPopup("PartnerMapEdit", {
                partner: this.props.partner,
            });
            if (confirmed) {
                for (const [key, value] of Object.entries(payload)) {
                    this.props.partner[key] = value;
                    if (Array.isArray(value)) {
                        this.changes[key] = value[0];
                    } else {
                        this.changes[key] = value;
                    }
                }
                this.render(this);
            }
        }

        async openMap() {
            try {
                if (this.accessToMap) {
                    await this.partnerMap();
                } else {
                    await this.showPopup("ErrorPopup", {
                        title: this.env._t("Map Error"),
                        body: this.env._t("Cannot access map functions!"),
                    });
                }
            } catch (e) {
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

Registries.Component.extend(PartnerDetailsEdit, PartnerDetailsMapEdit);

export default PartnerDetailsMapEdit;
