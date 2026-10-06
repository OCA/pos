/*
    Copyright (C) 2022-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html
*/
/** @odoo-module **/
import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";
import * as ProductScreen from "@point_of_sale/../tests/tours/utils/product_screen_util";
import {registry} from "@web/core/registry";
import {inLeftSide} from "@point_of_sale/../tests/tours/utils/common";

// Check SIN :contains en textarea
function checkCustomerComment(comment) {
    return inLeftSide([
        {
            content: "Check PoS comment loaded",
            trigger: "textarea[name='pos_comment']",
            run: function () {
                if (!this.$anchor.val().includes(comment)) {
                    throw new Error("PoS comment not loaded");
                }
            },
        },
    ]);
}

// Write usando API del tour (sin document)
function writeCustomerComment(newComment) {
    return inLeftSide([
        {
            content: "Write PoS comment",
            trigger: "textarea[name='pos_comment']",
            run: function () {
                this.$anchor.val(newComment);
                this.$anchor.trigger("input");
            },
        },
    ]);
}

registry.category("web_tour.tours").add("PosCustomerCommentTour", {
    steps: () =>
        [
            Chrome.startPoS(),
            Dialog.confirm("Open Register"),

            ProductScreen.clickPartnerButton(),
            ProductScreen.clickCustomer("Addison Olson"),

            ...checkCustomerComment("Important"),

            ...writeCustomerComment("New Comment"),

            {
                content: "Save customer",
                trigger: ".partnerlist-screen .button.highlight",
                run: "click",
            },

            ProductScreen.closePos(),
        ].flat(),
});
