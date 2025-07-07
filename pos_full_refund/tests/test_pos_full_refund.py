# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosFullRefund(TestPointOfSaleHttpCommon):
    """Test the Full Refund functionality in POS.

    This test verifies that when a user clicks the "Do Full Refund" button
    in the ticket screen, all lines from the selected order are automatically
    added to a new refund order with their full quantities.
    """

    def test_pos_full_refund(self):
        """Test that clicking 'Do Full Refund' creates a refund order with all lines."""
        # Open a POS session
        self.main_pos_config.with_user(self.pos_user).open_ui()

        # Start the tour that will:
        # 1. Create an order with multiple products
        # (Desk Pad, Monitor Stand, Letter Tray)
        # 2. Pay for the order
        # 3. Open refund mode
        # 4. Select the paid order
        # 5. Click "Do Full Refund" button
        # 6. Verify all lines are in the refund order with negative quantities
        # 7. Complete the refund payment
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosFullRefundTour",
            login="pos_user",
        )
