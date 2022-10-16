import { Validator } from "jsonschema";
import { HomieDeviceManager, HomieProperty, } from "node-homie";
import { join, parse } from "path";
import { asyncScheduler, merge, Observable, pipe, Subject } from "rxjs";
import { takeUntil, mergeMap, map, tap, throttleTime, withLatestFrom, distinctUntilChanged, delay, filter } from "rxjs/operators";
import winston from "winston";
import * as yaml from 'js-yaml';
import { DictionaryStore, OnDestroy, OnInit } from "node-homie/misc";
import { mergeWatchList, watchList } from "node-homie/rx";
import { normalizeLayout } from "./layout.func";
import { Card, PageDef, PageMenu } from "../model/dash.model";
import { collectCardProperties, normalizeCards } from "./cards.func";
import { Settings } from "../core/Settings";
import { ConfigFileChange, ConfigFileWatcher, ConfigMapWatcher, ConfigWatcher } from "cfg-watcher";

const pageDefSchema = require?.main?.require('./PageDef.Schema.json');
const menuSchema = require?.main?.require('./PageMenu.Schema.json');

const MenuFilename = 'menu.yaml';

export interface ConfigFileInput<T> {
    id: string;
    filename: string;
    data: T,
    error: Error
}
export type MenuInput = ConfigFileInput<PageMenu>;
export type PageDefInput = ConfigFileInput<PageDef>;

export interface MenuState {
    id: string;
    pageMenuEntriesOrig: PageMenu;
    pageMenuEntries: PageMenu;
    error: Error;
}

export interface PageState {
    id: string;
    pageDefOrig?: PageDef;
    pageDef?: PageDef;
    properties?: HomieProperty[];
    error?: Error;
}

interface ConfigStoreAction<T> {
    name: 'addUpdate' | 'remove';
    item?: T;
    id: string;
}

type PageAction = ConfigStoreAction<PageState>;
type MenuAction = ConfigStoreAction<MenuState>;


export class DashConfig implements OnInit, OnDestroy {
    onDestroy$ = new Subject<boolean>();
    protected readonly log: winston.Logger;

    protected validator = new Validator();

    public pageStore = new DictionaryStore<PageState>(page => page.id);
    public menuStore = new DictionaryStore<MenuState>(menu => menu.id);

    private pageDefWatcher: ConfigWatcher;
    private menuWatcher: ConfigWatcher;

    constructor(private deviceManager: HomieDeviceManager, private settings: Settings) {
        this.log = winston.child({
            name: 'dash-config',
            type: this.constructor.name,
        });

        this.pageDefWatcher = (this.settings.config_backend === 'file' ?
            new ConfigFileWatcher(['*.yaml', '*.yml'].map(fileFilter => join(this.settings.config_folder, fileFilter))) :
            new ConfigMapWatcher(this.settings.config_kubernetes_pagedef_configmap));

        this.menuWatcher = (this.settings.config_backend === 'file' ?
            new ConfigFileWatcher(['menu.yaml', 'menu.yml'].map(fileFilter => join(this.settings.config_folder, fileFilter))) :
            new ConfigMapWatcher(this.settings.config_kubernetes_pagedef_configmap));
    }

    private readPageDefFile() {
        return pipe<Observable<ConfigFileChange>, Observable<PageDefInput>>(

            map(change => {
                const pageId = parse(change.filename).name;
                try {
                    // sanitize file input
                    const data = !change.content?.trim() ? [] : yaml.load(change.content);

                    const res = <PageDefInput>{ id: pageId, filename: change.filename, data: data }
                    const pageDef = res.data;
                    const result = this.validator.validate(pageDef, pageDefSchema, { nestedErrors: true })
                    if (!result.valid) {
                        result.errors.forEach(error => {
                            this.log.error(`PageDef ${pageId} : ${error.toString()}`);
                        })
                        throw new Error(`PageDef ${pageId}: has formatting errors (see above).`);
                    }

                    return res;
                } catch (err) {
                    return <PageDefInput>{ id: pageId, filename: change.filename, error: err }
                }
            })

        )
    }


