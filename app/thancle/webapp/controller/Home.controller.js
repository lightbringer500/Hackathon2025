sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/Input"
], (Controller, JSONModel, Fragment, MessageBox) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.Home', {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf zynas.thancle.controller.Home
         */
        onInit: function () {

            const oView = this.getView();
            const oModel = this.getOwnerComponent().getModel("user");
        
            console.log("モデル取得:", oModel);
        
            if (!oModel) {
                console.error("モデル 'user' が未設定です！");
                return;
            }

            // const oView = this.getView();
            oView.bindElement({
                path: "/profile",
                model: "user",
                events: {
                    dataReceived: this._onDataReceived.bind(this),
                }
            });
        
            // メッセージの取得元
            this._oI18nModel = this.getOwnerComponent().getModel("i18n");

            // 現在日時(毎秒更新)
            this._updateDateTime();
            setInterval(this._updateDateTime.bind(this), 1000);

            // 初期データ表示
			let oViewModel = new JSONModel({
				oneDay: "",
				monthDays: "",
				tasks: ["", "", "", "", "", "", "", "", "", ""],
				visibility: [true, true, true, false, false, false, false, false, false, false]
			});
			this.getView().setModel(oViewModel, "viewModel");
			this._loadInitialData();
        },

 		/**
		 * 初期データを取得してモデルにセット
		 */
		_loadInitialData: function () {
			const oModel = this.getView().getModel("viewModel");

			// OData サービスからデータ取得
			$.ajax({
				url: "/template/Template?$filter=userId eq 'admin'", // userId は適宜変更
				method: "GET",
				success: function (data) {
					if (data.value.length > 0) {
						let templateData = data.value[0];

						// 単価データをセット
						oModel.setProperty("/oneDay", templateData.oneDay);
						oModel.setProperty("/monthDays", templateData.monthDays);

                        // タスクデータをセット
                        let tasks = [];
                        for (let i = 1; i <= 10; i++) {
                            tasks.push(templateData[`task${i}`] || ""); // 空なら空文字
                        }
                        oModel.setProperty("/tasks", tasks);
                        // 表示制御
                        let visibility = tasks.map((task, index) => index < 3 || task !== ""); // 1～3はtrue、以降はデータがあればtrue
                        oModel.setProperty("/visibility", visibility);
					}
				},
				error: function (err) {
					MessageToast.show("データの取得に失敗しました");
					console.error(err);
				}
			});
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
            let iNextTask = 4; // 4番目から表示開始
            let oView = this.getView();
        
            while (iNextTask <= 10) {
                let oTask = oView.byId("taskLabel" + iNextTask);
                // `oTask` が存在し、かつ非表示なら表示に変更
                if (oTask && !oTask.getVisible()) {
                    oTask.setVisible(true);
                    break; // 1つだけ表示して終了
                }
                iNextTask++;
            }
        
            // すべてのタスクが表示されたら追加ボタン非表示
            if (iNextTask >= 10) {
                oView.byId("taskAddButton").setVisible(false);
            }
        },

        /**
         * テンプレート情報の登録
         * @memberOf zynas.thancle.controller.Home
         */
        onPressTemplate: async function () {
            // 入力確認
            if (this._hasInputError()) {
                MessageBox.confirm(this._oI18nModel.getProperty("inputErrorMessage"));
                return;
            }

            // モデル取得
            const oModel = this.getOwnerComponent().getModel("template");
            const oController = this;

            // 実行確認
            MessageBox.confirm(this._oI18nModel.getProperty("templateConfirmMessage"), {
                onClose: function (oAction) {
                    // OK以外が押されたら何もしない
                    if (oAction !== MessageBox.Action.OK) return;

                    // 送信処理のパラメータ設定
                    const { date, oneDay, monthDays, tasks } = oController._getParams();
                    const oOperation = oModel.bindContext("/templateAction(...)");
                    oOperation
                        .setParameter("oneDay", oneDay)                 // 1日の時間
                        .setParameter("monthDays", monthDays)           // 月の日数
                        .setParameter("tasks", JSON.stringify(tasks));  // タスク一覧(JSON文字列に変換)

                    // 処理実行
                    oOperation.invoke()
                        .then(() => {
                            const { error } = oOperation.getBoundContext().getValue();
                            if (error) {
                                // 登録時のチェックでエラー
                                MessageBox.error(oController._oI18nModel.getProperty(error));
                                return;
                            }
                            // 登録成功メッセージを表示して画面再読み込み
                            console.log("─────テンプレート登録成功!!─────");
                            MessageBox.success(oController._oI18nModel.getProperty("templateSuccessMessage"), {
                                onClose: function () {
                                    location.reload(); // 画面リロード
                                }
                            });
                            
                        })
                        .catch(oError => oController._handlePresentError(oError));
                }
            });
        },

        /**
         * 時間計測ページへの遷移 (初期データ登録)
         * @memberOf zynas.thancle.controller.TimeEntry
         * Author : watanabe shuto
         */
        onStartTask: function () {

            console.log("─────▶ボタン押下─────")

            // モデル取得
            const oModel = this.getOwnerComponent().getModel("taskEntity");
            const oController = this;

            // 実行確認
            MessageBox.confirm(this._oI18nModel.getProperty("startOfWorkMessage"), {
                onClose: function (oAction) {
                    // OK以外が押されたら何もしない
                    if (oAction !== MessageBox.Action.OK) return;

                    // 送信処理のパラメータ設定
                    const { date, oneDay, monthDays, tasks } = oController._getParams();
                    const oOperation = oModel.bindContext("/taskStartAction(...)");
                    oOperation
                        .setParameter("date", date)                    // 今日の日付
                        .setParameter("tasks", JSON.stringify(tasks));  // タスク一覧(JSON文字列に変換)

                    // 処理実行
                    oOperation.invoke()
                        .then(() => {
                            const { error } = oOperation.getBoundContext().getValue();
                            if (error) {
                                // 登録時のチェックでエラー
                                MessageBox.error(oController._oI18nModel.getProperty(error));
                                return;
                            }
                            // 時間計測画面遷移
                            console.log("─────タスク登録成功!!─────");
                            var url = window.location.href.split('#')[0] + "#/timeEntry";
                            window.open(url, "_blank", "width=800,height=400");
                        })
                        .catch(oError => oController._handlePresentError(oError));
                }
            });
        },

        /**
         * 入力チェック
         * @returns 
         * @memberOf zynas.thancle.controller.Home
         */
        _hasInputError: function () {
            var oOneDayText = this.byId("oneDayText");
            var oMonthDaysText = this.byId("monthDaysText");

            // 時間
            if (!oOneDayText.getValue() || !/^\d+$/.test(oOneDayText.getValue())) {
                return true;
            }
            // 日数
            if (!oMonthDaysText.getValue() || !/^\d+$/.test(oMonthDaysText.getValue())) {
                return true;
            }

            return false;
        },
        
        /**
         * 画面に入力されたパラメータを取得する
         * @returns 
         * @memberOf zynas.thancle.controller.Thanks
         */
        _getParams: function () {
            // 今日の日付
			const today = new Date();
			const todayFormatted = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

            // 時間・日付
            const oneDay = this.byId("oneDayText").getValue();
            const monthDays = this.byId("monthDaysText").getValue();
        
            // タスク
            let tasks = [];
            for (let i = 1; i <= 10; i++) {
                let oTask = this.byId("taskLabel" + i);
                if (oTask && oTask.getVisible()) { // `null` チェックと `visible` の確認
                    let taskValue = oTask.getValue();
                    if (taskValue.trim() !== "") {
                        tasks.push(taskValue);
                    }
                }
            }
        
            return { "date": todayFormatted,"oneDay": oneDay, "monthDays": monthDays, "tasks": tasks };
        },

        /**
         * テンプレート登録時エラー
         * @param {*} oError 
         * @memberOf zynas.thancle.controller.Home
         */
        _handlePresentError: function (oError) {
            // メッセージを表示
            MessageToast.show(this._oI18nModel.getProperty("templateErrorMessage"));
            console.error(oError);
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
                // this._setVisibleAdminButton(oContext);
                return;
            }
            // this._openDialog();
        },

        /**
         * ログインユーザーのロールにしたがって、ボタンの表示を制御する
         * @memberOf zynas.thancle.controller.Home
         *
         * @param {*} oContext 
         */
        // _setVisibleAdminButton: function (oContext) {
        //     const isAdmin = !!oContext.getProperty("roles/admin");
        //     const oAdminButton = this.byId("homeHeaderButton");
        //     oAdminButton.setVisible(isAdmin);
        // },

        /**
         * NotFoundダイアログを表示する
         * @memberOf zynas.thancle.controller.Home
         */
        // _openDialog: function () {
        //     if (!this._oDialog) {
        //         Fragment.load({
        //             name: "zynas.thancle.view.fragments.LoginUserNotFoundDialog",
        //             controller: this
        //         }).then(function (oDialog) {
        //             this._oDialog = oDialog;
        //             this.getView().addDependent(this._oDialog);
        //             this._oDialog.open();
        //         }.bind(this));
        //     } else {
        //         this._oDialog.open();
        //     }
        // },

        /**
         * ダイアログを閉じる
         * @memberOf zynas.thancle.controller.Home
         */
        // onDialogClose: function () {
        //     this._oDialog.close();
        // },



    });
});
