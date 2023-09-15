if you want to display in the main screen some important buttons:

* Go to 'Point of Sale > Configuration > Settings'

* Edit the field 'Important Buttons' and write the technical name of the buttons.

  .. image:: ../static/img/configure_important_buttons.png

Here are for the official modules, the following possibles values:

  * ``point_of_sale`` : ProductInfoButton, SetFiscalPositionButton, OrderlineCustomerNoteButton, SetPricelistButton, RefundButton

  * ``pos_sale``: SetSaleOrderButton

  * ``pos_discount``: DiscountButton

  * ``pos_loyalty``: RewardButton, ResetProgramsButton, eWalletButton, PromoCodeButton

  * ``pos_restaurant``: SplitBillButton, SubmitOrderButton, TransferOrderButton, PrintBillButton, TableGuestsButton, OrderlineNoteButton

As a result, selected buttons will be displayed in the main screen:

  .. image:: ../static/img/important_buttons_displayed.png
