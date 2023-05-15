odoo.define("pos_order_to_sale_order.PosOrderToSaleOrderPopup", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const {_t} = require("web.core");
    var rpc = require('web.rpc');

    class PosOrderToSaleOrderPopup extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
        }
        async click_create_draft_sale_order(orderJson) {
           var self = this;
           var confirmed = false;
           rpc.query({
               model: 'sale.order',
               method: 'create_order_from_pos',
               args: [this.props.orderJson, "draft"],
           }).then(function (result) {
               confirmed=true;
           }).catch(function (error, event) {
               confirmed=false;
           });
           confirmed = true;
           //I was forced to remove the client and order lines instead remove order
           this.props.order.set_client(null);
           this.props.order.remove_orderline(this.props.order_lines);
           this.trigger("close-popup");
           if (confirmed) {
               return this.showPopup("ConfirmPopup", {
                   title: _t("Order created"),
                   body: _t("Your draft sale order was created"),
               });
           }	
        }
        async click_create_confirmed_sale_order() {
           var self = this;
           var confirmed = false;
           rpc.query({
               model: 'sale.order',
               method: 'create_order_from_pos',
               args: [this.props.orderJson, "sale"],
           }).then(function (result) {
               confirmed=true;
           }).catch(function (error, event) {
               confirmed=false;
           });
           confirmed = true;
           //I was forced to remove the client and order lines instead remove order
           this.props.order.set_client(null);
           this.props.order.remove_orderline(this.props.order_lines);
           this.trigger("close-popup");
           if (confirmed) {
               return this.showPopup("ConfirmPopup", {
                   title: _t("Order created"),
                   body: _t("Your confirmed sale order was created"),
               });
           }
        }
        async click_create_delivered_sale_order() {
           var self = this;
           var confirmed = false;
           rpc.query({
               model: 'sale.order',
               method: 'create_order_from_pos',
               args: [this.props.orderJson, "done"],
           }).then(function (result) {
               confirmed=true;
           }).catch(function (error, event) {
               confirmed=false;
           });
           confirmed = true;
           //I was forced to remove the client and order lines instead remove order
           this.props.order.set_client(null);
           this.props.order.remove_orderline(this.props.order_lines);
           this.trigger("close-popup");
           if (confirmed) {
               return this.showPopup("ConfirmPopup", {
                   title: _t("Order created"),
                   body: _t("Your delivered sale order was created"),
               });
           }
        }
    }
    PosOrderToSaleOrderPopup.template = "PosOrderToSaleOrderPopup";
    PosOrderToSaleOrderPopup.defaultProps = {
        cancelText: "Cancel",
        array: [],
    };

    Registries.Component.add(PosOrderToSaleOrderPopup);

    return PosOrderToSaleOrderPopup;
});
