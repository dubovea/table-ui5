sap.ui.define(
  [
    "tasklist/controller/Base.controller",
    "tasklist/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
  ],
  function (
    BaseController,
    Formatter,
    JSONModel,
    MessageBox,
    Filter,
    Export,
    ExportTypeCSV,
    exportLibrary,
    Spreadsheet
  ) {
    "use strict";

    const EdmType = exportLibrary.EdmType;

    return BaseController.extend("tasklist.controller.Tasks.Overview", {
      onInit: function () {
        this.__ODataUnit = this.getApplication().__ODataUnit;
        const oRouter = this.getRouter();
        oRouter.getRoute("taskView").attachMatched(() => {
          this.__loadList();
          this.__activePersoService();
          this.setBusy(false);
        });
      },

      formatter: Formatter,

      handleSearch: function () {
        this.__loadList();
      },

      handleClearFilters: function () {
        this.__clearFilters(["taskTypes", "users", "dateBegin", "dateEnd"]);
      },

      handleResetFilters: function () {
        this.__clearFilters(["taskTypes", "users", "dateBegin", "dateEnd"]);
        this.__loadList();
      },

      handleOpenUserVH: function (oEvent) {
        const sItemPath = oEvent
          ?.getSource()
          ?.getBindingContext("state")
          ?.getPath();
        this.__loadDialog("SelectUserDialog2").then((oDialog) => {
          this.setStateProperty("/itemPath", sItemPath);
          oDialog.open();
        });
      },

      handleSelectUserConfirm: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        if (!oSelectedItem) {
          return;
        }
        const { Id, Name } = oSelectedItem
            .getBindingContext("state")
            .getObject(),
          sItemPath = this.getStateProperty("/itemPath");
        if (sItemPath) {
          return this.setStateProperty(`${sItemPath}/sUserOwner`, Name);
        }
        this.setStateProperty("/filter/users/id", Id);
        this.setStateProperty("/filter/users/value", Name);
      },

      handleSelectUserSearch: function (oEvent) {
        const sValue = oEvent.getParameter("value"),
          oFilter = new Filter("Name", "Contains", sValue),
          oBinding = oEvent.getParameter("itemsBinding");
        oBinding.filter([oFilter]);
      },

      handleChangeDate: function (oEvent) {
        const oDP = oEvent.getSource(),
          bValid = oEvent.getParameter("valid"),
          sErrorFormatMsg = this.i18n("FORMAT_DATE"),
          sErrorMsg = `${sErrorFormatMsg} ${oDP.getDisplayFormat()}`;
        oDP.setValueState(bValid ? "None" : "Error");
        oDP.setValueStateText(bValid ? "" : sErrorMsg);
      },

      handlePersoTable: function () {
        this._oTPC.openDialog();
      },

      handleExportExcel: function () {
        const oTable = this.byId("tableTaskId"),
          oRowBinding = oTable.getBinding("items"),
          aCols = [
            {
              label: this.i18n("taskNameCol"),
              type: EdmType.String,
              property: "sTaskName",
              width: 40,
              wrap: true,
            },
            {
              label: this.i18n("taskTypeCol"),
              type: EdmType.String,
              property: "sTaskType",
              width: 10,
              wrap: true,
            },
            {
              label: this.i18n("taskUserOwnerCol"),
              type: EdmType.String,
              property: "sUserOwner",
              width: 40,
              wrap: true,
            },
            {
              label: this.i18n("taskDateBeginCol"),
              type: EdmType.Date,
              property: "dDateBegin",
              width: 10,
              wrap: true,
            },
            {
              label: this.i18n("taskDateEndCol"),
              type: EdmType.Date,
              property: "dDateEnd",
              width: 10,
              wrap: true,
            },
          ];

        const oSettings = {
          workbook: { columns: aCols },
          dataSource: oRowBinding,
          fileName: "Задачи на месяц.xlsx",
          worker: false,
        };

        const oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },

      handleExportCSV: function () {
        var oExport = new Export({
          exportType: new ExportTypeCSV({
            separatorChar: ";",
          }),
          models: this.__oViewModel,
          rows: {
            path: "/taskList/items",
          },
          columns: [
            {
              name: this.i18n("taskNameCol"),
              template: {
                content: "{sTaskName}",
              },
            },
            {
              name: this.i18n("taskTypeCol"),
              template: {
                content: "{sTaskType}",
              },
            },
            {
              name: this.i18n("taskUserOwnerCol"),
              template: {
                content: "{sUserOwner}",
              },
            },
            {
              name: this.i18n("taskDateBeginCol"),
              template: {
                content: {
                  parts: ["dDateBegin"],
                  formatter: (dDateBegin) => {
                    return dDateBegin?.toLocaleDateString();
                  },
                },
              },
            },
            {
              name: this.i18n("taskDateEndCol"),
              template: {
                content: {
                  parts: ["dDateEnd"],
                  formatter: (dDateEnd) => {
                    return dDateEnd?.toLocaleDateString();
                  },
                },
              },
            },
          ],
        });
        oExport
          .saveFile()
          .catch((oError) => {
            MessageBox.error(oError);
          })
          .then(() => {
            oExport.destroy();
          });
      },

      handleEditPage: function () {
        this.navTo("taskEdit");
      },
    });
  }
);
