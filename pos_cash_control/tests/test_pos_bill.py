from psycopg2 import IntegrityError

from odoo.tests.common import TransactionCase
from odoo.tools.misc import mute_logger


class TestPosBill(TransactionCase):
    def test_pos_bill_name(self):
        bill = self.env["pos.bill"].name_create("1")
        self.assertTrue(bool(bill))

        with self.assertRaises(IntegrityError):
            with mute_logger("odoo.sql_db"):
                self.env["pos.bill"].create({"name": "2"}).write({"name": "1"})
