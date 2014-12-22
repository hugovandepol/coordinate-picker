# Google Maps coordinate picker # 

Simple jQuery plugin that turns a div into a coordinate picker, using a Google
Map. It keeps an internal array of markers that are currently present on the map and fires events when a marker is added, dragged or deleted. Other code can then catch these events and for example update a hidden input field on a form with the data that is received.

## Installation and usage ##
The plugin can be installed via Bower using via `bower install tg-coordinate-picker`. Then require the plugin in your javascript file with `require('tg-coordinate-picker')`.


### Usage
Create a div with a suitable width and height that will hold the Google Map. If the div has a class `coordinate-picker`, then simply call ` $('div.coordinatePicker').coordinatePicker()` on document ready. 

By default, multiple markers can be placed on the map, by just clicking the map. To delete a marker, simply click it while holding down a configurable key. Currently, the default key to hold down is "d".

Next you should write some code that catches the events fired by the coordinate picker, to update for example a hidden form field where you store the marker info.

See below for which events are fired.

## Standard configuration and options ##
By default, the following options are set, that can be overwritten using the standard jQuery plugin way.

```
{
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
}
```

Some remarks:
+ It is possible to use a custom marker icon. Below is an example of options passed in to use such a custom icon:

```
{
    marker: {
        icon: '/assets/images/marker.png',
        imageOffset: {
            left: 16,
            top: 50
        }
}
```

## Events ##
The coordinate picker currently fires the events listed below, of which some are standard Google Maps events that are given some more data. The data is always present in the data key of the event object. Every data object has a 'map' key that holds the Google Map that is associated with the current traffic map, as well as what's listed in the table below.

| Event name                          | data                         | remark                 |
| ----------------------------------- | ---------------------------- | ---------------------- |
| coordinate_picker.map_ready         | the map that loaded          | When map is ready      |
| coordinate_picker.center_changed    | lat and long of new center   | Instead of mouse event |
| coordinate_picker.zoom_changed      | new zoom level               | Instead of mouse event |
| coordinate_picker.marker_dragend    | marker that is clicked       | Instead of mouse event | 
| coordinate_picker.marker_click      | marker that is clicked       | Instead of mouse event |
| coordinate_picker.marker_rightclick | marker that is richt clicked | Instead of mouse event |
| coordinate_picker.marker_dblclick   | marker that is dblclicked    | Instead of mouse event |
| coordinate_picker.markers_changed   | array of markers that are currently on the map | when a marker is added, deleted or dragged   | 



