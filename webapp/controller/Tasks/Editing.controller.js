sap.ui.define(
  [
    "tasklist/controller/Base.controller",
    "tasklist/model/formatter",
    "tasklist/model/BusinessAPI",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/export/library",
  ],
  function (
    BaseController,
    Formatter,
    BusinessAPI,
    JSONModel,
    MessageToast,
    Filter,
    exportLibrary
  ) {
    "use strict";

    const EdmType = exportLibrary.EdmType;

    return BaseController.extend("tasklist.controller.Tasks.Editing", {
      onInit: function () {
        this.__ODataUnit = this.getApplication().__ODataUnit;
        const oRouter = this.getRouter();
        oRouter.getRoute("taskEdit").attachMatched(() => {
          this.__loadList();
          this.__activePersoService(true);
          this.setBusy(false);
        });
      },

      formatter: Formatter,

      handleOpenUserVH: function (oEvent) {
        const sItemPath = oEvent
          ?.getSource()
          ?.getBindingContext("view")
          ?.getPath();
        this.__loadDialog("SelectUserDialog2").then((oDialog) => {
          this.setStateProperty("/itemPath", sItemPath);
          oDialog.open();
        });
      },

      handleChangeTaskType: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        if (!oSelectedItem) {
          return;
        }
        const oBinding = oSelectedItem.getBindingContext("state"),
          { Name } = oBinding.getObject(),
          sItemPath = oEvent.getSource().getBindingContext("state").getPath();
        this.setStateProperty(`${sItemPath}/sTaskText`, Name);
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

      handleAddItem: function () {
        const aTaskList = this.getStateProperty("/taskList/items"),
          sMaxId = aTaskList.reduce(
            (prev, current) =>
              +prev.sId > +current.sId ? +prev.sId : +current.sId,
            0
          );
        this.setStateProperty("/taskList/items", [
          ...aTaskList,
          {
            sId: `${sMaxId + 1}`,
            sTaskName: "",
            sTaskType: "",
            sTaskText: "",
            sUserOwner: "",
            dDateBegin: new Date(),
            dDateEnd: null,
          },
        ]);
      },

      handleSave: function () {
        const aTaskList = this.getStateProperty("/taskList/items");
        if (BusinessAPI.checkListBeforeSave(aTaskList)) {
          MessageToast.show(this.i18n("SAVE_ERROR"));
          return this.setStateProperty("/invalidated", true);
        }
        this.setStateProperty("/invalidated", false);
        $.sap.storage.put(
          "taskList",
          aTaskList.map((o) => ({
            Id: o.sId,
            TaskName: o.sTaskName,
            TaskType: o.sTaskType,
            TaskText: o.sTaskText,
            UserOwner: o.sUserOwner,
            DateBegin: o.dDateBegin,
            DateEnd: o.dDateEnd,
          }))
        );
        MessageToast.show(this.i18n("SAVE_SUCCESS"));
      },
    });
  }
);
