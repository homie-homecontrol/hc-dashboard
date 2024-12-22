import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { NumberInput, coerceNumberProperty } from '@angular/cdk/coercion';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { CanDisable, CanColor, ThemePalette } from '@angular/material/core';
import { MatSliderChange } from '@angular/material/slider';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { Subscription } from 'rxjs';

import {
    DOWN_ARROW,
    END,
    HOME,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    UP_ARROW,
    hasModifierKey,
} from '@angular/cdk/keycodes';
import { bgColorSchemeCssMapping } from '../mulit-function-tile.func';
import { MatColorName } from 'src/app/models/dash.model';

const activeEventOptions = normalizePassiveListenerOptions({ passive: false });

export interface MftSliderChange {
    /** The MatSlider that changed. */
    source: MftSliderComponent;
    /** The new value of the source slider. */
    value: number | null;
}

/*
 * Simple full height slider component.
 * Borrows heavily from angular material slider (https://github.com/angular/components/blob/13.3.9/src/material/slider/slider.ts)
 */
@Component({
    selector: 'hc-mft-slider',
    templateUrl: './mft-slider.component.html',
    styleUrls: ['./mft-slider.component.scss'],
    inputs: ['disabled', 'color'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(focus)': '_onFocus()',
        '(blur)': '_onBlur()',
        '(keydown)': '_onKeydown($event)',
        '(keyup)': '_onKeyup()',
        '(mouseenter)': '_onMouseenter()',

        // On Safari starting to slide temporarily triggers text selection mode which
        // show the wrong cursor. We prevent it by stopping the `selectstart` event.
        '(selectstart)': '$event.preventDefault()',
        class: 'hc-slider',
        role: 'slider',
        '[attr.aria-disabled]': 'disabled',
        '[attr.aria-valuemax]': 'max',
        '[attr.aria-valuemin]': 'min',
        '[attr.aria-valuenow]': 'value',
    },
})
export class MftSliderComponent implements ControlValueAccessor, OnDestroy, CanDisable, CanColor, AfterViewInit {
    // /** Set the background color for the status container */
    // @Input()
    // get bgColor(): ColorScheme {
    //   return this._bgColor;
    // }
    // set bgColor(v: ColorScheme) {
    //   this._bgColor = v;
    //   this.bgColorClass=bgColorSchemeCssMapping(this._bgColor, 'lighter');
    //   // console.log('Setting bg color ', this._bgColor,  this.bgColor)

    // }
    // private _bgColor: ColorScheme = 'pale';
    // public bgColorClass = bgColorSchemeCssMapping(this._bgColor, 'lighter');

    /** Set the background color for the status container */
    @Input()
    get sliderColor(): MatColorName {
        return this._sliderColor;
    }
    set sliderColor(v: MatColorName) {
        this._sliderColor = v;
        this.sliderColorClass = bgColorSchemeCssMapping(this._sliderColor, 'lighter');
    }
    private _sliderColor: MatColorName = 'accent';
    public sliderColorClass = bgColorSchemeCssMapping(this._sliderColor, 'lighter');

    /** The maximum value that the slider can have. */
    @Input()
    get max(): number {
        return this._max;
    }
    set max(v: NumberInput) {
        this._max = coerceNumberProperty(v, this._max);
        this._percent = this._calculatePercentage(this._value);

        // Since this also modifies the percentage, we need to let the change detection know.
        this._changeDetectorRef.markForCheck();
    }
    private _max: number = 100;

    /** The minimum value that the slider can have. */
    @Input()
    get min(): number {
        return this._min;
    }
    set min(v: NumberInput) {
        this._min = coerceNumberProperty(v, this._min);
        this._percent = this._calculatePercentage(this._value);

        // Since this also modifies the percentage, we need to let the change detection know.
        this._changeDetectorRef.markForCheck();
    }
    private _min: number = 0;

    /** The values at which the thumb will snap. */
    @Input()
    get step(): number {
        return this._step;
    }
    set step(v: NumberInput) {
        this._step = coerceNumberProperty(v, this._step);

        if (this._step % 1 !== 0) {
            this._roundToDecimal = this._step.toString().split('.').pop()!.length;
        }

        // Since this could modify the label, we need to notify the change detection.
        this._changeDetectorRef.markForCheck();
    }
    private _step: number = 1;

