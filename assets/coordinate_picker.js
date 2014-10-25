'use strict';

var $ = require('jquery');

// Load the Google Maps api taking into account possibly multiple coordinate picker instances
var googleLoaded = false,
    loadCallbacks = [];

google.maps.event.addDomListener(window, 'load', function () {
    googleLoaded = true;
    if (loadCallbacks.length > 0) {
        for (var i = 0; i < loadCallbacks.length; i += 1) {
            loadCallbacks[i]();
        }
    }
});

/**
 * Renders a Google Map in the element provided, on which markers can be added.
 * Markers can be dragged and deleted as well.
 *
 * It triggers events that other code can catch to process the data provided.
 * Please refer to the readme for a listing of these events.
 *
 * @param element
 * @param options
 * @returns {CoordinatePicker}
 * @constructor
 */
var CoordinatePicker = function (element, options) {
  this.options = $.extend({}, CoordinatePicker.DEFAULTS, options);
  this.elem = $(element);
  this.markers = [];
  this.dPressed = false;
  this.init();
  return this;
};

CoordinatePicker.DEFAULTS = {
    map: {
        center: {
            lat: 51.8361462,
            lng: 5.8601392
        },
        zoom: 17,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: {},
        disableDefaultUI: true,
        draggable: true,
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: true
    },
    marker: 'default',
    deleteKeyCode: 68,
    multipleMarkers: true
};

/**
 * Inits the coordinate picker
 *
 * @returns {CoordinatePicker}
 */
CoordinatePicker.prototype.init = function () {
    var coordinatePicker = this;

    // if the Google Api hasn't been loaded yet, wait with calling init on this coordinate picker
    if (!googleLoaded) {
        loadCallbacks.push(function () {
            coordinatePicker.init();
        });
        return this;
    }

    // configure google map options and display the map
    this.options.map = {
        center: new google.maps.LatLng(
            this.options.map.center.lat,
            this.options.map.center.lng
        ),
        zoom: this.options.map.zoom
    };

    this.map = new google.maps.Map(this.elem.get(0), this.options.map);

    this.addMapListeners();
    this.addDeleteKeyListeners();
};

/**
 * Adds event listeners to the map
 */
CoordinatePicker.prototype.addMapListeners = function () {
    var coordinatePicker = this;

    // bind center changed handler
    google.maps.event.addListener(this.map, 'center_changed', function(){
        coordinatePicker.triggerCenterChanged();
    });

    // bind zoom changed handler
    google.maps.event.addListener(this.map, 'zoom_changed', function(){
        coordinatePicker.triggerZoomChanged();
    });

    // bind map click handler based on multiple markers option
    google.maps.event.addListener(this.map, 'click', function (event) {
        if (coordinatePicker.options.multipleMarkers === false) {
            if (coordinatePicker.markers.length > 0) {
                coordinatePicker.markers[0].setMap(null);
                coordinatePicker.markers = [];
            }
        }
        coordinatePicker.addMarker(event.latLng.lat(), event.latLng.lng());
        coordinatePicker.triggerMarkersChanged();
    });
};

/**
 * Adds two listeners to the document to keep track of if the configured
 * delete key is being pressed
 */
CoordinatePicker.prototype.addDeleteKeyListeners = function () {
    var coordinatePicker = this;

    $(document).keydown(function (e) {
        coordinatePicker.dPressed = (e.keyCode === coordinatePicker.options.deleteKeyCode);
    });

    $(document).keyup(function () {
        coordinatePicker.dPressed = false;
    });
};

/**
 * Triggers center changed event and sends with it the new center of the map
 */
CoordinatePicker.prototype.triggerCenterChanged = function () {
   var center = this.map.getCenter(),
       data = {map: this.map, lat: center.lat(), lng: center.lng()};
   this.elem.trigger('coordinate_picker.center_changed', data);
   console.log('center changed', data);
};

/**
 * Triggers zoom changed event and sends with it the new zoom level of the map
 */
CoordinatePicker.prototype.triggerZoomChanged = function () {
    var data = {map: this.map, zoom: this.map.getZoom()};
    this.elem.trigger('coordinate_picker.zoom_changed', data);
};

