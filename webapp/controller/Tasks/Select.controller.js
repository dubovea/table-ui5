sap.ui.define(
  [
    "tasklist/controller/Base.controller",
    "sap/m/TablePersoController",
    "tasklist/model/TablePersoService",
    "tasklist/model/formatter",
    "tasklist/model/BusinessAPI",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
  ],
  function (
    BaseController,
    TablePersoController,
    TablePersoService,
    Formatter,
    BusinessAPI,
    JSONModel,
    MessageToast,
    MessageBox,
    Filter,
    Export,
    ExportTypeCSV
  ) {
    "use strict";

    return BaseController.extend("tasklist.controller.Tasks.Select", {
      onInit: function () {
        this.__ODataUnit = this.getApplication().__ODataUnit;
        this.__initViewModel();

        const oRouter = this.getRouter();
        oRouter.getRoute("taskSelect").attachMatched((oEvent) => {
          const oArguments = oEvent.getParameter("arguments"),
            bEditable =
              oArguments.editable && oArguments.editable === "editable";
          this.__oViewModel.setProperty("/editable", bEditable);
          this.__loadList();
          this.__activePersoService(bEditable);
          this.setBusy(false);
        });
      },

      formatter: Formatter,

      __initViewModel: function () {
        this.__oViewModel = new JSONModel({
          busy: true,
          editable: false,
          invalidated: false,
          taskList: {
            items: [],
            busy: false,
          },
          filter: {
            taskTypes: {
              selectedKey: "",
              items: [
                {
                  Id: "1",
                  Name: "Разработка",
                },
                {
                  Id: "2",
                  Name: "Тестирование",
                },
                {
                  Id: "3",
                  Name: "Проектирование",
                },
              ],
            },
            users: {
              id: "",
              value: "",
              error: "",
              items: [
                {
                  Id: "1",
                  Name: "Дубов Эдуард Александрович",
                },
                {
                  Id: "2",
                  Name: "Манин Михаил Александрович",
                },
                {
                  Id: "3",
                  Name: "Манин Александр Михайлович",
                },
              ],
            },
            dateBegin: null,
            dateEnd: null,
          },
        });
        this.getView().setModel(this.__oViewModel, "view");
      },

      __loadList: function () {
        MessageToast.show("Обновление данных");
        this.setBusy();
        this.__ODataUnit
          .getTaskList({ mFilter: this.__getFilters() })
          .then((aData) => {
            BusinessAPI.getTaskList({
              aData: aData,
              fnSuccess: (aResult) => {
                try {
                  this.__oViewModel.setProperty("/taskList/items", aResult);
                } catch (oError) {
                  MessageBox.error("DisplayError: " + oError.message, {
                    title: "Ошибка загрузки списка задач на месяц",
                  });
                }
              },
              fnError: (oError) => {
                MessageBox.error("ParseError: " + oError.message, {
                  title: "Ошибка загрузки списка задач на месяц",
                });
              },
            });
          })
          .catch((oError) => {
            MessageBox.error("RequestError: " + oError.message, {
              title: "Ошибка загрузки списка задач на месяц",
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
          const sVal = this.__oViewModel.getProperty(`/filter/${sModelProp}`);
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
          ?.getBindingContext("view")
          ?.getPath();
        this.__loadDialog("SelectUserDialog").then((oDialog) => {
          this.__oViewModel.setProperty("/itemPath", sItemPath);
          oDialog.open();
        });
      },

      handleSelectUserConfirm: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        if (!oSelectedItem) {
          return;
        }
        const { Id, Name } = oSelectedItem
            .getBindingContext("view")
            .getObject(),
          sItemPath = this.__oViewModel.getProperty("/itemPath");
        if (sItemPath) {
          return this.__oViewModel.setProperty(`${sItemPath}/sUserOwner`, Name);
        }
        this.__oViewModel.setProperty("/filter/users/id", Id);
        this.__oViewModel.setProperty("/filter/users/value", Name);
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
          sErrorMsg = `Введите действительный формат даты ${oDP.getDisplayFormat()}`;
        oDP.setValueState(bValid ? "None" : "Error");
        oDP.setValueStateText(bValid ? "" : sErrorMsg);
      },

      handlePersoTable: function () {
        this._oTPC.openDialog();
      },

      handleAddItem: function () {
        const aTaskList = this.__oViewModel.getProperty("/taskList/items"),
          sMaxId = aTaskList.reduce(
            (prev, current) =>
              +prev.sId > +current.sId ? +prev.sId : +current.sId,
            0
          );
        this.__oViewModel.setProperty("/taskList/items", [
          ...aTaskList,
          {
            sId: `${sMaxId + 1}`,
            sTaskName: "",
            sTaskType: "",
            sUserOwner: "",
            dDateBegin: new Date(),
            dDateEnd: null,
          },
        ]);
      },

      handleSave: function () {
        const aTaskList = this.__oViewModel.getProperty("/taskList/items");
        if (BusinessAPI.checkListBeforeSave(aTaskList)) {
          MessageToast.show("Проверьте корректность введенных данных.");
          return this.__oViewModel.setProperty("/invalidated", true);
        }
        this.__oViewModel.setProperty("/invalidated", false);
        $.sap.storage.put(
          "taskList",
          aTaskList.map((o) => ({
            Id: o.sId,
            TaskName: o.sTaskName,
            TaskType: o.sTaskType,
            UserOwner: o.sUserOwner,
            DateBegin: o.dDateBegin,
            DateEnd: o.dDateEnd,
          }))
        );
        MessageToast.show("Данные успешно сохранены.");
      },

      handleExportExcel: function () {
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
              name: "Название задачи",
              template: {
                content: "{sTaskName}",
              },
            },
            {
              name: "Тип задачи",
              template: {
                content: "{sTaskType}",
              },
            },
            {
              name: "Ответственный",
              template: {
                content: "{sUserOwner}",
              },
            },
            {
              name: "Дата начала",
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
              name: "Дата окончания",
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
            MessageBox.error(
              "Ошибка при загрузке данных. Браузер может не поддерживать данный функционал!\n\n" +
                oError
            );
          })
          .then(() => {
            oExport.destroy();
          });
      },

      handleEditPage: function () {
        this.navTo("taskSelect", {
          editable: "editable",
        });
      },
    });
  }
);