    /** Value of the slider. */
    @Input()
    get value(): number {
        // If the value needs to be read and it is still uninitialized, initialize it to the min.
        if (this._value === null) {
            this.value = this._min;
        }
        return this._value as number;
    }
    set value(v: NumberInput) {
        // console.log('Slider value input: ', v);
        if (v !== this._value) {
            let value = coerceNumberProperty(v, 0);

            // While incrementing by a decimal we can end up with values like 33.300000000000004.
            // Truncate it to ensure that it matches the label and to make it easier to work with.
            if (this._roundToDecimal && value !== this.min && value !== this.max) {
                value = parseFloat(value.toFixed(this._roundToDecimal));
            }

            this._value = value;
            this._percent = this._calculatePercentage(this._value);

            this.liveChange.emit(this._value);

            // Since this also modifies the percentage, we need to let the change detection know.
            this._changeDetectorRef.markForCheck();
        }
    }
    private _value: number | null = null;

    /** Event emitted when the slider value has changed. */
    @Output() readonly onclick: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Event emitted when the slider value has changed. */
    @Output() readonly change: EventEmitter<MftSliderChange> = new EventEmitter<MftSliderChange>();

    /** Event emitted when the slider thumb moves. */
    @Output() readonly liveChange: EventEmitter<number | null> = new EventEmitter<number | null>();

    /** Event emitted when the slider thumb moves. */
    @Output() readonly input: EventEmitter<MftSliderChange> = new EventEmitter<MftSliderChange>();

    /**
     * Emits when the raw value of the slider changes. This is here primarily
     * to facilitate the two-way binding for the `value` input.
     * @docs-private
     */
    @Output() readonly valueChange: EventEmitter<number | null> = new EventEmitter<number | null>();

    /** set focus to the host element */
    focus(options?: FocusOptions) {
        this._focusHostElement(options);
    }

    /** blur the host element */
    blur() {
        this._blurHostElement();
    }

    /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
    onTouched: () => any = () => {};

    /** The percentage of the slider that coincides with the value. */
    get percent(): number {
        return this._clamp(this._percent);
    }
    private _percent: number = 0;

    /**
     * Whether or not the thumb is sliding and what the user is using to slide it with.
     * Used to determine if there should be a transition for the thumb and fill track.
     */
    _isSliding: 'keyboard' | 'pointer' | null = null;

    /**
     * Whether or not the slider is active (clicked or sliding).
     * Used to shrink and grow the thumb as according to the Material Design spec.
     */
    _isActive: boolean = false;

    _isClickOnly: boolean = false;

    /** Whether the slider is at its minimum value. */
    _isMinValue() {
        return this.percent === 0;
    }

    /** CSS styles for the track fill element. */
    _getTrackFillStyles(): { [key: string]: string } {
        const percent = this.percent;
        const axis = 'X';
        const scale = `${percent}, 1, 1`;
        const sign = '-';

        return {
            // scale3d avoids some rendering issues in Chrome. See #12071.
            transform: `translate${axis}(0px) scale3d(${scale})`,
            // iOS Safari has a bug where it won't re-render elements which start of as `scale(0)` until
            // something forces a style recalculation on it. Since we'll end up with `scale(0)` when
            // the value of the slider is 0, we can easily get into this situation. We force a
            // recalculation by changing the element's `display` when it goes from 0 to any other value.
            display: percent === 0 ? 'none' : '',
        };
    }

    /** The size of a tick interval as a percentage of the size of the track. */
    private _tickIntervalPercent: number = 0;

    /** The dimensions of the slider. */
    private _sliderDimensions: ClientRect | null = null;

    private _controlValueAccessorChangeFn: (value: any) => void = () => {};

    /** Decimal places to round to, based on the step amount. */
    private _roundToDecimal?: number;

    /** Subscription to the Directionality change EventEmitter. */
    private _dirChangeSubscription = Subscription.EMPTY;

