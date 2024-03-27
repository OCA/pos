from odoo.tests import SavepointCase


class TestPosPricelistMultiCurrency(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.usd = cls.env.ref("base.USD")
        cls.eur = cls.env.ref("base.EUR")
        cls.pricelist_model = cls.env["product.pricelist"]
        cls.usd_pricelist, cls.eur_pricelist = cls.create_pricelists()

        cls.main_pos_config = cls.env.ref("point_of_sale.pos_config_main")
        # cls.company_model = cls.env["res.company"]
        # cls.main_company = cls.env.ref("base.main_company")

    @classmethod
    def create_pricelists(cls):
        usd_pricelist = cls.pricelist_model.create(
            {
                "name": "USD Pricelist",
                "discount_policy": "without_discount",
                "currency_id": cls.usd.id,
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "base": "list_price",
                            "applied_on": "1_product",
                            "product_tmpl_id": cls.env.ref(
                                "product.product_delivery_01_product_template"
                            ).id,
                            "fixed_price": 75.0,
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "base": "list_price",
                            "applied_on": "1_product",
                            "product_tmpl_id": cls.env.ref(
                                "product.product_product_12_product_template"
                            ).id,
                            "fixed_price": 60.0,
                        },
                    ),
                ],
            }
        )
        eur_pricelist = cls.pricelist_model.create(
            {
                "name": "EUR Pricelist",
                "currency_id": cls.eur.id,
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "base": "list_price",
                            "applied_on": "1_product",
                            "product_tmpl_id": cls.env.ref(
                                "product.product_delivery_01_product_template"
                            ).id,
                            "fixed_price": 100.0,
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "base": "list_price",
                            "applied_on": "1_product",
                            "product_tmpl_id": cls.env.ref(
                                "product.product_product_12_product_template"
                            ).id,
                            "fixed_price": 100.0,
                        },
                    ),
                ],
            }
        )
        return usd_pricelist, eur_pricelist

    def test_pos_config_pricelist_multi_currency(self):
        self.main_pos_config.write(
            {
                "pricelist_id": self.eur_pricelist.id,
                "use_pricelist": True,
                "available_pricelist_ids": [
                    (6, 0, (self.usd_pricelist + self.eur_pricelist).ids)
                ],
            }
        )
