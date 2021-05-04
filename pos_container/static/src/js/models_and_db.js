/*
    Copyright 2019 Coop IT Easy SCRLfs
            Pierrick Brun <pierrick.brun@akretion.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/


odoo.define('pos_container.models_and_db', function (require) {
    "use strict";

    var PosDB = require('point_of_sale.DB');
    var models = require('point_of_sale.models');
    var rpc = require('web.rpc');
    var config = require('web.config');

    var core = require('web.core');
    var QWeb = core.qweb;

    var utils = require('web.utils');
    var field_utils = require('web.field_utils');
    var round_di = utils.round_decimals;
    var round_pr = utils.round_precision;

    // include not available => extend
    models.PosModel = models.PosModel.extend({
        get_container_product: function(){
            // assign value if not already assigned.
            // Avoids rewriting init function
            if (!this.container_product){
                this.container_product = this.db.get_product_by_barcode(
                    'CONTAINER');
            }
            return this.container_product
        },
        scan_container: function(parsed_code){
            var selected_order = this.get_order();
            var container = this.db.get_container_by_barcode(
                parsed_code.base_code);

            if(!container){
                return false;
            }

            selected_order.add_container(container);
            return true;
        },
        // reload the list of container, returns as a deferred that resolves if there were
        // updated containers, and fails if not
        load_new_containers: function(){
            var self = this;
            var def  = new $.Deferred();
            var fields = _.find(this.models,function(model){
                return model.model === 'pos.container';
            }).fields;
            var domain = [];
            rpc.query({
                model: 'pos.container',
                method: 'search_read',
                args: [domain, fields],
            }, {
                timeout: 3000,
                shadow: true,
            })
            .then(function(containers){
                if (self.db.add_containers(containers)) {
                    // check if the partners we got were real updates
                    def.resolve();
                } else {
                    def.reject();
                }
            }, function(type,err){ def.reject(); });
           return def;
        },
        // load placeholder product for containers.
        // it is done here to load it even if inactivated.
        load_placeholder_product: function(){
            var self = this;
            var fields = _.find(this.models,function(model){
                return model.model === 'product.product';
            }).fields;
            var domain = [['barcode', '=', 'CONTAINER'], ['active', '=', false]];
            // no need to load it when active because it is already done in standard
            return rpc.query({
                model: 'product.product',
                method: 'search_read',
                args: [domain, fields],
            }).then(function(products){
                self.db.add_products(_.map(products, function (product) {
                    return new models.Product({}, product);
                }));
            });
        },

        // saves the container locally and try to send it to the backend.
        // it returns a deferred that succeeds after having tried to send the container and all the other pending containers.
        push_container: function(container, opts) {
            opts = opts || {};
            var self = this;

            if(container){
                this.db.add_containers([container]);
            }

            var pushed = new $.Deferred();

            this.flush_mutex.exec(function(){
                var flushed = self._save_containers_to_server(self.db.get_containers_sorted(), opts);

                flushed.always(function(ids){
                    pushed.resolve();
                });

                return flushed;
            });
            return pushed;
        },

        // send an array of containers to the server
        // available options:
        // - timeout: timeout for the rpc call in ms
        // returns a deferred that resolves with the list of
        // server generated ids for the sent containers
        _save_containers_to_server: function (containers, options) {
            var self = this;
            var containers= containers.filter(container => !( "id" in container))
            if (!containers || !containers.length) {
                var result = $.Deferred();
                result.resolve([]);
                return result;
            }

            options = options || {};
            var timeout = typeof options.timeout === 'number' ? options.timeout : 7500 * containers.length;

            return rpc.query({
                    model: 'pos.container',
                    method: 'create_from_ui',
                    args: containers,
                }, {
                    timeout: timeout,
                })
                .then(function (server_ids) {
                    //self.db.remove_containers(containers);
                    _.each(containers, function(container, key){
                        container["id"] = server_ids[key]
                    });
                    //self.db.add_containers(containers)
                    self.set('failed',false);
                    return server_ids;
                }).fail(function (type, error){
                    if(error.code === 200 ){    // Business Logic Error, not a connection problem
                        //if warning do not need to display traceback!!
                        if (error.data.exception_type == 'warning') {
                            delete error.data.debug;
                        }

                        // Hide error if already shown before ...
                        if ((!self.get('failed') || options.show_error) && !options.to_invoice) {
                            self.gui.show_popup('error-traceback',{
                                'title': error.data.message,
                                'body':  error.data.debug
                            });
                        }
                        self.set('failed',error);
                    }
                    console.error('Failed to send containers:', containers);
                });
        },

        // wrapper around the _save_to_server that updates the synch status widget
        // it is modified to send containers before orders
        _flush_orders: function(orders, options) {
            var self = this;
            this.set('synch',{ state: 'connecting', pending: orders.length});

            return self._save_containers_to_server(self.db.get_containers_sorted())
                .then(function(container_ids) {
                    for (var i=0; i < orders.length; i++){
                        if (orders[i].data.lines) {
                            for (var j=0; j < orders[i].data.lines[0].length; j++){
                                var orderline = orders[i].data.lines[0][j]
                                if ( !orderline.container_id && orderline.container_barcode) {
                                    orderline.container_id = self.db.get_container_by_barcode(orderline.container_barcode).id;
                                    delete orderline["container_barcode"]
                                }
                            }
                        }
                    }
                    return self._save_to_server(orders, options)
                }).done(function (server_ids) {
                    var pending = self.db.get_orders().length;

                    self.set('synch', {
                        state: pending ? 'connecting' : 'connected',
                        pending: pending
                    });

                    return server_ids;
                }).fail(function(error, event){
                    var pending = self.db.get_orders().length;
                    if (self.get('failed')) {
                        self.set('synch', { state: 'error', pending: pending });
                    } else {
                        self.set('synch', { state: 'disconnected', pending: pending });
                    }
                });
        },
    });

    models.Order = models.Order.extend({
        add_container: function(container, options){
            if(this._printed){
                this.destroy();
                return this.pos.get_order().add_container(container, options);
            }
            options = options || {};
            var attr = JSON.parse(JSON.stringify(container));
            attr.pos = this.pos;
            attr.order = this;
            var product = this.pos.get_container_product();
            var line = new models.Orderline({}, {
                pos: this.pos, order: this, product: product});

            line.set_container(container);
            line.set_quantity(0);
            this.orderlines.add(line);

            this.select_orderline(this.get_last_orderline());
        },
        has_tare_line: function(mode){
            var orderlines = this.orderlines.models
            for(var i=0; i < orderlines.length; i++){
                var line = orderlines[i];
                if(line && line.get_tare_mode() === mode){
                    return true;
                }
            }
            return false;
        },
        export_for_printing: function(){
            var orderlines = [];
            var self = this;

            this.orderlines.each(function(orderline){
                orderlines.push(orderline.export_for_printing());
            });

            var paymentlines = [];
            this.paymentlines.each(function(paymentline){
                paymentlines.push(paymentline.export_for_printing());
            });
            var client  = this.get('client');
            var cashier = this.pos.get_cashier();
            var company = this.pos.company;
            var shop    = this.pos.shop;
            var date    = new Date();

            function is_xml(subreceipt){
                return subreceipt ? (subreceipt.split('\n')[0].indexOf('<!DOCTYPE QWEB') >= 0) : false;
            }

            function render_xml(subreceipt){
                if (!is_xml(subreceipt)) {
                    return subreceipt;
                } else {
                    subreceipt = subreceipt.split('\n').slice(1).join('\n');
                    var qweb = new QWeb2.Engine();
                        qweb.debug = config.debug;
                        qweb.default_dict = _.clone(QWeb.default_dict);
                        qweb.add_template('<templates><t t-name="subreceipt">'+subreceipt+'</t></templates>');

                    return qweb.render('subreceipt',{'pos':self.pos,'widget':self.pos.chrome,'order':self, 'receipt': receipt}) ;
                }
            }

            var receipt = {
                orderlines: orderlines,
                paymentlines: paymentlines,
                subtotal: this.get_subtotal(),
                total_with_tax: this.get_total_with_tax(),
                total_without_tax: this.get_total_without_tax(),
                total_tax: this.get_total_tax(),
                total_paid: this.get_total_paid(),
                total_discount: this.get_total_discount(),
                tax_details: this.get_tax_details(),
                change: this.get_change(),
                name : this.get_name(),
                client: client ? client.name : null ,
                invoice_id: null,   //TODO
                cashier: cashier ? cashier.name : null,
                precision: {
                    price: 2,
                    money: 2,
                    quantity: 3,
                },
                date: {
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    date: date.getDate(),       // day of the month
                    day: date.getDay(),         // day of the week
                    hour: date.getHours(),
                    minute: date.getMinutes() ,
                    isostring: date.toISOString(),
                    localestring: date.toLocaleString(),
                },
                company:{
                    email: company.email,
                    website: company.website,
                    company_registry: company.company_registry,
                    contact_address: company.partner_id[1],
                    vat: company.vat,
                    vat_label: company.country && company.country.vat_label || '',
                    name: company.name,
                    phone: company.phone,
                    logo:  this.pos.company_logo_base64,
                },
                shop:{
                    name: shop.name,
                },
                currency: this.pos.currency,
                //custom here
                has_tare_mode: {
                    auto: this.has_tare_line('AUTO'),
                    manual: this.has_tare_line('MAN'),
                }
                //custom end
            };

            if (is_xml(this.pos.config.receipt_header)){
                receipt.header = '';
                receipt.header_xml = render_xml(this.pos.config.receipt_header);
            } else {
                receipt.header = this.pos.config.receipt_header || '';
            }

            if (is_xml(this.pos.config.receipt_footer)){
                receipt.footer = '';
                receipt.footer_xml = render_xml(this.pos.config.receipt_footer);
            } else {
                receipt.footer = this.pos.config.receipt_footer || '';
            }

            return receipt;
        },
    });
    
    // Add container to order line
    models.Orderline = models.Orderline.extend({
        get_container: function(){
            return this.container;
        },
        set_container: function(container){
            this.container = container;
        },
        set_tare_mode: function(mode){
            if (['MAN', 'AUTO'].indexOf(mode) != -1){
                this.tare_mode = mode;
                this.trigger('change', this);
            }
        },
        get_tare_mode: function() {
            return this.tare_mode;
        },
        set_tare: function(tare){
            this.tare = this.get_value_rounded(tare).toFixed(3);
            this.container = null;
            if (this.gross_weight && this.gross_weight != 'NaN'){
                this.set_quantity(this.gross_weight - parseFloat(this.tare));
            }
            else{
                this.set_gross_weight(this.quantity);
                this.set_quantity(this.quantity - parseFloat(this.tare));
            }
            this.trigger('change', this);
        },
        get_tare: function(){
            return this.tare || 0;
        },
        get_gross_weight: function(){
            return this.gross_weight;
        },
        set_gross_weight: function(weight){
            this.gross_weight = this.get_value_rounded(weight).toFixed(3);
            this.trigger('change', this);
        },
        set_quantity: function(quantity, keep_price){
            // copied from odoo core
            this.order.assert_editable();
            if(quantity === 'remove'){
                this.order.remove_orderline(this);
                return;
            }else{
                var quant = parseFloat(quantity) || 0;
                var unit = this.get_unit();
                if(unit){
                    if (unit.rounding) {
                        this.quantity    = round_pr(quant, unit.rounding);
                        var decimals = this.pos.dp['Product Unit of Measure'];
                        this.quantity = round_di(this.quantity, decimals)
                        this.quantityStr = field_utils.format.float(this.quantity, {digits: [69, decimals]});
                    } else {
                        this.quantity    = round_pr(quant, 1);
                        this.quantityStr = this.quantity.toFixed(0);
                    }
                }else{
                    this.quantity    = quant;
                    this.quantityStr = '' + this.quantity;
                }
            }
            // just like in sale.order changing the quantity will recompute the unit price
            if(! keep_price && ! this.price_manually_set){
                this.set_unit_price(this.product.get_price(this.order.pricelist, this.get_quantity()));
                this.order.fix_tax_included_price(this);
            }

            // surcharge starts here
            if (this.tare){
                this.set_gross_weight(this.quantity + parseFloat(this.tare));
            }
            this.trigger('change', this);
        },
        get_value_rounded: function(value){
            var value = parseFloat(value) || 0;
            var unit = this.get_unit();
            if(unit){
                if (unit.rounding) {
                    value = round_pr(value, unit.rounding);
                    var decimals = this.pos.dp['Product Unit of Measure'];
                    value = round_di(value, decimals)
                } else {
                    value = round_pr(value, 1);
                }
            }
            return value;
        },
        export_as_JSON: function(){
            var pack_lot_ids = [];
            if (this.has_product_lot){
                this.pack_lot_lines.each(_.bind( function(item) {
                    return pack_lot_ids.push([0, 0, item.export_as_JSON()]);
                }, this));
            }
            return {
                qty: this.get_quantity(),
                price_unit: this.get_unit_price(),
                price_subtotal: this.get_price_without_tax(),
                price_subtotal_incl: this.get_price_with_tax(),
                discount: this.get_discount(),
                product_id: this.get_product().id,
                tax_ids: [[6, false, _.map(this.get_applicable_taxes(), function(tax){ return tax.id; })]],
                id: this.id,
                pack_lot_ids: pack_lot_ids,
                //custom starts here
                tare: this.get_tare() ? this.get_tare() : null,
                container_id: this.get_container() ? this.get_container().id : null,
                container_barcode: this.get_container() ? this.get_container().barcode : null,
                container_weight: this.get_container() ? this.get_container().weight : null,
            };
        },
        //used to create a json of the ticket, to be sent to the printer
        export_for_printing: function(){
            return {
                quantity:           this.get_quantity(),
                unit_name:          this.get_unit().name,
                price:              this.get_unit_price(),
                discount:           this.get_discount(),
                product_name:       this.get_product().display_name,
                product_name_wrapped: this.generate_wrapped_product_name(),
                price_display :     this.get_display_price(),
                price_with_tax :    this.get_price_with_tax(),
                price_without_tax:  this.get_price_without_tax(),
                tax:                this.get_tax(),
                product_description:      this.get_product().description,
                product_description_sale: this.get_product().description_sale,
                // extension starts here
                container:          this.get_container(),
                tare:               this.get_tare(),
                tare_mode:          this.get_tare_mode(),
                gross_weight:       this.get_gross_weight(),
                product_barcode:    this.get_product().barcode,
            };
        },
    });

    PosDB.include({
        init: function(parent, options) {
            this._super(parent, options);

            this.container_sorted = [];
            this.container_by_id = {};
            this.container_by_barcode = {};
            this.container_search_string = "";
            this.container_write_date = null;
        },
        _container_search_string: function(container){

            var str = '';

            if(container.barcode){
                str += '|' + container.barcode;
            }
            if(container.name) {
                str += '|' + container.name;
            }
			var id = container.id || 0;
            str = '' + id + ':' + str.replace(':','') + '\n';

            return str;
        },
        add_containers: function(containers) {
            var updated_count = 0;
            var new_write_date = '';
            for(var i = 0, len = containers.length; i < len; i++) {
                var container = containers[i];

                if (this.container_write_date &&
                    this.container_by_barcode[container.barcode] &&
                    new Date(this.container_write_date).getTime() + 1000 >=
                    new Date(container.write_date).getTime() ) {
                    // FIXME: The write_date is stored with milisec precision in the database
                    // but the dates we get back are only precise to the second. This means when
                    // you read containers modified strictly after time X, you get back containers that were
                    // modified X - 1 sec ago.
                    continue;
                } else if ( new_write_date < container.write_date ) {
                    new_write_date  = container.write_date;
                }
                if (!this.container_by_barcode[container.barcode]) {
                    this.container_sorted.push(container.barcode);
                }
                this.container_by_barcode[container.barcode] = container;

                updated_count += 1;
            }

            this.container_write_date = new_write_date || this.container_write_date;

            if (updated_count) {
                // If there were updates, we need to completely
                // rebuild the search string and the id indexing

                this.container_search_string = "";
                this.container_by_id = {};

                for (var barcode in this.container_by_barcode) {
                    var container = this.container_by_barcode[barcode];

                    if(container.id){
                        this.container_by_id[container.id] = container;
                    }
                    this.container_search_string += this._container_search_string(container);
                }
            }
            return updated_count;
        },
        remove_containers: function(barcodes){
            for(var i = 0; i < barcodes.length; i++) {
                var container = this.container_by_barcode[barcodes[i]];
                if (container){
                    var index_s = this.container_sorted.indexOf(container.barcode);
                    this.container_sorted.splice(index_s, 1);
                    delete this.container_by_id[container.id];
                    delete this.container_by_barcode[container.barcode];
                }
            }
        },
        get_container_write_date: function(){
            return this.container_write_date;
        },
        get_container_by_id: function(id){
            return this.container_by_id[id];
        },
        get_container_by_barcode: function(barcode){
            return this.container_by_barcode[barcode];
        },
        get_containers_sorted: function(max_count){
            max_count = max_count ? Math.min(this.container_sorted.length, max_count) : this.container_sorted.length;
            var containers = [];
            for (var i = 0; i < max_count; i++) {
                containers.push(this.container_by_barcode[this.container_sorted[i]]);
            }

            return containers;
        },
        search_container: function(query) {
            try {
                query = query.replace(/[\[\]\(\)\+\*\?\.\-\!\&\^\$\|\~\_\{\}\:\,\\\/]/g,'.');
                query = query.replace(' ','.+');
                var re = RegExp("([0-9]+):\\|([0-9]*"+query+"[0-9]*\\|\|[0-9]*\\|.*?"+query+")","gi");
            } catch(e) {
                return [];
            }
            var results = [];
            for(var i = 0; i < this.limit; i++) {
               var r = re.exec(this.container_search_string);
                if(r) {
                    // r[1] = id, r[2] = barcode
                    var barcode = r[2].substring(0, r[2].indexOf("\|"));
                    results.push(this.get_container_by_barcode(barcode));
                } else {
                    break;
                }
            }

            return results;
        },

    });

    models.load_models({
        model: 'pos.container',
        fields: ['name','barcode', 'weight'],
        loaded: function(self, containers){
            self.db.add_containers(containers);
            return self.load_placeholder_product();
        },
    });

});