    /** The value of the slider when the slide start event fires. */
    private _valueOnSlideStart?: number | null;

    /** Reference to the inner slider wrapper element. */
    @ViewChild('sliderContainer') private _sliderContainer?: ElementRef;

    /** Keeps track of the last pointer event that was captured by the slider. */
    private _lastPointerEvent?: MouseEvent | TouchEvent | null;

    /** Keeps track of the last pointer event that was captured by the slider. */
    private _startPointerEvent?: MouseEvent | TouchEvent | null;

    /** Used to subscribe to global move and end events */
    protected _document: Document;

    /**
     * Identifier used to attribute a touch event to a particular slider.
     * Will be undefined if one of the following conditions is true:
     * - The user isn't dragging using a touch device.
     * - The browser doesn't support `Touch.identifier`.
     * - Dragging hasn't started yet.
     */
    private _touchId: number | undefined;

    constructor(
        public _elementRef: ElementRef,
        private _focusMonitor: FocusMonitor,
        private _changeDetectorRef: ChangeDetectorRef,
        private _ngZone: NgZone,
        @Inject(DOCUMENT) _document: any,
        @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string,
    ) {
        this._document = _document;

        _ngZone.runOutsideAngular(() => {
            const element = _elementRef.nativeElement;
            if (isTouchDevice()) {
                element.addEventListener('touchstart', this._touchstart, activeEventOptions);
            } else {
                element.addEventListener('mousedown', this._pointerDown, activeEventOptions);
            }
            element.addEventListener('touchmove', this._pointerDown, activeEventOptions);
            // element.addEventListener('touchmove',this._touchmove, activeEventOptions);
        });
    }

    disabled!: boolean;
    color: ThemePalette;
    defaultColor: ThemePalette;

    ngAfterViewInit() {
        this._focusMonitor.monitor(this._elementRef, true).subscribe((origin: FocusOrigin) => {
            this._isActive = !!origin && origin !== 'keyboard';
            this._changeDetectorRef.detectChanges();
        });

        // Update the slider dimensions after view init otherwise it cannot be used on mobile devices directly in _pointerDown
        this._sliderDimensions = this._getSliderDimensions();
        // if (this._dir) {
        //   this._dirChangeSubscription = this._dir.change.subscribe(() => {
        //     this._changeDetectorRef.markForCheck();
        //   });
        // }
    }

    ngOnDestroy() {
        const element = this._elementRef.nativeElement;
        if (isTouchDevice()) {
            element.removeEventListener('touchstart', this._touchstart, activeEventOptions);
        } else {
            element.removeEventListener('mousedown', this._pointerDown, activeEventOptions);
        }
        element.removeEventListener('touchmove', this._pointerDown, activeEventOptions);
        // element.removeEventListener('touchmove', this._touchmove, activeEventOptions);
        this._lastPointerEvent = null;
        this._removeGlobalEvents();
        this._focusMonitor.stopMonitoring(this._elementRef);
        this._dirChangeSubscription.unsubscribe();
    }

    _onMouseenter() {
        // console.log('Slider Mouseenter: ');
        if (this.disabled) {
            return;
        }

        // We save the dimensions of the slider here so we can use them to update the spacing of the
        // ticks and determine where on the slider click and slide events happen.
        this._sliderDimensions = this._getSliderDimensions();
        // this._updateTickIntervalPercent();
    }

    _onFocus() {
        // We save the dimensions of the slider here so we can use them to update the spacing of the
        // ticks and determine where on the slider click and slide events happen.
        this._sliderDimensions = this._getSliderDimensions();
        // this._updateTickIntervalPercent();
    }

    _onBlur() {
        this.onTouched();
    }

