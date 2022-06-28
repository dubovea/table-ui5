sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/Fragment"],
  function (Controller, Fragment) {
    "use strict";

    return Controller.extend("tasklist.controller.Base", {
      onInit: function () {},

      getGlobalModel: function () {
        return this.getOwnerComponent().getModel("globalProperties");
      },

      getApplication: function () {
        return this.getGlobalModel().getProperty("/application");
      },

      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      navTo: function (sName, oParameters, bReplace) {
        this.getRouter().navTo(sName, oParameters, bReplace);
      },

      setBusy: function (bShowIndicator = true) {
        this.__oViewModel.setProperty("/busy", bShowIndicator);
      },

      __loadDialog: function (sDialogName) {
        const oView = this.getView();
        return new Promise((resolve, reject) => {
          if (this[sDialogName]) {
            return resolve(this[sDialogName]);
          }
          Fragment.load({
            id: oView.getId(),
            name: `tasklist.fragment.${sDialogName}`,
            controller: this,
          })
            .then((oValueHelpDialog) => {
              oView.addDependent(oValueHelpDialog);
              this[sDialogName] = oValueHelpDialog;
              return resolve(oValueHelpDialog);
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
    });
  }
);
