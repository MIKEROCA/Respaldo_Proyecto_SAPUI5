sap.ui.define([
    //"sap/ui/core/mvc/Controller",
    "logaligroup/employees/controller/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
	 */
    function (Base, JSONModel, Filter, FilterOperator) {
        "use strict";

        return Base.extend("logaligroup.employees.controller.MasterEmployee", {
            onInit: function () {
                this._bus = sap.ui.getCore().getEventBus();
            },

            onFilter: function () {
                let oJSONCountries = this.getView().getModel("jsonCountries").getData();

                let filters = [];
                if (oJSONCountries.EmployeeId !== "") {
                    filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
                }
                if (oJSONCountries.CountryKey !== "") {
                    filters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
                }
                //se obtienen datos de la tabla
                let oList = this.getView().byId("tableEmployee");
                let oBinding = oList.getBinding("items");
                oBinding.filter(filters);

            },

            onClearFilter: function () {
                let oModel = this.getView().getModel("jsonCountries");
                oModel.setProperty("/EmployeeId", "");
                oModel.setProperty("/CountryKey", "");
            },

            showPostalCode: function (oEvent) {
                let itemPressed = oEvent.getSource();
                let oContext = itemPressed.getBindingContext("jsonEmployees");
                let objectContext = oContext.getObject();

                sap.m.MessageToast.show(objectContext.PostalCode);
            },

            showOrders: function (oEvent) {

                //get selected controller
                let iconPressed = oEvent.getSource();

                //Context from the model
                let oContext = iconPressed.getBindingContext("odataNorthwind");

                if (!this._oDialogOrders) {
                    this._oDialogOrders = sap.ui.xmlfragment("logaligroup.employees.fragment.DialogOrders", this);
                    this.getView().addDependent(this._oDialogOrders);
                }

                //Dialog Binding to the Context to have access to the data of selected item
                this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath());
                this._oDialogOrders.open();

            },

            onCloseOrders: function () {
                this._oDialogOrders.close();
            },

            onShowCity: function () {
                let oJSONModelConfig = this.getView().getModel("jsonModelConfig");
                oJSONModelConfig.setProperty("/visibleCity", true);
                oJSONModelConfig.setProperty("/visibleBtnShowCity", false);
                oJSONModelConfig.setProperty("/visibleBtnHideCity", true);
            },

            onHideCity: function () {
                let oJSONModelConfig = this.getView().getModel("jsonModelConfig");
                oJSONModelConfig.setProperty("/visibleCity", false);
                oJSONModelConfig.setProperty("/visibleBtnShowCity", true);
                oJSONModelConfig.setProperty("/visibleBtnHideCity", false);
            },

            //onValidate: function () {
            //    let inputEmployee = this.getView().byId("inputEmployee");
            //    let valueEmployee = inputEmployee.getValue();
            //
            //    if (valueEmployee.length === 6) {
            //        //inputEmployee.setDescription("OK");
            //        this.getView().byId("labelCountry").setVisible(true);
            //        this.getView().byId("slCountry").setVisible(true);
            //    } else {
            //        //inputEmployee.setDescription("Not OK");
            //        this.getView().byId("labelCountry").setVisible(false);
            //        this.getView().byId("slCountry").setVisible(false);
            //    }
            //},

            showEmployee: function (oEvent) {
                let path = oEvent.getSource().getBindingContext("odataNorthwind").getPath();
                this._bus.publish("flexible", "showEmployee", path)
            },

            //toOrderDetails: function (oEvent) {
            //    let orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
            //    let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //    oRouter.navTo("RouteOrderDetails", {
            //        OrderID: orderID
            //    });
            //}
        });
    });
