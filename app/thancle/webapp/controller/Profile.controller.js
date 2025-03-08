sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
], (Controller, Fragment) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.Profile', {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf zynas.thancle.controller.Profile
         */
        onInit: function () {
            const oView = this.getView();
            oView.bindElement({
                path: "/profile",
                model: "user",
                events: {
                    dataReceived: this._onDataReceived.bind(this),
                }
            });

        },

        /**
         * ログインユーザー情報の取得結果により処理を実行する
         * @memberOf zynas.thancle.controller.Profile
         *
         * @param {*} oEvent 
         */
        _onDataReceived: function (oEvent) {
            const oContext = oEvent.getSource().getBoundContext();
            if (oContext.getProperty("email")) {
                this._setVisibleAdminButton(oContext);
                return;
            }
            this._openDialog();
        },

        /**
         * ログインユーザーのロールにしたがって、ボタンの表示を制御する
         * @memberOf zynas.thancle.controller.Profile
         *
         * @param {*} oContext 
         */
        _setVisibleAdminButton: function (oContext) {
            const isAdmin = !!oContext.getProperty("roles/admin");
            const oAdminButton = this.byId("profileHeaderButton");
            oAdminButton.setVisible(isAdmin);
        },

        /**
         * NotFoundダイアログを表示する
         * @memberOf zynas.thancle.controller.Profile
         */
        _openDialog: function () {
            if (!this._oDialog) {
                Fragment.load({
                    name: "zynas.thancle.view.fragments.LoginUserNotFoundDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(this._oDialog);
                    this._oDialog.open();
                }.bind(this));
            } else {
                this._oDialog.open();
            }
        },

        /**
         * ダイアログを閉じる
         * @memberOf zynas.thancle.controller.Profile
         */
        onDialogClose: function () {
            this._oDialog.close();
        },

        /**
         * 賞品ページに遷移
         * @memberOf zynas.thancle.controller.Profile
         */
        onOpenPrizes: function(){
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("prizes");
        },

        /**
         * ありがとうを贈るページに遷移
         * @memberOf zynas.thancle.controller.Profile
         */
        onPressThanksButton: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("thanks");
        },

        /**
         * 社員一覧ページに遷移
         * 
         */
        onEmployeesButton: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("employees");
        },
    });
});
