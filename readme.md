# Google Maps coordinate picker # 

Simple jQuery Plugin that turns a div into a coordinate picker, using a Google
Map. It holds an internal array of markers that are currently present on the map and fires events when a marker is added, dragged or deleted. Other code can then catch these events and for example update the value of a hidden markers input field of a form.

## Installation and usage ##
Installation via Bower:


Usage:
Create a div with a suitable width and height that will hold the Google Map. If the div has a class `coordinate-picker`, then simply call

```
$('div.coordinatePicker').coordinatePicker();
```

on document ready. 

By default, multiple markers can be placed on the map, by just clicking the map. To delete a marker, simply click it while holding down "d" on your keyboard. It is possible to configure another button for this too, see below.

Next you should write some code that catches the events fired by the coordinate picker, to update a hidden form field for example where you store the marker info.

See below for which events are fired.


## Standard configuration and options ##
By default, the following options are set:

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
    deleteKeyCode: 68,
    multipleMarkers: true
}
```
Some remarks:
Currently, the default key to hold down to delete a marker by a left mouse click is "d". And it is possible to use a custom marker icon. Below is an example of options passed in to use such a custom icon:

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
The coordinate picker currently fires the following events:
+ coordinate_picker.center_changed: when you drag the map and the center changes.
+ coordinate_picker.zoom_changed: when you zoom the map and the zoom level changes.
+ coordinate_picker.markers_changed: when a marker is added, dragged or deleted from the map.
+ coordinate_picker.marker_dragged: when a marker was dragged.
+ coordinate_picker.marker_clicked: when a marker was clicked.


