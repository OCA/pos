from odoo.tests.common import TransactionCase

from .. import utils


class TestUtils(TransactionCase):
    def test_get_trigram(self):
        """
        extract 1 letter from firstname and 2 letters from lastname
        - If one of the fields is empty, extract 3 letters from the other field
        - If both fields are empty, return an empty string
        """
        firstname = "Tri"
        lastname = "Doan"
        self.assertEqual(utils.get_trigram(firstname, lastname), "TDo")

        firstname = ""
        lastname = "Doan"
        self.assertEqual(utils.get_trigram(firstname, lastname), "Doa")

        firstname = "Tri"
        lastname = ""
        self.assertEqual(utils.get_trigram(firstname, lastname), "Tri")

        firstname = ""
        lastname = ""
        self.assertEqual(utils.get_trigram(firstname, lastname), "")
