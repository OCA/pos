class PosPricelistShowDiscountCommonSetup:
    @classmethod
    def create_pricelists(cls, env):
        pos_pricelist = env["product.pricelist"].create(
            {
                "name": "Pos Pricelist",
                "discount_policy": "without_discount",
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "base": "list_price",
                            "applied_on": "1_product",
                            "product_tmpl_id": env.ref(
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
                            "product_tmpl_id": env.ref(
                                "product.product_product_12_product_template"
                            ).id,
                            "fixed_price": 60.0,
                        },
                    ),
                ],
            }
        )
        drp = env["product.pricelist"].create(
            {
                "name": "Discount Reference Pricelist",
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "base": "list_price",
                            "applied_on": "1_product",
                            "product_tmpl_id": env.ref(
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
                            "product_tmpl_id": env.ref(
                                "product.product_product_12_product_template"
                            ).id,
                            "fixed_price": 100.0,
                        },
                    ),
                ],
            }
        )
        return pos_pricelist, drp

    @classmethod
    def config_pos(cls, env, pricelist, discount_pricelist):
        pos_config = env.ref("point_of_sale.pos_config_main")
        pos_config.write(
            {
                "pricelist_id": pricelist.id,
                "use_pricelist": True,
                "available_pricelist_ids": [
                    (6, 0, (pricelist + discount_pricelist).ids)
                ],
                "display_discount_from_pricelist": True,
                "discount_pricelist_id": discount_pricelist.id,
            }
        )
        return pos_config
