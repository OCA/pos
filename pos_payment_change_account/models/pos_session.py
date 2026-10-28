from collections import defaultdict

from odoo import fields, models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _group_payments_by_order(self, split_receivables_cash):
        """
        Group payments by order and separate change amounts.

        Returns:
            tuple: (grouped_receivables, total_change)
                - grouped_receivables: dict with payments as keys, summed
                    amounts per order
                - total_change: dict with payments as keys for negative amounts (change)
        """

        def amounts():
            return {"amount": 0.0, "amount_converted": 0.0}

        # Separate positive (receivables) and negative (change) amounts per order
        grouped_receivables = defaultdict(amounts)
        total_change = defaultdict(amounts)

        # Group by order
        order_payments = defaultdict(list)

        for payment, payment_amounts in split_receivables_cash.items():
            if not payment.payment_method_id.change_account_id:
                grouped_receivables[payment] = payment_amounts
                continue
            order_id = payment.pos_order_id.id if payment.pos_order_id else False
            order_payments[order_id].append((payment, payment_amounts))

        for payments_list in order_payments.values():
            # Find positive and negative amounts
            positive_payments = []
            negative_payments = []

            for payment, payment_amounts in payments_list:
                if payment_amounts["amount"] >= 0:
                    positive_payments.append((payment, payment_amounts))
                else:
                    negative_payments.append((payment, payment_amounts))

            # Sum positive and negative amounts for this order
            if positive_payments:
                # Use the first positive payment as the key
                main_payment = positive_payments[0][0]
                for payment_vals in positive_payments + negative_payments:
                    payment_amounts = payment_vals[1]
                    grouped_receivables[main_payment]["amount"] += payment_amounts[
                        "amount"
                    ]
                    grouped_receivables[main_payment]["amount_converted"] += (
                        payment_amounts["amount_converted"]
                    )

            # Accumulate negative amounts (change) into total
            for payment, payment_amounts in negative_payments:
                total_change[payment]["amount"] += payment_amounts["amount"]
                total_change[payment]["amount_converted"] += payment_amounts[
                    "amount_converted"
                ]

        return dict(grouped_receivables), dict(total_change)

    def _accumulate_amounts(self, data):
        resp = super()._accumulate_amounts(data)
        # Group split_receivables_cash by partner
        if "split_receivables_cash" in resp:
            grouped_receivables, total_change = self._group_payments_by_order(
                resp["split_receivables_cash"]
            )
            resp["split_receivables_cash"] = grouped_receivables
            resp["split_changed_cash"] = total_change
        return resp

    def _get_combine_statement_line_vals(self, journal_id, amount, payment_method):
        # Override to set the liquidity_account_id by change_account_id if specified
        vals = super()._get_combine_statement_line_vals(
            journal_id, amount, payment_method
        )
        if payment_method.type == "cash" and payment_method.change_account_id:
            vals.update(
                {
                    "liquidity_account_id": payment_method.change_account_id.id,
                }
            )
        return vals

    def _get_split_statement_line_vals(self, journal_id, amount, payment):
        # Override to set the liquidity_account_id by change_account_id if specified
        vals = super()._get_split_statement_line_vals(journal_id, amount, payment)
        payment_method = payment.payment_method_id
        if payment_method.type == "cash" and payment_method.change_account_id:
            vals.update(
                {
                    "liquidity_account_id": payment_method.change_account_id.id,
                }
            )
        return vals

    def _update_transfer_moves_cash(self, transfer_moves_cash, payment_method, amounts):
        if not payment_method.change_account_id:
            return
        # Set transfer amounts per payment method
        if payment_method not in transfer_moves_cash:
            transfer_moves_cash[payment_method] = {
                "amount": 0.0,
                "amount_converted": 0.0,
            }
        transfer_moves_cash[payment_method]["amount"] += amounts["amount"]
        transfer_moves_cash[payment_method]["amount_converted"] += amounts[
            "amount_converted"
        ]

    def _group_split_changed_cash_by_payment_method(self, split_changed_cash):
        """Group split_changed_cash amounts by payment method."""
        grouped = dict()
        for payment, amounts in split_changed_cash.items():
            if payment.payment_method_id not in grouped:
                grouped[payment.payment_method_id] = {
                    "amount": 0.0,
                    "amount_converted": 0.0,
                }
            grouped[payment.payment_method_id]["amount"] += amounts["amount"]
            grouped[payment.payment_method_id]["amount_converted"] += amounts[
                "amount_converted"
            ]
        return grouped

    def _create_cash_statement_lines_and_cash_move_lines(self, data):
        """Override to create transfer entries from change_account to cash."""
        # Call parent to create standard cash statement lines
        data = super()._create_cash_statement_lines_and_cash_move_lines(data)

        # Create transfer entries for payments with change_account_id
        split_receivables_cash = data.get("split_receivables_cash", {})
        combine_receivables_cash = data.get("combine_receivables_cash", {})
        split_changed_cash = data.get("split_changed_cash", {})

        split_changed_cash_payment_methods = (
            self._group_split_changed_cash_by_payment_method(split_changed_cash)
        )

        # Create transfer move
        transfer_moves_cash = dict()  # payment_method: amounts

        # Create transfer moves for split payments
        for payment, amounts in split_receivables_cash.items():
            self._update_transfer_moves_cash(
                transfer_moves_cash, payment.payment_method_id, amounts
            )

        # Create transfer moves for combined payments
        for payment_method, amounts in combine_receivables_cash.items():
            self._update_transfer_moves_cash(
                transfer_moves_cash, payment_method, amounts
            )
        for payment_method, amounts in transfer_moves_cash.items():
            # Update amounts with change amounts from split_changed_cash
            if payment_method in split_changed_cash_payment_methods:
                change_amounts = split_changed_cash_payment_methods[payment_method]
                # Subtract (to increase ) change amounts (negative)
                amounts["amount"] -= change_amounts["amount"]
                amounts["amount_converted"] -= change_amounts["amount_converted"]
            self._create_change_to_cash_transfer(payment_method, amounts)

        # Create cash change entry for split_changed_cash
        if split_changed_cash:
            self._create_cash_change_entry(split_changed_cash)

        return data

    def _create_change_to_cash_transfer(self, payment_method, amounts):
        """Create transfer entry: debit cash, credit change_account."""
        if payment_method.type != "cash":
            return
        journal = payment_method.journal_id
        cash_account = journal.default_account_id
        cash_change_account = payment_method.change_account_id

        if not cash_account or not cash_change_account:
            # Skip if no cash/cash receipt account configured
            return

        transfer_move = self.env["account.move"].create(
            {
                "journal_id": journal.id,
                "date": fields.Date.context_today(self),
                "ref": self._get_cash_transfer_label(),
            }
        )

        # Debit: Cash account (final destination)
        debit_line_vals = self._debit_amounts(
            {
                "account_id": cash_account.id,
                "move_id": transfer_move.id,
                "partner_id": False,
            },
            amounts["amount"],
            amounts["amount_converted"],
        )

        # Credit: Cash receipt account (intermediate)
        credit_line_vals = self._credit_amounts(
            {
                "account_id": cash_change_account.id,
                "move_id": transfer_move.id,
                "partner_id": False,
            },
            amounts["amount"],
            amounts["amount_converted"],
        )

        self.env["account.move.line"].create([debit_line_vals, credit_line_vals])
        transfer_move._post()

    def _get_cash_transfer_label(self):
        """Return translatable label for cash transfer."""
        return self.env._("Cash transfer for session: %s", self.name)

    def _create_cash_change_entry(self, split_changed_cash):
        """Create journal entry to move cash change from cash_account to
        cash receipt account.

        One credit line (total change on cash_account) and multiple debit lines
        (one per payment on cash_change_account).
        """
        if not split_changed_cash:
            return

        # Calculate total change and collect payments data
        total_amount = 0.0
        total_amount_converted = 0.0
        payments_data = []

        for payment, amounts in split_changed_cash.items():
            payment_method = payment.payment_method_id
            # Change amounts are negative, so we need to negate them for the entry
            total_amount -= amounts["amount"]
            total_amount_converted -= amounts["amount_converted"]
            payments_data.append(
                {
                    "payment": payment,
                    "payment_method": payment_method,
                    "amount": (amounts["amount"]) * -1,
                    "amount_converted": (amounts["amount_converted"]) * -1,
                }
            )

        if not payments_data:
            return

        # Use the first payment method's journal for the move
        first_payment_method = payments_data[0]["payment_method"]
        journal = first_payment_method.journal_id
        cash_account = journal.default_account_id

        if not cash_account:
            return

        # Create the journal entry
        change_move = self.env["account.move"].create(
            {
                "journal_id": journal.id,
                "date": fields.Date.context_today(self),
                "ref": self.env._("%s: cash change: ", self.name),
            }
        )

        move_lines = []

        # Create debit lines (one per payment on cash_change_account)
        for p_data in payments_data:
            payment = p_data["payment"]
            payment_method = p_data["payment_method"]
            cash_change_account = payment_method.change_account_id

            if not cash_change_account:
                continue

            debit_line_vals = self._debit_amounts(
                {
                    "account_id": cash_change_account.id,
                    "move_id": change_move.id,
                    "partner_id": False,
                    "name": self.env._(
                        "%s: %s - %s",
                        self.name,
                        payment.name or "/",
                        payment.pos_order_id.name,
                    ),
                },
                p_data["amount"],
                p_data["amount_converted"],
            )
            move_lines.append(debit_line_vals)

        # Create one credit line (total change on cash_account)
        credit_line_vals = self._credit_amounts(
            {
                "account_id": cash_account.id,
                "move_id": change_move.id,
                "partner_id": False,
                "name": self.env._("%s: total cash change", self.name),
            },
            total_amount,
            total_amount_converted,
        )
        move_lines.append(credit_line_vals)

        # Create all lines and post the move
        self.env["account.move.line"].create(move_lines)
        change_move._post()

    def _get_other_related_moves(self):
        """Include cash transfer entries in related moves."""
        moves = super()._get_other_related_moves()

        # Add cash transfer entries by searching for moves with our ref pattern
        transfer_moves = self.env["account.move"].search(
            [
                ("ref", "ilike", self.name),
                ("journal_id", "in", self.cash_journal_id.ids),
            ]
        )

        return moves | transfer_moves
