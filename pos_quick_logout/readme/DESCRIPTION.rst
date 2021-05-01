This module was written to extend the functionality of Odoo Point Of Sale about
changing of cashier.

This module add a simple button 'Log Out' available in Point Of Sale Front End
UI. This button is available when the cashier is not the initial user logged in
Odoo. It allows to log out quickly, wihout selecting again the user in the
list. This module is useful for users that use regularly the change of cashier,
especialy with 'pos_access_right', when users doesn't have the right to do some
actions like set discount, change unit price, ...


* By default, the header is unchanged

.. image:: ../static/description/cashier_user_identical.png


* If the cashier changed, and is not the user logged in Odoo, the extra button appears

.. image:: ../static/description/cashier_user_different.png
