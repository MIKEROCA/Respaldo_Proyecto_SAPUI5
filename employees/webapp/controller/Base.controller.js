sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        //'use strict';

        return Controller.extend("logaligroup.employees.controller.Base", {

            onInit: function () {

            },

            toOrderDetails: function (oEvent) {
                let orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteOrderDetails", {
                    OrderID: orderID
                });
            }
        });
    });            