/** @odoo-module **/
import {Order, PosGlobalState} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

export const ConfigImagePosGlobalState = (OriginalPosGlobalState) =>
    class extends OriginalPosGlobalState {
        /**
         * @override
         */
        constructor() {
            super(...arguments);
            this.config_logo = null;
            this.config_logo_base64 = "";
        }
        /**
         * Replicate the picture load of the company logo for the config logo
         * @override
         * @returns {undefined} The promise is resolved in place
         */
        async _loadPictures() {
            await super._loadPictures(...arguments);
            this.config_logo = new Image();
            return new Promise((resolve, reject) => {
                this.config_logo.onload = () => {
                    const img = this.config_logo;
                    let ratio = 1;
                    const targetwidth = 300;
                    const maxheight = 150;
                    if (img.width !== targetwidth) {
                        ratio = targetwidth / img.width;
                    }
                    if (img.height * ratio > maxheight) {
                        ratio = maxheight / img.height;
                    }
                    const width = Math.floor(img.width * ratio);
                    const height = Math.floor(img.height * ratio);
                    const c = document.createElement("canvas");
                    c.width = width;
                    c.height = height;
                    const ctx = c.getContext("2d");
                    ctx.drawImage(this.config_logo, 0, 0, width, height);

                    this.config_logo_base64 = c.toDataURL();
                    resolve();
                };
                this.config_logo.onerror = () => {
                    reject();
                };
                this.config_logo.crossOrigin = "anonymous";
                this.config_logo.src = `/web/image?model=pos.config&id=${this.config.id}&field=logo`;
            });
        }
    };

Registries.Model.extend(PosGlobalState, ConfigImagePosGlobalState);

const ConfigImageOrder = (OriginalOrder) =>
    class extends OriginalOrder {
        /**
         * @override
         * Switch to the config logo if it's available
         * @returns {Object} receipt
         */
        export_for_printing() {
            const receipt = super.export_for_printing(...arguments);
            if (this.pos.config.logo) {
                receipt.company.logo = this.pos.config_logo_base64;
            }
            return receipt;
        }
    };

Registries.Model.extend(Order, ConfigImageOrder);
