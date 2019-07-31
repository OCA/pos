/**
Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('pos_place.chrome', function (require) {
    "use strict";

    var chrome = require('point_of_sale.chrome');
    var pos_place_widget = require('pos_place.widgets');

    chrome.Chrome.include({

        init: function () {
            this.widgets.push({
                'name':     'place_name',
                'widget':   pos_place_widget.PlaceNameWidget,
                'replace':  '.placeholder-PlaceNameWidget',
            });
            return this._super(arguments[0], {});
        },

    });

});
