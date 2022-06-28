sap.ui.define(["sap/ui/base/Object"], function (SAPObject) {
  "use strict";

  return SAPObject.extend("tasklist.controller.model.ODataUnit", {
    constructor: function (oModel) {
      this.__oDataModel = oModel;
    },

    refresh: function () {
      this.__oDataModel.refresh();
    },

    __readOData: function (sPath, oParams) {
      return new Promise(
        function (resolve, reject) {
          this.__oDataModel.read(sPath, {
            urlParameters: oParams ? oParams.urlParameters : null,
            filters: oParams ? oParams.filters : null,
            sorters: oParams ? oParams.sorters : null,
            success: function (oData) {
              resolve(oData);
            },
            error: function (oResponse) {
              reject(oResponse);
            },
          });
        }.bind(this)
      );
    },

    /**
     * Запрос списка задач на месяц
     * @param {Object} oParams параметры выполнения
     * @param {Map} oParams.mFilter фильтры, поля будут описаны позже
     * @returns {Promise} с передачей массива записей
     */
    getTaskList: function (oParams) {
      return new Promise((resolve, reject) => {
        let aTaskLocalStorage = $.sap.storage.get("taskList"),
          aTasks = [
            {
              Id: "1",
              TaskName: "Разработка тестового приложения",
              TaskType: "",
              UserOwner: "",
              DateBegin: null,
              DateEnd: null,
            },
            {
              Id: "2",
              TaskName: "Тестирование приложения",
              TaskType: "",
              UserOwner: "",
              DateBegin: null,
              DateEnd: null,
            },
            {
              Id: "3",
              TaskName: "Тестирование приложения #2",
              TaskType: "",
              UserOwner: "",
              DateBegin: null,
              DateEnd: null,
            },
          ];
        if (aTaskLocalStorage) {
          aTasks = aTaskLocalStorage.map((o) => ({
            ...o,
            DateBegin: new Date(o.DateBegin),
            DateEnd: new Date(o.DateEnd),
          }));
        }

        const sTaskType = oParams.mFilter.get("sTaskType"),
          sUserOwner = oParams.mFilter.get("sUserOwner"),
          dDateBegin = oParams.mFilter.get("dDateBegin"),
          dDateEnd = oParams.mFilter.get("dDateEnd");
        if (sTaskType) {
          aTasks = aTasks.filter((o) => {
            return o.TaskType === sTaskType;
          });
        }
        if (sUserOwner) {
          aTasks = aTasks.filter((o) => {
            return o.UserOwner.indexOf(sUserOwner) > -1;
          });
        }
        if (dDateBegin) {
          aTasks = aTasks.filter((o) => {
            return +o.DateBegin >= +dDateBegin;
          });
        }
        if (dDateEnd) {
          aTasks = aTasks.filter((o) => {
            return +o.DateEnd <= +dDateEnd;
          });
        }
        resolve(aTasks);
        //   this.__readOData("/TaskListSet", {
        //     filters: aFilter,
        //   })
        //     .then((oResponse) => {
        //       resolve(oResponse.results);
        //     })
        //     .catch((oError) => {
        //       reject(oError);
        //     });
      });
    },
  });
});
