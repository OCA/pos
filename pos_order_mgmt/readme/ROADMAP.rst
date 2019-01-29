* It's possible to return the same order over and over. To avoid so, we should
  load and control if there's a returned line id associated with the original
  order. That would be a great improvement for future revisions.
  This feature is implemented in the module ``pos_order_return`` in the back
  office part, but not in front office part (implemented in this this module).
