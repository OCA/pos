/** @odoo-module **/

import PartnerMapEdit from "pos_partner_location_abstract.PartnerMapEdit";
import Registries from "point_of_sale.Registries";
import {loadJS} from "@web/core/assets";
import {onMounted, onWillStart} from "@odoo/owl";

/* eslint no-undef: "warn"*/
const PartnerMapGoogleEdit = (PartnerMapEdit) =>
    class PartnerMapGoogleEdit extends PartnerMapEdit {
        onHandleMap() {
            if (
                this.config.geolocalize_tech_name === "googlemap" &&
                this.config.googlemap_api_key
            ) {
                this.provider = "googlemap";
                onWillStart(async () =>
                    loadJS(
                        `https://maps.googleapis.com/maps/api/js?key=${this.config.googlemap_api_key}&libraries=places`
                    )
                );
                onMounted(() => this.googleMapConfigure());
            } else {
                super.onHandleMap();
            }
        }

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
            this.map = new google.maps.Map(this.mapContainerRef.el, mapOptions);

            if (this.lat && this.lng) {
                this.setAddressByLatLng(this.lat, this.lng);
            } else {
                this.setAddressByLocation(this.partner.contact_address);
            }

            this.marker = new google.maps.Marker({
                position: latLng,
                map: this.map,
                draggable: true,
            });

            this.addrInput.el.value = this.partner.contact_address;

            this.map.addListener("click", (event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                this.updateMarker(lat, lng);
                this.setAddressByLatLng(lat, lng);
            });
        }

        setAddressByLatLng(lat, lng) {
            if (lat && lng) {
                const latLng = new google.maps.LatLng(lat, lng);
                this.geocoder.geocode({location: latLng}, (results, status) => {
                    if (status === google.maps.GeocoderStatus.OK) {
                        this.getFormattedAddress(results[0].place_id).then(() => {
                            this.addrInput.el.value = results[0].formatted_address;
                        });
                    }
                });
            }
        }

        updateMarker(lat, lng) {
            super.updateMarker(lat, lng);
            if (this.provider === "googlemap") {
                const latLng = new google.maps.LatLng(lat, lng);
                this.map.setCenter(latLng);
                this.marker.setPosition(latLng);
                google.maps.event.trigger(this.map, "resize");
            }
        }

        setAddressByLocation(address) {
            if (address && this.provider === "googlemap") {
                this.geocoder.geocode({address: address}, (results, status) => {
                    if (status === google.maps.GeocoderStatus.OK) {
                        this.lat = results[0].geometry.location.lat();
                        this.lng = results[0].geometry.location.lng();
                        this.getFormattedAddress(results[0].place_id).then(() => {
                            this.addrInput.el.value = results[0].formatted_address;
                            this.updateMarker(this.lat, this.lng);
                        });
                    }
                });
            } else {
                super.setAddressByLocation(address);
            }
        }

        getFormattedAddress(place_id) {
            return this.rpc({
                model: "base.geocoder",
                method: "prepare_geo_address_googlemap",
                args: [place_id],
            }).then((resp) => {
                this.address = resp;
            });
        }
    };

Registries.Component.extend(PartnerMapEdit, PartnerMapGoogleEdit);

export default PartnerMapGoogleEdit;
