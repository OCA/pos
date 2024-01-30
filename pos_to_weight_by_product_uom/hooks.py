def post_init_hook(cr, registry):
    cr.execute(
        """
        UPDATE uom_category
        SET to_weight = true
        WHERE id = (
            SELECT res_id
            FROM ir_model_data
            WHERE module = 'uom'
            AND name = 'product_uom_categ_kgm'
        );"""
    )

    cr.execute(
        """
        UPDATE product_template
        SET to_weight = true
        FROM uom_uom, uom_category
        WHERE uom_uom.id = product_template.uom_id
        AND uom_category.id = uom_uom.category_id
        AND uom_category.to_weight = True;
        """
    )
