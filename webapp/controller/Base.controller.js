sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/TablePersoController",
    "tasklist/model/TablePersoService",
    "tasklist/model/BusinessAPI",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    Controller,
    Fragment,
    MessageToast,
    MessageBox,
    TablePersoController,
    TablePersoService,
    BusinessAPI
  ) {
    "use strict";

    return Controller.extend("tasklist.controller.Base", {
      onInit: function () {},

      getGlobalModel: function () {
        return this.getModel("globalProperties");
      },

      getModel: function (sName) {
        return (
          this.getOwnerComponent().getModel(sName) ||
          this.getView().getModel(sName)
        );
      },

      getStateProperty: function (sPath, oContext) {
        return this.getModel("state").getProperty(sPath, oContext);
      },

      setStateProperty: function (sPath, oValue, oContext, bAsyncUpdate) {
        return this.getModel("state").setProperty(
          sPath,
          oValue,
          oContext,
          bAsyncUpdate
        );
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
        this.__oViewModel &&
          this.__oViewModel.setProperty("/busy", bShowIndicator);
        this.setStateProperty("/busy", bShowIndicator);
      },

      __loadList: function () {
        const sLoadPending = this.i18n("LOAD_PENDING"),
          sLoadError = this.i18n("LOAD_ERROR");
        MessageToast.show(sLoadPending);
        this.setBusy();
        this.__ODataUnit
          .getTaskList({ mFilter: this.__getFilters() })
          .then((aData) => {
            BusinessAPI.getTaskList({
              aData: aData,
              fnSuccess: (aResult) => {
                try {
                  this.__oViewModel &&
                    this.__oViewModel.setProperty("/taskList/items", aResult);
                  this.setStateProperty("/taskList/items", aResult);
                } catch (oError) {
                  MessageBox.error("DisplayError: " + oError.message, {
                    title: sLoadError,
                  });
                }
              },
              fnError: (oError) => {
                MessageBox.error("ParseError: " + oError.message, {
                  title: sLoadError,
                });
              },
            });
          })
          .catch((oError) => {
            MessageBox.error("RequestError: " + oError.message, {
              title: sLoadError,
            });
          })
          .finally(() => {
            this.setBusy(false);
          });
      },
      /**
       * Формирование из свойств модели __oViewModel('/filter/...') мапы с фильтрами для последующей передачи в ODataUnit
       * @returns {Map} результат работы функции (поля описаны в oDataUnit.getTaskList)
       */
      __getFilters: function () {
        const mFilter = new Map();
        const fnSimplePusher = (sModelProp, sFilterProp) => {
          const sVal =
            (this.__oViewModel &&
              this.__oViewModel.getProperty(`/filter/${sModelProp}`)) ||
            this.getStateProperty(`/filter/${sModelProp}`);
          if (sVal) {
            mFilter.set(sFilterProp, sVal);
          }
        };
        fnSimplePusher("taskTypes/selectedKey", "sTaskType");
        fnSimplePusher("users/value", "sUserOwner");
        fnSimplePusher("dateBegin", "dDateBegin");
        fnSimplePusher("dateEnd", "dDateEnd");

        return mFilter;
      },

      __activePersoService: function (bEditable) {
        if (!this._oTPC) {
          this._oTPC = new TablePersoController({
            table: this.byId("tableTaskId"),
            componentName: "tasklist",
            persoService: TablePersoService,
          }).activate();
        }
        if (bEditable) {
          TablePersoService.resetPersData().done(() => {
            this._oTPC.refresh();
          });
        }
      },

      __clearFilters: function (aPaths) {
        if (!aPaths?.length) {
          return;
        }
        const oFilters =
          (this.__oViewModel && this.__oViewModel.getProperty("/filter")) ||
          this.getStateProperty("/filter");
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
        this.__oViewModel && this.__oViewModel.setProperty("/filter", oFilters);
        this.setStateProperty("/filter", oFilters);
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
