sap.ui.define([
    "sap/m/MessageToast",
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
    "sap/ui/core/library"
], function (
    MessageToast,
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
    coreLibrary

) {
    "use strict";

    // shortcut for sap.ui.core.TitleLevel
    var TitleLevel = coreLibrary.TitleLevel;

   return {

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        showMessages: function (pResponse) {

            var tableMessage = [],
                i18nTexts = pThis.getResourceBundle(),
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
                    this.oMessageView.navigateBack();
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
                            level: TitleLevel.H1
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

    }
    
});