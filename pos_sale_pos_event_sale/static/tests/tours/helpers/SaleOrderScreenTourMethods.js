/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define(
    "pos_sale_pos_event_sale.tour.SaleOrderScreenTourMethods",
    function (require) {
        /* eslint-disable no-empty-function */
        "use strict";

        const {createTourMethods} = require("point_of_sale.tour.utils");

        class Do {
            clickDisplayedOrder(orderName) {
                return [
                    {
                        content: `clicking SO ${orderName}`,
                        trigger: `.screen.order-management-screen .col.name:contains("${orderName}")`,
                    },
                ];
            }
            close() {
                return [
                    {
                        content: `Close screen`,
                        trigger: `.screen.order-management-screen .button.back`,
                    },
                ];
            }
        }

        class Check {
            isShown() {
                return [
                    {
                        content: "Sale Order Management screen is shown",
                        trigger: ".screen.order-management-screen:not(.oe_hidden)",
                        run: () => {},
                    },
                ];
            }
        }

        return createTourMethods("SaleOrderScreen", Do, Check);
    }
);
