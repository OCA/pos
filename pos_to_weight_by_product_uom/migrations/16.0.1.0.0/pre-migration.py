# Copyright 2024, Grap
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from openupgradelib import openupgrade

_field_renames = [
    (
        "uom.uom",
        "uom_uom",
        "to_weigh",
        "to_weight",
    ),
    (
        "uom.category",
        "uom_category",
        "to_weigh",
        "to_weight",
    ),
]


@openupgrade.migrate()
def migrate(env, version):
    openupgrade.rename_fields(env, _field_renames)
