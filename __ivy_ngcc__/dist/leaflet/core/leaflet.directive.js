import { Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, Output } from '@angular/core';
import { latLng, map } from 'leaflet';
import { LeafletUtil } from './leaflet.util';
import * as ɵngcc0 from '@angular/core';
var LeafletDirective = /** @class */ (function () {
    function LeafletDirective(element, zone) {
        this.element = element;
        this.zone = zone;
        this.DEFAULT_ZOOM = 1;
        this.DEFAULT_CENTER = latLng(38.907192, -77.036871);
        this.DEFAULT_FPZ_OPTIONS = {};
        this.fitBoundsOptions = this.DEFAULT_FPZ_OPTIONS;
        this.panOptions = this.DEFAULT_FPZ_OPTIONS;
        this.zoomOptions = this.DEFAULT_FPZ_OPTIONS;
        this.zoomPanOptions = this.DEFAULT_FPZ_OPTIONS;
        // Default configuration
        this.options = {};
        // Configure callback function for the map
        this.mapReady = new EventEmitter();
        this.zoomChange = new EventEmitter();
        this.centerChange = new EventEmitter();
        // Mouse Map Events
        this.onClick = new EventEmitter();
        this.onDoubleClick = new EventEmitter();
        this.onMouseDown = new EventEmitter();
        this.onMouseUp = new EventEmitter();
        this.onMouseMove = new EventEmitter();
        this.onMouseOver = new EventEmitter();
        this.onMouseOut = new EventEmitter();
        // Map Move Events
        this.onMapMove = new EventEmitter();
        this.onMapMoveStart = new EventEmitter();
        this.onMapMoveEnd = new EventEmitter();
        // Map Zoom Events
        this.onMapZoom = new EventEmitter();
        this.onMapZoomStart = new EventEmitter();
        this.onMapZoomEnd = new EventEmitter();
        this.mapEventHandlers = {};
        // Nothing here
    }
    LeafletDirective.prototype.ngOnInit = function () {
        var _this = this;
        // Create the map outside of angular so the various map events don't trigger change detection
        this.zone.runOutsideAngular(function () {
            // Create the map with some reasonable defaults
            _this.map = map(_this.element.nativeElement, _this.options);
            _this.addMapEventListeners();
        });
        // Only setView if there is a center/zoom
        if (null != this.center && null != this.zoom) {
            this.setView(this.center, this.zoom);
        }
        // Set up all the initial settings
        if (null != this.fitBounds) {
            this.setFitBounds(this.fitBounds);
        }
        if (null != this.maxBounds) {
            this.setMaxBounds(this.maxBounds);
        }
        if (null != this.minZoom) {
            this.setMinZoom(this.minZoom);
        }
        if (null != this.maxZoom) {
            this.setMaxZoom(this.maxZoom);
        }
        this.doResize();
        // Fire map ready event
        this.mapReady.emit(this.map);
    };
    LeafletDirective.prototype.ngOnChanges = function (changes) {
        /*
         * The following code is to address an issue with our (basic) implementation of
         * zooming and panning. From our testing, it seems that a pan operation followed
         * by a zoom operation in the same thread will interfere with eachother. The zoom
         * operation interrupts/cancels the pan, resulting in a final center point that is
         * inaccurate. The solution seems to be to either separate them with a timeout or
          * to collapse them into a setView call.
         */
        // Zooming and Panning
        if (changes['zoom'] && changes['center'] && null != this.zoom && null != this.center) {
            this.setView(changes['center'].currentValue, changes['zoom'].currentValue);
        }
        // Set the zoom level
        else if (changes['zoom']) {
            this.setZoom(changes['zoom'].currentValue);
        }
        // Set the map center
        else if (changes['center']) {
            this.setCenter(changes['center'].currentValue);
        }
        // Other options
        if (changes['fitBounds']) {
            this.setFitBounds(changes['fitBounds'].currentValue);
        }
        if (changes['maxBounds']) {
            this.setMaxBounds(changes['maxBounds'].currentValue);
        }
        if (changes['minZoom']) {
            this.setMinZoom(changes['minZoom'].currentValue);
        }
        if (changes['maxZoom']) {
            this.setMaxZoom(changes['maxZoom'].currentValue);
        }
    };
    LeafletDirective.prototype.ngOnDestroy = function () {
        // If this directive is destroyed, the map is too
        // this.map.remove();
    };
    LeafletDirective.prototype.getMap = function () {
        return this.map;
    };
    LeafletDirective.prototype.onResize = function () {
        this.delayResize();
    };
    LeafletDirective.prototype.addMapEventListeners = function () {
        var _this = this;
        var registerEventHandler = function (eventName, handler) {
            _this.mapEventHandlers[eventName] = handler;
            _this.map.on(eventName, handler);
        };
        // Add all the pass-through mouse event handlers
        registerEventHandler('click', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onClick, e); });
        registerEventHandler('dblclick', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onDoubleClick, e); });
        registerEventHandler('mousedown', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseDown, e); });
        registerEventHandler('mouseup', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseUp, e); });
        registerEventHandler('mouseover', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseOver, e); });
        registerEventHandler('mouseout', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseOut, e); });
        registerEventHandler('mousemove', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMouseMove, e); });
        registerEventHandler('zoomstart', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapZoomStart, e); });
        registerEventHandler('zoom', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapZoom, e); });
        registerEventHandler('zoomend', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapZoomEnd, e); });
        registerEventHandler('movestart', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapMoveStart, e); });
        registerEventHandler('move', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapMove, e); });
        registerEventHandler('moveend', function (e) { return LeafletUtil.handleEvent(_this.zone, _this.onMapMoveEnd, e); });
        // Update any things for which we provide output bindings
        var outputUpdateHandler = function () {
            var zoom = _this.map.getZoom();
            if (zoom !== _this.zoom) {
                _this.zoom = zoom;
                LeafletUtil.handleEvent(_this.zone, _this.zoomChange, zoom);
            }
            var center = _this.map.getCenter();
            if (null != center || null != _this.center) {
                if (((null == center || null == _this.center) && center !== _this.center)
                    || (center.lat !== _this.center.lat || center.lng !== _this.center.lng)) {
                    _this.center = center;
                    LeafletUtil.handleEvent(_this.zone, _this.centerChange, center);
                }
            }
        };
        registerEventHandler('moveend', outputUpdateHandler);
        registerEventHandler('zoomend', outputUpdateHandler);
    };
    /**
     * Resize the map to fit it's parent container
     */
    LeafletDirective.prototype.doResize = function () {
        var _this = this;
        // Run this outside of angular so the map events stay outside of angular
        this.zone.runOutsideAngular(function () {
            // Invalidate the map size to trigger it to update itself
            _this.map.invalidateSize({});
        });
    };
    /**
     * Manage a delayed resize of the component
     */
    LeafletDirective.prototype.delayResize = function () {
        if (null != this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(this.doResize.bind(this), 200);
    };
    /**
     * Set the view (center/zoom) all at once
     * @param center The new center
     * @param zoom The new zoom level
     */
    LeafletDirective.prototype.setView = function (center, zoom) {
        if (this.map && null != center && null != zoom) {
            this.map.setView(center, zoom, this.zoomPanOptions);
        }
    };
    /**
     * Set the map zoom level
     * @param zoom the new zoom level for the map
     */
    LeafletDirective.prototype.setZoom = function (zoom) {
        if (this.map && null != zoom) {
            this.map.setZoom(zoom, this.zoomOptions);
        }
    };
    /**
     * Set the center of the map
     * @param center the center point
     */
    LeafletDirective.prototype.setCenter = function (center) {
        if (this.map && null != center) {
            this.map.panTo(center, this.panOptions);
        }
    };
    /**
     * Fit the map to the bounds
     * @param latLngBounds the boundary to set
     */
    LeafletDirective.prototype.setFitBounds = function (latLngBounds) {
        if (this.map && null != latLngBounds) {
            this.map.fitBounds(latLngBounds, this.fitBoundsOptions);
        }
    };
    /**
     * Set the map's max bounds
     * @param latLngBounds the boundary to set
     */
    LeafletDirective.prototype.setMaxBounds = function (latLngBounds) {
        if (this.map && null != latLngBounds) {
            this.map.setMaxBounds(latLngBounds);
        }
    };
    /**
     * Set the map's min zoom
     * @param number the new min zoom
     */
    LeafletDirective.prototype.setMinZoom = function (zoom) {
        if (this.map && null != zoom) {
            this.map.setMinZoom(zoom);
        }
    };
    /**
     * Set the map's min zoom
     * @param number the new min zoom
     */
    LeafletDirective.prototype.setMaxZoom = function (zoom) {
        if (this.map && null != zoom) {
            this.map.setMaxZoom(zoom);
        }
    };
    LeafletDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: NgZone }
    ]; };
    LeafletDirective.propDecorators = {
        fitBoundsOptions: [{ type: Input, args: ['leafletFitBoundsOptions',] }],
        panOptions: [{ type: Input, args: ['leafletPanOptions',] }],
        zoomOptions: [{ type: Input, args: ['leafletZoomOptions',] }],
        zoomPanOptions: [{ type: Input, args: ['leafletZoomPanOptions',] }],
        options: [{ type: Input, args: ['leafletOptions',] }],
        mapReady: [{ type: Output, args: ['leafletMapReady',] }],
        zoom: [{ type: Input, args: ['leafletZoom',] }],
        zoomChange: [{ type: Output, args: ['leafletZoomChange',] }],
        center: [{ type: Input, args: ['leafletCenter',] }],
        centerChange: [{ type: Output, args: ['leafletCenterChange',] }],
        fitBounds: [{ type: Input, args: ['leafletFitBounds',] }],
        maxBounds: [{ type: Input, args: ['leafletMaxBounds',] }],
        minZoom: [{ type: Input, args: ['leafletMinZoom',] }],
        maxZoom: [{ type: Input, args: ['leafletMaxZoom',] }],
        onClick: [{ type: Output, args: ['leafletClick',] }],
        onDoubleClick: [{ type: Output, args: ['leafletDoubleClick',] }],
        onMouseDown: [{ type: Output, args: ['leafletMouseDown',] }],
        onMouseUp: [{ type: Output, args: ['leafletMouseUp',] }],
        onMouseMove: [{ type: Output, args: ['leafletMouseMove',] }],
        onMouseOver: [{ type: Output, args: ['leafletMouseOver',] }],
        onMouseOut: [{ type: Output, args: ['leafletMouseOut',] }],
        onMapMove: [{ type: Output, args: ['leafletMapMove',] }],
        onMapMoveStart: [{ type: Output, args: ['leafletMapMoveStart',] }],
        onMapMoveEnd: [{ type: Output, args: ['leafletMapMoveEnd',] }],
        onMapZoom: [{ type: Output, args: ['leafletMapZoom',] }],
        onMapZoomStart: [{ type: Output, args: ['leafletMapZoomStart',] }],
        onMapZoomEnd: [{ type: Output, args: ['leafletMapZoomEnd',] }],
        onResize: [{ type: HostListener, args: ['window:resize', [],] }]
    };
