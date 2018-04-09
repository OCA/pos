/******************************************************************************
    Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 *****************************************************************************/

openerp.pos_picking_load = function(instance, local) {


    module = instance.point_of_sale;
    var QWeb = instance.web.qweb;
    var _t = instance.web._t;
    var round_pr = instance.web.round_precision;

    /*************************************************************************
        Extend Model Order:
            * Add getter and setter function for field 'origin_picking_id';
    */
    var moduleOrderParent = module.Order;
    module.Order = module.Order.extend({

        set_origin_picking_id: function(id) {
            this.set({
                origin_picking_id: id,
            });
        },

        set_origin_picking_name: function(name) {
            this.set({
                origin_picking_name: name,
            });
        },

        export_for_printing: function(attributes){
            var order = moduleOrderParent.prototype.export_for_printing.apply(this, arguments);
            order['origin_picking_name'] = this.get('origin_picking_name');
            return order;
        },

        export_as_JSON: function() {
            var order = moduleOrderParent.prototype.export_as_JSON.apply(this, arguments);
            order['origin_picking_id'] = this.get('origin_picking_id');
            return order;
        },

    });


    /*************************************************************************
        New Widget LoadPickingButtonWidget:
            * On click, display a new screen to select a picking;
    */
    module.LoadPickingButtonWidget = module.PosBaseWidget.extend({
        template: 'LoadPickingButtonWidget',

        renderElement: function() {
            var self = this;
            this._super();
            this.$el.click(function(){
                var ss = self.pos.pos_widget.screen_selector;
                ss.set_current_screen('pickinglist');
            });
        },
    });


    /*************************************************************************
        Extend PosWidget:
            * Create new screen;
            * Add load and save button;
    */
    module.PosWidget = module.PosWidget.extend({
        build_widgets: function() {
            this._super();

            if (this.pos.config.iface_load_picking){
                // New Screen to select a picking
                this.pickinglist_screen = new module.PickingListScreenWidget(this, {});
                this.pickinglist_screen.appendTo(this.$('.screens'));
                this.pickinglist_screen.hide();
                this.screen_selector.screen_set.pickinglist = this.pickinglist_screen;

                // Add button
                this.search_picking_button = new module.LoadPickingButtonWidget(this,{});
                this.search_picking_button.appendTo(this.pos_widget.$('li.orderline.empty'));
            }
        },
    });


    /*************************************************************************
        Extend OrderWidget:
    */
    module.OrderWidget = module.OrderWidget.extend({
        renderElement: function(scrollbottom){
            this._super(scrollbottom);
            if (this.pos_widget.search_picking_button) {
                this.pos_widget.search_picking_button.appendTo(
                    this.pos_widget.$('li.orderline.empty')
                );
            }
        }
    });


    /*************************************************************************
        New ScreenWidget PickingListScreenWidget:
            * On show, display all pickings;
            * on click on a picking, display the content;
            * on click on 'validate', allow to use this picking;
            * on click on 'cancel', display the preview screen;
    */
    module.PickingListScreenWidget = module.ScreenWidget.extend({
        template: 'PickingListScreenWidget',
        show_leftpane: true,
        model: 'stock.picking',
        current_picking_id: false,
        current_picking_name: false,

        // Base functions
        init: function(parent, options){
            this._super(parent, options);
        },

        start: function() {
            var self = this;
            this._super();

            // Bind click buttons
            this.$el.find('span.button.cancel').click(_.bind(this.clickCancelButton, this));
            this.$el.find('span.button.validate').click(_.bind(this.clickValidateButton, this));

            // manage Search Box
            var search_timeout = null;
            this.$('.searchbox input').on('keyup',function(event){
                clearTimeout(search_timeout);
                var query = this.value;
                search_timeout = setTimeout(function(){
                    self.perform_search(query);
                },70);
            });

            this.$('.searchbox .search-clear').click(function(){
                self.clear_search();
            });
        },

        show: function() {
            this._super();
            var ss = this.pos.pos_widget.screen_selector;
            this.pos_widget.numpad.hide();
            this.pos_widget.paypad.hide();
            this.search_pickings();
            this.$el.find('span.button.validate').hide();
        },

        prepare_order: function(order, picking) {
            var partner = this.pos.db.get_partner_by_id(picking.partner_id);
            order.set_client(partner || undefined);
            return order;
        },

        prepare_orderline: function(product, pickingline) {
            return {
                quantity: pickingline.quantity,
                price: pickingline.price_unit || product.price,
                discount: pickingline.discount || 0.0,
            };
        },

        // User Event
        clickCancelButton: function(event) {
            order = this.pos.get('selectedOrder');
            order.set_client(undefined);
            order.set_origin_picking_id(undefined);
            order.set_origin_picking_name(undefined);
            order.get('orderLines').reset();
            this.pos_widget.order_widget.change_selected_order();
            var ss = this.pos.pos_widget.screen_selector;
            ss.set_current_screen('products');
            this.pos_widget.numpad.show();
            this.pos_widget.paypad.show();
        },

        clickValidateButton: function(event) {
            order = this.pos.get('selectedOrder');
            order.set_origin_picking_id(this.current_picking_id);
            order.set_origin_picking_name(this.current_picking_name);
            var ss = this.pos.pos_widget.screen_selector;
            ss.set_current_screen('products');
            this.pos_widget.numpad.show();
            this.pos_widget.paypad.show();
        },

        load_picking: function(origin_picking_id) {
            var self = this;
            var pickingModel = new instance.web.Model(this.model);
            return pickingModel.call('load_picking_for_pos', [[origin_picking_id]])
            .then(function (picking) {
                self.current_picking_id = origin_picking_id;
                self.current_picking_name = picking.name;
                var picking_selectable = true;
                var order = self.pos.get('selectedOrder');
                order = self.prepare_order(order, picking);
                order.get('orderLines').reset();
                var pickinglines = picking.line_ids || [];
                var unknown_products = [];
                for (var i=0, len=pickinglines.length; i<len; i++) {
                    // check if product are available in pos
                    var pickingline = pickinglines[i];
                    var line_name = pickingline.name;
                    var product = self.pos.db.get_product_by_id(pickingline.product_id);
                    if (_.isUndefined(product)) {
                        unknown_products.push(line_name);
                        continue;
                    }
                    // Create new line and add it to the current order
                    orderline = self.prepare_orderline(product, pickingline);
                    order.addProduct(product, orderline);
                    last_orderline = order.getLastOrderline();
                    last_orderline = jQuery.extend(last_orderline, orderline);
                }
                // Forbid POS Order loading if some products are unknown
                if (unknown_products.length > 0){
                    self.pos_widget.screen_selector.show_popup(
                        'error-traceback', {
                            message: _t('Unknown Products'),
                            comment: _t('Unable to load some picking lines because the ' +
                                    'products are not available in the POS cache.\n\n' +
                                    'Please check that lines :\n\n  * ') + unknown_products.join("; \n  *")
                        });
                    picking_selectable = false;
                }
                // Check if the partner is unknown
                if (_.isUndefined(order.get_client)) {
                    self.pos_widget.screen_selector.show_popup(
                        'error-traceback', {
                            message: _t('Unknown Partner'),
                            comment: _t('Unable to load this picking because the partner' + 
                                    ' is not known in the Point Of Sale as a customer')
                        });
                    picking_selectable = false;
                }

                if (picking_selectable){
                    self.$el.find('span.button.validate').show();
                }
                else{
                    self.$el.find('span.button.validate').hide();
                }

            }).fail(function (error, event){
                if (parseInt(error.code) === 200) {
                    // Business Logic Error, not a connection problem
                    self.pos_widget.screen_selector.show_popup(
                        'error-traceback', {
                            message: error.data.message,
                            comment: error.data.debug
                        });
                }
                else{
                    self.pos_widget.screen_selector.show_popup('error',{
                        message: _t('Connection error'),
                        comment: _t('Can not execute this action because the POS is currently offline'),
                    });
                }
                event.preventDefault();
            });
        },

        search_pickings: function(query) {
            var self = this;
            var pickingModel = new instance.web.Model(this.model);
            return pickingModel.call('search_pickings_for_pos', [query || '', this.pos.pos_session.id])
            .then(function (result) {
                self.render_list(result);
            }).fail(function (error, event){
                if (parseInt(error.code) === 200) {
                    // Business Logic Error, not a connection problem
                    self.pos_widget.screen_selector.show_popup(
                        'error-traceback', {
                            message: error.data.message,
                            comment: error.data.debug
                        }
                    );
                }
                else{
                    self.pos_widget.screen_selector.show_popup('error',{
                        message: _t('Connection error'),
                        comment: _t('Can not execute this action because the POS is currently offline'),
                    });
                }
                event.preventDefault();
            });
        },

        on_click_picking: function(event){
            this.load_picking(parseInt(event.target.parentNode.dataset.pickingId, 10));
        },

        render_list: function(pickings){
            var self = this;
            var contents = this.$el[0].querySelector('.picking-list-contents');
            contents.innerHTML = "";
            var line_list = document.createDocumentFragment();
            _.each(pickings, function(picking){
                var picking_line_html = QWeb.render('LoadPickingLine',{widget: this, picking:picking});
                var picking_line = document.createElement('tbody');
                picking_line.innerHTML = picking_line_html;
                picking_line = picking_line.childNodes[1];
                picking_line.addEventListener('click', self.on_click_picking);
                line_list.appendChild(picking_line);
            });
            contents.appendChild(line_list);
        },

        perform_search: function(query){
            this.search_pickings(query);
        },

        clear_search: function(){
            this.search_pickings();
            this.$('.searchbox input')[0].value = '';
            this.$('.searchbox input').focus();
        },

    });

};
