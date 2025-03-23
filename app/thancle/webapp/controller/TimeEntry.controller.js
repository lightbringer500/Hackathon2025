sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("zynas.thancle.controller.TimeEntry", {
		onInit: function () {

            // メッセージの取得元
            this._oI18nModel = this.getOwnerComponent().getModel("i18n");

            // 現在日時(毎秒更新)
            this._updateDateTime();
            setInterval(this._updateDateTime.bind(this), 1000);
            
            // 初期データ表示
			const oModel = new JSONModel({
				tasks: Array.from({ length: 10 }, () => ({
					name: "",
					label: "00:00:00",
                    buttonText: "▶",
					adjustValue: "",
					visible: false,
					started: false,     // タイマー動作状態
					startTime: null,    // 開始時間
                    elapsedTime: 0,     // 経過時間
					timerId: null       // setInterval の ID
				}))
			});
			this.getView().setModel(oModel, "viewModel");
            this._loadInitialData();
		},

 		/**
		 * 初期データを取得してモデルにセット
		 */
		_loadInitialData: function () {
            // モデルを取得し、未設定なら新しく作成
            let oModel = this.getView().getModel("viewModel");
            if (!oModel) {
                oModel = new JSONModel({ tasks: [] });
                this.getView().setModel(oModel, "viewModel");
            }

            // 今日の日付を yyyy-MM-dd 形式で取得
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;

            // OData サービスからデータ取得
            $.ajax({
                url: `/taskEntity/TaskEntity?$filter=userId eq 'admin' and date eq '${formattedDate}'`,
                method: "GET",
                success: function (data) {
                    if (data.value.length > 0) {
                        let taskData = data.value[0];

                        console.log(taskData);

                        // タスクデータをセット
                        let tasks = [];
                        for (let i = 1; i <= 10; i++) {
                            const taskName = taskData[`task${i}`] || "";
                            const taskTime = taskData[`taskTime${i}`] || "00:00:00";
                            const isVisible = taskName !== ""; // データがある場合のみ表示

                            tasks.push({
                                name: taskName,
                                label: taskTime,
                                visible: isVisible,
                                buttonText: "▶",
                                adjustValue: "",
                                started: false,  // タイマー動作状態
                                startTime: null, // 開始時間
                                elapsedTime: 0,  // 経過時間
                                timerId: null    // setInterval の ID
                            });
                        }
                        oModel.setProperty("/tasks", tasks);
					}
				},
				error: function (err) {
					MessageToast.show("データの取得に失敗しました");
					console.error(err);
				}
			});
		},
        
        /**
		 * ボタン押下時のタスク開始/停止処理
		 */
		onToggleTask: function (oEvent) {
			const oButton = oEvent.getSource();
			const sId = oButton.getId();
			const iIndex = parseInt(sId.replace(/\D/g, ""), 10) - 1; // IDからインデックス取得

			const oModel = this.getView().getModel("viewModel");
			const aTasks = oModel.getProperty("/tasks");

			// 現在再生中のタスクを探す
			const iRunningIndex = aTasks.findIndex(task => task.started);

			// すでに再生中のタスクを停止
			if (iRunningIndex !== -1) {
				this._stopTimer(iRunningIndex);
			}

			// 同じボタンなら停止、それ以外なら新規再生
			if (iRunningIndex !== iIndex) {
				this._startTimer(iIndex);
			}
		},

		/**
		 * 指定したタスクのタイマーを開始
		 */
		_startTimer: function (iIndex) {
			const oModel = this.getView().getModel("viewModel");
			const aTasks = oModel.getProperty("/tasks");

			aTasks[iIndex].started = true;
			aTasks[iIndex].startTime = new Date();
			aTasks[iIndex].timerId = setInterval(() => {
                // 追加時間の取得
                const itemStr = "measureAdjust" + (iIndex + 1);
                var oInput = this.byId(itemStr);
                var sValue = oInput.getValue();
                const elapsed = this._calculateElapsed(aTasks[iIndex].startTime, sValue);
				oModel.setProperty(`/tasks/${iIndex}/label`, elapsed);
			}, 1000);

			// ボタンの表示を変更
			oModel.setProperty(`/tasks/${iIndex}/buttonText`, "⏸");
			oModel.refresh();
		},

		/**
		 * 指定したタスクのタイマーを停止
		 */
		_stopTimer: function (iIndex) {
			const oModel = this.getView().getModel("viewModel");
			const aTasks = oModel.getProperty("/tasks");

			clearInterval(aTasks[iIndex].timerId);
			aTasks[iIndex].started = false;
			// aTasks[iIndex].timerId = null;
            aTasks[iIndex].elapsedTime += (new Date() - aTasks[iIndex].startTime);	aTasks[iIndex].timerId = null;
            aTasks[iIndex].timerId = null;

			// ボタンの表示を元に戻す
			oModel.setProperty(`/tasks/${iIndex}/buttonText`, "▶");
			oModel.refresh();
		},

		/**
		 * 経過時間を計算
		 */
		_calculateElapsed: function(startTime, elapsedTime) {
            const now = new Date();
            let diff;
        
            // "-"のみの場合は経過時間を計算しない
            if (elapsedTime === "-") {
                diff = now - startTime;
            } else {
                // elapsedTimeを分からミリ秒に変換
                const elapsedMilliseconds = elapsedTime * 60 * 1000;
                diff = now - startTime + elapsedMilliseconds;
            }
        
            // マイナス値の場合は0に設定
            diff = Math.max(diff, 0);
        
            const seconds = Math.floor(diff / 1000) % 60;
            const minutes = Math.floor(diff / 60000) % 60;
            const hours = Math.floor(diff / 3600000);
        
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
            this.byId("currentTime").setText(dateTimeString);
        },

        /**
         * 時間追加分の入力時の制限
         * 数値とハイフン（マイナス）許可
         */
        onValidateInput: function(oEvent) {
            var sValue = oEvent.getParameter("value"); // 入力値を取得
            var oInput = oEvent.getSource(); // Inputコントロール自体を取得
          
            // 空の場合はエラーをリセット
            if (sValue === "") {
              oInput.setValueState("None");
              oInput.setValueStateText("");
              return;
            }
          
            // 正規表現パターン
            var regexValid = /^-?[0-9]*$/; // 数値と先頭ハイフンのみ許可
            var regexLeadingHyphen = /^-/; // ハイフンが先頭にあるか確認
          
            // 入力値が不正な場合
            if (!regexValid.test(sValue)) {
              oInput.setValueState("Error");
              oInput.setValueStateText("数値と先頭のハイフンのみ入力可能です");
              return;
            }
          
            // ハイフンが先頭以外にある場合
            if (sValue.includes("-") && !regexLeadingHyphen.test(sValue)) {
              oInput.setValueState("Error");
              oInput.setValueStateText("ハイフンは先頭にのみ許可されています");
              return;
            }
          
            // 入力が有効な場合
            oInput.setValueState("None");
            oInput.setValueStateText("");
        },

        /**
         * タスクデータ更新
         */
        onEndTask: function () {

            // モデル取得
            const oModel = this.getOwnerComponent().getModel("taskEntity");
            const oController = this;

            // 実行確認
            MessageBox.confirm(this._oI18nModel.getProperty("endOfWorkMessage"), {
                onClose: function (oAction) {
                    // OK以外が押されたら何もしない
                    if (oAction !== MessageBox.Action.OK) return;
 
                    // 送信処理のパラメータ設定
                    const { date, tasks, taskTimes} = oController._getParams();
                    const oOperation = oModel.bindContext("/taskEndAction(...)");
                    oOperation
                        .setParameter("date", date)                             // 今日の日付
                        .setParameter("tasks", JSON.stringify(tasks))           // タスク一覧(JSON文字列に変換)
                        .setParameter("taskTimes", JSON.stringify(taskTimes));  // 経過時間一覧(JSON文字列に変換)

                    // 処理実行
                    oOperation.invoke()
                        .then(() => {
                            const { error } = oOperation.getBoundContext().getValue();
                            if (error) {
                                // 登録時のチェックでエラー
                                MessageBox.error(oController._oI18nModel.getProperty(error));
                                return;
                            }
                            console.log("─────タスク更新成功!!─────")
                            MessageBox.success(oController._oI18nModel.getProperty("timeEndSuccessMessage"), {
                                onClose: function () {
                                    window.close();
                                }
                            });
                        })
                        .catch(oError => oController._handlePresentError(oError));
                }.bind(this) // スコープの明示的なバインド
            });
        },

        /**
         * 画面に入力されたパラメータを取得する
         * @returns 
         * @memberOf zynas.thancle.controller.TimeEntity
         */
        _getParams: function () {
            // 今日の日付
			const today = new Date();
			const todayFormatted = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

            // 画面のタスクデータ取得
            const oView = this.getView();
            const oViewModel = oView.getModel("viewModel");
            const oData = oViewModel.getData();

            // タスクデータをリスト化
            const tasks = [];
            const taskTimes = [];
            for (let i = 0; i < 10; i++) {
                if (oData.tasks[i].visible) {
                    tasks.push(oData.tasks[i].name);
                    taskTimes.push(oData.tasks[i].label); // 経過時間
                } else {
                    tasks.push("");  // 非表示のタスクは空文字
                    taskTimes.push("");
                }
            }
        
            return { "date": todayFormatted, "tasks": tasks, "taskTimes": taskTimes };
        },

        /**
         * タスク更新時エラー
         * @param {*} oError 
         * @memberOf zynas.thancle.controller.TimeEntry
         */
        _handlePresentError: function (oError) {
            // メッセージを表示
            MessageBox.error(this._oI18nModel.getProperty("timeErrorMessage"));
            console.error(oError);
        },
    

        
		// onAddTask: function () {
		// 	// モデル取得
		// 	var viewModel = this.getView().getModel("viewModel");
		// 	var tasks = viewModel.getProperty("/tasks");

		// 	// 空いているスロットを探す
		// 	for (var i = 0; i < tasks.length; i++) {
		// 		if (!tasks[i].visible) {
		// 			// 新しいタスクを追加
		// 			tasks[i] = { name: "新規タスク", label: "新しい作業", extraValue: "", visible: true };
		// 			viewModel.setProperty("/tasks", tasks);
		// 			break;
		// 		}
		// 	}
		// }
	});
});
