Native Odoo only handle Cash Moves, so this module rewrite core functions in core point_of_sale :
- get_closing_control_data() in pos_session.py, add some datas in return key 'other_payment_methods'
- try_cash_in_out()  in pos_session.py

We make the choice to rewrite get_closing_control_data() insted of override because of multiple changes needed.