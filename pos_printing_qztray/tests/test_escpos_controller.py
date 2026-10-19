# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import base64
import io

from PIL import Image

from odoo.tests.common import TransactionCase

from odoo.addons.pos_printing_qztray.controllers.main import PosEscposController


def _make_png_base64(width=10, height=10):
    """Helper: generate a minimal white PNG encoded as base64."""
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


class TestRenderAnyReport(TransactionCase):
    """Unit tests for PosEscposController.render_any_report (image → ESC/POS)."""

    def setUp(self):
        super().setUp()
        self.controller = PosEscposController()

    def test_valid_png_returns_base64_string(self):
        result = self.controller.render_any_report(_make_png_base64(), width_mm=80)
        self.assertIsInstance(result, str)
        # Must be valid base64
        decoded = base64.b64decode(result)
        self.assertGreater(len(decoded), 0)

    def test_valid_png_58mm_returns_base64_string(self):
        result = self.controller.render_any_report(_make_png_base64(), width_mm=58)
        self.assertIsInstance(result, str)
        base64.b64decode(result)  # should not raise

    def test_invalid_base64_returns_error_dict(self):
        result = self.controller.render_any_report("NOT!VALID!BASE64", width_mm=80)
        self.assertIsInstance(result, dict)
        self.assertIn("error", result)

    def test_valid_base64_not_an_image_returns_error_dict(self):
        not_image = base64.b64encode(b"this is not image data").decode("utf-8")
        result = self.controller.render_any_report(not_image, width_mm=80)
        self.assertIsInstance(result, dict)
        self.assertIn("error", result)

    def test_result_contains_escpos_cut_command(self):
        """ESC/POS cut command (GS V) must be present in the output."""
        result = self.controller.render_any_report(_make_png_base64(), width_mm=80)
        raw = base64.b64decode(result)
        # GS V 65 = full cut (0x1d 0x56 0x41)
        self.assertIn(b"\x1d\x56", raw)
