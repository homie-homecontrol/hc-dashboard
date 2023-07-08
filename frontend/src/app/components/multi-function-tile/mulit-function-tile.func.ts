
// export const BGCsCssMapping = {
//     'primary' : 'mft-primary-bg mft-primary-text',

import { MatColorName, ColorSchemes } from "src/app/models/dash.model";

// }

export function getDefault(color?: MatColorName, defaultScheme: MatColorName = 'pale'): MatColorName {
    return color ? color : defaultScheme;
}


export function bgColorSchemeCssMapping(colorScheme?: MatColorName, lighter: 'lighter' | undefined = undefined): string {
    const color = getDefault(colorScheme);
    const lmodifier = lighter ? "-lighter" : "";
    return `mft-${color}${lmodifier}-bg mft-${color}${lmodifier}-text`;
}


export function colorColorSchemeCssMapping(colorScheme?: MatColorName, lighter: 'lighter' | undefined = undefined): string {
    const color = getDefault(colorScheme);
    const lmodifier = lighter ? "-lighter" : "";
    return `mft-${color}${lmodifier}-color`;
}

export function indicatorColorSchemeCssMapping(colorScheme?: MatColorName, lighter: 'lighter' | undefined = undefined): string {
    const color = getDefault(colorScheme);
    const lmodifier = lighter ? "-lighter" : "";
    return `mft-right-indicator-${color}${lmodifier}`;
}