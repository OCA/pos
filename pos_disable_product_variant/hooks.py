# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html


def set_pos_availability_on_variant(cr, registry):
    sql = """
        UPDATE product_product pp
        SET available_in_pos = pt.available_in_pos
        FROM product_template pt
        WHERE pt.id = pp.product_tmpl_id
    """
    cr.execute(sql)