    _onKeydown(event: KeyboardEvent) {
        console.log('Slider keydown: ', event);
        if (this.disabled || hasModifierKey(event) || (this._isSliding && this._isSliding !== 'keyboard')) {
            return;
        }

        const oldValue = this.value;

        switch (event.keyCode) {
            case PAGE_UP:
                this._increment(10);
                break;
            case PAGE_DOWN:
                this._increment(-10);
                break;
            case END:
                this.value = this.max;
                break;
            case HOME:
                this.value = this.min;
                break;
            case LEFT_ARROW:
                // NOTE: For a sighted user it would make more sense that when they press an arrow key on an
                // inverted slider the thumb moves in that direction. However for a blind user, nothing
                // about the slider indicates that it is inverted. They will expect left to be decrement,
                // regardless of how it appears on the screen. For speakers ofRTL languages, they probably
                // expect left to mean increment. Therefore we flip the meaning of the side arrow keys for
                // RTL. For inverted sliders we prefer a good a11y experience to having it "look right" for
                // sighted users, therefore we do not swap the meaning.
                this._increment(-1);
                break;
            case UP_ARROW:
                this._increment(1);
                break;
            case RIGHT_ARROW:
                // See comment on LEFT_ARROW about the conditions under which we flip the meaning.
                this._increment(1);
                break;
            case DOWN_ARROW:
                this._increment(-1);
                break;
            default:
                // Return if the key is not one that we explicitly handle to avoid calling preventDefault on
                // it.
                return;
        }

        if (oldValue != this.value) {
            this._emitInputEvent();
            this._emitChangeEvent();
        }

        this._isSliding = 'keyboard';
        event.preventDefault();
    }

    _onKeyup() {
        if (this._isSliding === 'keyboard') {
            this._isSliding = null;
        }
    }

    /** Called when the user has put their pointer down on the slider. */
    private _touchstart = (event: TouchEvent | MouseEvent) => {
        console.log('touchstart: ', event);
        this._startPointerEvent = event;

        console.log('TOUCH isclickonly');
        this._isClickOnly = true;
        this._bindGlobalEvents(event);
        if (event.cancelable) {
        }
    };

    /** Called when the user has put their pointer down on the slider. */
    private _pointerDown = (event: TouchEvent | MouseEvent) => {
        console.log('_pointerDown', this._isSliding, event);
        // console.log('pointerevent: ', event)

        // Don't do anything if the slider is disabled or the
        // user is using anything other than the main mouse button.
        if (this.disabled || this._isSliding || (!isTouchEvent(event) && event.button !== 0)) {
            //console.log('isclickonly');
            //this._isClickOnly = true;
            //this._bindGlobalEvents(event);
            return;
        }
        console.log('_pointerDown TRIGGERED');

        this._ngZone.run(() => {
            this._touchId = isTouchEvent(event)
                ? getTouchIdForSlider(event, this._elementRef.nativeElement)
                : undefined;
            const pointerPosition = getPointerPositionOnPage(event, this._touchId);
            const startPointerPosition = getPointerPositionOnPage(this._startPointerEvent!, this._touchId);

            // ==================== Improve accidental sliding protection on scroll ====================
            // = Check if the mouse movement is indicating a horizontal sliding motion, otherwise return
            // = This assumes that if there is more y movement then x the users intends to scroll the page and
            // = not slide the slider.
            if (pointerPosition && startPointerPosition) {
                this._startPointerEvent = event;
                const deltaY = Math.abs(pointerPosition.y - startPointerPosition.y);
                const deltaX = Math.abs(pointerPosition.x - startPointerPosition.x);

                if (deltaY > 8 || deltaX < 5) {
                    this._isSliding = null;
                    return;
                }
            }
            // ====================

            if (pointerPosition) {
                // ==================== Improve accidental sliding protection on scroll ====================
                // = Check if the mouse event happens with the proximity of the slider position, otherwise ignore the event.
                this._sliderDimensions = this._getSliderDimensions();
                if (!this._sliderDimensions) {
                    window.prompt('NO SLider dimensions');
                    return;
                }

                let offset = this._sliderDimensions.left;
                let size = this._sliderDimensions.width;
                let sliderPosition = offset + size * this.percent;
                let posComponent = pointerPosition.x;

                // we define 15% of the component size before and after the sliderposition as detection area for sliding
                let fuzzyFactor = 0.15;
                // in case we are near the beginning or the end of the component we increase the detection area by 5% to 20%.
                if (this.percent >= 0.9 || this.percent <= 0.1) {
                    fuzzyFactor = 0.2;
                }

                console.log('_pointerDown ngZone run before detection area');
                // if the event did not happen within the detection area: exit
                if (Math.abs(posComponent - sliderPosition) > size * fuzzyFactor) {
                    if (!this._isClickOnly) {
                        console.log('isclickonly');
                        this._isClickOnly = true;
                        this._bindGlobalEvents(event);
                    }
                    return;
                }
                // ====================

                if (this._isClickOnly) {
                    this._isClickOnly = false;
                    this._removeGlobalEvents();
                }
                const oldValue = this.value;
                this._isSliding = 'pointer';
                this._lastPointerEvent = event;
                this._focusHostElement();
                this._onMouseenter(); // Simulate mouseenter in case this is a mobile device.
                this._bindGlobalEvents(event);
                this._focusHostElement();
                this._updateValueFromPosition(pointerPosition);
                this._valueOnSlideStart = oldValue;
                // console.log('Slider: ', event)

                // Despite the fact that we explicitly bind active events, in some cases the browser
                // still dispatches non-cancelable events which cause this call to throw an error.
                // There doesn't appear to be a good way of avoiding them. See #23820.
                if (event.cancelable) {
                    event.preventDefault();
                }

                // Emit a change and input event if the value changed.
                if (oldValue != this.value) {
                    this._emitInputEvent();
                }
                console.log('_pointerDown ngZone run end');
            }
        });
    };

