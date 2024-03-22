/** @odoo-module **/

import PartnerDetailsEdit from "point_of_sale.PartnerDetailsEdit";
import Registries from "point_of_sale.Registries";

const PartnerDetailsMapGoogleEdit = (PartnerDetailsEdit) =>
    class PartnerDetailsMapGoogleEdit extends PartnerDetailsEdit {
        get accessToMap() {
            this.config = this.env.pos.config;
            if (
                this.config.geolocalize_tech_name === "googlemap" &&
                this.config.googlemap_api_key
            ) {
                return true;
            }
            return super.accessToMap;
        }
    };

Registries.Component.extend(PartnerDetailsEdit, PartnerDetailsMapGoogleEdit);

export default PartnerDetailsMapGoogleEdit;
