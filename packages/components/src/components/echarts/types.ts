export interface ColorStop {
    offset: number;
    color: string;
}

export type Colors = string | ColorStop[];

export enum BarDirectionEnum {
    Horizontal = "Horizontal",
    Vertical = "Vertical",
}
