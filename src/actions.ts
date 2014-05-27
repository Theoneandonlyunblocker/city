/// <reference path="js/employee.d.ts" />
/// <reference path="js/player.d.ts" />
/// <reference path="js/eventlistener.d.ts" />
/// <reference path="js/spriteblinker.d.ts" />
/// 
module actions
{
  var blinkerTODO = new Blinker(600, 0x880055, -1, false);

  export function buyCell( player: Player, cell, employee: Employee )
  {
    employee.active = false;
    employee.currentAction = "buyCell";
    var blinkerIdTODO = blinkerTODO.idGenerator++;

    var actionTime = getActionTime([employee.skills["negotiation"]], 14);
    var price = getActionCost([employee.skills["negotiation"]], cell.landValue).actual;

    var buyCellConfirmFN = function()
    {
      blinkerTODO.removeCells(blinkerIdTODO);
      employee.active = true;
      employee.currentAction = undefined;
      employee.trainSkill("negotiation");
      if (player.money < price)
      {
        eventManager.dispatchEvent(
        {
          type: "makeInfoPopup",
          content:
          {
            text: "Not enough funds"
          }
        })
        return false;
      }

      else
      {
        player.addCell(cell);
        player.addMoney(-price);
        eventManager.dispatchEvent({type: "updateWorld", content: ""});

        return true
      }

    }.bind(this);

    var buyCellCancelFN = function()
    {
      blinkerTODO.removeCells(blinkerIdTODO);
      employee.active = true;
      employee.currentAction = undefined;
    }.bind(this);

    var onCompleteText = "Buy plot for " + price + "$?";

    var buyCellCompleteFN = function()
    {
      blinkerTODO.addCells([cell], blinkerIdTODO);
      blinkerTODO.start();
      eventManager.dispatchEvent(
      {
        type: "makeConfirmPopup",
        content:
        {
          text: onCompleteText,
          onOk: buyCellConfirmFN,
          onClose: buyCellCancelFN
        }
      })
    };

    eventManager.dispatchEvent({type: "updateWorld", content:""});
    eventManager.dispatchEvent({type: "delayedAction", content:
      {
        time: actionTime["actual"],
        onComplete: buyCellCompleteFN
      }
    });
  }
  export function recruitEmployee(player: Player, employee: Employee)
  {
    employee.active = false;
    employee.currentAction = "recruit";

    var actionTime = getActionTime([employee.skills["recruitment"]], 14);

    var employeeCount = getSkillAdjust(
      [employee.skills["recruitment"]],
      2,
      function employeeCountAdjustFN(avgSkill){return 1 / (1.5 / Math.log(avgSkill + 1))},
      0.33);

    var newEmployees = makeNewEmployees(employeeCount.actual, employee.skills["recruitment"]);


    var recruitCompleteFN = function()
    {
      eventManager.dispatchEvent(
      {
        type: "makeRecruitCompletePopup",
        content:
        {
          player: player,
          employees: newEmployees,
          text: [employee.name + " was able to scout the following people.",
          "Which one should we recruit?"],
          recruitingEmployee: employee
        }
      })
    }
    eventManager.dispatchEvent({type: "delayedAction", content:
      {
        time: actionTime["actual"],
        onComplete: recruitCompleteFN
      }
    });
  }

  export function constructBuilding(props:
  {
    player: Player;
    cell: any;
    building: any;
    employee: Employee;
  })
  {
    var player = props.player;
    var cell = props.cell;
    var building = props.building;
    var employee = props.employee;

    employee.active = false;
    employee.currentAction = "constructBuilding";
    var blinkerId = blinkerTODO.idGenerator++;

    var actionTime = getActionTime([employee.skills["construction"]], building.buildTime);

    var constructBuildingConfirmFN = function()
    {
      blinkerTODO.removeCells(blinkerId);
      employee.active = true;
      employee.currentAction = undefined;

      cell.changeContent(building, true, player);
      eventManager.dispatchEvent({type: "updateWorld", content: ""});
    };
    var constructBuildingCompleteFN = function()
    {
      blinkerTODO.addCells([cell], blinkerId);
      blinkerTODO.start();
      eventManager.dispatchEvent(
      {
        type: "makeInfoPopup",
        content:
        {
          text: "Building at cell " + cell.gridPos + " has finished construction.",
          onClose: constructBuildingConfirmFN
        }
      })
    }

    eventManager.dispatchEvent({type: "delayedAction", content:
      {
        time: actionTime["actual"],
        onComplete: constructBuildingCompleteFN
      }
    });
  }

  function getSkillAdjust( skills: number[], base: number, adjustFN, variance: number)
  {
    var avgSkill = skills.reduce(function(a, b){return a+b}) / skills.length;
    var workRate = adjustFN ? adjustFN(avgSkill) : 2 / Math.log(avgSkill + 1);
    
    var approximate = Math.round(base * workRate);
    var actual = Math.round(approximate +
      randRange(-base * variance, base * variance) );

    return(
    {
      approximate: approximate,
      actual: actual < 1 ? 1 : actual
    });
  }
  export function getActionTime( skills: number[], base: number )
  {
    return getSkillAdjust(
      skills,
      base,
      function actionTimeAdjustFN(avgSkill){return 2 / Math.log(avgSkill + 1);},
      0.25
    );
  }

  export function getActionCost( skills: number[], base: number )
  {
    return getSkillAdjust(
      skills,
      base,
      function actionCostAdjustFN(avgSkill){return 2 / Math.log(avgSkill + 3);},
      0.25
    );
  }
}
