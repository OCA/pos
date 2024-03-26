odoo.define("pos_return_voucher.SetReturnVoucherPopup", function (require) {
    "use strict";

    const {useState, useRef} = owl.hooks;
    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const framework = require("web.framework");
    const time = require("web.time");

    class SetReturnVoucherPopup extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this.state = useState({
                id: false,
                uid: "",
                pos_reference: "",
                amount: 0.0,
                remaining_amount: 0.0,
                max_validity_date: false,
            });
            this.inputRef = useRef("inputName");
        }
        mounted() {
            this.inputRef.el.focus();
        }
        getPayload() {
            return {
                id: this.state.id,
                uid: this.state.uid,
                pos_reference: this.state.pos_reference,
                amount: this.state.remaining_amount,
                remaining_amount: this.state.remaining_amount,
            };
        }
        async searchReturnVoucher(event) {
            const inputUid = event.target.value;
            if (inputUid.length > 0) {
                const {
                    id,
                    uid,
                    pos_reference,
                    amount,
                    remaining_amount,
                    max_validity_date,
                } = await this._getReturnVoucher(inputUid);
                this.state.id = id || false;
                this.state.uid = uid || "";
                this.state.pos_reference = pos_reference || "";
                this.state.amount = amount || 0.0;
                this.state.remaining_amount = remaining_amount || 0.0;
                this.state.max_validity_date = max_validity_date || false;
            }
        }
        async _getReturnVoucher(uid) {
            let voucherData = {};
            framework.blockUI();

            const data = await this.rpc({
                model: "pos.return.voucher",
                method: "search_read",
                args: [
                    [["order_id.pos_reference", "like", uid]],
                    [
                        "id",
                        "pos_reference",
                        "amount",
                        "remaining_amount",
                        "max_validity_date",
                        "state",
                    ],
                ],
            });
            framework.unblockUI();

            try {
                if (data.length === 0)
                    throw Error(this.env._t("Return voucher not found."));
                voucherData = data[0];
                if (voucherData.state === "done")
                    throw Error(
                        this.env._t("The return voucher has already been used.")
                    );
                else if (voucherData.state === "expired")
                    throw Error(
                        this.env._t(
                            `The return voucher expired on ${this.datetime_to_str(
                                voucherData.max_validity_date
                            )}`
                        )
                    );
                voucherData.uid =
                    voucherData.pos_reference.length > 0
                        ? this.env.pos.extractUIDFromReference(
                              voucherData.pos_reference
                          )
                        : "";
            } catch (error) {
                this.showPopup("ErrorPopup", {
                    title: this.env._t("Error"),
                    body: error.message,
                });
            }

            return voucherData;
        }
        async confirm() {
            this.props.resolve(this.getPayload());
            this.trigger("close-popup");
        }
        datetime_to_str(date) {
            return time.datetime_to_str(new Date(date));
        }
    }
    SetReturnVoucherPopup.template = "SetReturnVoucherPopup";
    SetReturnVoucherPopup.defaultProps = {
        confirmText: "Select return voucher",
        cancelText: "Cancel",
    };

    Registries.Component.add(SetReturnVoucherPopup);

    return SetReturnVoucherPopup;
});