    /**
     * Called when the user has moved their pointer after
     * starting to drag. Bound on the document level.
     */
    private _pointerMove = (event: TouchEvent | MouseEvent) => {
        console.log('_pointerMove', this._isSliding, event);
        if (this._isClickOnly) {
            this._isClickOnly = false;
            this._removeGlobalEvents();
        }
        if (this._isSliding === 'pointer') {
            const pointerPosition = getPointerPositionOnPage(event, this._touchId);

            if (pointerPosition) {
                // Prevent the slide from selecting anything else.
                // event.preventDefault();
                const oldValue = this.value;
                this._lastPointerEvent = event;
                this._updateValueFromPosition(pointerPosition);

                // Native range elements always emit `input` events when the value changed while sliding.
                if (oldValue != this.value) {
                    this._emitInputEvent();
                }
            }
        }
    };

    /** Called when the user has lifted their pointer. Bound on the document level. */
    private _pointerUp = (event: TouchEvent | MouseEvent) => {
        console.log('_pointerUp', this._isSliding, event);
        if (this._isSliding === 'pointer') {
            if (
                !isTouchEvent(event) ||
                typeof this._touchId !== 'number' ||
                // Note that we use `changedTouches`, rather than `touches` because it
                // seems like in most cases `touches` is empty for `touchend` events.
                findMatchingTouch(event.changedTouches, this._touchId)
            ) {
                event.preventDefault();
                this._removeGlobalEvents();
                this._isSliding = null;
                this._touchId = undefined;

                if (this._valueOnSlideStart != this.value && !this.disabled) {
                    this._emitChangeEvent();
                }

                this._valueOnSlideStart = this._lastPointerEvent = null;
            }
        } else if (this._isClickOnly) {
            console.log('_pointerUp Clicked', this._isSliding, event);
            event.preventDefault();
            this.onclick.emit(true);
            this._isClickOnly = false;
            this._removeGlobalEvents();
            this._isSliding = null;
            this._touchId = undefined;
            this._valueOnSlideStart = this._lastPointerEvent = null;
        }
    };

    /** Called when the window has lost focus. */
    private _windowBlur = () => {
        // If the window is blurred while dragging we need to stop dragging because the
        // browser won't dispatch the `mouseup` and `touchend` events anymore.
        if (this._lastPointerEvent) {
            this._pointerUp(this._lastPointerEvent);
        }
    };

    /** Use defaultView of injected document if available or fallback to global window reference */
    private _getWindow(): Window {
        return this._document.defaultView || window;
    }

