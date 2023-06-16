/* Copyright 2023 Aures Tic - Jose Zambudio
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("pos_return_vocher.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const time = require("web.time");

    const superOrder = models.Order.prototype;
    const superPaymentline = models.Paymentline.prototype;

    models.PosModel = models.PosModel.extend({
        extractUIDFromReference: function (reference) {
            const regex = /([0-9]|-){14}/g;
            const match = reference.match(regex);
            return match[0];
        },
    });
    models.load_fields("pos.payment.method", ["return_voucher"]);

    models.Paymentline = models.Paymentline.extend({
        export_as_JSON: function () {
            const json = superPaymentline.export_as_JSON.call(this);
            json.emitted_return_voucher_id = this.emittedReturnVoucherId;
            json.redeemed_return_voucher_id = this.redeemedReturnVoucherId;
            return json;
        },
        init_from_JSON: function (json) {
            superPaymentline.init_from_JSON.apply(this, arguments);
            this.emittedReturnVoucherId = json.emitted_return_voucher_id;
            this.redeemedReturnVoucherId = json.redeemed_return_voucher_id;
        },
        set_redeemed_return_voucher: function (id) {
            this.redeemedReturnVoucherId = id;
        },
        export_for_printing: function () {
            const json = superPaymentline.export_for_printing.call(this);
            json.emitted_return_voucher_id = this.emittedReturnVoucherId;
            json.return_voucher =
                this.payment_method.return_voucher && this.get_amount() < 0;
            return json;
        },
    });

    models.Order = models.Order.extend({
        init_from_JSON: function (json) {
            superOrder.init_from_JSON.apply(this, arguments);
            this.emittedReturnVoucherId = json.emitted_return_voucher_id;
            this.emittedReturnVoucherDate = json.return_voucher_max_date
                ? time.str_to_datetime(json.return_voucher_max_date)
                : false;
        },
        export_for_printing: function () {
            const json = superOrder.export_for_printing.call(this);
            json.return_voucher =
                json.paymentlines.some((payment) => payment.return_voucher) ||
                this.emittedReturnVoucherId;
            if (json.return_voucher) {
                if (
                    !this.emittedReturnVoucherId &&
                    !this.emittedReturnVoucherDate &&
                    this.pos.config.return_voucher_validity
                ) {
                    const emittedReturnVoucherDate = new Date();
                    emittedReturnVoucherDate.setDate(
                        emittedReturnVoucherDate.getDate() +
                            this.pos.config.return_voucher_validity
                    );
                    this.emittedReturnVoucherDate = emittedReturnVoucherDate;
                }
                json.return_voucher_expire_date = this.emittedReturnVoucherDate
                    ? time.date_to_str(this.emittedReturnVoucherDate)
                    : false;
            }
            return json;
        },
        getOrderReceiptEnv: function () {
            const receiptEnv = superOrder.getOrderReceiptEnv.call(this);
            receiptEnv.receipt.uid = this.pos.extractUIDFromReference(
                receiptEnv.receipt.name
            );
            return receiptEnv;
        },
    });

    return models;
});
