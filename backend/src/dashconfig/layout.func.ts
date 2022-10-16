import { ScreenSize, PageLayout, ScreenSizes, ColumnConfig } from "../model/dash.model";



export function getNextConfiguredLayout(layoutSize: ScreenSize, layout: PageLayout): ScreenSize | null {

    const startIndex = ScreenSizes.indexOf(layoutSize);
    for (let index = startIndex + 1; index < ScreenSizes.length; index++) {
        const ls = ScreenSizes[index];
        if (!!layout[ls]) {
            return ls;
        }
    }
    return null;
}

export function normalizeLayout(layout: PageLayout): PageLayout {
    const normalized: PageLayout = { autoReflow: layout.autoReflow };
    for (let index = 0; index < ScreenSizes.length; index++) {
        const screenSize = ScreenSizes[index];
        if (!layout[screenSize]) {
            const nextCfgSize = getNextConfiguredLayout(screenSize, layout);
            if (nextCfgSize) {
                normalized[screenSize] = reflowColumns(layout.autoReflow, layout[nextCfgSize]!, screenSize);
            } else {
                normalized[screenSize] = normalized[ScreenSizes[index - 1]];
            }
        } else {
            normalized[screenSize] = layout[screenSize]
        }
    }
    return normalized;
}

export function reflowColumns(reflowType: 'stacked' | 'single' | null | undefined, fromCol: ColumnConfig, toScreenSize: ScreenSize): ColumnConfig {
    const colNums: { [K in ScreenSize]: number } = {
        small: 1,
        medium: 2,
        large: 3,
        xlarge: 4
    }

    const toCol: ColumnConfig = { columns: [] }
    for (let index = 0; index < colNums[toScreenSize]; index++) {
        toCol.columns.push([]);
    }
    if (reflowType === 'stacked' || reflowType === null || reflowType === undefined) {
        for (let colIndex = 0; colIndex < fromCol.columns.length; colIndex++) {
            const column = fromCol.columns[colIndex];
            const targetColIndex = colIndex % colNums[toScreenSize];
            toCol.columns[targetColIndex] = [...toCol.columns[targetColIndex], ...column];
        }
    } else if (reflowType === 'single') {
        const maxColumnLength = getLongestColumnCount(fromCol);
        let cardCounter = 0;
        for (let columnLineIndex = 0; columnLineIndex < maxColumnLength; columnLineIndex++) {
            for (let colIndex = 0; colIndex < fromCol.columns.length; colIndex++) {
                const column = fromCol.columns[colIndex];
                const targetColIndex = cardCounter % colNums[toScreenSize];
                if (columnLineIndex < column.length) {
                    toCol.columns[targetColIndex] = [...toCol.columns[targetColIndex], column[columnLineIndex]];
                    cardCounter++;
                }
            }
        }
    }
    return toCol;
}

export function getLongestColumnCount(colCfg: ColumnConfig) {
    var longest = 0;
    for (let colIndex = 0; colIndex < colCfg.columns.length; colIndex++) {
        const column = colCfg.columns[colIndex];
        longest = Math.max(longest, column.length);
    }
    return longest;
}
