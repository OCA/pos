# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


def migrate(cr, version):
    cr.execute(
        """
        ALTER TABLE pos_config
        ADD COLUMN iface_display_margin bool;
    """
    )
    cr.execute(
        """
        UPDATE pos_config
        SET iface_display_margin = false;
    """
    )
