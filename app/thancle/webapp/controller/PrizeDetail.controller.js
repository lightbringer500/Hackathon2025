sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
], (Controller, History) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.PrizeDetail', {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf zynas.thancle.controller.PrizeDetail
         */
        onInit: function () {
            const oView = this.getView();
            oView.bindElement({
                path: "/profile",
                model: "user"
            });

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("prizeDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * URLのIDと一致する賞品を表示する
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {
            const prizeId = oEvent.getParameter("arguments").prizeId;

            const oModel = this.getView().getModel("prize");
            // Prizeエンティティをバインディング
            const oContext = oModel.createBindingContext("/Prizes(" + prizeId + ")");

            const oView = this.getView();
            oView.bindElement({
                path: oContext.getPath(),
                model: "prize"
            });

            // // バインディングしたコンテキストをビューに適用
            // this.getView().bindElement(oContext);

            // var oModel = this.getView().getModel("prize");
            // var oPrizeData = oModel.getProperty("/Prize").find(function(item) {
            //     return item.ID === prizeId;
            // });

            // if (oPrizeData) {
            //     // データをビューに表示
            //     this.byId("nameText").setText(oPrizeData.name);
            //     this.byId("informationText").setText(oPrizeData.information);
            // }
            // var sPath = "/prizeDetail" + prizeId;
            // this.getView.bindElement(sPath);
        },

        /**
         * 賞品一覧ページに遷移する
         */
        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("prizes", {}, true);
            }
        }
    });
});