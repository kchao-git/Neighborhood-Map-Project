'use strict';

//Map Markers  
var markerData = [
	{title: 'Avocado', position: {lat: 44, lng: -78}},
	{title: 'Banana', position: {lat: 45, lng: -79}},
	{title: 'Avocado', position: {lat: 43, lng: -80}}
];

//ViewModel
var AppViewModel = function() {
	var self = this;
	
	self.markerList = ko.observableArray();

	self.filterText = ko.observable();
	
	//Create Map
	var mapCanvas = $('#map').get(0);
	var mapOptions = {
		center: {lat: 44.5403, lng: -78.5463},
		zoom: 8
	};
	var map = new google.maps.Map(mapCanvas, mapOptions);

	//Set up Markers
	markerData.forEach(function(marker, index){
		self.markerList.push( 
			new Marker(marker, map)
		);
	});

	//Listener for search/filter bar. Toggles visibility for both the marker and list view item
	self.filterText.subscribe(function(input) {
		console.log("textInput: " + input);

		ko.utils.arrayForEach(self.markerList(), function(marker){
			if(marker.googleMarker.getTitle().toLowerCase().indexOf(input) < 0){
				marker.googleMarker.setVisible(false);
				marker.visible(false);
			} else {
				marker.googleMarker.setVisible(true);
				marker.visible(true);
			}
		});
	});
};

//Marker class to handle creating Google Map marker and toggle visibility for the list view
function Marker(data, map) {
	var self = this;
	self.googleMarker = new google.maps.Marker({
		position: data.position,
		map: map,
		title: data.title
	});

	self.visible = ko.observable(true);
}

//Callback function for Google Maps
function initMap() {
	//Start viewmodel once Google Maps API has loaded successfully
	ko.applyBindings(new AppViewModel());
}

//Google error handling function
function googleError() {
	$('.error').text('Unable to load Google Maps');
}






