odoo.define(
    "pos_customer_screen_partner_location.customer_screen_map",
    function (require) {
        "use strict";

        const publicWidget = require("web.public.widget");

        publicWidget.registry.CustomerScreenMap = publicWidget.Widget.extend({
            selector: ".o_customer_screen",
            events: {
                "click .cancel": "_clickScreenClose",
                "click .confirm": "_clickSendAndClose",
                "change input[name='address']": "_inputChange",
            },

            /**
             * @override
             */
            start: function () {
                const def = this._super.apply(this, arguments);
                this.mapContainerRef = this.$(".partner-map-body")[0];
                this.addrInput = this.$("input[name='address']")[0];
                this.address = {};
                this.provider = "";
                this.partnerId = parseInt(this.el.dataset.id, 10) || 0;
                this.posConfigId = parseInt(this.el.dataset.pos_id, 10) || 0;
                const def1 = this.loadData();
                const def2 = this.onHandleMap();
                return Promise.all([def, def1, def2]).then(() => {
                    if (!this.provider) {
                        this.screenClose(
                            "Please install module for support customer screen map provider!"
                        );
                    }
                });
            },

            loadData: function () {
                return this._rpc({
                    model: "res.partner",
                    method: "read",
                    args: [
                        [this.partnerId],
                        ["contact_address", "partner_latitude", "partner_longitude"],
                    ],
                    kwargs: {load: false},
                }).then((result) => {
                    console.log(result);
                    if (result.length > 0) {
                        const data = result[0];
                        this.lat = parseFloat(data.partner_latitude) || 0;
                        this.lng = parseFloat(data.partner_longitude) || 0;
                        this.contact_address = data.contact_address;
                        this.addrInput.value = data.contact_address;
                    }
                });
            },

            onHandleMap: function () {
                return new Promise(() => {});
            },

            updateMarker: function (lat, lng) {
                this.lat = lat;
                this.lng = lng;
            },

            sendAndClose: function () {
                window.parent.postMessage(
                    {
                        tag: "set_data",
                        result: {
                            partner_latitude: this.lat,
                            partner_longitude: this.lng,
                            ...this.address,
                        },
                    },
                    window.location.origin
                );
            },

            screenClose: function (message = false) {
                window.parent.postMessage(
                    {
                        tag: "close",
                        message: message || false,
                    },
                    window.location.origin
                );
            },

            /* eslint no-empty-function: "warn"*/
            /* eslint no-unused-vars: "warn"*/
            setAddressByLocation: function (address) {},

            _inputChange: function (event) {
                this.setAddressByLocation(event.target.value);
            },

            _clickScreenClose: function (ev) {
                ev.preventDefault();
                this.screenClose();
            },

            _clickSendAndClose: function (ev) {
                ev.preventDefault();
                this.sendAndClose();
            },
        });
    }
);
