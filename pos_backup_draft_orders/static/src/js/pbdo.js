/******************************************************************************
    Point Of Sale - Backup Draft Orders module for OpenERP
    Copyright (C) 2014 GRAP (http://www.grap.coop)
    @author Julien WESTE
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/

openerp.pos_backup_draft_orders = function (instance) {
    module = instance.point_of_sale;
    _t = instance.web._t;

    /*************************************************************************
        Overload : PosWidget to include button in PosOrderHeaderWidget widget
        to backup draft orders
    */
    module.PosWidget = module.PosWidget.extend({

        displayBackupButton: function(){
            if (this.backup_order_button){
                var order = this.pos.get('selectedOrder');
                if (((order.get('orderLines').length + order.get('paymentLines').length) > 0) && 
                        (order.getChange()<0 && (Math.abs(order.getChange()) > 0.000001))){
                    this.backup_order_button.$el.fadeIn();
                }
                else{
                    this.backup_order_button.$el.fadeOut();
                }
            }
        },

        build_widgets: function(){
            this._super();
            var self = this;

            // Create a button to backup the current order
            this.backup_order_button = new module.HeaderButtonWidget(this,{
                label:_t('Keep in Draft'),
                action: function(){ self.backup_order(); },
            });
            this.backup_order_button.appendTo(this.$('#pos_order_header'));
            this.pos.bind('change:selectedOrder', this.displayBackupButton, this);
            this.backup_order_button.$el.fadeOut();
        },

        backup_order: function() {
            var order = this.pos.get('selectedOrder');
            this.pos.push_order(order.exportAsJSON());
            this.pos.get('selectedOrder').destroy();
        },

    });

    module.OrderWidget = module.OrderWidget.extend({
        renderElement: function(){
            this.pos_widget.displayBackupButton();
            this._super();
        },
    });

    module.PaymentScreenWidget = module.PaymentScreenWidget.extend({
        updatePaymentSummary: function(){
            this.pos_widget.displayBackupButton();
            this._super();
        },
    });

};