    /**
     * Binds our global move and end events. They're bound at the document level and only while
     * dragging so that the user doesn't have to keep their pointer exactly over the slider
     * as they're swiping across the screen.
     */
    private _bindGlobalEvents(triggerEvent: TouchEvent | MouseEvent) {
        // Note that we bind the events to the `document`, because it allows us to capture
        // drag cancel events where the user's pointer is outside the browser window.
        const document = this._document;
        const isTouch = isTouchEvent(triggerEvent);
        const moveEventName = isTouch ? 'touchmove' : 'mousemove';
        const endEventName = isTouch ? 'touchend' : 'mouseup';
        document.addEventListener(moveEventName, this._pointerMove, activeEventOptions);
        document.addEventListener(endEventName, this._pointerUp, activeEventOptions);

        if (isTouch) {
            document.addEventListener('touchcancel', this._pointerUp, activeEventOptions);
        }

        const window = this._getWindow();

        if (typeof window !== 'undefined' && window) {
            window.addEventListener('blur', this._windowBlur);
        }
    }

    /** Removes any global event listeners that we may have added. */
    private _removeGlobalEvents() {
        const document = this._document;
        document.removeEventListener('mousemove', this._pointerMove, activeEventOptions);
        document.removeEventListener('mouseup', this._pointerUp, activeEventOptions);
        document.removeEventListener('touchmove', this._pointerMove, activeEventOptions);
        document.removeEventListener('touchend', this._pointerUp, activeEventOptions);
        document.removeEventListener('touchcancel', this._pointerUp, activeEventOptions);

        const window = this._getWindow();

        if (typeof window !== 'undefined' && window) {
            window.removeEventListener('blur', this._windowBlur);
        }
    }

    /** Increments the slider by the given number of steps (negative number decrements). */
    private _increment(numSteps: number) {
        // Pre-clamp the current value since it's allowed to be
        // out of bounds when assigned programmatically.
        const clampedValue = this._clamp(this.value || 0, this.min, this.max);
        this.value = this._clamp(clampedValue + this.step * numSteps, this.min, this.max);
    }

    /** Calculate the new value from the new physical location. The value will always be snapped. */
    private _updateValueFromPosition(pos: { x: number; y: number }) {
        if (!this._sliderDimensions) {
            return;
        }

        let offset = this._sliderDimensions.left;
        let size = this._sliderDimensions.width;
        let posComponent = pos.x;

        // The exact value is calculated from the event and used to find the closest snap value.
        let percent = this._clamp((posComponent - offset) / size);

        // Since the steps may not divide cleanly into the max value, if the user
        // slid to 0 or 100 percent, we jump to the min/max value. This approach
        // is slightly more intuitive than using `Math.ceil` below, because it
        // follows the user's pointer closer.
        if (percent === 0) {
            this.value = this.min;
        } else if (percent === 1) {
            this.value = this.max;
        } else {
            const exactValue = this._calculateValue(percent);

            // This calculation finds the closest step by finding the closest
            // whole number divisible by the step relative to the min.
            const closestValue = Math.round((exactValue - this.min) / this.step) * this.step + this.min;

            // The value needs to snap to the min and max.
            this.value = this._clamp(closestValue, this.min, this.max);
        }
    }

    /** Emits a change event if the current value is different from the last emitted value. */
    private _emitChangeEvent() {
        this._controlValueAccessorChangeFn(this.value);
        this.valueChange.emit(this.value);
        this.change.emit(this._createChangeEvent());
    }

    /** Emits an input event when the current value is different from the last emitted value. */
    private _emitInputEvent() {
        this.input.emit(this._createChangeEvent());
    }

    // /** Updates the amount of space between ticks as a percentage of the width of the slider. */
    // private _updateTickIntervalPercent() {
    //   if (!this.tickInterval || !this._sliderDimensions) {
    //     return;
    //   }

    //   let tickIntervalPercent: number;
    //   if (this.tickInterval == 'auto') {
    //     let trackSize = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
    //     let pixelsPerStep = (trackSize * this.step) / (this.max - this.min);
    //     let stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
    //     let pixelsPerTick = stepsPerTick * this.step;
    //     tickIntervalPercent = pixelsPerTick / trackSize;
    //   } else {
    //     tickIntervalPercent = (this.tickInterval * this.step) / (this.max - this.min);
    //   }
    //   this._tickIntervalPercent = isSafeNumber(tickIntervalPercent) ? tickIntervalPercent : 0;
    // }

