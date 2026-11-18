/** @odoo-module **/
/*
 *  Copyright 2023 LevelPrime
 *  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
 */
import {useService} from "@web/core/utils/hooks";
import {Orderline} from "@point_of_sale/app/generic_components/orderline/orderline";
import {patch} from "@web/core/utils/patch";

patch(Orderline.prototype, {
    setup() {
        super.setup();
        this.numberBuffer = useService("number_buffer");
    },
    async removeLine() {
        this.numberBuffer.sendKey("Backspace");
        this.numberBuffer.sendKey("Backspace");
    },
});
