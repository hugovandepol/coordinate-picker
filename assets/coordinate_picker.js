'use strict';

var $ = require('jquery');

var googleLoaded = false;
var loadCallback = null;

// Load the Google Maps api
google.maps.event.addDomListener(window, 'load', function () {
    googleLoaded = true;
        if (loadCallback) {
            loadCallback();
    }
});

/**
 * Renders a Google Map in the element provided, on which markers can be added.
 * Markers can be dragged and deleted as well.
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

    // wait for google to load
    if (!googleLoaded) {
        loadCallback = function () {
            coordinatePicker.init();
        };
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

    this.addEventListeners();
};

/**
 * Adds event listeners
 */
CoordinatePicker.prototype.addEventListeners = function () {
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

    // register listeners to the document that check if delete key is pressed
    $(document).keydown(function (e) {
        coordinatePicker.dPressed = (e.keyCode === coordinatePicker.options.deleteKeyCode);
    });

    $(document).keyup(function () {
        coordinatePicker.dPressed = false;
    });
};

/**
 * Triggers center changed event
 */
CoordinatePicker.prototype.triggerCenterChanged = function () {
   var center = this.map.getCenter(),
       data = {map: this.map, lat: center.lat(), lng: center.lng()};

   this.elem.trigger('coordinate_picker.center_changed', data);
};

/**
 * Triggers zoom changed event
 */
CoordinatePicker.prototype.triggerZoomChanged = function () {
    var data = {map: this.map, zoom: this.map.getZoom()};
    this.elem.trigger('coordinate_picker.zoom_changed', data);
    console.log('zoom changed', data);

};

/**
 * Triggers markers changed event. Sends with it the current array of markers
 */
CoordinatePicker.prototype.triggerMarkersChanged = function () {
    var data = {markers: this.markers};
    this.elem.trigger('coordinate_picker.markers_changed', data);
};

/**
 * Triggers marker dragged event
 *
 * @param m The marker that was dragged
 */
CoordinatePicker.prototype.triggerMarkerDragged = function (m) {
    var data = {marker: m};
    this.elem.trigger('coordinate_picker.marker_dragged', data);
};

/**
 * Triggers marker clicked event
 *
 * @param m The marker that was clicked
 */
CoordinatePicker.prototype.triggerMarkerClicked = function (m) {
    var data = {marker: m};
    this.elem.trigger('coordinate_picker.marker_clicked', data);
};

/**
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
    if (coordinatePicker.options.marker.icon) {
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
            coordinatePicker.triggerMarkerClicked(marker);
        }
    });

    // bind drag listener
    google.maps.event.addListener(marker, 'dragend', function (event){
        // update marker
        coordinatePicker.markers.forEach(function (m) {
            if (m === marker) {
                m.setPosition(event.latLng);
            }

            // fire events
            coordinatePicker.triggerMarkerDragged(marker);
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

    if (typeof option === 'string') {
      if (option === '') {
        // do something
      }
    }
  });

  return this;
};

exports.CoordinatePicker = CoordinatePicker;
