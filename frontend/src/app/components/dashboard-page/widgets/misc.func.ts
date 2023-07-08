import { MftColorScheme } from "src/app/models/common.model";
import { MatColorName, MftMode } from "src/app/models/dash.model";



export function colorToScheme(color: MatColorName, mode: MftMode): MftColorScheme {
    if (mode === "intense"){
        return <MftColorScheme>{
            tile: color,
            status: color,
            slider: 'primary',
            actionBarIcon: color,
            flatButton: color,
            typeIcon: 'primary',
            valueStatus: 'warn'
        }
    }else{
        return <MftColorScheme>{
            tile: color !== 'pale' ? 'primary' : 'pale',
            status: color,
            slider: 'primary',
            actionBarIcon: 'pale',
            flatButton: color,
            typeIcon: 'primary',
            valueStatus: "pale"
        }
    }
}