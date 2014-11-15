/******************************************************************************
    Point Of Sale - Second Header module for OpenERP
    Copyright (C) 2014 GRAP (http://www.grap.coop)
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

openerp.pos_second_header = function (instance) {
    module = instance.point_of_sale;

    /* 
        Define : PosOrderHeaderWidget to allow possibility to include inside 
        some extra informations.
    */
    module.PosOrderHeaderWidget = module.PosBaseWidget.extend({
        template: 'PosOrderHeaderWidget',

        init: function(parent, options){
            this._super(parent,options);
        },
    });

    /* 
        Overload : PosWidget to include PosOrderHeaderWidget inside.
    */
    module.PosWidget = module.PosWidget.extend({
        build_widgets: function(){
            this._super();
            this.pos_order_header = new module.PosOrderHeaderWidget(this,{});
            this.pos_order_header.appendTo(this.$('#rightheader'));

        },
    });

};
