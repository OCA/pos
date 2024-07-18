odoo.define("pos_tare.ScaleScreen", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const ScaleScreen = require("point_of_sale.ScaleScreen");
    const {useState} = owl;
    const {useAutoFocusToLast} = require("point_of_sale.custom_hooks");

    const TareScaleScreen = (ScaleScreen_) =>
        class extends ScaleScreen_ {
            setup() {
                super.setup();
                this.state = useState({
                    tare: this.props.product.tare_weight,
                    weight: 0,
                    gross_weight: 0,
                });
                useAutoFocusToLast({selector: "#input_weight_tare"});
            }

            _readScale() {
                if (this.env.pos.config.iface_gross_weight_method === "scale") {
                    super._readScale();
                }
            }

            async _setWeight() {
                await super._setWeight();
                this.state.gross_weight = this.state.weight;
                this.state.weight -= this.state.tare;
            }

            updateWeight() {
                this.state.weight = this.state.gross_weight - this.state.tare;
            }

            confirm() {
                this.props.resolve({
                    confirmed: true,
                    payload: {
                        weight: {
                            weight: this.state.weight,
                            tare: this.state.tare ? parseFloat(this.state.tare) : 0,
                        },
                    },
                });
                this.trigger("close-temp-screen");
            }
        };

    Registries.Component.extend(ScaleScreen, TareScaleScreen);

    return ScaleScreen;
});
