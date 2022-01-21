sap.ui.define([
    //"sap/ui/core/mvc/Controller",
    "logaligroup/employees/controller/Base.controller",    
    "logaligroup/employees/model/formatter",
    "sap/m/MessageBox"
],

    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Base, formatter, MessageBox) {
        'use strict';

        return Base.extend("logaligroup.employees.controller.EmployeeDetails", {

            Formatter: formatter,

            onInit: function () {
                //atributo donde se guarda la instancia  cuando se realice la llamada
                this._bus = sap.ui.getCore().getEventBus();
            },

            onCreateIncidence: function () {
                let tableIncidence = this.getView().byId("tableIncidence");
                let newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence", this);
                let incidenceModel = this.getView().getModel("incidenceModel");
                let odata = incidenceModel.getData();
                let index = odata.length;
                odata.push({ index: index + 1, _ValidateDate: false, EnabledSave: false });
                incidenceModel.refresh();
                newIncidence.bindElement("incidenceModel>/" + index);
                tableIncidence.addContent(newIncidence);
            },

            onDeleteIncidence: function (oEvent) {
                //let tableIncidence = this.getView().byId("tableIncidence");
                //let rowIncidence = oEvent.getSource().getParent().getParent();
                //let incidenceModel = this.getView().getModel("incidenceModel");
                //let odata = incidenceModel.getData();
                //let contextObj = rowIncidence.getBindingContext("incidenceModel");

                //odata.splice(contextObj.index - 1, 1);
                //for (let i in odata) {
                //    odata[i].index = parseInt(i) + 1;
                //};

                //incidenceModel.refresh();
                //tableIncidence.removeContent(rowIncidence);

                //for (let j in tableIncidence.getContent()) {
                //    tableIncidence.getContent()[j].bindElement("incidenceModel>/" + j);
                //};
                let contextObj = oEvent.getSource().getBindingContext("incidenceModel").getObject();

                MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteIncidence"), {
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            this._bus.publish("incidence", "onDeleteIncidence", {
                                IncidenceId: contextObj.IncidenceId,
                                SapId: contextObj.SapId,
                                EmployeeId: contextObj.EmployeeId
                            });
                        }
                    }.bind(this)
                });
            },

            onSaveIncidence: function (oEvent) {
                let incidence = oEvent.getSource().getParent().getParent();
                let incidenceRow = incidence.getBindingContext("incidenceModel");
                //pasamos el evento a quien va realizar la subscripcion (incidencia seleccionada)
                //let temp = incidenceRow.sPath.replace('/','');
                this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow.sPath.replace('/', '') });
            },

            updateIncidenceCreationDate: function (oEvent) {
                let context = oEvent.getSource().getBindingContext("incidenceModel");
                let contextObj = context.getObject();
                let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                if (!oEvent.getSource().isValidValue()) {
                    contextObj._ValidateDate = false;
                    contextObj.CreationDateState = "Error";

                    MessageBox.error(oResourceBundle.getText("errorCreationDateValue"), {
                        title: "Error",
                        onClose: null,
                        styleClass: "",
                        actions: MessageBox.Action.Close,
                        emphasizeAction: null,
                        initialFocus: null,
                        textDirection: sap.ui.core.TextDirection.Inherit
                    });
                } else {
                    contextObj.CreationDateX = true;
                    contextObj._ValidateDate = true;
                    contextObj.CreationDateState = "None";
                };

                if (oEvent.getSource().isValidValue() && contextObj.Reason) {
                    contextObj.EnabledSave = true;
                } else {
                    contextObj.EnabledSave = false;
                }
                context.getModel().refresh();
            },

            updateIncidenceReason: function (oEvent) {
                let context = oEvent.getSource().getBindingContext("incidenceModel");
                let contextObj = context.getObject();

                if (!oEvent.getSource().getValue()) {
                    contextObj.ReasonX = true;
                    contextObj.ReasonState = "None";
                } else {
                    contextObj.ReasonState = "Error";
                };

                if (contextObj._ValidateDate && oEvent.getSource().getValue()) {
                    contextObj.EnabledSave = true;
                } else {
                    contextObj.EnabledSave = false;
                }

                context.getModel().refresh();
            },

            updateIncidenceType: function (oEvent) {
                let context = oEvent.getSource().getBindingContext("incidenceModel");
                let contextObj = context.getObject();

                if (contextObj._ValidateDate && contextObj.Reason) {
                    contextObj.EnabledSave = true;
                } else {
                    contextObj.EnabledSave = false;
                }
                contextObj.TypeX = true;

                context.getModel().refresh();
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