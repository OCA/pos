In the Point of Sale UI, click a cart line to select it, then click it
again to reopen the variant configurator on it, pre-filled with the
line's current attribute values. Pick a different variant and confirm.

- If the line's quantity is 1, it is updated in place.
- If the quantity is more than 1, only the confirmed unit is split
  onto its own line; the rest stays on the original variant.
- If the line was already sent to the kitchen printer, it is replaced
  (removed, then re-added with the new variant) so the change is
  correctly reported as a cancellation and a new addition. Otherwise
  it is simply updated in place.

Note, customer note, and discount are kept when a line is split or
replaced.

The change is refused, with an explanatory message, if the line
already has lot/serial numbers assigned.
