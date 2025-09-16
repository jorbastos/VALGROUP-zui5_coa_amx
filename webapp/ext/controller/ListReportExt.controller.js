sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/Label",
    "sap/m/Input",
    "valgroup/com/zui5coaamx/ext/custom/MessageHelper"  // caminho relativo ao webapp
], function (
    MessageBox,
    Label,
    Input,
    MessageHelper
) {
    'use strict';

    return {

        onInit: function () {
            this.addCustomToolbarContent();
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        addCustomToolbarContent: function () {

            var oLabel = new Label({
                text: this.getResourceBundle().getText("email"),
            });

            var oInput = new Input({
                id: "InputEmail",
                width: "200px",
            });

            // Pega a toolbar da tabela
            let oToolbar = this.getView().byId(this.getView().getId() + '--listReport').getToolbar();

            if (oToolbar) {
                // Adiciona à toolbar
                oToolbar.addContent(oLabel);
                oToolbar.addContent(oInput);
            }
        },

        printCOA: function (oEvent) {
            let that = this,
                oModel = this.getOwnerComponent().getModel(),
                oContextSelected = this.extensionAPI.getSelectedContexts(),
                sPath = oContextSelected[0].getPath(),
                sObjCOA = oModel.getProperty(sPath),
                sRequest = '/print',
                oKeys = {
                    "DeliveryDocument": sObjCOA.DeliveryDocument,
                    "DeliveryDocumentItem": sObjCOA.DeliveryDocumentItem,
                    "BillingDocument": sObjCOA.BillingDocument,
                    "BillingDocumentItem": sObjCOA.BillingDocumentItem,
                    "ManufacturingOrder": sObjCOA.ManufacturingOrder,
                    "InspectionLot": sObjCOA.InspectionLot,
                    "email": this.getView().byId(this.getView().getId() + '--listReport').getToolbar().getContent()[4].getValue()
                };

            this.getView().setBusy(true);

            oModel.callFunction(sRequest, {
                method: "POST",
                urlParameters: oKeys,
                success: function (oData, oResponse) {
                    that.getView().setBusy(false);
                    MessageHelper.showMessages(oResponse);

                }.bind(this),
                error: function (oError) {
                    that.getView().setBusy(false);
                    var oErro = JSON.parse(oError.responseText);
                    oErro = oErro.error.message.value;
                    MessageBox.error(oErro);
                }.bind(this)
            });
        },

    };
});