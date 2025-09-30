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
            this.attachEventsToTable();
            this.addCustomToolbarContent();
        },

        attachEventsToTable: function () {
            let oTable = this.getView().byId(this.getView().getId() + '--listReport').getTable(),
                oPlugin = oTable.getPlugins()[0];

            if (oPlugin) {
                oPlugin.attachSelectionChange(this.onRowSelectionChange, this);
            }
        },

        onRowSelectionChange: function (oEvent) {
            var sLabelBlocked,
                sInputEnabled,
                oToolbarContent = this.getView().byId(this.getView().getId() + '--listReport').getToolbar().getContent();

            if (this.extensionAPI.getSelectedContexts()) {
                if (this.extensionAPI.getSelectedContexts().length > 0) {
                    sLabelBlocked = false, sInputEnabled = true;
                }
                else {
                    sLabelBlocked = true; sInputEnabled = false;
                }
            }

            for (var i = 0; i < oToolbarContent.length; i++) {
                if (oToolbarContent[i].sId == 'LabelEmail') {
                    oToolbarContent[i].setBlocked(sLabelBlocked);
                }
                if (oToolbarContent[i].sId == 'InputEmail') {
                    oToolbarContent[i].setEnabled(sInputEnabled);
                }
            }
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        addCustomToolbarContent: function () {

            var oLabel = new Label({
                id: "LabelEmail",
                text: this.getResourceBundle().getText("email"),
                blocked: true
            });

            var oInput = new Input({
                id: "InputEmail",
                width: "200px",
                type: "Email",
                showSuggestion: true,
                enabled: false,
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
                oModeli18n = this.getOwnerComponent().getModel("i18n"),
                oContextSelected = this.extensionAPI.getSelectedContexts(),
                sPath = oContextSelected[0].getPath(),
                sObjCOA = oModel.getProperty(sPath),
                sRequest = '/print',
                oToolbarContent = this.getView().byId(this.getView().getId() + '--listReport').getToolbar().getContent();

            for (var i = 0; i < oToolbarContent.length; i++) {
                if (oToolbarContent[i].sId == 'InputEmail') {
                    var sEmail = oToolbarContent[i].getValue();
                }
            }

            let oKeys = {
                "DeliveryDocument": sObjCOA.DeliveryDocument,
                "DeliveryDocumentItem": sObjCOA.DeliveryDocumentItem,
                "BillingDocument": sObjCOA.BillingDocument,
                "BillingDocumentItem": sObjCOA.BillingDocumentItem,
                "ManufacturingOrder": sObjCOA.ManufacturingOrder,
                //"InspectionLot": sObjCOA.InspectionLot,
                "email": sEmail
            };

            this.getView().setBusy(true);

            oModel.callFunction(sRequest, {
                method: "POST",
                urlParameters: oKeys,
                success: function (oData, oResponse) {
                    that.getView().setBusy(false);
                    MessageHelper.showMessages(oResponse, oModeli18n);

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