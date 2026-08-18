from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def load_data(self, models_to_load):
        response = super().load_data(models_to_load)
        records = response.get("hr.employee")
        if not isinstance(records, list) or not records:
            return response

        group = self.env.ref(
            "pos_blind_session_closing.group_pos_close_session_amounts",
            raise_if_not_found=False,
        )
        if not group:
            return response

        user_ids = set()
        for record in records:
            user_id = self._get_employee_user_id(record)
            if user_id:
                user_ids.add(user_id)
        users_with_group = set()
        if user_ids:
            users_with_group = set(
                self.env["res.users"]
                .browse(list(user_ids))
                .filtered(lambda user: group.id in user.all_group_ids.ids)
                .ids
            )

        for record in records:
            user_id = self._get_employee_user_id(record)
            record["_can_see_closing_amounts"] = bool(
                user_id and user_id in users_with_group
            )

        return response

    @staticmethod
    def _get_employee_user_id(record):
        user_id = record.get("user_id")
        if not user_id:
            return False
        if isinstance(user_id, (list, tuple)):
            return user_id[0]
        return user_id
