/** @odoo-module **/
/*
 *  Copyright 2023 LevelPrime
 *  License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
 */

import Orderline from "point_of_sale.Orderline";
import Registries from "point_of_sale.Registries";

const PosOrderline = (Orderline) =>
    class extends Orderline {
        async removeLine(ev) {
            const order = this.env.pos.get_order();
            if (order) {
                ev.stopPropagation();
                ev.preventDefault();
                this.selectLine();
                order.remove_orderline(order.get_selected_orderline());
                this.checkRewardLines(order);
            }
        }
        // Dependecy-less suport to pos_loyalty
        checkRewardLines(order) {
            const anyRewardLine = order.orderlines.some((line) => line.is_reward_line);
            if (anyRewardLine) {
                order._updateRewards();
            }
        }
    };
Registries.Component.extend(Orderline, PosOrderline);
