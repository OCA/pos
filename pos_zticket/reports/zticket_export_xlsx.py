# Copyright 2019 Coop IT Easy SCRLfs
# @author Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, models
from odoo.exceptions import UserError


class ZTicketExportXlsx(models.AbstractModel):
    _name = "report.pos_zticket.zticket_export_xlsx"
    _inherit = "report.report_xlsx.abstract"

    def _get_ws_params(self, wb, data, sessions):
        session_template = {
            "nom": {
                "header": {"value": "Nom"},
                "data": {"value": self._render("session.name")},
                "width": 20,
            },
            "ouverture": {
                "header": {"value": "Date d'ouverture"},
                "data": {
                    "value": self._render(
                        "'{:%Y/%m/%d %H:%M:%S}'.format(session.start_at)"
                    )
                },
                "width": 20,
            },
            "fermeture": {
                "header": {"value": "Date de fermeture"},
                "data": {
                    "value": self._render(
                        "'{:%Y/%m/%d %H:%M:%S}'.format(session.stop_at)"
                    )
                },
                "width": 20,
            },
            "pos": {
                "header": {"value": "Point de vente"},
                "data": {"value": self._render("session.config_id.name")},
                "width": 20,
            },
            "responsable": {
                "header": {"value": "Responsable"},
                "data": {
                    "value": self._render("session.user_id.display_name")
                },
                "width": 20,
            },
            "total_ttc": {
                "header": {"value": "Total des transactions TTC"},
                "data": {
                    "value": self._render(
                        "sum(session.order_ids.mapped('amount_total'))"
                    )
                },
                "width": 20,
            },
            "total_remise": {
                "header": {"value": "dont Remises"},
                "data": {
                    "value": self._render(
                        "sum(map(lambda line: line.price_unit*line.qty*(line.discount/100), session.mapped('order_ids').mapped('lines'))) + abs(sum(session.mapped('order_ids').mapped('lines').filtered(lambda line: line.product_id.id == session.config_id.discount_product_id.id).mapped('price_subtotal_incl')))"
                    )
                },
                "width": 20,
            },
            "total_ht": {
                "header": {"value": "Total des transactions HT"},
                "data": {
                    "value": self._render(
                        "sum(session.order_ids.mapped('amount_total')) - sum(session.order_ids.mapped('amount_tax'))"
                    )
                },
                "width": 20,
            },
            "solde_initial": {
                "header": {"value": "Solde initial"},
                "data": {
                    "value": self._render(
                        "sum(session.statement_ids.filtered(lambda x: x.journal_id.type == 'cash').mapped('balance_start'))"
                    )
                },
                "width": 20,
            },
            "cash_in": {
                "header": {"value": "Entrées d'espèces"},
                "data": {
                    "value": self._render(
                        "sum(session.statement_ids.filtered(lambda x: x.journal_id.type == 'cash').mapped('line_ids').filtered(lambda x: x.amount > 0 and x.account_id.user_type_id.type == 'other' and x.account_id.user_type_id.internal_group == 'asset').mapped('amount'))"
                    )
                },
                "width": 20,
            },
            "cash_out": {
                "header": {"value": "Sorties d'espèces"},
                "data": {
                    "value": self._render(
                        "-1 * sum(session.statement_ids.filtered(lambda x: x.journal_id.type == 'cash').mapped('line_ids').filtered(lambda x: x.amount < 0 and x.account_id.user_type_id.type == 'other' and x.account_id.user_type_id.internal_group == 'asset').mapped('amount'))"
                    )
                },
                "width": 20,
            },
            "solde_final": {
                "header": {"value": "Solde final"},
                "data": {
                    "value": self._render(
                        "sum(session.statement_ids.filtered(lambda x: x.journal_id.type == 'cash').mapped('balance_end'))"
                    )
                },
                "width": 20,
            },
            "pertes": {
                "header": {"value": "Pertes en espèces"},
                "data": {
                    "value": self._render(
                        "-1 * sum(session.statement_ids.filtered(lambda x: x.journal_id.type == 'cash').mapped('line_ids').filtered(lambda x: x.account_id.user_type_id.type == 'other' and x.account_id.user_type_id.internal_group == 'expense').mapped('amount'))"
                    )
                },
                "width": 20,
            },
            "benefices": {
                "header": {"value": "Bénéfices en espèces"},
                "data": {
                    "value": self._render(
                        "sum(session.statement_ids.filtered(lambda x: x.journal_id.type == 'cash').mapped('line_ids').filtered(lambda x: x.account_id.code and (x.account_id.code.startswith('488') or (x.account_id.user_type_id.type == 'other' and x.account_id.user_type_id.internal_group == 'income'))).mapped('amount'))"
                    )
                },
                "width": 20,
            },
            "tickets_nbr": {
                "header": {"value": "Nombre de tickets"},
                "data": {"value": self._render("len(session.order_ids)")},
                "width": 20,
            },
            "tickets_moy": {
                "header": {"value": "Ticket moyen"},
                "data": {
                    "value": self._render(
                        "round(sum(session.order_ids.mapped('amount_total'))/len(session.order_ids), 2)"
                    )
                },
                "width": 20,
            },
            "nb_produits": {
                "header": {"value": "Nombre de produits"},
                "data": {
                    "value": self._render(
                        "len(session.mapped('order_ids').mapped('lines'))"
                    )
                },
                "width": 20,
            },
            "marge_ht": {
                "header": {"value": "Marge HT"},
                "data": {"value": self._render("session.margin_total")},
                "width": 20,
            },
            "marge_pourcentage": {
                "header": {"value": "Marge (%)"},
                "data": {"value": self._render("round(session.markup_rate)")},
                "width": 20,
            },
            "date": {
                "header": {"value": "Date"},
                "data": {
                    "value": self._render("'{:%d-%m-%Y}'.format(line['date'])")
                },
                "width": 20,
            },
            "compte_lib_code": {
                "header": {"value": "Code de libellé"},
                "data": {"value": self._render("line['acc'].code")},
                "width": 50,
            },
            "compte_lib": {
                "header": {"value": "Libellé"},
                "data": {"value": self._render("line['acc'].name")},
                "width": 50,
            },
            "compte_num": {
                "header": {"value": "Numéro de compte"},
                "data": {"value": self._render("line['acc'].code")},
                "width": 20,
            },
            "debit": {
                "header": {"value": "Débit"},
                "data": {"value": self._render("line['debit']")},
                "width": 20,
            },
            "credit": {
                "header": {"value": "Crédit"},
                "data": {"value": self._render("line['credit']")},
                "width": 20,
            },
            "paiements_num": {
                "header": {"value": "Nombre de paiements"},
                "data": {"value": self._render("line['nb_transactions']")},
                "width": 20,
            },
        }

        wanted_list = [
            "nom",
            "ouverture",
            "fermeture",
            "pos",
            "responsable",
            "total_ttc",
            "total_remise",
            "total_ht",
            "solde_initial",
            "cash_in",
            "cash_out",
            "solde_final",
            "pertes",
            "benefices",
            "tickets_nbr",
            "tickets_moy",
            "nb_produits",
            "marge_ht",
            "marge_pourcentage",
            "date",
            # "compte_lib_code",
            "compte_lib",
            "compte_num",
            "debit",
            "credit",
            "paiements_num",
        ]
        totaux_list = [
            "compte_lib",
            "compte_num",
            "debit",
            "credit",
            "paiements_num",
        ]
        ws_params = {
            "ws_name": "Sessions",
            "generate_ws_method": "_zticket_report",
            "title": "sessions",
            "wanted_list": wanted_list,
            "col_specs": session_template,
        }
        ws_total_params = {
            "ws_name": "Totaux",
            "generate_ws_method": "_zticket_report",
            "title": "totaux",
            "wanted_list": totaux_list,
            "col_specs": session_template,
        }

        return [ws_params, ws_total_params]

    def _aggregate_lines(self, lines, line, get_account):
        try:
            debit = line.amount
        except AttributeError:
            debit = 0
        try:
            credit = line.credit
        except AttributeError:
            credit = 0
        if credit == 0 and debit == 0 and hasattr(line, "debit"):
            # When there is a negative amount
            credit -= line.debit
        nb_transactions = ""
        if line._name == "account.bank.statement.line":
            nb_transactions = 1
            if line.display_name.endswith(
                "return"
            ) or line.display_name.endswith("retour"):
                nb_transactions = 0
        if not lines.get(get_account(line).id):
            lines[get_account(line).id] = {
                "acc": get_account(line),
                "debit": debit,
                "credit": credit,
                "date": line.date,
                "nb_transactions": nb_transactions,
            }
        else:
            lines[get_account(line).id]["debit"] += debit
            lines[get_account(line).id]["credit"] += credit
            lines[get_account(line).id]["nb_transactions"] += nb_transactions

    def _zticket_report(self, workbook, ws, ws_params, data, sessions):

        ws.set_portrait()
        ws.fit_to_pages(1, 0)
        ws.set_header(self.xls_headers["standard"])

        self._set_column_width(ws, ws_params)

        row_pos = 0
        row_pos = self._write_line(
            ws,
            row_pos,
            ws_params,
            col_specs_section="header",
            default_format=self.format_theader_yellow_left,
        )
        ws.freeze_panes(row_pos, 0)

        all_lines = []
        for session in sessions:
            lines = []
            obj_account_move_lines = self.env["account.move.line"].browse()
            stat_lines = {}
            for order in session.order_ids:
                for stat_line in order.statement_ids:
                    self._aggregate_lines(
                        stat_lines,
                        stat_line,
                        lambda x: x.statement_id.account_id,
                    )

                om = order.account_move
                # When order.account_move empty but the account.move exists
                if not om or len(om) == 0:
                    om = self.env["account.move"].search(
                        [
                            ("ref", "=", order.name),
                            ("journal_id", "=", order.sale_journal.id),
                        ],
                        limit=1,
                    )
                for om_line in om.line_ids:
                    # Ensure each line is unique
                    obj_account_move_lines |= om_line

            lines.extend(stat_lines.values())

            o_m_lines = {}
            for om_line in obj_account_move_lines:
                if om_line.account_id.user_type_id.type == "receivable":
                    # No account.move.lines for receivable account
                    # to avoid redundancy with statements
                    continue
                if not om_line.tax_ids and not om_line.tax_line_id:
                    if not self.env.user.company_id.fallback_account_id:
                        raise UserError(
                            _(
                                "The company {} does not have a fallback account"
                                " configured, but this report contains moves for"
                                " which no tax was defined. Please set one and retry."
                            ).format(self.env.user.company_id.name)
                        )
                    account_missing_tva = self.env["account.account"].new(
                        {
                            "name": "TVA non renseignée (équivalent 0%)",
                            "code": self.env.user.company_id.fallback_account_id.code,
                        }
                    )
                    o_m_lines[0] = {
                        "acc": account_missing_tva,
                        "debit": 0,
                        "credit": 0,
                        "date": om_line.date,
                        "nb_transactions": "",
                    }
                self._aggregate_lines(
                    o_m_lines, om_line, lambda x: x.account_id
                )

            lines.extend(o_m_lines.values())
            all_lines.extend(lines)

            if ws_params["title"] == "sessions":
                for line in lines:
                    row_pos = self._write_line(
                        ws,
                        row_pos,
                        ws_params,
                        col_specs_section="data",
                        render_space={"session": session, "line": line},
                        default_format=self.format_tcell_left,
                    )
        if ws_params["title"] == "totaux":
            lines_subtotal = {}
            for line in all_lines:
                line_subtotal = lines_subtotal.get(line["acc"].code)
                if line_subtotal:
                    line_subtotal["debit"] += line["debit"]
                    line_subtotal["credit"] += line["credit"]
                    line_subtotal["nb_transactions"] += line["nb_transactions"]
                else:
                    lines_subtotal[line["acc"].code] = line

            account_total = self.env["account.account"].new(
                {"name": "TOTAL", "code": ""}
            )
            total = {
                "acc": account_total,
                "debit": 0,
                "credit": 0,
                "nb_transactions": "",
            }
            for line_subtotal in sorted(
                lines_subtotal.values(),
                key=lambda x: str(x["nb_transactions"]),
            ):
                # The rounding here prevents values of almost-zero.
                line_subtotal["debit"] = round(line_subtotal["debit"], 2)
                total["debit"] += line_subtotal["debit"]
                line_subtotal["credit"] = round(line_subtotal["credit"], 2)
                total["credit"] += line_subtotal["credit"]
                row_pos = self._write_line(
                    ws,
                    row_pos,
                    ws_params,
                    col_specs_section="data",
                    render_space={"line": line_subtotal},
                    default_format=self.format_tcell_left,
                )
            row_pos = self._write_line(
                ws,
                row_pos,
                ws_params,
                col_specs_section="data",
                render_space={"line": total},
                default_format=self.format_tcell_left,
            )
