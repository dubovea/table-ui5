sap.ui.define(
  ["sap/ui/core/UIComponent", "tasklist/Application"],
  function (UIComponent, Application) {
    "use strict";

    return UIComponent.extend("tasklist.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG);
        UIComponent.prototype.init.apply(this, arguments);
        new Application(this).init();
      },
    });
  }
);
