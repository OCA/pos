/*
    POS Gift Tickete for Odoo
    Copyright (C) 2015 FactorLibre (www.factorlibre.com)
    @author: Ismael Calvo <ismael.calvo@factorlibre.com>
    The licence is in the file __openerp__.py
*/

odoo.define('pos_gift_ticket.gift_print_widget', function(require) {
    "use strict";

    var core = require('web.core');
    var QWeb = core.qweb;
    var _t = core._t;

    var HeaderButtonWidget = require('point_of_sale.chrome').HeaderButtonWidget;

    var GiftPrintWidget = HeaderButtonWidget.extend({
        refresh_gift_ticket: function(){
            var order = this.pos.get('selectedOrder');
            $('.pos-receipt-container', this.$el).html(QWeb.render('PosGiftTicket',{
                widget:this,
                order: order,
                orderlines: order.orderlines.models,
            }));
        },

        print_gift: function() {
            if(this.pos.get('selectedOrder').orderlines.models.length){
                this.refresh_gift_ticket();
                this.pos.get('selectedOrder')._printed = true;
                setTimeout(function () {
                    window.print();
                }, 2000);
            }
        },

    });

    return GiftPrintWidget;
});


odoo.define('pos_gift_ticket.chrome_extensions', function(require) {
    "use strict";

    var chrome = require('point_of_sale.chrome').Chrome;
    var GiftPrintWidget = require('pos_gift_ticket.gift_print_widget');
    var core = require('web.core');
    var _t = core._t;

    chrome.prototype.widgets.splice(0, 0, {
        'name':   'print_gift_tickent',
        'widget': GiftPrintWidget,
        'append':  '.pos-rightheader',
        'args': {
            label: _t('Print Gift'),
            action: function(){
                this.print_gift();
            },
        }
    });
});
