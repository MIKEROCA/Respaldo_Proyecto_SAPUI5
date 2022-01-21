sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"    
],

    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     */
    function (Controller, JSONModel, MessageBox) {
        //'use strict';

        return Controller.extend("logaligroup.employees.controller.Main", {

            onBeforeRendering: function () {
                this._detailEmployeeView = this.getView().byId("detailEmployeeView");
            },

            onInit: function () {
                let oView = this.getView();

                let oJSONModelEmpl = new JSONModel();
                oJSONModelEmpl.loadData("../model/json/Employees.json", false);
                oView.setModel(oJSONModelEmpl, "jsonEmployees");

                let oJSONModelCountries = new JSONModel();
                oJSONModelCountries.loadData("../model/json/Countries.json", false);
                oView.setModel(oJSONModelCountries, "jsonCountries");

                let oJSONModelLayout = new JSONModel();
                oJSONModelLayout.loadData("../model/json/Layouts.json", false);
                oView.setModel(oJSONModelLayout, "jsonLayout");

                let oJSONModelConfig = new JSONModel({
                    visibleID: true,
                    visibleName: true,
                    visibleCountry: true,
                    visibleCity: false,
                    visibleBtnShowCity: true,
                    visibleBtnHideCity: false,
                });
                oView.setModel(oJSONModelConfig, "jsonModelConfig");

                //subscribción del evento
                this._bus = sap.ui.getCore().getEventBus();
                this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);

                this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveODataIncidence, this);

                this._bus.subscribe("incidence", "onDeleteIncidence", function (channelId, eventId, data) {
                    
                    let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                    
                    this.getView().getModel("incidenceModel").remove("/IncidentsSet(IncidenceId='" + data.IncidenceId +
                        "',SapId='" + data.SapId +
                        "',EmployeeId='" + data.EmployeeId + "')", {
                        success: function () {
                            this.onReadODataIncidence.bind(this)(data.EmployeeId);
                            sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteOK"));
                        }.bind(this),
                        error: function (error) {
                            sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteKO"));
                        }.bind(this)
                    });
                }, this);
            },

            showEmployeeDetails: function (category, nameEvent, path) {
                let detailView = this.getView().byId("detailEmployeeView");
                detailView.bindElement("odataNorthwind>" + path);
                this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

                let incidenceModel = new JSONModel([]);
                detailView.setModel(incidenceModel, "incidenceModel");
                detailView.byId("tableIncidence").removeAllContent();
                this.onReadODataIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID);
            },

            onSaveODataIncidence: function (channelId, eventId, data) {
                let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                let employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
                let incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();

                if (typeof incidenceModel[data.incidenceRow].IncidenceId == 'undefined') {
                    //se crea cuerpo para la llamada oData
                    let body = {

                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: employeeId.toString(),
                        CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                        //CreationDateX :
                        Type: incidenceModel[data.incidenceRow].Type,
                        //TypeX :
                        Reason: incidenceModel[data.incidenceRow].Reason
                        //ReasonX :
                    }
                    this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
                        success: function () {
                            this.onReadODataIncidence.bind(this)(employeeId);
                            //sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOK"));
                            MessageBox.success(oResourceBundle.getText("odataSaveOK"));
                        }.bind(this),
                        error: function (error) {
                            sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"));
                        }.bind(this)
                    })

                } else if (incidenceModel[data.incidenceRow].CreationDateX ||
                    incidenceModel[data.incidenceRow].ReasonX ||
                    incidenceModel[data.incidenceRow].TypeX) {

                    let body = {
                        CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                        CreationDateX: incidenceModel[data.incidenceRow].CreationDateX,
                        Type: incidenceModel[data.incidenceRow].Type,
                        TypeX: incidenceModel[data.incidenceRow].TypeX,
                        Reason: incidenceModel[data.incidenceRow].Reason,
                        ReasonX: incidenceModel[data.incidenceRow].ReasonX
                    };

                    this.getView().getModel("incidenceModel").update("/IncidentsSet(IncidenceId='" + incidenceModel[data.incidenceRow].IncidenceId +
                        "',SapId='" + incidenceModel[data.incidenceRow].SapId +
                        "',EmployeeId='" + incidenceModel[data.incidenceRow].EmployeeId + "')", body, {
                        success: function () {
                            this.onReadODataIncidence.bind(this)(employeeId);
                            sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateOK"));
                        }.bind(this),
                        error: function (error) {
                            sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateKO"));
                        }.bind(this)
                    });

                } else {
                    sap.m.MessageToast.show(oResourceBundle.getText("odataNoChanges"));
                }
            },

            onReadODataIncidence: function (employeeId) {
                this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                    filters: [
                        new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                        new sap.ui.model.Filter("EmployeeId", "EQ", employeeId.toString())
                    ],
                    success: function (data) {
                        let incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                        incidenceModel.setData(data.results);
                        let tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                        tableIncidence.removeAllContent();

                        for (var incidence in data.results) {
                            data.results[incidence]._ValidateDate = true;
                            data.results[incidence].EnabledSave = false;
                            let newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence", this._detailEmployeeView.getController());
                            this._detailEmployeeView.addDependent(newIncidence);
                            newIncidence.bindElement("incidenceModel>/" + incidence);
                            tableIncidence.addContent(newIncidence)
                        }
                    }.bind(this),
                    error: function (error) {

                    }
                });
            }
        });
    });