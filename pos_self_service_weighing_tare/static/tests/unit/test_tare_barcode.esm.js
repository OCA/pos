/** @odoo-module **/

import {getSteps, startSteps} from "point_of_sale.tour.utils";
import {Chrome} from "point_of_sale.tour.ChromeTourMethods";
import {ErrorPopup} from "point_of_sale.tour.ErrorPopupTourMethods";
import {NumberPopup} from "point_of_sale.tour.NumberPopupTourMethods";
import {PaymentScreen} from "point_of_sale.tour.PaymentScreenTourMethods";
import {ProductScreen} from "point_of_sale.tour.ProductScreenTourMethods";
import {ReceiptScreen} from "point_of_sale.tour.ReceiptScreenTourMethods";
import {TextInputPopup} from "point_of_sale.tour.TextInputPopupTourMethods";
import {TicketScreen} from "point_of_sale.tour.TicketScreenTourMethods";
import Tour from "web_tour.tour";

QUnit.module("unit test for tare barcode", {
    before() {},
});

QUnit.test("trying to setup js tests for TARE", async function (assert) {
    assert.equal(1, 2);
});
