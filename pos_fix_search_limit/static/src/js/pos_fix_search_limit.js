/* Copyright 2018 Akretion - Raphaël Reverdy
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
odoo.define("pos_fix_search_limit.db", function (require) {
    "use strict";
    var PosDB = require("point_of_sale.DB");
    PosDB.include({
        limit: 314159265,  // the maximum number of results returned by a search
    });     
});

odoo.define('pos_fix_search_limit.product_list', function(require) {
    "use strict";
    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var qweb = core.qweb;

    screens.ProductListWidget.include({
        displayLimit: 100, //number of elements displayed
        renderElement: function() {
            //Limit the number of elements to displayLimit (instead of db.limit)
            // (db.limit has been increased to return more results)
            // (but we still want to limit the display)
            //And make use of document fragment, because better perfs
            var self = this;
            var i = 0;
            var len = Math.min(this.product_list.length, this.displayLimit);
            var frag = document.createDocumentFragment();
            var product_node = null;

            var el_str  = qweb.render(this.template, {widget: this});
            var el_node = document.createElement('div');
                el_node.innerHTML = el_str;
                el_node = el_node.childNodes[1];

            if(this.el && this.el.parentNode){
                this.el.parentNode.replaceChild(el_node,this.el);
            }
            this.el = el_node;

            var list_container = el_node.querySelector('.product-list');
            for(i=0; i < len; i++){
                product_node = this.render_product(this.product_list[i]);
                product_node.addEventListener('click',this.click_product_handler);
                product_node.addEventListener('keypress',this.keypress_product_handler);
                frag.appendChild(product_node);
            }
            list_container.appendChild(frag);
        }
    });
});