    /** Creates a slider change object from the specified value. */
    private _createChangeEvent(value = this.value): MftSliderChange {
        let event = <MftSliderChange>{};

        event.source = this;
        event.value = value;

        return event;
    }

    /** Calculates the percentage of the slider that a value is. */
    private _calculatePercentage(value: number | null) {
        const percentage = ((value || 0) - this.min) / (this.max - this.min);
        return isSafeNumber(percentage) ? percentage : 0;
    }

    /** Calculates the value a percentage of the slider corresponds to. */
    private _calculateValue(percentage: number) {
        return this.min + percentage * (this.max - this.min);
    }

    /** Return a number between two numbers. */
    private _clamp(value: number, min = 0, max = 1) {
        return Math.max(min, Math.min(value, max));
    }

    /**
     * Get the bounding client rect of the slider track element.
     * The track is used rather than the native element to ignore the extra space that the thumb can
     * take up.
     */
    private _getSliderDimensions() {
        return this._sliderContainer ? this._sliderContainer.nativeElement.getBoundingClientRect() : null;
    }

    /**
     * Focuses the native element.
     * Currently only used to allow a blur event to fire but will be used with keyboard input later.
     */
    private _focusHostElement(options?: FocusOptions) {
        this._elementRef.nativeElement.focus(options);
    }

    /** Blurs the native element. */
    private _blurHostElement() {
        this._elementRef.nativeElement.blur();
    }

    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value
     */
    writeValue(value: any) {
        this.value = value;
    }

    /**
     * Registers a callback to be triggered when the value has changed.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnChange(fn: (value: any) => void) {
        this._controlValueAccessorChangeFn = fn;
    }

    /**
     * Registers a callback to be triggered when the component is touched.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    /**
     * Sets whether the component should be disabled.
     * Implemented as part of ControlValueAccessor.
     * @param isDisabled
     */
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }
}

/** Checks if number is safe for calculation */
function isSafeNumber(value: number) {
    return !isNaN(value) && isFinite(value);
}

/** Returns whether an event is a touch event. */
function isTouchEvent(event: MouseEvent | TouchEvent | undefined): event is TouchEvent {
    // This function is called for every pixel that the user has dragged so we need it to be
    // as fast as possible. Since we only bind mouse events and touch events, we can assume
    // that if the event's name starts with `t`, it's a touch event.
    return event ? event.type[0] === 't' : false;
}

/** Gets the coordinates of a touch or mouse event relative to the viewport. */
function getPointerPositionOnPage(event: MouseEvent | TouchEvent | undefined, id: number | undefined) {
    let point: { clientX: number; clientY: number } | undefined;

    if (isTouchEvent(event)) {
        // The `identifier` could be undefined if the browser doesn't support `TouchEvent.identifier`.
        // If that's the case, attribute the first touch to all active sliders. This should still cover
        // the most common case while only breaking multi-touch.
        if (typeof id === 'number') {
            point = findMatchingTouch(event.touches, id) || findMatchingTouch(event.changedTouches, id);
        } else {
            // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
            point = event.touches[0] || event.changedTouches[0];
        }
    } else {
        point = event;
    }

    return point ? { x: point.clientX, y: point.clientY } : undefined;
}

/** Finds a `Touch` with a specific ID in a `TouchList`. */
function findMatchingTouch(touches: TouchList, id: number): Touch | undefined {
    for (let i = 0; i < touches.length; i++) {
        if (touches[i].identifier === id) {
            return touches[i];
        }
    }

    return undefined;
}

/** Gets the unique ID of a touch that matches a specific slider. */
function getTouchIdForSlider(event: TouchEvent, sliderHost: HTMLElement): number | undefined {
    for (let i = 0; i < event.touches.length; i++) {
        const target = event.touches[i].target as HTMLElement;

        if (sliderHost === target || sliderHost.contains(target)) {
            return event.touches[i].identifier;
        }
    }

    return undefined;
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
