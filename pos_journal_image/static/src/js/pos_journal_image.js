/*
Copyright (C) 2019-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_journal_image.pos_journal_image', function (require) {
    "use strict";

    var PosBaseWidget = require('point_of_sale.BaseWidget');

    PosBaseWidget.include({
        journal_icon_url: function(id){
            return '/web/binary/image?model=account.journal&id=' + id + '&field=pos_image';
        },
    });

});
