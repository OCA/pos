odoo.define("pos_screen_lock.Chrome", function (require) {
    "use strict";

    const ChromeWidget = require("point_of_sale.Chrome");
    const Registries = require("point_of_sale.Registries");
    const {Gui} = require("point_of_sale.Gui");
    const core = require("web.core");
    const _t = core._t;

    let idleTime = 0;
    let idleWarningTime = 0;

    const PosScreenLockChrome = (Chrome) =>
        class extends Chrome {
            _buildChrome() {
                super._buildChrome();

                if (this.env.pos.config.iface_screen_lock) {
                    this.setTimers();
                    $(document).on("click", () => this.resetTimers());
                }
            }

            get screen_lock_time() {
                return this.env.pos.config.screen_lock_time;
            }

            get warning_screen_lock_time() {
                return this.env.pos.config.warning_screen_lock_time;
            }

            setTimers() {
                this.lockInterval = setInterval(this.timerIncrement.bind(this), 60000);

                if (this.env.pos.config.iface_screen_lock_warning) {
                    this.warningInterval = setInterval(
                        this.timeWarningIncrement.bind(this),
                        60000
                    );
                }
            }

            resetTimers() {
                if (this.lockInterval) {
                    clearInterval(this.lockInterval);
                }

                if (this.warningInterval) {
                    clearInterval(this.warningInterval);
                }

                idleTime = 0;
                idleWarningTime = 0;
                this.setTimers();
            }

            isLoginScreen() {
                return (
                    this.tempScreen.name === "LoginScreen" && this.tempScreen.isShown
                );
            }

            timeWarningIncrement() {
                idleWarningTime += 1;
                if (
                    idleWarningTime >= this.warning_screen_lock_time &&
                    !this.isLoginScreen()
                ) {
                    const minutesUntilLock =
                        this.screen_lock_time - this.warning_screen_lock_time;
                    Gui.showPopup("ConfirmPopup", {
                        title: _t("Warning Idle"),
                        body:
                            _t("The system will lock in ") +
                            minutesUntilLock +
                            _t(" minutes."),
                    });
                }
            }

            timerIncrement() {
                idleTime += 1;
                if (idleTime >= this.screen_lock_time && !this.isLoginScreen()) {
                    if (this.popup.isShown) {
                        this.trigger("close-popup");
                    }
                    this.env.pos.get_order().finalize();
                    this.trigger("close-pos");
                }
            }
        };

    Registries.Component.extend(ChromeWidget, PosScreenLockChrome);

    return ChromeWidget;
});
