# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp import models, api


class Module(models.Model):

    _inherit = 'ir.module.module'

    @api.multi
    def module_uninstall(self):
        for module in self:
            if module.name == 'pos_remove_pos_category':

                # As we have loose previous POS categs restore them
                # in a sane empty state
                self.env.cr.execute('''
                    UPDATE product_template SET pos_categ_id=NULL;
                ''')

                # And restore original constraint
                self.env.cr.execute('''
                    ALTER TABLE product_template
                    DROP CONSTRAINT IF EXISTS
                    product_template_pos_categ_id_fkey;
                ''')

                self.env.cr.execute('''
                    ALTER TABLE product_template ADD CONSTRAINT
                    "product_template_pos_categ_id_fkey"
                    FOREIGN KEY (pos_categ_id)
                    REFERENCES pos_category(id) ON DELETE SET NULL;
                ''')

                # Restore POS category menu action
                # in SQL because pool/env is not available here
                self.env.cr.execute('''
                    UPDATE ir_act_window iaw SET res_model='pos.category'
                    FROM ir_model_data imd
                    WHERE
                        iaw.id = imd.res_id AND
                        imd.model = 'ir.actions.act_window' AND
                        imd.name = 'product_pos_category_action';
                ''')

                break

        return super(Module, self).module_uninstall()
