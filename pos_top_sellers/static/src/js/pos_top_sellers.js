openerp.pos_top_sellers = function(instance)
{
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.list.columns.add(
        'field.pos_top_sellers_product_col',
        'instance.web.pos_top_sellers.PosTopSellersListClickableColumn');

    instance.web.views.add(
        'pos_top_sellers_shop_view',
        'instance.web.pos_top_sellers.PosTopSellersShopListView'
        );

    instance.web.views.add(
        'pos_top_sellers_product_view',
        'instance.web.pos_top_sellers.PosTopSellersProductListView'
        );

    instance.web.pos_top_sellers = instance.web.pos_top_sellers || {};

    instance.web.pos_top_sellers.PosTopSellersListClickableColumn =
        instance.web.list.Column.extend({
            _format: function (row_data, options)
            {
                var prod_id   = row_data[this.id].value[0];
                var prod_name = _.escape(row_data[this.id].value[1] || options.value_if_empty);

                return _.str.sprintf('<a class="oe_form_uri" data-pos-t10-click-id="%s" >%s</a>',
                    prod_id, prod_name);

            },
        });

    instance.web.ListView.List.include({
            render: function()
            {
                var result = this._super(this, arguments),
                    self = this;

                this.$current.delegate('a[data-pos-t10-click-id]',
                    'click', function()
                    {
                        // forward context from parent view
                        var ctx = self.dataset.get_context().eval();
                        $.extend(ctx, {
                            my_res_id: jQuery(this).data('pos-t10-click-id'),
                        });

                        self.view.do_action({
                            type: 'ir.actions.act_window',
                            res_model: 'pos.top.sellers.product.report',
                            view_type: 'form',
                            view_mode: 'tree',
                            views: [[false, 'pos_top_sellers_product_view']],
                            },
                            {
                                additional_context: ctx
                            }
                        );
                    });

                return result;
            },
        });

    instance.web.pos_top_sellers.PosTopSellersShopListView =
        instance.web.web_listview_date_range_bar.DateRangeBar.extend({

            init: function(parent, dataset, view_id, _options) {
                _options.selectable = false
                _options.sortable = false
                _options.reorderable = false
                _options.search_view = false
                this._super.apply(this, arguments);
                },
        });

    instance.web.pos_top_sellers.PosTopSellersProductListView =
        instance.web.pos_top_sellers.PosTopSellersShopListView.extend({

            init: function(parent, dataset, view_id, options) {
                this._super.apply(this, arguments);
            },

            start:function(){
                var tmp = this._super.apply(this, arguments);
                var self = this;
                var defs = [];

                this.$el.parent().find('.oe_list_date_range_bar_start').
                    prepend(QWeb.render("pos_top_sellers_product_view_product_selector", {widget: this}));

                this.$el.parent().find('.oe_pos_top_sellers_product_id_input').change(function() {
                    var product_default_code =  this.value === '' ? null : this.value;
                    if( product_default_code ){
                        req = self.dataset.call('get_product_id_for_code', [product_default_code]);
                        req.then(
                            function(product_id){
                                if(product_id)
                                {
                                    self.ViewManager.$el.find("span.oe_breadcrumb_item").text(product_default_code);
                                    self.last_context["my_res_id"] = product_id;
                                    self.do_search(self.last_domain, self.last_context, self.last_group_by);
                                }
                            }
                        );
                    }
                });

                var ctx = this.dataset.get_context().eval();
                if ( ctx.my_res_id )
                {
                    req = self.dataset.call('get_product_code_for_id', [ctx.my_res_id])
                    req.then(
                        function(product_default_code){
                            self.$el.parent().find('.oe_pos_top_sellers_product_id_input').val( product_default_code );
                            self.ViewManager.$el.find("span.oe_breadcrumb_item").text(product_default_code);
                        }
                    );
                    defs.push(req);
                }

                return $.when(tmp, defs);
            },

            style_for: function (record) {
                var self = this;
                var tmp = self._super.apply(this, arguments);
                var id = record.attributes.id;
                if( id == 1 )
                {
                    tmp += "color: #FF0000"
                }
                if( id == 2 )
                {
                    tmp += "color: #FFCC00"
                }
                return tmp;
            },
        });
};
