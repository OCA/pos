odoo.define("pos_crm.AskVatPopup", function (require) {
    "use strict";
    var core = require("web.core");
    var _t = core._t;

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const AskVatBuffer = require("pos_crm.AskVatBuffer");
    const {useListener} = require("@web/core/utils/hooks");
    const Registries = require("point_of_sale.Registries");

    const {useState} = owl;

    class AskVatPopup extends AbstractAwaitablePopup {
        /**
         * @param {Object} props
         * @param {Boolean} props.isPassword Show password popup.
         * @param {Number|null} props.startingValue Starting value of the popup.
         * @param {Boolean} props.isInputSelected Input is highlighted and will reset upon a change.
         *
         * Resolve to { confirmed, payload } when used with showPopup method.
         * @confirmed {Boolean}
         * @payload {String}
         */
        setup() {
            super.setup();
            useListener("accept-input", this.confirm);
            useListener("close-this-popup", this.cancel);
            const startingBuffer = "";
            this.state = useState({
                buffer: startingBuffer,
                toStartOver: this.props.isInputSelected,
            });
            AskVatBuffer.use({
                nonKeyboardInputEvent: "numpad-click-input",
                triggerAtEnter: "accept-input",
                triggerAtEscape: "close-this-popup",
                state: this.state,
            });
        }
        get inputBuffer() {
            if (this.state.buffer === null) {
                return "";
            }
            if (this.props.isPassword) {
                return this.state.buffer.replace(/./g, "•");
            }
            return this.state.buffer;
        }
        confirm() {
            if (AskVatBuffer.get()) {
                super.confirm();
            }
        }
        sendInput(key) {
            this.trigger("numpad-click-input", {key});
        }
        getPayload() {
            return AskVatBuffer.get();
        }
    }
    AskVatPopup.template = "AskVatPopup";
    AskVatPopup.defaultProps = {
        confirmText: _t("Ok"),
        cancelText: _t("Cancel"),
        title: _t("Confirm ?"),
        body: "",
        cheap: false,
        startingValue: null,
    };

    Registries.Component.add(AskVatPopup);

    return AskVatPopup;
});
