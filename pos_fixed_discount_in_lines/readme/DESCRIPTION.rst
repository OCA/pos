This module allows to apply a fixed discount on a POS order (similar to the feature of pos_fixed_discount) but instead of using a "discount" product with negative price, it applies a percentage discount in line to all products equal to the amount of the fixed discount inputed, eg:

If total amount of order is 200 and user inputs a fixed discount of 20, all lines will have a 10% discount.

If, due to rounding, there is a difference between inputted fixed discount and sum of applied discounts, a service product "Fixed discount rounding" will be added to the order with the amount needed to make the order amount match the fixed discount applied.
