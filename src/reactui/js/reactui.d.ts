/// <reference path="../../../lib/react.d.ts" />
/// <reference path="../../js/player.d.ts" />
/// <reference path="employeelist.d.ts" />
/// <reference path="employee.d.ts" />
/// <reference path="cellinfo.d.ts" />
/// <reference path="popup.d.ts" />
/// <reference path="stage.d.ts" />
declare class ReactUI {
    public idGenerator: number;
    public popups: any[];
    public topZIndex: number;
    public stage: any;
    constructor();
    public init(): void;
    public makeCellBuyPopup(player: Player, cell: any): void;
    public newPopup(_employees: any[]): void;
    public destroyPopup(key: any): void;
    public updateReact(): void;
}
