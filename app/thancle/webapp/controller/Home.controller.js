sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/Input"
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
        
            // 現在日時(毎秒更新)
            this._updateDateTime();
            setInterval(this._updateDateTime.bind(this), 1000);
        },
        
        /**
         * 日付ラベル更新処理
         */
        _updateDateTime: function () {
            // 日付取得
            const now = new Date();
        
            // 日付
            const formattedDate = now.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric"
            });
            
            // 曜日
            const weekday = now.toLocaleDateString("ja-JP", { weekday: "short" }).charAt(0);
            
            // 時間 (HH:MM:SS)
            const formattedTime = now.toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });

            // 表示
            const dateTimeString = `${formattedDate} (${weekday}) ${formattedTime}`;
            this.byId("todayText").setText(dateTimeString);
        },

        /**
         * タスク追加ボタン押下時
         */
        onAddTask: function () {
            var i;
            // 4～10番のタスクを順番に取得
            for (i = 4; i <= 10; i++) {
                var oTask = this.byId("taskLabel" + i);
                if (!oTask.getVisible()) {
                    oTask.setVisible(true); // 非表示のものを1つだけ表示
                    break;
                }
            }
            if (i == 10) {
                this.byId("taskAddButton").setVisible(false);
            }
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

    });
});