LeafletDirective.ɵfac = function LeafletDirective_Factory(t) { return new (t || LeafletDirective)(ɵngcc0.ɵɵdirectiveInject(ɵngcc0.ElementRef), ɵngcc0.ɵɵdirectiveInject(ɵngcc0.NgZone)); };
LeafletDirective.ɵdir = ɵngcc0.ɵɵdefineDirective({ type: LeafletDirective, selectors: [["", "leaflet", ""]], hostBindings: function LeafletDirective_HostBindings(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵlistener("resize", function LeafletDirective_resize_HostBindingHandler() { return ctx.onResize(); }, false, ɵngcc0.ɵɵresolveWindow);
    } }, inputs: { fitBoundsOptions: ["leafletFitBoundsOptions", "fitBoundsOptions"], panOptions: ["leafletPanOptions", "panOptions"], zoomOptions: ["leafletZoomOptions", "zoomOptions"], zoomPanOptions: ["leafletZoomPanOptions", "zoomPanOptions"], options: ["leafletOptions", "options"], zoom: ["leafletZoom", "zoom"], center: ["leafletCenter", "center"], fitBounds: ["leafletFitBounds", "fitBounds"], maxBounds: ["leafletMaxBounds", "maxBounds"], minZoom: ["leafletMinZoom", "minZoom"], maxZoom: ["leafletMaxZoom", "maxZoom"] }, outputs: { mapReady: "leafletMapReady", zoomChange: "leafletZoomChange", centerChange: "leafletCenterChange", onClick: "leafletClick", onDoubleClick: "leafletDoubleClick", onMouseDown: "leafletMouseDown", onMouseUp: "leafletMouseUp", onMouseMove: "leafletMouseMove", onMouseOver: "leafletMouseOver", onMouseOut: "leafletMouseOut", onMapMove: "leafletMapMove", onMapMoveStart: "leafletMapMoveStart", onMapMoveEnd: "leafletMapMoveEnd", onMapZoom: "leafletMapZoom", onMapZoomStart: "leafletMapZoomStart", onMapZoomEnd: "leafletMapZoomEnd" }, features: [ɵngcc0.ɵɵNgOnChangesFeature] });
