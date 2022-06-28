sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
  "use strict";

  return {
    formatValueState: function (value, bInvalidated) {
      if (!value && bInvalidated) {
        return "Error";
      }
      return "None";
    },

    formatValueStateDateEnd: function (dDateBegin, dDateEnd, bInvalidated) {
      if (!dDateEnd && bInvalidated) {
        return "Error";
      }
      if (+dDateEnd < +dDateBegin && bInvalidated) {
        return "Error";
      }
      return "None";
    },
  };
});
