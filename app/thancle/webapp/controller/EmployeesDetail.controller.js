sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
], (Controller, History) => {
    'use strict';

    return Controller.extend('zynas.thancle.controller.EmployeesDetail', {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf zynas.thancle.controller.EmployeesDetail
         */
        onInit: function () {
            const oView = this.getView();
            oView.bindElement({
                path: "/profile",
                model: "user"
            });

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("employeesDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * URLのIDと一致する賞品を表示する
         * @param {*} oEvent 
         */
        _onRouteMatched: function (oEvent) {
            const employeesId = oEvent.getParameter("arguments").employeesId;

            const oModel = this.getView().getModel("employees");
            // Employeesエンティティをバインディング
            const oContext = oModel.createBindingContext("/Employeess(" + employeesId + ")");

            const oView = this.getView();
            oView.bindElement({
                path: oContext.getPath(),
                model: "employees"
            });

            // // バインディングしたコンテキストをビューに適用
            // this.getView().bindElement(oContext);

            // var oModel = this.getView().getModel("employees");
            // var oEmployeesData = oModel.getProperty("/Employees").find(function(item) {
            //     return item.ID === employeesId;
            // });

            // if (oEmployeesData) {
            //     // データをビューに表示
            //     this.byId("nameText").setText(oEmployeesData.name);
            //     this.byId("informationText").setText(oEmployeesData.information);
            // }
            // var sPath = "/employeesDetail" + employeesId;
            // this.getView.bindElement(sPath);
        },

        /**
         * 社員一覧ページに遷移する
         */
        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("employees", {}, true);
            }
        }
    });
});