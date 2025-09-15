sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageItem",
    "sap/m/MessageView",
    "sap/ui/core/IconPool",
    "sap/m/Bar",
    "sap/m/Title",
    "sap/ui/core/library",
    "sap/m/Input",
], function (
    MessageToast,
    Message,
    MessageType,
    MessageBox,
    Dialog,
    Button,
    Label,
    mobileLibrary,
    Text,
    JSONModel,
    MessageItem,
    MessageView,
    IconPool,
    Bar,
    Title,
    coreLibrary,
    Input,
) {
    'use strict';

    return {

        onInit: function () {
            this.addCustomToolbarContent();
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
                    that.showMessages(oResponse);

                }.bind(this),
                error: function (oError) {
                    that.getView().setBusy(false);
                    var oErro = JSON.parse(oError.responseText);
                    oErro = oErro.error.message.value;
                    MessageBox.error(oErro);
                }.bind(this)
            });
        },

        // LÓGICA PARA EXIBIÇÃO DAS MENSAGENS
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        showMessages: function (pResponse) {

            var that = this,
                tableMessage = [],
                i18nTexts = this.getResourceBundle(),
                oModelMessage = new JSONModel(),
                oMessage = JSON.parse(pResponse.headers["sap-message"]);

            if (oMessage.details) {
                tableMessage = oMessage.details;
            }

            tableMessage.push(oMessage);

            for (var i = 0; i < tableMessage.length; i++) {
                tableMessage[i].type = tableMessage[i].severity.substring(0, 1).toUpperCase() + tableMessage[i].severity.substring(1);
            }

            if (tableMessage.length == 1) {
                var lineMessage = tableMessage[0];

                switch (true) {
                    case (lineMessage.type == "Success"):
                        MessageToast.show(lineMessage.message);
                        break;
                    case (lineMessage.type == "Error"):
                        MessageBox.error(lineMessage.message);
                        break;
                    default:
                        MessageBox.warning(lineMessage.message);
                        break;
                }
                return;
            }

            // Template para a Mensagem
            var oMessageTemplate = new MessageItem({
                type: '{type}',
                title: '{message}',
                description: '{description}',
                subtitle: '{subtitle}',
                counter: '{counter}',
                markupDescription: '{markupDescription}',
                groupName: '{groupName}'
            });

            oModelMessage.setData(tableMessage);

            this.oMessageView = new MessageView({
                showDetailsPageHeader: false,
                itemSelect: function () {
                    oBackButton.setVisible(true);
                },
                items: {
                    path: "/",
                    template: oMessageTemplate
                },
                groupItems: true
            });

            var oBackButton = new Button({
                icon: IconPool.getIconURI("nav-back"),
                visible: false,
                press: function () {
                    that.oMessageView.navigateBack();
                    this.setVisible(false);
                }
            });

            this.oMessageView.setModel(oModelMessage);

            this.oDialog = new Dialog({
                resizable: true,
                content: this.oMessageView,
                state: 'Error',
                beginButton: new Button({
                    press: function () {
                        this.getParent().close();
                    },
                    text: i18nTexts.getText("close"),
                }),
                customHeader: new Bar({
                    contentLeft: [oBackButton],
                    contentMiddle: [
                        new Title({
                            text: i18nTexts.getText("log"),
                            level: coreLibrary.TitleLevel.H1
                        })
                    ]
                }),
                contentHeight: "50%",
                contentWidth: "23%",
                verticalScrolling: false
            });

            this.oMessageView.navigateBack();
            this.oDialog.open();

        },
    };
});