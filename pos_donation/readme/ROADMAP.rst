* If there is no partner set on the PoS order, a donation is not created.
  There should be a user warning in the PoS to avoid this.
* If there are multiple donation products used in the same PoS order, a donation is not created.
  This is because the ``default_tax_receipt_option`` is currently defined on the ``product.template``.
  It would be better to define it on on a more global record, like the ``pos.config``.
