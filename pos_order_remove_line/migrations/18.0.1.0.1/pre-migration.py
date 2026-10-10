# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)
import logging

_logger = logging.getLogger(__name__)


def migrate(cr, version):
    """Add line_remove_btn and line_remove_warning fields to pos.config.

    This migration fixes the issue where res.config.settings fields
    pos_line_remove_btn and pos_line_remove_warning were not properly
    saving because Odoo's POS config settings automatically strip the
    'pos_' prefix, looking for line_remove_btn and line_remove_warning
    in the pos.config model.
    """
    if not version:
        return

    _logger.info("Adding line_remove_btn and line_remove_warning fields to pos.config")

    # Check if old fields exist
    cr.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'pos_config'
        AND column_name IN ('pos_line_remove_btn', 'pos_line_remove_warning')
        """
    )
    old_fields = [row[0] for row in cr.fetchall()]

    if not old_fields:
        _logger.info("Old fields not found, skipping migration")
        return

    # Add new fields if they don't exist
    cr.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'pos_config'
        AND column_name IN ('line_remove_btn', 'line_remove_warning')
        """
    )
    existing_new_fields = [row[0] for row in cr.fetchall()]

    if "line_remove_btn" not in existing_new_fields:
        _logger.info("Adding line_remove_btn field to pos_config table")
        cr.execute(
            """
            ALTER TABLE pos_config
            ADD COLUMN line_remove_btn BOOLEAN DEFAULT FALSE
            """
        )

    if "line_remove_warning" not in existing_new_fields:
        _logger.info("Adding line_remove_warning field to pos_config table")
        cr.execute(
            """
            ALTER TABLE pos_config
            ADD COLUMN line_remove_warning BOOLEAN DEFAULT FALSE
            """
        )

    # Copy values from old fields to new fields
    if "pos_line_remove_btn" in old_fields:
        _logger.info("Copying values from pos_line_remove_btn to line_remove_btn")
        cr.execute(
            """
            UPDATE pos_config
            SET line_remove_btn = pos_line_remove_btn
            WHERE pos_line_remove_btn IS NOT NULL
            """
        )

    if "pos_line_remove_warning" in old_fields:
        _logger.info(
            "Copying values from pos_line_remove_warning to line_remove_warning"
        )
        cr.execute(
            """
            UPDATE pos_config
            SET line_remove_warning = pos_line_remove_warning
            WHERE pos_line_remove_warning IS NOT NULL
            """
        )

    _logger.info("Migration completed successfully")