/**
 * Triggers markers changed event. Sends with it the current array of markers
 */
CoordinatePicker.prototype.triggerMarkersChanged = function () {
    var data = {map: this.map, markers: this.markers};
    this.elem.trigger('coordinate_picker.markers_changed', data);
};

/**
 * Triggers marker dragend event
 *
 * @param m The marker that was dragged
 */
CoordinatePicker.prototype.triggerMarkerDragend = function (m) {
    var data = {map: this.map, marker: m};
    this.elem.trigger('coordinate_picker.marker_dragend', data);
};

/**
 * Triggers marker click event
 *
 * @param m The marker that was clicked
 */
CoordinatePicker.prototype.triggerMarkerClick = function (m) {
    var data = {map: this.map, marker: m};
    this.elem.trigger('coordinate_picker.marker_click', data);
};

/**
 * Triggers marker double click event
 *
 * @param m The marker that was double clicked
 */
CoordinatePicker.prototype.triggerMarkerDblClick = function (m) {
    var data = {marker: m};
    this.elem.trigger('coordinate_picker.marker_dblclick', data);
};

/**
 * Triggers marker right click event
 *
 * @param m The marker that was right clicked
 */
CoordinatePicker.prototype.triggerMarkerRightClick = function (m) {
    var data = {marker: m};
    this.elem.trigger('coordinate_picker.marker_rightclick', data);
};

/**
 * Adds a marker to the map on the given lat lng position
 *
 * @param lat
 * @param lng
 */
CoordinatePicker.prototype.addMarker = function (lat, lng) {
    var coordinatePicker = this;

    var markerOptions = {
        draggable: true,
        clickable: true,
        position: new google.maps.LatLng(lat, lng),
        map: this.map
    };

    // add custom icon if we have one
    if (coordinatePicker.options.marker !== 'default' && coordinatePicker.options.marker.icon) {
        markerOptions.icon = new google.maps.MarkerImage(
            this.options.marker.icon,
            null,
            new google.maps.Point(0, 0),
            new google.maps.Point(
                this.options.marker.imageOffset.left,
                this.options.marker.imageOffset.top
            )
        );
    }

    // construct marker
    var marker = new google.maps.Marker(markerOptions);

    // bind click listener
    google.maps.event.addListener(marker, 'click', function (){
        var index = coordinatePicker.markers.indexOf(marker);

        // remove marker when delete key is being held down
        if (coordinatePicker.dPressed && index !== -1) {
            marker.setMap(null);
            coordinatePicker.markers.splice(index, 1);

            // fire markers changed event
            coordinatePicker.triggerMarkersChanged();
        } else {
            // fire regular clicked event
            coordinatePicker.triggerMarkerClick(marker);
        }
    });

    // bind double click listener
    google.maps.event.addListener(marker, 'dblclick', function (){
        coordinatePicker.triggerMarkerDblClick(marker);
    });

    // bind right click listener
    google.maps.event.addListener(marker, 'rightclick', function (){
        coordinatePicker.triggerMarkerRightClick(marker);
    });

    // bind drag listener
    google.maps.event.addListener(marker, 'dragend', function (event){
        // update marker
        coordinatePicker.markers.forEach(function (m) {
            if (m === marker) {
                m.setPosition(event.latLng);
            }

            // fire events
            coordinatePicker.triggerMarkerDragend(marker);
            coordinatePicker.triggerMarkersChanged();
        });
    });

  // add marker to internal markers array
  this.markers.push(marker);
};

/**
 * jQuery plugin definition
 * @param option
 * @returns {$.fn}
 */
$.fn.coordinatePicker = function (option) {
  var i, args = [];
  for (i = 1; i < args.length; i += 1) {
    args[i - 1] = arguments[i];
  }

  var options = typeof option === 'object' ? option : {};

  this.each(function () {
    var $this = $(this);
    var data = $this.data('coordinatePicker');

    if (!data) {
      data = new CoordinatePicker(this, options);
      $this.data('coordinatePicker', data);
    }
  });

  return this;
};

exports = CoordinatePicker;
