sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.TimeEntry', {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf zynas.thancle.controller.TimeEntry
         */
        onInit: function () {
            const oView = this.getView();
            oView.bindElement({
                path: "/timeEntry",
                model: "user"
            });

            // 取得した日付のデータが存在する場合は、取得した日付のデータ内容で表示する

            // 取得した日付のデータが存在しない場合は、画面より取得した内容で新しく表示する

            // 現在日時(毎秒更新)
            this._updateDateTime();
            setInterval(this._updateDateTime.bind(this), 1000);

            this._oRouter = this.getOwnerComponent().getRouter();
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
        }

    });
});