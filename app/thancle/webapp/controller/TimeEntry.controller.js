sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.TimeEntry', {

        /**
         * コントローラーの初期化処理
         */
        onInit: function () {
            // タスク配列の初期化
            this.tasks = [];
            this.taskTimes = [];
            this._loadTaskData();
            this._updateDateTime();
            // 1秒ごとに日時を更新する
            setInterval(this._updateDateTime.bind(this), 1000);
            // 初期表示数
            this._visibleTasksCount = 3;
            this._displayTasks();
            this._displayAddButton();
        },

        /**
         * 現在の日時を更新する
         */
        _updateDateTime: function () {
            const now = new Date();
            const formattedDate = now.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric"
            });
            const weekday = now.toLocaleDateString("ja-JP", { weekday: "short" }).charAt(0);
            const formattedTime = now.toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
            const dateTimeString = `${formattedDate} (${weekday}) ${formattedTime}`;
            // 現在の日時をUIに表示
            this.byId("currentTime").setText(dateTimeString);
        },

        /**
         * タスクデータを読み込む
         */
        _loadTaskData: function () {
            $.ajax({
                url: "/taskEntity/TaskEntity?$filter=userId eq 'admin'",
                method: "GET",
                success: (data) => {
                    if (data.value.length > 0) {
                        // 初期表示数
                        this._visibleTasksCount = 3;
                        const templateData = data.value[0];
                        this._initializeTasks(templateData);
                        this._displayTasks(); // データ取得後に表示
                    }
                },
                error: (err) => {
                    console.error(err);
                    // エラーハンドリング: tasksが未定義のままにならないように初期化
                    this.tasks = [];
                    this._displayTasks();
                }
            });
        },

        /**
         * タスクデータを初期化する
         * @param {Object} templateData テンプレートデータ
         */
        _initializeTasks: function (templateData) {
            for (let i = 1; i <= 10; i++) {
                this.tasks.push({
                    name: templateData[`task${i}`] || "",
                    elapsed: "00:00",
                    started: false,
                    remark: 0
                });
            }
        },

        /**
         * タスクを表示する
         */
        _displayTasks: function () {
            if (!this.tasks) { // tasksが未定義なら初期化
                this.tasks = [];
            }
            const oView = this.getView();
            const taskList = oView.byId("taskList");
        
            // リストアイテムをクリア
            taskList.destroyItems();
            this.tasks.forEach((task, index) => {
                if (index < this._visibleTasksCount) {
                    const taskItem = new sap.m.CustomListItem({
                        content: [
                            new sap.m.Input({ // タスク名を編集可能にする
                                value: task.name,
                                type: "Text",
                                change: (oEvent) => this._updateTaskName(index, oEvent.getParameter("value"))
                            }),
                            new sap.m.Label({ text: task.elapsed }),
                            new sap.m.Button({
                                text: task.started ? "停止" : "開始",
                                press: () => this._toggleTask(index)
                            }),
                            new sap.m.Input({
                                value: task.remark,
                                type: "Number",
                                change: (oEvent) => this._updateRemark(index, oEvent.getParameter("value"))
                            })
                        ]
                    });
                    taskList.addItem(taskItem);
                }
            });
        },
        
        /**
         * タスクの開始/停止を切り替える
         * @param {Number} index タスクのインデックス
         */
        _toggleTask: function (index) {
            const task = this.tasks[index];
            if (task.started) {
                // 停止処理
                task.started = false;
                this._stopTimer(index);
            } else {
                // 他のタスクを停止
                this.tasks.forEach((t, i) => {
                    if (i !== index && t.started) {
                        t.started = false;
                        this._stopTimer(i);
                    }
                });
                // 開始処理
                task.started = true;
                this._startTimer(index);
            }
            this._displayTasks();
        },

        /**
         * タイマーを開始する
         * @param {Number} index タスクのインデックス
         */
        _startTimer: function (index) {
            const task = this.tasks[index];
            task.startTime = new Date();
            this.timer = setInterval(() => {
                const elapsed = this._calculateElapsed(task.startTime);
                task.elapsed = elapsed;
                this._displayTasks();
            }, 1000);
        },

        /**
         * タイマーを停止する
         * @param {Number} index タスクのインデックス
         */
        _stopTimer: function (index) {
            clearInterval(this.timer);
        },

        /**
         * 経過時間を計算する
         * @param {Date} startTime 開始時間
         * @returns {String} 経過時間(HH:mm形式)
         */
        _calculateElapsed: function (startTime) {
            const now = new Date();
            const diff = now.getTime() - startTime.getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
        },

        /**
         * タスクの備考を更新する
         * @param {Number} index タスクのインデックス
         * @param {String} value 変更後の値
         */
        _updateRemark: function (index, value) {
            const task = this.tasks[index];
            task.remark = parseInt(value);
            // 分数として保持
            task.elapsed = this._calculateTotalElapsed(task);
            this._displayTasks();
        },

        /**
         * 合計経過時間を計算する
         * @param {Object} task タスクオブジェクト
         * @returns {String} 合計経過時間(HH:mm形式)
         */
        _calculateTotalElapsed: function (task) {
            const elapsedMinutes = this._parseElapsed(task.elapsed);
            const remarkMinutes = task.remark;
            const totalMinutes = elapsedMinutes + remarkMinutes;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        },

        /**
         * 経過時間を分数に変換する
         * @param {String} elapsed 経過時間(HH:mm形式)
         * @returns {Number} 分数
         */
        _parseElapsed: function (elapsed) {
            const parts = elapsed.split(":");
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        },
        
        /**
         * 追加ボタンを表示する
         */
        _displayAddButton: function () {
            const oView = this.getView();
            const addButton = oView.byId("taskEntityAddButton");
            if (!addButton) {
                const addButton = new sap.m.Button({
                    text: "＋",
                    press: this.onAddTask.bind(this)
                });
                oView.addContent(addButton);
                oView.byId("taskEntityAddButton") = addButton;
            }
        },
        
        /**
         * タスクを追加する
         */
        _onAddTask: function () {
            this._visibleTasksCount++;
            this._displayTasks();
            if (this._visibleTasksCount >= this.tasks.length) {
                this.getView().byId("taskEntityAddButton").setVisible(false);
            }
        },
        
        /**
         * タスク名を更新する
         * @param {Number} index タスクのインデックス
         * @param {String} value 変更後の値
         */
        _updateTaskName: function (index, value) {
            this.tasks[index].name = value;
        },
        
    });
});
