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
	
	//Observatbles
	self.markerList = ko.observableArray();
	self.filterText = ko.observable();

	//Create Map
	self.map = createMap();

	//Set up Markers
	setMarkers(markerData, self.markerList, self.map);

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

	//Toggle marker list
	$('.menu').click(function(){
		$( ".marker-list" ).slideToggle("slow", function(){});
	});

	//Handle clicks on marker list items.
	//Highlight selected item from marker list
	$('body').on('click', '.marker-list-item', function(){
		var $selectedMarker = $(this);
		if($selectedMarker.hasClass('selected')){
			$selectedMarker.removeClass('selected');
		} else {
			$('.marker-list-item').removeClass('selected');
			$selectedMarker.addClass('selected');
		}
	});

	//Toggles map marker when item from marker list is clicked
	self.selectMarker = function(e) {
		toggleMarker(e.googleMarker);
	};
};

var viewModel;

//Google Map Functions

//Marker class to handle creating Google Map marker and toggle visibility for the list view
function Marker(data, map) {
	var self = this;
	self.googleMarker = new google.maps.Marker({
		position: data.position,
		map: map,
		animation: google.maps.Animation.DROP,
		title: data.title
	});

	self.googleMarker.addListener('click', markerListener);

	self.visible = ko.observable(true);
}

function createMap() {
	var mapCanvas = $('#map-canvas').get(0);
	var mapOptions = {
		center: {lat: 44.5403, lng: -78.5463},
		zoom: 8
	};
	return new google.maps.Map(mapCanvas, mapOptions);
}

function setMarkers(data, markerList, map) {
	data.forEach(function(marker, index){
		var markerObj = new Marker(marker, map);
		//markerObj.googleMarker.addListener('click', self.selectMapMarker);
		markerList.push(markerObj);
	});
}

//
function toggleMarker(markerObj){
	if(markerObj.getAnimation() !== null) {
		markerObj.setAnimation(null);
	} else {
		//clear all bounce animations
		ko.utils.arrayForEach(viewModel.markerList(), function(marker){
			marker.googleMarker.setAnimation(null);
		});

		markerObj.setAnimation(google.maps.Animation.BOUNCE);
	}
}

//Click listener function for map markers
function markerListener() {
	//Remove highlight from marker list to avoid confusion
	$('.marker-list-item').removeClass('selected');

	//Toggle animation and infowindow on selected marker
	toggleMarker(this);
}

//Callback function for Google Maps
function initMap() {
	viewModel = new AppViewModel();
	//Start viewmodel once Google Maps API has loaded successfully
	ko.applyBindings(viewModel);
}

//Google error handling function
function googleError() {
	$('.error').text('Unable to load Google Maps');
}