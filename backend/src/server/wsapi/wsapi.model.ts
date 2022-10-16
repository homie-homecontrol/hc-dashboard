import { Observable } from "rxjs";
import { Core } from "../../core/Core";
import { APIMessage } from "../../model/api.model";

export type makeAPIFunc<OPTIONS> = (messages$: Observable<APIMessage>, opts: OPTIONS, onDestroy$: Observable<boolean>) => Observable<APIMessage>;
