sap.ui.define(["sap/ui/thirdparty/jquery"], function (jQuery) {
  "use strict";
  var DemoPersoService = {
    oData: {
      _persoSchemaVersion: "1.0",
      aColumns: [
        {
          id: "tasklist-tableTaskId-taskNameColId",
          order: 0,
          text: "Название задачи",
          visible: true,
        },
        {
          id: "tasklist-tableTaskId-taskTypeColId",
          order: 1,
          text: "Тип задачи",
          visible: true,
        },
        {
          id: "tasklist-tableTaskId-taskUserOwnerColId",
          order: 2,
          text: "Ответственный",
          visible: true,
        },
        {
          id: "tasklist-tableTaskId-taskDateBeginColId",
          order: 3,
          text: "Дата начала",
          visible: true,
        },
        {
          id: "tasklist-tableTaskId-taskDateEndColId",
          order: 4,
          text: "Дата окончания",
          visible: true,
        },
      ],
    },

    oResetData: {
      _persoSchemaVersion: "1.0",
      aColumns: [
        {
          id: "tasklist-tableTaskId-taskNameColId",
          order: 0,
          text: "Название задачи",
          visible: true,
        },
        {
          id: "tasklist-tableTaskId-taskTypeColId",
          order: 1,
          text: "Тип задачи",
          visible: true,
        },
        {
          id: "tasklist-tableTaskId-taskUserOwnerColId",
          order: 2,
          text: "Ответственный",
          visible: true,
        },
        {
          id: "tasklist-tableTaskId-taskDateBeginColId",
          order: 3,
          text: "Дата начала",
          visible: true,
        },
        {
          id: "tasklist-tableTaskId-taskDateEndColId",
          order: 4,
          text: "Дата окончания",
          visible: true,
        },
      ],
    },

    getPersData: function () {
      var oDeferred = new jQuery.Deferred();
      if (!this._oBundle) {
        this._oBundle = this.oData;
      }
      oDeferred.resolve(this._oBundle);
      return oDeferred.promise();
    },

    setPersData: function (oBundle) {
      var oDeferred = new jQuery.Deferred();
      this._oBundle = oBundle;
      oDeferred.resolve();
      return oDeferred.promise();
    },

    resetPersData: function () {
      var oDeferred = new jQuery.Deferred();
      this._oBundle = this.oResetData;
      oDeferred.resolve();
      return oDeferred.promise();
    },
  };

  return DemoPersoService;
});