    private readMenuFile() {
        return pipe<Observable<ConfigFileChange>, Observable<MenuInput>>(
            map(change => {
                const menuId = parse(change.filename).name;
                try {
                    // sanitize file input
                    const data = !change.content?.trim() ? [] : yaml.load(change.content);

                    const res = <MenuInput>{ id: menuId, filename: change.filename, data: data }
                    const result = this.validator.validate(res.data, menuSchema, { nestedErrors: true })
                    if (!result.valid) {
                        result.errors.forEach(error => {
                            this.log.error(`Menu ${menuId} : ${error.toString()}`);
                        })
                        throw new Error(`Menu ${menuId}: has formatting errors (see above).`);
                    }

                    return res;
                } catch (err) {
                    return <MenuInput>{ id: menuId, filename: change.filename, error: err }
                }

            })
        )
    }

    async onInit() {
        this.watchPageDefs();
        this.watchPageMenu();
    }


    private normalizePageDef(pageDef?: PageDef): PageDef {
        if (!pageDef) {
            return { layout: {}, cards: [] }
        }
        return {
            layout: normalizeLayout(pageDef.layout),
            cards: normalizeCards(this.deviceManager, pageDef.cards),
        };
    }


    private collectProperties(cards: Card[]): HomieProperty[] {
        return cards.map(
            card => collectCardProperties(this.deviceManager, card)
        ).flat().filter(
            (prop, index, arr) => arr.indexOf(prop) === index
        )
    }


    private watchPageDefs() {
        const pageDefWatcher$ = this.pageDefWatcher.fileChange$;

        // // watch for file deletes
        const removePage$ = pageDefWatcher$.pipe(
            filter(fileChange => fileChange.filename !== MenuFilename),
            filter(change => change.type === 'remove'),
            map(change => <PageAction>{ name: 'remove', id: parse(change.filename).name })
        )


        const addUpdatePage$ = pageDefWatcher$.pipe(
            filter(fileChange => fileChange.filename !== MenuFilename),
            filter(fileChange => (fileChange.type === 'add' || fileChange.type === 'update') && (fileChange.filename !== MenuFilename)),
            delay(500),
            this.readPageDefFile(),
            map(pageDefInput => {
                const pageId = pageDefInput.id

                if (pageDefInput.error) {
                    this.log.error(`Error loading pageDef from ${pageId}: ${pageDefInput.error.message}`)
                    this.log.debug('Exception: ', { error: pageDefInput.error });
                    return <PageAction>{
                        name: 'addUpdate',
                        id: pageId,
                        item: {
                            id: pageId,
                            error: pageDefInput.error
                        }
                    }
                }

                const pageDef = this.normalizePageDef(pageDefInput.data);

                return <PageAction>{
                    name: 'addUpdate', item: {
                        id: pageId,
                        pageDefOrig: pageDefInput.data,
                        pageDef: pageDef,
                        properties: this.collectProperties(pageDef.cards),
                    }
                }
            })
        );


        // this.deviceManager.ch

        // const readyPropertiesList$ = this.deviceManager.queryDevices( { state: 'ready'}, 1000).pipe(
        //     throttleTime(2000, asyncScheduler, { leading: true, trailing: true })
        // );


        const readyPropertiesList$ = this.deviceManager.query({ device: { state: 'ready'} }, 1000).pipe(
            throttleTime(2000, asyncScheduler, { leading: true, trailing: true }),

        );


        // const readyPropertiesList$ =this.deviceManager.devicesList$.pipe(
        //     watchList(device => device.attributes$.pipe(map(attrs => attrs.state), distinctUntilChanged())),
        //     // Throttle device discovery changes
        //     throttleTime(1000, asyncScheduler, { leading: false, trailing: true }),

        //     // Throttle device state changes
        //     map(devices => devices.filter(device => device.attributes.state === 'ready')),
        //     throttleTime(500, asyncScheduler, { leading: true, trailing: true }),

        //     // Throttle property changes
        //     mergeWatchList(device => device.propertiesList$),
        //     throttleTime(2000, asyncScheduler, { leading: true, trailing: true }),
        // );


        const updatePagesOnDeviceStateChange$ = readyPropertiesList$.pipe(
            tap(_ => this.log.verbose('==========> ReadyDevices changed!')),
            withLatestFrom(this.pageStore.asArray$), mergeMap(([_, pages]) => pages),
            filter(page => !page.error),
            map(page => {
                this.log.info(`Re-normalize Page after readyDevicesChange ${page.id}...`);
                const pageDef = this.normalizePageDef(page.pageDefOrig);
                const newPage = <PageState>{
                    ...page,
                    properties: this.collectProperties(pageDef.cards),
                    pageDef: pageDef
                }

                // this.log.info('Updated PropertiesList: ', { props: newPage.properties!.map(prop => { return { p: prop?.pointer, s: prop?.parent?.parent?.attributes.state } }) });
                this.log.info('done');
                return <PageAction>{
                    name: 'addUpdate', item: newPage
                }
            })
        );



        merge(removePage$, addUpdatePage$, updatePagesOnDeviceStateChange$).pipe(
            takeUntil(this.onDestroy$),
            tap(action => {
                if (action.name === 'addUpdate' && action.item) {
                    this.pageStore.addOrUpdate(action.item);
                } else if (action.name === 'remove') {
                    this.pageStore.remove(action.id);
                }
            })
        ).subscribe({
            next: (action) => {
                this.log.info(`Action: ${action.name} => ${action.item?.id}`);
            },
            complete: () => {
                this.log.warn(`Pagedef subscription COMPLETED!`);
            },
            error: (err) => {
                this.log.error(`Error in pagedef subscription`, err);
            }
        });


        // init pagedef watcher after all subscriptions are setup and connected
        this.pageDefWatcher.onInit();


    }



