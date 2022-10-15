
export interface OnInit {
    /**
     * Called after object creation to initialize active content.
     * @returns Promise in case of async initialization
     */
    onInit(): Promise<void>;
}

export interface OnDestroy {
    /**
     * Called before an Object is destroyed. All ressources, listeners, etc should be cleanup here.
     * @returns Promise in case of async destrution
     */
    onDestroy(): Promise<void>;
}