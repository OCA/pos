odoo.define('pos_self_weighing.screens', function (require) {

    "use strict";
    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');
    var gui = require('point_of_sale.gui');
    var utils = require('web.utils');
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var tare = require('pos_barcode_tare.screens');

    var _t = core._t;
    var round_pr = utils.round_precision;
    var get_unit = tare.get_unit;
    var QWeb = core.qweb;

    /* Widgets */

    // Search and order products.
    var SelfServiceSearchWidget = screens.ScreenWidget.extend({
        template:'SelfServiceSearchWidget',
        init: function (parent, options) {
            var self = this;
            this._super(parent, options);
            this.product_list_widget = options.product_list_widget || null;

            var root_category_id = this.pos.db.root_category_id;
            this.category = this.pos.db.get_category_by_id(root_category_id);

            var search_timeout = null;
            this.search_handler = function (event) {
                if (event.type === "keypress" || event.keyCode === 46 ||
                event.keyCode === 8) {
                    clearTimeout(search_timeout);
                    var searchbox = this;
                    search_timeout = setTimeout(function () {
                        self.perform_search(self.category,
                            searchbox.value, event.which === 13);
                    }, 70);
                }
            };
        },
        renderElement: function () {
            this._super();
            var search_box = this.el.querySelector('.searchbox input');
            search_box.addEventListener('keypress', this.search_handler);
            search_box.addEventListener('keydown', this.search_handler);
        },
        perform_search: function (category, query, buy_result) {
            var db = this.pos.db;
            var products = null;
            if (query) {
                products = db.search_product_in_category(category.id, query);
                // Defines a shortcut to order a the one product displayed when
                // a search has only one result.
                if (buy_result && products.length === 1) {
                    var product_id = products[0].id;
                    // Triggers the click product action in order to display
                    // the scale screen instead of simply adding the product
                    // to the order.
                    this.product_list_widget.click_product_handler(null,
                        product_id);
                    this.clear_search();
                } else {
                    this.product_list_widget.set_product_list(products);
                }
            } else {
                products = db.get_product_by_category(this.category.id);
                this.product_list_widget.set_product_list(products);
            }
        },
        clear_search: function () {
            var db = this.pos.db;
            var products = db.get_product_by_category(this.category.id);
            this.product_list_widget.set_product_list(products);
            var input = this.el.querySelector('.searchbox input');
            input.value = '';
            input.focus();
        },
    });

    // Display products.
    var SelfServiceProductListWidget = screens.ProductListWidget.extend({
        init: function (parent, options) {
            this._super(parent, options);
            var self = this;
            this.click_product_handler = function (event, product_id) {
                var id = product_id || this.dataset.productId;
                var product = self.pos.db.get_product_by_id(id);
                options.click_product_action(null, product);
            };
        },
        renderElement: function () {
            var el_str = QWeb.render(this.template, {widget: this});
            var el_node = document.createElement('div');
            el_node.innerHTML = el_str;
            el_node = el_node.childNodes[1];

            if (this.el && this.el.parentNode) {
                this.el.parentNode.replaceChild(el_node, this.el);
            }
            this.el = el_node;
            var list_container = el_node.querySelector('.product-list');
            for (var i = 0, len = this.product_list.length; i < len; i++) {
                var product = this.product_list[i];
                // We are displaying only products that need to be weighted to
                // be sold.
                if (product.to_weight) {
                    var product_node = this.render_product(product);
                    product_node.addEventListener('click',
                        this.click_product_handler);
                    list_container.appendChild(product_node);
                }
            }
        },
    });

    // Simple back and forward action pad.
    var SelfServiceActionpadWidget = screens.ActionpadWidget.extend({
        template:'SelfServiceActionpadWidget',
        init: function (parent, options) {
            this._super(parent, options);
            this.order_widget = options.order_widget;
            this.price_labels = options.price_labels;
        },
        click_back: function () {
            var order = this.pos.get_order();
            var orderline = order.get_selected_orderline();
            if (orderline) {
                order.remove_orderline(orderline);
            }
            if ( order.orderlines.length === 0) {
                // Go back to the default screen when there is nothing left
                // to remove from the current order.
                this.gui.show_screen('selfService');
            } else {
                this.order_widget.renderElement();
            }
        },
        print: function () {
            var order = this.pos.get_order();
            var orderline = order.get_selected_orderline();
            // The print button works only when there is at least one
            // label to print.
            if (orderline) {
                this.price_labels.renderElement();
                window.print();
                this.gui.show_screen('selfService');
                this.pos.delete_current_order();
            } else {
                var popup = {
                    title: _t("There is no product to print label for."),
                    body:
                    _t("You did not weighted any product. Start by " +
                    "weighing a product, then you'll be able to print a " +
                    "price barcode label for this product."),
                };
                this.gui.show_popup('alert', popup);
            }
        },
        renderElement: function () {
            var self = this;
            this._super();

            this.$('.back').click(function () {
                self.click_back();
            });

            this.$('.print').click(function () {
                self.print();
            });
        },
    });

    // This renders the price barcode labels.
    var PriceLabelsWidget = screens.ScreenWidget.extend({
        template:'PosPriceLabels',

        init: function (parent, options) {
            this._super(parent, options);
            // Bind used to render the labels each time the order is modified.
            this.pos.bind('change:selectedOrder', this.bind_order_events, this);
            if (this.pos.get_order()) {
                this.bind_order_events();
            }
        },
        bind_order_events: function () {
            // Ensure that any change to the current order will trigger this
            // widget to re-render so that it will be ready whenever we want to
            // print it.
            if (this.pos.get_order()) {
                var lines = this.pos.get_order().orderlines;
                lines.unbind('add', this.renderElement, this);
                lines.bind('add', this.renderElement, this);
                lines.unbind('remove', this.renderElement, this);
                lines.bind('remove', this.renderElement, this);
                lines.unbind('change', this.renderElement, this);
                lines.bind('change', this.renderElement, this);
            }
        },
        renderElement: function () {
            this._super();
            var order = this.pos.get_order();
            // Render one label per orderline in the order.
            this.$(".labels").html(QWeb.render("PosLabels", {
                widget:this,
                orderlines: order.get_orderlines(),
            }));
        },
    });

    /* Screens */

    // This replaces the scale widget to handle tare when needed.
    var SelfServiceScaleScreenWidget = screens.ScaleScreenWidget.extend({
        next_screen: 'selfProducts',
        previous_screen: 'selfProducts',

        show: function () {
            this._super();
            var self = this;
            var product = this.get_product();
            var tare_code = this.get_tare_code();
            // Change the buy action so that tare value is deleted.
            this.$('.next,.buy-product').off('click').click(function () {
                // This reset the screen params so that we do not apply the tare
                // twice.
                self.gui.show_screen(self.next_screen, {});
                // Add product *after* switching screen to scroll properly
                self.order_product(product, tare_code);
            });
        },
        get_tare_code: function () {
            return this.gui.get_current_screen_param('tare_code');
        },
        order_product: function (product, tare_code) {
            var order = this.pos.get_order();
            order.add_product(product, {quantity: this.weight});
            // Apply tare when needed.
            if (tare_code) {
                var tare_weight = tare_code.value;
                var orderline = order.get_last_orderline();
                orderline.set_tare(tare_weight);
            }
        },
    });

    // Update the tare printing screen for it to link to self service screens.
    var SelfServiceTareScreenWidget = tare.TareScreenWidget.extend({
        next_screen: 'selfService',
        previous_screen: 'selfService',
        show: function () {
            this._super();
            if (!this.pos.config.iface_electronic_scale) {
                var popup = {
                    title: _t("We can not add this product to the order."),
                    body:
                        _t("You did not configured this POS to use the " +
                        "electronic scale. This add-on requires POS to use " +
                        "the scale. Reconfigure the POS to be able to use " +
                        "this add-on."),
                };
                this.gui.show_popup('error', popup);
            }
        },
    });

    // This is the home screen with the three call to action buttons.
    var SelfServiceWidget = screens.ScreenWidget.extend({
        template:'SelfServiceWidgetHome',
        next_screen: 'selfService',
        previous_screen: 'selfService',

        renderElement: function () {
            var self = this;
            this._super();

            this.$('.tare').click(function () {
                // Create a tare barcode label.
                self.gui.show_screen('selfTare');
            });

            this.$('.weight').click(function () {
                // Weight a product without a container.
                self.gui.show_screen('selfProducts');
            });

            this.$('.scan').click(function () {
                // Scan a tare barcode label to get redirected to the product
                // screen.
                self.gui.show_screen('selfScan');
            });
        },
    });

    // This is the tare barcode label scanning label. It is mostly a place
    // holder to recall customers to scan their tare barcode label.
    var SelfServiceScanScreenWidget = screens.ScreenWidget.extend({
        template:'SelfServiceTareScanWidget',
        next_screen: 'selfProducts',
        previous_screen: 'selfService',

        renderElement: function () {
            this._super();
            var self = this;
            this.$('.back').click(function () {
                self.gui.show_screen(self.previous_screen);
            });
        },
    });

    // This is the updated product screen. This screen displays only products
    // with the to_weight flag set to true. This screen gives priority to the
    // text search with a big central search bar.
    var SelfServiceProduct = screens.ProductScreenWidget.extend({
        template:'SelfServiceProduct',
        next_screen: 'selfService',
        previous_screen: 'selfService',

        start: function () {
            var self = this;
            // Reuse the original order widget in order not to break the whole
            // event messaging system.
            this.order_widget = this.gui.screen_instances.products.order_widget;

            // Displays the products pictures but it has no product category.
            this.product_list_widget = new SelfServiceProductListWidget(this,
                {product_list: this.pos.db.get_product_by_category(0),
                    click_product_action: function (event, product) {
                        self.click_product(product);
                    }});

            this.search_widget = new SelfServiceSearchWidget(this,
                {product_list_widget: this.product_list_widget});

            // Handles barcode rendering
            this.price_labels = new PriceLabelsWidget(this,
                {order_widget: this.order_widget});
            // A two button pad: back action undo last action, validate action
            // prints the labels.
            this.actionpad = new SelfServiceActionpadWidget(this,
                {order_widget: this.order_widget,
                    price_labels: this.price_labels});

            // To replace the OrderWidget in this screen would be the regular
            // product screen so we replace the placeholders only when this
            // pos is configured to be a self service POS.
            if (this.pos.config.iface_self_weight) {
                this.order_widget.replace(this.$('.placeholder-OrderWidget'));
                this.product_list_widget.replace(
                    this.$('.placeholder-SelfServiceProductListWidget'));
                this.actionpad.replace(
                    this.$('.placeholder-SelfServiceActionpadWidget'));
                this.search_widget.replace(
                    this.$('.placeholder-SelfServiceSearchWidget'));
                this.price_labels.replace(
                    this.$('.placeholder-SelfServiceProductListWidget'));
            }
        },
        get_tare_code: function () {
            return this.gui.get_current_screen_param('tare_code');
        },
        reset_tare_code: function () {
            var order = this.pos.get_order();
            if (order) {
                delete order.screen_data.params.tare_code;
            }
        },
        click_product: function (product) {
            var self = this;
            var order = this.pos.get_order();
            var order_length = order.orderlines.length;

            if (order_length > 0 &&
                !this.pos.config.iface_self_weight_multi_label) {
                var print_popup = {
                    title: _t("We can add this product to the order."),
                    confirm: function () {
                        self.actionpad.print();
                    },
                    body:
                        _t("You already have one label to print. " +
                        "Do you want to print it now?"),
                };
                this.gui.show_popup('confirm', print_popup);
            } else if (product.to_weight &&
                this.pos.config.iface_electronic_scale) {
                var tare_code = this.get_tare_code();
                var scale_params = {product: product, tare_code: tare_code};
                this.gui.show_screen('selfScale', scale_params);
            } else {
                var popup = {
                    title: _t("We can add this product to the order."),
                    body:
                        _t("You did not configured this POS to use the " +
                        "electronic scale. This add-on requires POS to use " +
                        "the scale. Reconfigure the POS to be able to use " +
                        "this add-on."),
                };
                this.gui.show_popup('error', popup);
            }
        },
        show: function () {
            this._super();
            // Set focus on the search box in order to speed up the process.
            this.el.querySelector('.searchbox input').focus();
        },
    });

    /* Models */

    // This order line models generates a price barcode per order line.
    models.Orderline = models.Orderline.extend({
        pad_data: function (padding_size, data) {
            // For padding size = 5, this function transforms 123 into 00123
            var data_str = data.toString();
            if (data_str.length >= padding_size) {
                return data_str;
            }
            var padded = '0'.repeat(padding_size) + data_str;
            return padded.substr(padded.length - padding_size);
        },
        get_barcode_data: function () {
            // Pad the values to match the EAN13 format.
            var padding_size = 5;
            var product_barcode = this.product.barcode || "0".repeat(13);
            var product_base_code = product_barcode.substr(0, 7);
            var unit = get_unit(this.pos, this.product.uom_id[1]);
            var rounding = unit.rounding;
            var product_qty_in_gram = this.get_quantity() * 1e3;
            var product_qty_round = round_pr(product_qty_in_gram, rounding);
            var qty = this.pad_data(padding_size, product_qty_round);
            // Builds the barcode using a placeholder checksum.
            var barcode = product_base_code.concat(qty, 0);
            // Compute checksum.
            var barcode_parser = this.pos.barcode_reader.barcode_parser;
            var checksum = barcode_parser.ean_checksum(barcode);
            // Replace checksum placeholder by the actual checksum.
            return barcode.substr(0, 12).concat(checksum);
        },
    });

    screens.ScreenWidget.include({
        barcode_product_action: function (code) {
            var self = this;
            if (self.pos.scan_product(code)) {
                if (this.pos.config.iface_self_weight) {
                    self.gui.show_screen("selfProducts");
                } else if (self.barcode_product_screen) {
                    self.gui.show_screen(self.barcode_product_screen);
                }
            } else {
                this.barcode_error_action(code);
            }
        },
        barcode_tare_action_self_service: function (code) {
            // Apply tare barcode function depending on POS configuration.
            var current_screen = this.gui.get_current_screen();
            try {
                if (this.pos.config.iface_self_weight &&
                    current_screen === "selfScan") {
                    this.gui.show_screen('selfProducts', {tare_code: code});
                } else {
                    this.barcode_tare_action(code);
                }
            } catch (error) {
                var title = _t("We can not apply this tare barcode.");
                var popup = {title: title, body: error.message};
                this.gui.show_popup('error', popup);
            }
        },
        // Setup the callback action for the "weight" barcodes.
        show: function () {
            this._super();
            this.pos.barcode_reader.set_action_callback(
                'tare',
                _.bind(this.barcode_tare_action_self_service, this));
        },
    });

    // Redefines the default screen when POS is configured to be self service.
    chrome.Chrome = chrome.Chrome.include({
        build_widgets: function () {
            if (this.pos.config.iface_self_weight) {
                this._super();
                this.gui.set_default_screen('selfService');
                this.gui.set_startup_screen('selfService');
                this.widget.close_button.hide();
            } else {
                this._super();
            }
        },
    });

    gui.define_screen({name:'selfService', widget: SelfServiceWidget});
    gui.define_screen({name:'selfTare', widget: SelfServiceTareScreenWidget});
    gui.define_screen({name:'selfScale', widget: SelfServiceScaleScreenWidget});
    gui.define_screen({name:'selfProducts', widget: SelfServiceProduct});
    gui.define_screen({name:'selfScan', widget: SelfServiceScanScreenWidget});

});
