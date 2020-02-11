/* Copyright 2020 Solvos Consultoría Informática
   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define('pos_order_return_traceability.widgets', function (require) {
    "use strict";

    var core = require('web.core');
    var screens = require('point_of_sale.screens');
    var order_mgmt_widgets = require('pos_order_mgmt.widgets');

    var QWeb = core.qweb;

    screens.ActionpadWidget.include({

        renderElement: function() {
            var self = this;
            this._super();

            var button_pay_click_handler = $._data(
                this.$el.find('.pay')[0], 'events').click[0].handler;
            var button_pay = this.$('.pay');
            button_pay.off('click');
            button_pay.click(function(){
                var order = self.pos.get_order();
                if (self.check_return_order(order)) {
                    button_pay_click_handler();
                }
            });

        },

        check_return_order: function (order) {
            var self = this;
            if (!order.returned_order_id) {
                return true;
            }

            var lines = order.get_orderlines();
            var qty_incorrect_lines = [], no_return_lines = [];
            for (var i = 0; i < lines.length; i++) {
                var qty_line = lines[i].get_quantity();
                var product = lines[i].get_product();
                if (!lines[i].returned_line_id && (qty_line < 0) &&
                    !product.pos_allow_negative_qty) {
                    // Prevent new lines without return associated
                    no_return_lines.push(product.display_name);
                } else if (lines[i].returned_line_id && (
                        (qty_line > 0) ||
                        ((-1)*lines[i].quantity_returnable > qty_line)
                    )) {
                    // Maximum quantity allowed exceeded
                    qty_incorrect_lines.push(product.display_name + ': ' +
                        lines[i].get_quantity_str() + ' < ' +
                        (-1)*lines[i].quantity_returnable);
                }
            }

            if ((qty_incorrect_lines.length + no_return_lines.length) > 0) {
                var error_message = _t('Please check the following line(s):');
                if (qty_incorrect_lines.length > 0) {
                    error_message += "\n\n";
                    error_message += _t('* Invalid quantity line(s): ') +
                        qty_incorrect_lines.join(', ');
                }
                if (no_return_lines.length > 0) {
                    error_message += "\n\n";
                    error_message += _t('* Non-returnable line(s): ') +
                        no_return_lines.join(', ');
                }
                self.gui.show_popup(
                    'error-traceback', {
                        'title': _t('Return lines error(s)'),
                        'body': error_message,
                    });
                return false;
            }

            return true;
        }

    });

    order_mgmt_widgets.OrderListScreenWidget.include({

        _prepare_product_options_from_orderline_data: function (
            order, line, action) {

            var self = this;
            var ret = this._super(order, line, action);

            if (['return'].indexOf(action) !== -1) {
                ret.quantity = (-1) * line.qty_returnable;
                ret.extras = {
                    returned_line_id: line.id,
                    quantity_returnable: line.qty_returnable,
                }
            }

            return ret;

        },

    });

});
