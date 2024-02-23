odoo.define("pos_hr.employees", function (require) {
    "use strict";

    var {PosGlobalState, Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const PosZipPosGlobalState = (PosGlobalState) =>
        class PosZipPosGlobalState extends PosGlobalState {
            async _processData(loadedData) {
                await super._processData(...arguments);
                if (this.config.is_zipcode_required) {
                    this.zipcodes = loadedData["order.zipcode"];
                    this.zip_code = loadedData.zip_code;
                    this.reset_zipcode();
                }
            }
            async after_load_server_data() {
                await super.after_load_server_data(...arguments);
                if (this.config.is_zipcode_required) {
                    this.hasLoggedIn = !this.config.is_zipcode_required;
                }
            }
            reset_zipcode() {
                this.zip_code = "";
            }
            set_zipcode(zipcode) {
                this.zip_code = zipcode;
            }

            /** {name: null, id: null, barcode: null, user_id:null, pin:null}
             * If pos_hr is activated, return {name: string, id: int, barcode: string, pin: string, user_id: int}
             * @returns {null|*}
             */
            get_zipcode() {
                if (this.config.is_zipcode_required) {
                    return this.zip_code;
                }
                return "";
            }
        };
    Registries.Model.extend(PosGlobalState, PosZipPosGlobalState);

    const PosZipOrder = (Order) =>
        class PosZipOrder extends Order {
            constructor(obj, options) {
                super(...arguments);
                this.zip_code = options.zip_code || this.zip_code || "";
            }
            set_zipcode(zipcode) {
                this.zip_code = zipcode;
            }

            /** {name: null, id: null, barcode: null, user_id:null, pin:null}
             * If pos_hr is activated, return {name: string, id: int, barcode: string, pin: string, user_id: int}
             * @returns {null|*}
             */
            get_zipcode() {
                return this.zip_code;
            }
            init_from_JSON(json) {
                super.init_from_JSON(...arguments);
                if (this.pos.config.is_zipcode_required && json.zip_code) {
                    this.zip_code = json.zip_code;
                }
            }
            export_as_JSON() {
                const json = super.export_as_JSON(...arguments);
                if (this.pos.config.is_zipcode_required) {
                    json.zip_code = this.zip_code || "";
                }
                return json;
            }
        };
    Registries.Model.extend(Order, PosZipOrder);
});
