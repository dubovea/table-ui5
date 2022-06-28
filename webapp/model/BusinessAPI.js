sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Преобразование и получение списка задач на месяц
     * @param {Object} oParams параметры выполнения
     * @param {Object}  oParams.oData  результат работы функции oModel.read() - чтения сущности
     * @param {Function} oParams.fnSuccess функция для передачи в неё готового массива
     * @param {Function} oParams.fnError функция для передачи в неё объекта с описанием ошибки (в случае возникновения)
     */
    getTaskList: function (oParams) {
      let aResult = [];
      try {
        aResult = oParams.aData.map((o) => ({
          sId: o.Id || "",
          sTaskName: o.TaskName || "",
          sTaskType: o.TaskType || "",
          sUserOwner: o.UserOwner || "",
          dDateBegin: o.DateBegin || null,
          dDateEnd: o.DateEnd || null,
        }));
        oParams.fnSuccess(aResult);
      } catch (e) {
        oParams.fnError({
          message: "@ catch: " + e.message,
        });
      }
    },

    checkListBeforeSave: function (aList) {
      let bError = aList.some((o) => {
        return (
          Object.values(o).some((value) => !value) ||
          +o.dDateEnd < +o.dDateBegin
        );
      });
      return bError;
    },
  };
});
