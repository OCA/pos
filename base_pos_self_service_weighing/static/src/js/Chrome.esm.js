/** @odoo-module alias=base_pos_self_service_weighing.Chrome **/
// SPDX-FileCopyrightText: 2023 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Chrome from "point_of_sale.Chrome";
import Registries from "point_of_sale.Registries";

const SelfServiceWeighingChrome = (Chrome_) =>
    class extends Chrome_ {
        /**
         * @override
         * `SelfServiceWeighingWelcomeScreen` is the start screen if the POS is configured
         * as a self-service pos.
         */
        get startScreen() {
            // Calling super first because it logs an error in some cases.
            var result = super.startScreen;
            if (this.env.pos.config.is_self_service_weighing_station) {
                return {name: "SelfServiceWeighingWelcomeScreen"};
            }
            return result;
        }

        isSelfService() {
            return (
                this.env.pos &&
                this.env.pos.config &&
                this.env.pos.config.is_self_service_weighing_station
            );
        }

        async setupBarcodeParser() {
            const result = await super.setupBarcodeParser(...arguments);
            this.env.pos.init_barcode_generators();
            return result;
        }
    };

Registries.Component.extend(Chrome, SelfServiceWeighingChrome);
export default SelfServiceWeighingChrome;
