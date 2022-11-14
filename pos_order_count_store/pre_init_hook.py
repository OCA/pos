def pre_compute_pos_order_count(cr):
    # compute pos_order_count with SQL for faster installation
    query = """
    ALTER TABLE
        res_partner
    ADD COLUMN IF NOT EXISTS
        pos_order_count INTEGER;
    """
    cr.execute(query)
    query = """
    UPDATE
        res_partner
    SET
        pos_order_count = count
    FROM
        (
            SELECT
                partner_id,
                count(*)
            FROM
                pos_order
            GROUP by
                partner_id
        ) pos_order_partner
    WHERE
        res_partner.id = pos_order_partner.partner_id;
    """
    cr.execute(query)
