odoo.define("pos_order_to_purchase_order.PosOrderToPurchaseOrderPopup", function (require) {
    "use strict";

    const {useState} = owl.hooks;
    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const {_t} = require("web.core");
    var rpc = require('web.rpc');

    class PosOrderToPurchaseOrderPopup extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
        }
        async click_create_draft_purchase_order(orderJson) {
           var self = this;
           var confirmed = false;
           rpc.query({
               model: 'purchase.order',
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
                   body: _t("Your draft purchase order was created"),
               });
           }	
        }
        async click_create_confirmed_purchase_order() {
           var self = this;
           var confirmed = false;
           rpc.query({
               model: 'purchase.order',
               method: 'create_order_from_pos',
               args: [this.props.orderJson, "purchase"],
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
                   body: _t("Your confirmed purchase order was created"),
               });
           }
        }
        async click_create_delivered_purchase_order() {
           var self = this;
           var confirmed = false;
           rpc.query({
               model: 'purchase.order',
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
                   body: _t("Your delivered purchase order was created"),
               });
           }
        }
    }
    PosOrderToPurchaseOrderPopup.template = "PosOrderToPurchaseOrderPopup";
    PosOrderToPurchaseOrderPopup.defaultProps = {
        cancelText: "Cancel",
        array: [],
    };

    Registries.Component.add(PosOrderToPurchaseOrderPopup);

    return PosOrderToPurchaseOrderPopup;
});
