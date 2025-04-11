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

            // 初期化
            let oViewModel = new JSONModel({
                taskEntity: []
            });

            // modelセット
            this.getView().setModel(oViewModel, "taskEntity");

            // 初期表示
            this._loadTaskEntityData();
        },

        /**
         * taskEntityデータの読み込みと合計時間の計算
         */
        _loadTaskEntityData: function () {
            const oModel = this.getOwnerComponent().getModel("taskEntity");
            if (!oModel) {
                return;
            }

            // ユーザーID取得
            var userId = "admin";

            let oneDayCalc = 0;
            let monthDaysCalc = 0;

            // 基準工数の取得
			$.ajax({
				url: "/template/Template?$filter=userId eq 'admin'", // userId は適宜変更
				method: "GET",
				success: function (data) {
					if (data.value.length > 0) {
						let templateData = data.value[0];

                        // 人日、人月の基準値を取得
                        oneDayCalc = templateData.oneDay;
                        monthDaysCalc = templateData.monthDays;
					}
				},
				error: function (err) {
					MessageToast.show("データの取得に失敗しました");
					console.error(err);
				}
			});
            
            // タスク情報の取得
            $.ajax({
                url: `/taskEntity/TaskEntity?$filter=userId eq 'admin'`,
                method: "GET",
                success: function (data) {

                    // taskEntity のデータを計算する
                    const oTaskEntity = data.value.map(task => {
                        // taskTime1 ～ taskTime10 の配列
                        const taskTimes = [
                            task.taskTime1, task.taskTime2, task.taskTime3, task.taskTime4,
                            task.taskTime5, task.taskTime6, task.taskTime7, task.taskTime8,
                            task.taskTime9, task.taskTime10
                        ];

                        // 合計時間を計算（時間、分、秒を秒に変換して合算）
                        const totalSeconds = taskTimes.reduce((acc, time) => {
                            if (time) {
                                const [hours, minutes, seconds] = time.split(":").map(num => parseInt(num, 10));
                                return acc + (hours * 3600) + (minutes * 60) + seconds; // 秒単位で加算
                            }
                            return acc;
                        }, 0);

                        // 合計秒数を時間、分、秒に変換
                        const totalHours = Math.floor(totalSeconds / 3600); // 時間部分
                        const totalMinutes = Math.floor((totalSeconds % 3600) / 60); // 分部分
                        // HH時間MM分 形式で表示
                        const formattedTime = `${totalHours}時間${totalMinutes}分`;

                        // 人日計算
                        let oneDayCalcResult = totalSeconds / (oneDayCalc * 3600);
                        oneDayCalcResult = (Math.round(oneDayCalcResult * 100) / 100) + '人日'

                        // 人月計算
                        let monthDaysCalcResult = totalSeconds / (monthDaysCalc * oneDayCalc * 3600);
                        monthDaysCalcResult = (Math.round(monthDaysCalcResult * 1000) / 1000) + '人月';

                        return {
                            date: task.date,
                            totalTime: formattedTime,
                            oneDayCalc: oneDayCalcResult,
                            monthDaysCalc: monthDaysCalcResult,
                            raw: task  // 生データ
                        };
                    });

                    // 計算後のデータをJSONModelにセット
                    const oTaskEntityModel = this.getView().getModel("taskEntity");
                    oTaskEntityModel.setProperty("/taskEntity", oTaskEntity);
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
            console.log("─────戻るボタン押下─────");
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
            console.log("─────詳細ボタン押下─────");
            const oContext = oEvent.getSource().getBindingContext("taskEntity");
            if (!oContext) {
                return;
            }
        
            const selectedDate = oContext.getProperty("date");
            if (!selectedDate) {
                return;
            }

            // 詳細ページに遷移
            const url = window.location.href.split('#')[0] + "#/timeEntry/" + selectedDate;
            window.open(url, "_blank", "width=800,height=550");
        }
    });
});
