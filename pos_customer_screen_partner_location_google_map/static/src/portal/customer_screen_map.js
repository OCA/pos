odoo.define(
    "pos_customer_screen_partner_location_google_map.customer_screen_map",
    function (require) {
        "use strict";

        const publicWidget = require("web.public.widget");
        const {loadJS} = require("@web/core/assets");

        /* eslint no-undef: "warn"*/
        publicWidget.registry.CustomerScreenMap.include({
            onHandleMap() {
                return this._rpc({
                    model: "pos.config",
                    method: "read",
                    args: [
                        [this.posConfigId],
                        ["geolocalize_tech_name", "googlemap_api_key"],
                    ],
                }).then((response) => {
                    if (response.length > 0) {
                        const data = response[0];
                        this.provider = data.geolocalize_tech_name;
                        if (this.provider === "googlemap") {
                            loadJS(
                                `https://maps.googleapis.com/maps/api/js?key=${data.googlemap_api_key}&libraries=places`
                            ).then(() => {
                                this.googleMapConfigure();
                            });
                        }
                    }
                });
            },

            googleMapConfigure() {
                // Default latLng
                // Config
                this.geocoder = new google.maps.Geocoder();
                const latLng = new google.maps.LatLng(this.lat, this.lng);
                const mapOptions = {
                    zoom: 12,
                    center: latLng,
                };
                // Show Map
                this.map = new google.maps.Map(this.mapContainerRef, mapOptions);

                if (this.lat && this.lng) {
                    this.setAddressByLatLng(this.lat, this.lng);
                } else {
                    this.setAddressByLocation(this.contact_address);
                }

                this.marker = new google.maps.Marker({
                    position: latLng,
                    map: this.map,
                    draggable: true,
                });

                this.addrInput.value = this.contact_address;

                this.map.addListener("click", (event) => {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    this.updateMarker(lat, lng);
                    this.setAddressByLatLng(lat, lng);
                });
            },

            setAddressByLatLng(lat, lng) {
                if (lat && lng) {
                    const latLng = new google.maps.LatLng(lat, lng);
                    this.geocoder.geocode({location: latLng}, (results, status) => {
                        if (status === google.maps.GeocoderStatus.OK) {
                            this.getFormattedAddress(results[0].place_id).then(() => {
                                this.addrInput.value = results[0].formatted_address;
                            });
                        }
                    });
                }
            },

            updateMarker(lat, lng) {
                this._super(...arguments);
                if (this.provider === "googlemap") {
                    const latLng = new google.maps.LatLng(lat, lng);
                    this.map.setCenter(latLng);
                    this.marker.setPosition(latLng);
                    google.maps.event.trigger(this.map, "resize");
                }
            },

            setAddressByLocation(address) {
                if (address && this.provider === "googlemap") {
                    this.geocoder.geocode({address: address}, (results, status) => {
                        if (status === google.maps.GeocoderStatus.OK) {
                            this.lat = results[0].geometry.location.lat();
                            this.lng = results[0].geometry.location.lng();
                            this.getFormattedAddress(results[0].place_id).then(() => {
                                this.addrInput.value = results[0].formatted_address;
                                this.updateMarker(this.lat, this.lng);
                            });
                        }
                    });
                } else {
                    this._super(...arguments);
                }
            },

            getFormattedAddress(place_id) {
                return this._rpc({
                    model: "base.geocoder",
                    method: "prepare_geo_address_googlemap",
                    args: [place_id],
                }).then((resp) => {
                    this.address = resp;
                });
            },
        });
    }
);
