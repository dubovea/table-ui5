sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "tasklist/model/ODataUnit",
  ],
  function (SAPObject, JSONModel, BindingMode, ODataUnit) {
    "use strict";

    return SAPObject.extend("tasklist.Application", {
      constructor: function (oComponent) {
        this.__oComponent = oComponent;
      },

      init: function () {
        this.__oComponent.getRouter().initialize();
        this.__oGlobalProperties = {
          application: this,
        };
        this.__oGlobalModel = new JSONModel(this.__oGlobalProperties);
        this.__oGlobalModel.setDefaultBindingMode(BindingMode.TwoWay);
        this.__oComponent.setModel(this.__oGlobalModel, "globalProperties");
        this.__ODataUnit = new ODataUnit(this.__oComponent.getModel());
      },

      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },
    });
  }
);
