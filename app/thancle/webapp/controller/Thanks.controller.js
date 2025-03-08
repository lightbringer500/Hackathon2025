sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/library"
], (Controller, MessageToast, MessageBox, sapUiCoreLib) => {
    'use strict';
    const { ValueState } = sapUiCoreLib;

    return Controller.extend('zynas.thancle.controller.Thanks', {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf zynas.thancle.controller.Thanks
         */
        onInit: function () {
            const oView = this.getView();
            oView.bindElement({
                path: "/profile",
                model: "user",
            });

            // メッセージの取得元
            this._oI18nModel = this.getOwnerComponent().getModel("i18n");
        },

        /**
         * 画面のレンダリング後に呼び出される関数
         * @memberOf zynas.thancle.controller.Thanks
         */
        onAfterRendering: function () {
            // コンボボックスのフィルタを設定
            this.byId("thanksFormToCombo")?.setFilterFunction(this._filterEmployeeCombo);
        },

        /**
         * プロフィールページに戻る
         * @memberOf zynas.thancle.controller.Thanks
         */
        onPressNav: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("profile");
        },

        /**
         * 社員コンボボックスのフィルタ
         * @param {*} input 入力文字列
         * @param {*} item 項目
         * @returns 
         * @memberOf zynas.thancle.controller.Thanks
         */
        _filterEmployeeCombo: function (input, item) {
            const name = item.getText();
            const email = item.getAdditionalText();
            const ID = item.data("ID");
            return name.includes(input) || email.includes(input) || ID.includes(input);
        },

        /**
         * 社員を検証する
         * @param {*} oEvent 
         * @memberOf zynas.thancle.controller.Thanks
         */
        validateEmployee: function (oEvent) {
            const oSource = oEvent?.getSource() ?? this.byId("thanksFormToCombo");
            const oSelectedItem = oSource.getSelectedItem();
            let valueState = ValueState.None
            if (!oSelectedItem) {
                // 選択されていない場合
                valueState = ValueState.Error;
            }
            oSource.setValueState(valueState);
        },

        /**
         * レートを検証する
         * @param {*} oEvent 
         * @memberOf zynas.thancle.controller.Thanks
         */
        validateSeedRate: function (oEvent) {
            const oSource = oEvent?.getSource() ?? this.byId("thanksFormRateSelect");
            const oSelectedItem = oSource.getSelectedItem();
            let valueState = ValueState.None
            if (!oSelectedItem) {
                // 選択されていない場合
                valueState = ValueState.Error;
            }
            oSource.setValueState(valueState);
        },

        /**
         * さんくるを贈る
         * @memberOf zynas.thancle.controller.Thanks
         */
        onPressPresent: async function () {
            // 入力確認
            if (this._hasInputError()) {
                MessageBox.alert(this._oI18nModel.getProperty("inputErrorMessage"));
                return;
            }

            // モデル取得
            const oModel = this.getOwnerComponent().getModel("seed");
            const oController = this;

            // 実行確認
            MessageBox.confirm(this._oI18nModel.getProperty("thanksPresentConfirmMessage"), {
                onClose: function (oAction) {
                    // OK以外が押されたら何もしない
                    if (oAction !== MessageBox.Action.OK) return;

                    // 送信処理のパラメータ設定
                    const { recipientId, rateId, message } = oController._getParams();
                    const oOperation = oModel.bindContext("/present(...)");
                    oOperation.setParameter("recipientId", recipientId)
                        .setParameter("rateId", rateId)
                        .setParameter("message", message);

                    // 処理実行
                    oOperation.invoke()
                        .then(() => {
                            const { error } = oOperation.getBoundContext().getValue();
                            if (error) {
                                // 登録時のチェックでエラー
                                MessageBox.error(oController._oI18nModel.getProperty(error));
                                return;
                            }
                            // 入力値をクリア
                            oController._clearParams();
                            // プロフィールを更新
                            oController.getView().getModel("user").refresh();
                            // メッセージを表示して画面遷移
                            MessageToast.show(oController._oI18nModel.getProperty("thanksPresentSuccessMessage"));
                            setTimeout(() => {
                                oController.onPressNav();
                            }, 600);
                        })
                        .catch(oError => oController._handlePresentError(oError));
                }
            });
        },

        /**
         * 入力にエラーがあるかどうか
         * @returns 
         * @memberOf zynas.thancle.controller.Thanks
         */
        _hasInputError: function () {
            this.validateEmployee();
            this.validateSeedRate();
            const employeeState = this.byId("thanksFormToCombo").getValueState();
            const rateState = this.byId("thanksFormRateSelect").getValueState();
            return employeeState === ValueState.Error || rateState === ValueState.Error;
        },

        /**
         * さんくるを贈る処理のエラーを表示する
         * @param {*} oError 
         * @memberOf zynas.thancle.controller.Thanks
         */
        _handlePresentError: function (oError) {
            // メッセージを表示
            MessageToast.show(this._oI18nModel.getProperty("thanksPresentErrorMessage"));
            console.error(oError);
        },

        /**
         * 画面に入力されたパラメータを取得する
         * @returns 
         * @memberOf zynas.thancle.controller.Thanks
         */
        _getParams: function () {
            const recipientId = this.byId("thanksFormToCombo").getSelectedItem()?.data("ID") ?? "";
            const rateId = this.byId("thanksFormRateSelect").getSelectedItem()?.data("ID") ?? "";
            const message = this.byId("thanksFormMessageText").getValue();
            return { "recipientId": recipientId, "rateId": rateId, "message": message };
        },

        /**
         * 画面に入力されたパラメータをクリアする
         * @memberOf zynas.thancle.controller.Thanks
         */
        _clearParams: function () {
            this.byId("thanksFormToCombo").setSelectedKey("");
            this.byId("thanksFormRateSelect").setSelectedKey("");
            this.byId("thanksFormMessageText").setValue("");
        }
    });
});