/*@__PURE__*/ (function () { ɵngcc0.ɵsetClassMetadata(LeafletDirective, [{
        type: Directive,
        args: [{
                selector: '[leaflet]'
            }]
    }], function () { return [{ type: ɵngcc0.ElementRef }, { type: ɵngcc0.NgZone }]; }, { fitBoundsOptions: [{
            type: Input,
            args: ['leafletFitBoundsOptions']
        }], panOptions: [{
            type: Input,
            args: ['leafletPanOptions']
        }], zoomOptions: [{
            type: Input,
            args: ['leafletZoomOptions']
        }], zoomPanOptions: [{
            type: Input,
            args: ['leafletZoomPanOptions']
        }], options: [{
            type: Input,
            args: ['leafletOptions']
        }], mapReady: [{
            type: Output,
            args: ['leafletMapReady']
        }], zoomChange: [{
            type: Output,
            args: ['leafletZoomChange']
        }], centerChange: [{
            type: Output,
            args: ['leafletCenterChange']
        }], onClick: [{
            type: Output,
            args: ['leafletClick']
        }], onDoubleClick: [{
            type: Output,
            args: ['leafletDoubleClick']
        }], onMouseDown: [{
            type: Output,
            args: ['leafletMouseDown']
        }], onMouseUp: [{
            type: Output,
            args: ['leafletMouseUp']
        }], onMouseMove: [{
            type: Output,
            args: ['leafletMouseMove']
        }], onMouseOver: [{
            type: Output,
            args: ['leafletMouseOver']
        }], onMouseOut: [{
            type: Output,
            args: ['leafletMouseOut']
        }], onMapMove: [{
            type: Output,
            args: ['leafletMapMove']
        }], onMapMoveStart: [{
            type: Output,
            args: ['leafletMapMoveStart']
        }], onMapMoveEnd: [{
            type: Output,
            args: ['leafletMapMoveEnd']
        }], onMapZoom: [{
            type: Output,
            args: ['leafletMapZoom']
        }], onMapZoomStart: [{
            type: Output,
            args: ['leafletMapZoomStart']
        }], onMapZoomEnd: [{
            type: Output,
            args: ['leafletMapZoomEnd']
        }], onResize: [{
            type: HostListener,
            args: ['window:resize', []]
        }], zoom: [{
            type: Input,
            args: ['leafletZoom']
        }], center: [{
            type: Input,
            args: ['leafletCenter']
        }], fitBounds: [{
            type: Input,
            args: ['leafletFitBounds']
        }], maxBounds: [{
            type: Input,
            args: ['leafletMaxBounds']
        }], minZoom: [{
            type: Input,
            args: ['leafletMinZoom']
        }], maxZoom: [{
            type: Input,
            args: ['leafletMaxZoom']
        }] }); })();
    return LeafletDirective;
}());
export { LeafletDirective };

//# sourceMappingURL=leaflet.directive.js.map