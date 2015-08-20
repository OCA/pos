/*
    POS Gift Tickete for Odoo
    Copyright (C) 2015 FactorLibre (www.factorlibre.com)
    @author: Ismael Calvo <ismael.calvo@factorlibre.com>
    The licence is in the file __openerp__.py
*/


openerp.pos_gift_ticket = function (instance) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.point_of_sale.ReceiptScreenWidget.include({
        show: function(){
            this._super()
            var self = this;
            var print_gift_ticket_button = this.add_action_button({
                    label: _t('Gift Ticket'),
                    icon: '/point_of_sale/static/src/img/icons/png48/printer.png',
                    click: function(){
                        self.print_gift();
                    },
                });
        },
        refresh_gift_ticket: function(){
            var order = this.pos.get('selectedOrder');
            $('.pos-receipt-container', this.$el).html(QWeb.render('PosGiftTicket',{
                    widget:this,
                    order: order,
                    orderlines: order.get('orderLines').models,
                }));
        },
        print: function() {
            this.refresh()
            this._super()
        },
        print_gift: function() {
            this.refresh_gift_ticket()
            this.pos.get('selectedOrder')._printed = true;
            setTimeout(function() {
                    window.print();
                }, 2000);
              // window.print();
        },
    });

};
