At the moment, when we create a new product and choose the unity of measure **kg**, 
we have to tick the checkbox 'To Weigh With Scale' in the Point of Sale part.

We want to speed the process of creating a new product, avoiding filling manually this parameter.


This module adds the field **'To weigh'** in UOM categories (set to **false** by default).

.. image:: ../static/description/uom_categ_toweigh.png
   :alt: Categories of unities of measure
   :width: 900


**→** This field affects every unities contained in this category.

.. image:: ../static/description/uom_toweigh.png
   :alt: Unities of measure with field 'To weigh'
   :width: 900

**→** **AND** it is linked with the parameter **to_weight** in product.template used for example in the Point of Sale app. 

.. image:: ../static/description/uom_pos_change_toweigh_checked.png
   :alt: Change the field 'to weigh' for every product
   :width: 300

* You **CAN'T** change 'To weigh' for one UOM → You have to change in Category and affect all UOM of this category.

.. image:: ../static/description/uom_change_toweigh.png
   :alt: Can't change the field 'to weigh' for one unity of measure
   :width: 900
