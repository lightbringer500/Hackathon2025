sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.Prizes', {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf zynas.thancle.controller.Prizes
         */
        onInit: function () {
            const oView = this.getView();
            oView.bindElement({
                path: "/profile",
                model: "user"
            });

            this._oRouter = this.getOwnerComponent().getRouter();
        },

        /**
         * プロフィールページに遷移する
         * @memberOf zynas.thancle.controller.Prizes
         */
        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this._oRouter.navTo("profile", {}, true);
            }
        },

        /**
         * 賞品詳細ページに遷移
         * @memberOf zynas.thancle.controller.Prizes
         */
        onOpenPrizeDetail: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext("prize");
            if (!oContext) {
                return;
            }

            // sPath: '/Prizes(id)'
            const sPath = oContext.getPath();
            const sId = sPath.split('(').flatMap(path => path.split(')'))[1];
            if (!sId) {
                return;
            }

            // 詳細ページに遷移
            this._oRouter.navTo("prizeDetail", {
                prizeId: window.encodeURIComponent(sId)
            });
        },

        /**
         * 賞品検索
         * @memberOf zynas.thancle.controller.Prizes
         */
        // onSearch : function () {
        //   var oView = this.getView(),
        //     sValue = oView.byId("prizeSearch").getValue(),
        //     oFilter = new Filter("LastName", FilterOperator.Contains, sValue);

        //   oView.byId("peopleList").getBinding("items").filter(oFilter, FilterType.Application);
        // },

    });
});