Some features we would need to cover in the future:

  - When the field `name` is set to be readonly the module must prevent
    the field to have red border and the possibility to have the cursor,
    and change the background color of the name field could be user
    friendly.
  - In back office, the name *OR* the surname is mandatory. In front
    office, the name *AND* the surname is mandatory. Should be great to
    have a similar behaviour.
  - In back office, default is "company". In front office, default is
    "individual". The behaviour should however depend by *B2B* or *B2C*
    setting in order to set the right default.
  - In individual mode, in back office, it is possible to select the
    parent company. In individual mode, in front office, it is not
    possible. However we would also have to say that odoo doesn't permit
    the parent company selection.

The ticket referencing the above information can be read at
<https://github.com/OCA/pos/pull/775>