    private watchPageMenu() {
        const menuWatcher$ = this.menuWatcher.fileChange$;


        // // watch for file deletes
        const removeMenu$ = menuWatcher$.pipe(
            filter(fileChange => fileChange.filename === MenuFilename),
            filter(change => change.type === 'remove'),
            map(change => <MenuAction>{ name: 'remove', id: parse(change.filename).name })
        )


        const addUpdateMenu$ = menuWatcher$.pipe(
            // takeUntil(this.onDestroy$),
            filter(fileChange => fileChange.filename === MenuFilename),
            filter(fileChange => (fileChange.type === 'add' || fileChange.type === 'update')),
            this.readMenuFile(),
            delay(500),
            map((menuInput) => {
                const menuId = menuInput.id;

                if (menuInput.error) {
                    this.log.error(`Error loading menu from ${menuId}: ${menuInput.error.message}`)
                    this.log.debug('Exception: ', { error: menuInput.error });
                    return <MenuAction>{
                        name: 'addUpdate', item: {
                            id: menuId,
                            error: menuInput.error
                        }
                    }
                }
                const entries = this.filterMenuEntries(menuInput.data)
                return <MenuAction>{
                    name: 'addUpdate', item: {
                        id: menuId,
                        pageMenuEntriesOrig: menuInput.data,
                        pageMenuEntries: entries,
                    }
                }
            })
        );

        const updateOnPageDefUpdate$ = this.pageStore.events$.pipe(
            withLatestFrom(this.menuStore.asArray$), mergeMap(([_, pages]) => pages),
            map(menu => {
                const entries = this.filterMenuEntries(menu.pageMenuEntriesOrig)
                return <MenuAction>{
                    name: 'addUpdate', item: {
                        ...menu,
                        pageMenuEntries: entries,
                        // pageMenuEntriesJson: JSON.stringify(entries)
                    }
                }
            })
        );


        merge(removeMenu$, addUpdateMenu$, updateOnPageDefUpdate$).pipe(
            takeUntil(this.onDestroy$),
            tap(action => {
                if (action.name === 'addUpdate' && action.item) {
                    this.menuStore.addOrUpdate(action.item)
                } else if (action.name === 'remove') {
                    this.menuStore.remove(action.id);
                }
            })
        ).subscribe({
            complete: () => {
                this.log.info("Menu-updates$ completed");
            }
        });

        // init menu watcher after all subscriptions are setup and connected
        this.menuWatcher.onInit();


    }


    protected filterMenuEntries(menu: PageMenu): PageMenu {
        return menu.filter(entry => this.pageStore.hasId(entry.id) && !this.pageStore.getItem(entry.id)?.error);
    }

    public async onDestroy() {
        this.log.info('DashConfig onDestroy');
        this.onDestroy$.next(true);
        this.pageDefWatcher.onDestroy();
        this.menuWatcher.onDestroy();
    }
}