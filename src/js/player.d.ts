/// <reference path="../../lib/pixi.d.ts" />
/// <reference path="employee.d.ts" />
/// <reference path="../../data/js/cg.d.ts" />
declare class Player {
    public id: string;
    public color: number;
    public money: number;
    public eventListener: any;
    public ownedContent: any;
    public weightedContentAmounts: any;
    public ownedCells: any;
    public employees: any;
    public usedInitialRecruit: boolean;
    public incomePerDate: any;
    public incomePerType: any;
    public modifiers: any;
    public modifierEffects: any;
    public moneySpan: HTMLElement;
    public incomeSpan: HTMLElement;
    constructor(id: string, color?: number);
    public bindElements(): void;
    public updateElements(): void;
    public init(): void;
    public addEventListeners(): void;
    public addEmployee(employee: Employee): void;
    public getEmployees(): any[];
    public getActiveEmployees(): any[];
    public addCell(cell: any): void;
    public removeCell(cell: any): void;
    public addContent(content: any): void;
    public removeContent(content: any): void;
    public addMoney(initialAmount: any, incomeType?: string, date?: any): void;
    public addModifier(modifier: any): void;
    public applyModifier(modifier: any): void;
    public applyAllModifiers(): void;
    public removeModifier(modifier: any): void;
    public getBuildCost(type: any): number;
    public getCellBuyCost(baseCost: any): number;
}
