sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (Controller, History, JSONModel, MessageBox) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.WorkHistory', {
        onInit: function () {
            const oView = this.getView();
            this._oRouter = this.getOwnerComponent().getRouter();

            // 1. 空のviewModelを作成
            let oViewModel = new JSONModel({
                taskEntity: []
            });

            // 2. viewModelをビューにセット
            this.getView().setModel(oViewModel, "taskEntity");

            // 3. taskEntityデータを読み込む
            this._loadTaskEntityData();
        },

        /**
         * taskEntityデータの読み込みと合計時間の計算
         */
        _loadTaskEntityData: function () {
            const oModel = this.getOwnerComponent().getModel("taskEntity");
            if (!oModel) {
                console.error("モデル 'taskEntity' が正しく取得できていません。");
                return;
            }

            // ユーザーID取得
            var userId = "admin";
            
            // OData サービスからデータ取得
            $.ajax({
                url: `/taskEntity/TaskEntity?$filter=userId eq 'admin'`,
                method: "GET",
                success: function (data) {
                    console.log(data);

                    // taskEntity のデータを計算する
                    const oTaskEntity = data.value.map(task => {
                        // taskTime1 ～ taskTime10 の配列
                        const taskTimes = [
                            task.taskTime1, task.taskTime2, task.taskTime3, task.taskTime4,
                            task.taskTime5, task.taskTime6, task.taskTime7, task.taskTime8,
                            task.taskTime9, task.taskTime10
                        ];

                        // 合計時間を計算 (nullやundefinedの場合は0として計算)
                        const totalTime = taskTimes.reduce((acc, time) => acc + (time ? parseFloat(time) : 0), 0);

                        return {
                            date: task.date,
                            totalTime: totalTime.toFixed(2),  // 小数点2桁にフォーマット
                            raw: task  // 生データ
                        };
                    });

                    // 計算後のデータをJSONModelにセット
                    const oTaskEntityModel = this.getView().getModel("taskEntity");
                    oTaskEntityModel.setProperty("/taskEntity", oTaskEntity);


                    console.log(oTaskEntity);
                    console.log(oTaskEntityModel);

				}.bind(this),
				error: function (err){
					MessageToast.show("データの取得に失敗しました");
					console.error(err);
				}
			});

        },

        /**
         * 戻るボタンの処理
         */
        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this._oRouter.navTo("home", {}, true);
            }
        },

        /**
         * 作業履歴詳細ページに遷移
         */
        onOpenTaskDetail: function (oEvent) {
            // const oContext = oEvent.getSource().getBindingContext("taskEntity");
            // if (!oContext) {
            //     return;
            // }

            // // 作業履歴のIDを抽出
            // const sPath = oContext.getPath();
            // const sId = sPath.split('(').flatMap(path => path.split(')'))[1];
            // if (!sId) {
            //     return;
            // }

            // // 詳細ページに遷移
            // this._oRouter.navTo("taskDetail", {
            //     taskId: window.encodeURIComponent(sId)
            // });

            var url = window.location.href.split('#')[0] + "#/timeEntry";
            window.open(url, "_blank", "width=800,height=550");

            // const selectedDate = "2025-04-05";
            // const baseUrl = window.location.href.split('#')[0];
            // const url = `${baseUrl}#/timeEntry?date=${encodeURIComponent(selectedDate)}`;

            // var date = "2025-04-06"; // 動的に変える
            // var url = window.location.origin + window.location.pathname + "#/timeEntry?date=" + date;
            // window.open(url, "_blank", "width=800,height=550");
        }
    });
});
