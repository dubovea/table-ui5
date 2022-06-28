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

      getResourceBundle: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      i18n: function (sKey, aArgs) {
        return this.getResourceBundle().getText(sKey, aArgs);
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

      __clearFilters: function (aPaths) {
        if (!aPaths?.length) {
          return;
        }
        const oFilters = this.__oViewModel.getProperty("/filter");
        let bFilterContains = false;

        const fnClearValues = (oFilters, sParentPath = "") => {
          for (const sPath in oFilters) {
            bFilterContains =
              !!aPaths.find((sFilterPath) => sFilterPath === sPath) ||
              !!aPaths.find((sFilterPath) => sFilterPath === sParentPath);
            if (bFilterContains && typeof oFilters[sPath] === "boolean") {
              oFilters[sPath] = false;
            }
            if (bFilterContains && typeof oFilters[sPath] === "string") {
              oFilters[sPath] = "";
            }
            if (bFilterContains && typeof oFilters[sPath] === "object") {
              fnClearValues(oFilters[sPath], sPath);
            }
            if (bFilterContains && oFilters[sPath] instanceof Date) {
              oFilters[sPath] = null;
            }
          }
        };

        fnClearValues(oFilters);
        this.__oViewModel.setProperty("/filter", oFilters);
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
