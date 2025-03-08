sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
], (Controller, Fragment) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.Home', {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf zynas.thancle.controller.Home
         */
        onInit: function () {
            const oView = this.getView();
            oView.bindElement({
                path: "/home",
                model: "user",
                events: {
                    dataReceived: this._onDataReceived.bind(this),
                }
            });

            // 今日の日付を表示
            this.byId("todayText").setText(new Date().toLocaleDateString());
        },

        /**
         * ログインユーザー情報の取得結果により処理を実行する
         * @memberOf zynas.thancle.controller.Home
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
         * @memberOf zynas.thancle.controller.Home
         *
         * @param {*} oContext 
         */
        _setVisibleAdminButton: function (oContext) {
            const isAdmin = !!oContext.getProperty("roles/admin");
            const oAdminButton = this.byId("homeHeaderButton");
            oAdminButton.setVisible(isAdmin);
        },

        /**
         * NotFoundダイアログを表示する
         * @memberOf zynas.thancle.controller.Home
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
         * @memberOf zynas.thancle.controller.Home
         */
        onDialogClose: function () {
            this._oDialog.close();
        },

        /**
         * 賞品ページに遷移
         * @memberOf zynas.thancle.controller.Home
         */
        onOpenPrizes: function(){
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("prizes");
        },

        /**
         * ありがとうを贈るページに遷移
         * @memberOf zynas.thancle.controller.Home
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
