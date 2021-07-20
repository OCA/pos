12.0.3.0.0 (2019-08-13)
~~~~~~~~~~~~~~~~~~~~~~~

* [MIG] Port module to version 12.0.
* [REF] Don't use ``product.product`` model for Reasons, because Odoo remove
  the fields ``expense_pdt`` ``and income_pdt`` from the model.
  Use instead a new model ``pos.move.reason`` for this purpose.
* [REF] Doesn't inherit from ``cash.box.in`` and ``cash.box.out`` model,
  as there are bad designed and doesn't allow clean inheritance.
  Instead, use new transient model ``wizard.pos.move.reason``.

8.0.2.0.0 (2018-06-25)
~~~~~~~~~~~~~~~~~~~~~~

* [REF] Minor code refactoring.

8.0.1.0.0 (2017-06-08)
~~~~~~~~~~~~~~~~~~~~~~

* First Version of the module.
