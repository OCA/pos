/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_crm.AskVatBuffer", function (require) {
    "use strict";

    const {parse} = require("web.field_utils");
    var NumberBuffer = require("point_of_sale.NumberBuffer");
    const {Gui} = require("point_of_sale.Gui");

    // The buffer core size of number input is limited to 12
    // Because of it we need to override this behavior.
    // In the future this class can be used to VAT input validation

    class AskVatBuffer extends NumberBuffer.constructor {
        constructor() {
            super();
            this._max_buffer_size = 100;
        }
        /**
         * Updates the current buffer state using the given input.
         * @param {String} input valid input
         */
        _updateBuffer(input) {
            const isEmpty = (val) => {
                return val === "" || val === null;
            };
            if (input === undefined || input === null) return;
            const isFirstInput = isEmpty(this.state.buffer);
            if (input === "," || input === ".") {
                if (this.state.toStartOver) {
                    this.state.buffer = "";
                }
                if (isFirstInput) {
                    this.state.buffer = "0" + this.decimalPoint;
                } else if (!this.state.buffer.length || this.state.buffer === "-") {
                    this.state.buffer += "0" + this.decimalPoint;
                } else if (this.state.buffer.indexOf(this.decimalPoint) < 0) {
                    this.state.buffer += this.decimalPoint;
                }
            } else if (input === "Delete") {
                if (this.isReset) {
                    this.state.buffer = "";
                    this.isReset = false;
                    return;
                }
                this.state.buffer = isEmpty(this.state.buffer) ? null : "";
            } else if (input === "Backspace") {
                if (this.isReset) {
                    this.state.buffer = "";
                    this.isReset = false;
                    return;
                }
                if (this.state.toStartOver) {
                    this.state.buffer = "";
                }
                const buffer = this.state.buffer;
                if (isEmpty(buffer)) {
                    this.state.buffer = null;
                } else {
                    const nCharToRemove =
                        buffer[buffer.length - 1] === this.decimalPoint ? 2 : 1;
                    this.state.buffer = buffer.substring(
                        0,
                        buffer.length - nCharToRemove
                    );
                }
            } else if (input === "+") {
                if (this.state.buffer[0] === "-") {
                    this.state.buffer = this.state.buffer.substring(
                        1,
                        this.state.buffer.length
                    );
                }
            } else if (input === "-") {
                if (isFirstInput) {
                    this.state.buffer = "-0";
                } else if (this.state.buffer[0] === "-") {
                    this.state.buffer = this.state.buffer.substring(
                        1,
                        this.state.buffer.length
                    );
                } else {
                    this.state.buffer = "-" + this.state.buffer;
                }
            } else if (input[0] === "+" && !isNaN(parseFloat(input))) {
                // When input is like '+10', '+50', etc
                const inputValue = parse.float(input.slice(1));
                const currentBufferValue = this.state.buffer
                    ? parse.float(this.state.buffer)
                    : 0;
                this.state.buffer = this.component.env.pos.formatFixed(
                    inputValue + currentBufferValue
                );
            } else if (!isNaN(parseInt(input, 10))) {
                if (this.state.toStartOver) {
                    // When we want to erase the current buffer for a new value
                    this.state.buffer = "";
                }
                if (isFirstInput) {
                    this.state.buffer = String(input);
                } else if (this.state.buffer.length > this._max_buffer_size) {
                    Gui.playSound("bell");
                } else {
                    this.state.buffer += input;
                }
            }
            if (this.state.buffer === "-") {
                this.state.buffer = "";
            }
            // Once an input is accepted and updated the buffer,
            // the buffer should not be in reset state anymore.
            this.isReset = false;
            // It should not be in a start the buffer over state anymore.
            this.state.toStartOver = false;

            if (this.config.maxValue && this.state.buffer > this.config.maxValue) {
                this.state.buffer = this.config.maxValue.toString();
                this.config.maxValueReached();
            }

            this.trigger("buffer-update", this.state.buffer);
        }
    }

    return new AskVatBuffer();
});
