odoo.define('pos_self_service_base.screens', function (require) {
    "use strict";
    // This file contains the base screen where user actions will be included.
    // Those actions will be defined in seperated modules.
    // e.g.: `pos_self_service_printing` defines UI and business logic for printing labels,

    var gui = require('point_of_sale.gui');
    var screens = require('point_of_sale.screens');

    var SelfServiceLabelScreenWidget = screens.ScreenWidget.extend({
        template: 'SelfServiceLabelScreenWidget',
        start: function(){
            console.log("[SelfServiceLabelScreenWidget] start()")
            var self = this;
            this._super();
            this.self_service_scale_widget = this.pos.chrome.widget.self_service_scale_widget
            this.barcode_parser = this.pos.barcode_reader.barcode_parser;
            this.barcode = null;
        },

        show: function(){
            console.log("[SelfServiceLabelScreenWidget] show()")
            var self = this;
            this._super();
        },
        renderElement(){
            console.log("[SelfServiceLabelScreenWidget] renderElement")
            var self = this;
            this._super();
            this.$('.print').click(function(){
                self.click_print();
            });
        },

        click_print: function (){
            console.log("[SelfServiceLabelScreenWidget] click_print");
            var weight = this.self_service_scale_widget.get_weight();
            if (weight > 0){
                console.log(weight)
                this.set_barcode(this.format_barcode(weight))
                console.log(this.get_barcode());
                var title = _t("BARCODE:") + this.get_barcode();
                var message = "Almost there guys!"
                var popup = {title: title, body: message};
                this.gui.show_popup('alert', popup);
            } else {
                var title = _t("");
                var message = _("")
                var popup = {title: title, body: message};
                this.gui.show_popup('error', popup);
            }

            // TODO render label ?

            // TODO print label
        },
        format_barcode: function (weight){
            console.log("[SelfServiceLabelScreenWidget] format_barcode");
            // We use EAN13 barcode, it looks like `07 00000 12345 x`. First there
            // is the prefix, here 07, that is used to decide which type of
            // barcode we're dealing with. A weight barcode has then two groups
            // of five digits. The first group encodes the product id. Here the
            // product id is 00000. The second group encodes the weight in
            // grams. Here the weight is 12.345kg. The last digit of the barcode
            // is a checksum, here symbolized by x.
            var padding_size = 5;
            var void_product_id = '0'.repeat(padding_size);
            var weight_in_gram = weight * 1e3;

            if (weight_in_gram >= Math.pow(10, padding_size)) {
                throw new RangeError(_t("Maximum tare weight is 99.999kg"));
            }

            // Weight has to be padded with zeroes.
            var weight_with_padding = '0'.repeat(padding_size) + weight_in_gram;
            var padded_weight = weight_with_padding.substr(
                weight_with_padding.length - padding_size
            );
            // Builds the barcode using a placeholder checksum.
            var barcode = this.get_barcode_prefix()
                .concat(void_product_id, padded_weight)
                .concat(0);
            // Compute checksum
            var ean_checksum = this.barcode_parser.ean_checksum(barcode);
            // Replace checksum placeholder by the actual checksum.
            return barcode.substr(0, 12).concat(ean_checksum);
        },
        get_barcode_prefix: function () {
            var barcode_pattern = this.get_barcode_pattern();
            return barcode_pattern.substr(0, 2);
        },
        get_barcode_pattern: function () {
            var rules = this.get_nomenclature_rules();
            var rule = rules.filter(
                function (r) {
                    // We select the first (smallest sequence ID) barcode rule
                    // with the expected type.
                    return r.type === "tare";
                })[0];
            return rule.pattern;
        },
        get_nomenclature_rules: function () {
            return this.barcode_parser.nomenclature.rules;
        },
        get_barcode: function(){
            console.log("[SelfServiceLabelScreenWidget] get_barcode");
            return this.barcode;
        },
        set_barcode: function(barcode){
            console.log("[SelfServiceLabelScreenWidget] set_barcode");
            this.barcode = barcode;
        }
    });

    // Add the self-service tare screen to the GUI
    gui.define_screen({
        'name': 'selfservice_label',
        'widget': SelfServiceLabelScreenWidget,
        'condition': function(){
            return this.pos.config.iface_self_service;
        },
    });


    /* -------- The Self-Service Screen  -------- */
    // This is the home screen with the call to action buttons.
    var SelfServiceScreenWidget = screens.ScreenWidget.extend({
        template: 'SelfServiceScreenWidget',

        // Ignore products, discounts, and client barcodes
        barcode_product_action: function(code){},
        barcode_discount_action: function(code){},
        barcode_client_action: function(code){},

        show: function(){
            this._super();
            this.chrome.widget.order_selector.hide();
        },
        renderElement(){
            console.log("[SelfServiceScreenWidget] renderElement")
            var self = this;
            this._super();
            this.$('.tare').click(function () {
                self.pos.chrome.self_service_action_buttons.back_button.history_stack.push(self.gui.get_current_screen());
                self.gui.show_screen('selfservice_label');
            });
        },
    });

    // Add the self-service screen to the GUI
    gui.define_screen({
        'name': 'selfservice',
        'widget': SelfServiceScreenWidget,
        'condition': function(){
            return this.pos.config.iface_self_service;
        },
    });

    return {
        SelfServiceScreenWidget: SelfServiceScreenWidget,
    }
});
