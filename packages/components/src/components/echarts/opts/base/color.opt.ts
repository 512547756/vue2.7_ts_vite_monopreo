import { ColorStop, Colors, BarDirectionEnum } from "../../types";
import isArray from "lodash/isArray";
import cloneDeep from "lodash/cloneDeep";

/**
 * 均布的渐变色
 * @param colors 色值数组
 * @returns
 */
export function createGradientColors(colors: string[]): ColorStop[] {
    return colors.map((v, index) => {
        return {
            offset: 1 * (index / (colors.length - 1)),
            color: v,
        };
    });
}

export function createColorOpts(colors: Colors[], direction = BarDirectionEnum.Vertical) {
    if (colors.length && isArray(colors[0])) {
        const colorOpts: any = {
            x: 0,
            y: 0,
            x2: 0,
            y2: 0,
        };
        colorOpts.type = "linear";

        if (BarDirectionEnum.Vertical == direction) {
            colorOpts.y2 = 1;
        } else {
            colorOpts.x2 = 1;
        }
        return colors.map((v) => {
            colorOpts.colorStops = v;
            return cloneDeep(colorOpts);
        });
    }

    return colors;
}
