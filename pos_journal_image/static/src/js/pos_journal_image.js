/*
Copyright (C) 2019-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

"use strict";

openerp.pos_journal_image = function(instance){
    var module = instance.point_of_sale;

    module.PosBaseWidget.include({
        journal_icon_url: function(id){
            return '/web/binary/image?model=account.journal&id=' + id + '&field=pos_image';
        },
    });

};
