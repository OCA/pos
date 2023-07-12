/*
Copyright (C) 2022-Today KMEE (https://kmee.com.br)
 License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*/

odoo.define("pos_ask_vat.NumberBuffer", function (require) {
    "use strict";

    var NumberBuffer = require("point_of_sale.NumberBuffer");
    const {Gui} = require("point_of_sale.Gui");

    const _updateBuffer = (input) => {
        const self = NumberBuffer;
        const isEmpty = (val) => {
            return val === "" || val === null;
        };
        if (input === undefined || input === null) return;
        const isFirstInput = isEmpty(self.state.buffer);
        if (input === "," || input === ".") {
            if (isFirstInput) {
                self.state.buffer = "0" + self.decimalPoint;
            } else if (!self.state.buffer.length || self.state.buffer === "-") {
                self.state.buffer += "0" + self.decimalPoint;
            } else if (self.state.buffer.indexOf(self.decimalPoint) < 0) {
                self.state.buffer += self.decimalPoint;
            }
        } else if (input === "Delete") {
            if (self.isReset) {
                self.state.buffer = "";
                self.isReset = false;
                return;
            }
            self.state.buffer = isEmpty(self.state.buffer) ? null : "";
        } else if (input === "Backspace") {
            if (self.isReset) {
                self.state.buffer = "";
                self.isReset = false;
                return;
            }
            const buffer = self.state.buffer;
            if (isEmpty(buffer)) {
                self.state.buffer = null;
            } else {
                const nCharToRemove =
                    buffer[buffer.length - 1] === self.decimalPoint ? 2 : 1;
                self.state.buffer = buffer.substring(0, buffer.length - nCharToRemove);
            }
        } else if (input === "+") {
            if (self.state.buffer[0] === "-") {
                self.state.buffer = self.state.buffer.substring(
                    1,
                    self.state.buffer.length
                );
            }
        } else if (input === "-") {
            if (isFirstInput) {
                self.state.buffer = "-0";
            } else if (self.state.buffer[0] === "-") {
                self.state.buffer = self.state.buffer.substring(
                    1,
                    self.state.buffer.length
                );
            } else {
                self.state.buffer = "-" + self.state.buffer;
            }
        } else if (input[0] === "+" && !isNaN(parseFloat(input))) {
            // When input is like '+10', '+50', etc
            const inputValue = parseFloat(input.slice(1));
            const currentBufferValue = self.state.buffer
                ? parseFloat(self.state.buffer)
                : 0;
            self.state.buffer = self.component.env.pos.formatFixed(
                inputValue + currentBufferValue
            );
        } else if (!isNaN(parseInt(input, 10))) {
            if (isFirstInput) {
                self.state.buffer = String(input);
            } else if (self.state.buffer.length > 13) {
                Gui.playSound("bell");
            } else {
                self.state.buffer += input;
            }
        }
        if (self.state.buffer === "-") {
            self.state.buffer = "";
        }
        // Once an input is accepted and updated the buffer,
        // the buffer should not be in reset state anymore.
        self.isReset = false;

        self.trigger("buffer-update", self.state.buffer);
    };

    NumberBuffer.__proto__._updateBuffer = _updateBuffer;
});
