import { Observable } from "rxjs";
import { Core } from "../core/Core";
import { APIMessage } from "../model/api.model";

export type makeAPIFunc = (messages$: Observable<APIMessage>, core: Core, onDestroy$: Observable<boolean>) => Observable<APIMessage>;
