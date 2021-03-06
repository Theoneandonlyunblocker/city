/// <reference path="../../lib/react.d.ts" />
/// <reference path="../../lib/pixi.d.ts" />
///
/// <reference path="../../data/js/cg.d.ts" />
///
/// <reference path="../js/player.d.ts" />
/// <reference path="../js/actions.d.ts" />
/// <reference path="../js/eventlistener.d.ts" />
///
/// <reference path="js/employeelist.d.ts" />
/// <reference path="js/employee.d.ts" />
/// <reference path="js/employeeaction.d.ts" />
/// <reference path="js/employeeactionpopup.d.ts" />
/// <reference path="js/inputpopup.d.ts" />
/// <reference path="js/actioninfo.d.ts" />
/// <reference path="js/stage.d.ts" />
var ReactUI = (function () {
    function ReactUI(player, frameImages) {
        this.idGenerator = 0;
        this.popups = {};
        this.topZIndex = 15;
        this.player = player;
        this.frameImages = frameImages;
        this.init();
    }
    ReactUI.prototype.init = function () {
        React.initializeTouchEvents(true);
        this.addEventListeners();
        this.updateReact();
    };
    ReactUI.prototype.addEventListeners = function () {
        var self = this;

        eventManager.addEventListener("makeEmployeeActionPopup", function (event) {
            self.makeEmployeeActionPopup(event.content);
        });
        eventManager.addEventListener("makeRecruitPopup", function (event) {
            self.makeRecruitPopup(event.content);
        });
        eventManager.addEventListener("makeRecruitCompletePopup", function (event) {
            self.makeRecruitCompletePopup(event.content);
        });
        eventManager.addEventListener("makeCellBuyPopup", function (event) {
            self.makeCellBuyPopup(event.content);
        });
        eventManager.addEventListener("makeConfirmPopup", function (event) {
            self.makeConfirmPopup(event.content);
        });
        eventManager.addEventListener("makePopup", function (event) {
            self.makePopup(event.content.type, event.content.props);
        });
        eventManager.addEventListener("makeInfoPopup", function (event) {
            self.makeInfoPopup(event.content);
        });
        eventManager.addEventListener("makeBuildingSelectPopup", function (event) {
            self.makeBuildingSelectPopup(event.content);
        });
        eventManager.addEventListener("makeBuildingConstructPopup", function (event) {
            self.makeBuildingConstructPopup(event.content);
        });
        eventManager.addEventListener("makeInputPopup", function (event) {
            self.makeInputPopup(event.content);
        });
        eventManager.addEventListener("makeLoadPopup", function (event) {
            self.makeLoadPopup();
        });
        eventManager.addEventListener("makeSavePopup", function (event) {
            self.makeSavePopup();
        });
        eventManager.addEventListener("closeTopPopup", function (event) {
            self.closeTopPopup();
        });
        eventManager.addEventListener("updateReact", function (event) {
            self.updateReact();
        });
    };

    ///// /////
    ReactUI.prototype.makePopup = function (type, props) {
        var key = this.idGenerator++;

        var onCloseCallback = props.onClose;
        props.onClose = function () {
            this.destroyPopup(key, onCloseCallback);
        }.bind(this);

        var zIndex = this.incrementZIndex();
        var popupProps = {};
        for (var prop in props) {
            popupProps[prop] = props[prop];
        }
        ;
        popupProps.key = key;
        popupProps.initialStyle = {
            top: window.innerHeight / 3.5 - 60 + Object.keys(this.popups).length * 15,
            left: window.innerWidth / 3.5 - 60 + Object.keys(this.popups).length * 15,
            zIndex: zIndex
        };
        popupProps.incrementZIndex = this.incrementZIndex.bind(this, key);

        var popup = {
            type: type,
            props: popupProps,
            zIndex: zIndex
        };

        this.popups[key] = popup;
        this.updateReact();
    };

    ReactUI.prototype.makeEmployeeActionPopup = function (props) {
        this.makePopup("EmployeeActionPopup", props);
    };

    ReactUI.prototype.makeInfoPopup = function (props) {
        this.makePopup("InfoPopup", props);
    };
    ReactUI.prototype.makeLoadPopup = function () {
        this.makePopup("LoadPopup", {
            onOk: function (name) {
                eventManager.dispatchEvent({
                    type: "loadGame",
                    content: name
                });
            }
        });
    };

    ReactUI.prototype.makeSavePopup = function () {
        this.makePopup("SavePopup", {
            onOk: function (name) {
                eventManager.dispatchEvent({
                    type: "saveGame",
                    content: name
                });
            }
        });
    };

    ReactUI.prototype.makeRecruitPopup = function (props) {
        var self = this;
        var recruitWithSelected = function (selected) {
            actions.recruitEmployee(props.player, selected.employee);
        };
        this.makeEmployeeActionPopup({
            player: props.player,
            relevantSkills: ["recruitment"],
            text: "Select employee in charge of recruitment",
            onOk: recruitWithSelected,
            okBtnText: "Select",
            action: {
                actionText: "Scouting new employees would take:",
                data: {
                    time: {
                        approximate: true,
                        amount: 14
                    }
                }
            }
        });
    };

    ReactUI.prototype.makeRecruitCompletePopup = function (props) {
        var self = this;
        var recruitConfirmFN = function (selected) {
            props.player.addEmployee(selected.employee);
            if (props.recruitingEmployee) {
                props.recruitingEmployee.trainSkill("recruitment");
            }
        };

        var recruitCloseFN = function (selected) {
            if (props.recruitingEmployee) {
                props.recruitingEmployee.active = true;
                self.updateReact();
            }
        };
        this.makeEmployeeActionPopup({
            employees: props.employees,
            text: props.text || "Choose employee to recruit",
            onOk: recruitConfirmFN,
            onClose: recruitCloseFN,
            okBtnText: "Recruit"
        });
    };

    ReactUI.prototype.makeCellBuyPopup = function (props) {
        if (Object.keys(props.player.employees).length < 1) {
            this.makeInfoPopup({ text: "Recruit some employees first" });
            return;
        }

        if (props.player.ownedCells[props.cell.gridPos])
            return;

        var buyCost = props.cell.landValue;
        if (props.cell.content) {
            buyCost += 10;
            if (props.cell.content.type.cost) {
                buyCost += props.cell.content.type.cost * 1.15;
            }
        }
        var buySelected = function (selected) {
            actions.buyCell(props.player, props.cell, selected.employee, buyCost);
        };
        this.makeEmployeeActionPopup({
            player: props.player,
            relevantSkills: ["negotiation"],
            text: "Select employee in charge of purchasing the plot",
            onOk: buySelected,
            okBtnText: "Buy",
            action: {
                target: props.cell,
                actionText: "Buying this plot would take:",
                data: {
                    time: {
                        approximate: true,
                        amount: 14
                    },
                    cost: {
                        approximate: true,
                        amount: buyCost
                    }
                }
            }
        });
    };
    ReactUI.prototype.makeConfirmPopup = function (props) {
        this.makePopup("ConfirmPopup", props);
    };
    ReactUI.prototype.makeBuildingSelectPopup = function (props) {
        if (Object.keys(props.player.employees).length < 1) {
            this.makeInfoPopup({ text: "Recruit some employees first" });
            return;
        }

        this.makePopup("BuildingListPopup", {
            player: props.player,
            buildingTemplates: cg.content.buildings,
            buildingImages: this.frameImages,
            onOk: props.onOk
        });
    };
    ReactUI.prototype.makeBuildingConstructPopup = function (props) {
        var buildBuilding = function (selected) {
            if (selected) {
                actions.constructBuilding({
                    player: props.player,
                    cell: props.cell,
                    building: props.buildingTemplate,
                    employee: selected.employee
                });
                props.onOk.call();
            }
        };
        this.makeEmployeeActionPopup({
            player: props.player,
            relevantSkills: ["construction"],
            text: "Select employee in charge of construction",
            onOk: buildBuilding,
            okBtnText: "Build",
            action: {
                target: props.cell,
                actionText: "Constructing this building would take:",
                data: {
                    time: {
                        approximate: true,
                        amount: props.buildingTemplate.buildTime
                    },
                    cost: {
                        approximate: false,
                        amount: props.buildingTemplate.cost
                    }
                },
                baseDuration: props.buildingTemplate.buildTime,
                exactCost: props.buildingTemplate.cost
            }
        });
    };

    ReactUI.prototype.makeInputPopup = function (props) {
        this.makePopup("InputPopup", props);
    };

    ///// OTHER METHODS /////
    ReactUI.prototype.incrementZIndex = function (key) {
        var newZIndex = this.topZIndex++;
        if (key) {
            this.popups[key].zIndex = newZIndex;
        }
        return newZIndex;
    };
    ReactUI.prototype.destroyPopup = function (key, callback) {
        if (callback)
            callback.call();

        this.popups[key] = null;
        delete this.popups[key];

        this.updateReact();
    };
    ReactUI.prototype.closeTopPopup = function () {
        if (Object.keys(this.popups).length < 1)
            return;
        else {
            var max = 0;
            var key;
            for (var popup in this.popups) {
                if (this.popups[popup].zIndex > max) {
                    max = this.popups[popup].zIndex;
                    key = popup;
                }
            }
            this.destroyPopup(key);
        }
    };
    ReactUI.prototype.clearAllPopups = function () {
        this.popups = {};
    };

    ReactUI.prototype.updateReact = function () {
        React.renderComponent(UIComponents.Stage({ popups: this.popups }), document.getElementById("react-container"));
    };
    return ReactUI;
})();
//# sourceMappingURL=reactui.js.map
