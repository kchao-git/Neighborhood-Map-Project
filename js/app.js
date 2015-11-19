'use strict';

//Map Markers  
var markerData = [
	{id: 0, title: 'Baja Fish Tacos', position: {lat: 33.697738, lng: -117.887827}, foursquareid: '4bd2509877b29c74dd958e82'},
	{id: 1, title: 'Kickin Crab', position: {lat: 33.6995000000, lng: -117.8852600000}, foursquareid: '4cb8b1aef50e224b3ad0e8fb'},
	{id: 2, title: 'Chipotle', position: {lat: 33.6983980000, lng: -117.8852340000}, foursquareid: '4a99bb80f964a520203020e3'},
	{id: 3, title: 'Taqueria El Zamorano', position: {lat: 33.716332, lng: -117.877320}, foursquareid: '54349e5c498e1873d1a55d9c'},
	{id: 4, title: 'Clemente Seafood', position: {lat: 33.699704, lng: -117.869242}, foursquareid: '4cb219101168a0932f7b3823'}
]

var numLocation = markerData.length;

//DOM Elements
var $markerListItems = $('.marker-list-item');
var $errorMessage = $('.error');
var $mapCanvas = $('#map-canvas');

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

		$markerListItems.removeClass('selected');
		//clear all bounce animations
		ko.utils.arrayForEach(self.markerList(), function(marker){
			marker.googleMarker.setAnimation(null);
			marker.infoWindow.close();
		});
		//self.infoWindow.close();

		ko.utils.arrayForEach(self.markerList(), function(marker){
			if(marker.googleMarker.getTitle().toLowerCase().indexOf(input) < 0){
				marker.googleMarker.setVisible(false);
				marker.visible(false);
			} else {
				marker.googleMarker.setVisible(true);
				marker.visible(true);
			}
		});
		$markerListItems = $('.marker-list-item');
	});

	//Toggle marker list
	$('.menu').click(function(){
		$( ".marker-list" ).slideToggle("slow", function(){});
	});

	//Toggles map marker when item from marker list is clicked
	self.selectMarker = function(e) {
		toggleMarker(e);
	};
};

//declare ko's viewmodel for reference
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

	self.infoWindow = new google.maps.InfoWindow({
		content: '<h2>' + data.title + '</h2>'
	});

	self.infoWindow.addListener('closeclick', function(){
		toggleMarker(self);
	});

	self.googleMarker.addListener('click', function(){
		toggleMarker(self);
	});

	self.visible = ko.observable(true);

	self.selected = ko.observable(false);

	self.setInfoContent = function(content) {
		self.infoWindow.setContent('<h2>' + self.googleMarker.getTitle() + '</h2>' + content);
	};
}

function createMap() {
	var mapCanvas = $mapCanvas.get(0);
	var mapOptions = {
		center: {lat: 33.709664, lng: -117.876967},
		zoom: 13
	};
	return new google.maps.Map(mapCanvas, mapOptions);
}

function setMarkers(data, markerList, map) {
	data.forEach(function(marker, index){
		var markerObj = new Marker(marker, map);
		markerList.push(markerObj);
	});
}

//Toggles selection of map markers
function toggleMarker(marker){

	if(marker.selected()){
		//unselect marker, stop animation, close infowindow
		marker.selected(false);
		marker.googleMarker.setAnimation(null);
		marker.infoWindow.close();
	} else {
		//clear other selections and select marker
		ko.utils.arrayForEach(viewModel.markerList(), function(markers){
			markers.googleMarker.setAnimation(null);
			markers.infoWindow.close();
			markers.selected(false);
		});
		marker.selected(true);
		marker.googleMarker.setAnimation(google.maps.Animation.BOUNCE);
		marker.infoWindow.open(viewModel.map, marker.googleMarker);
	}
}

//Callback function for Google Maps
function initMap() {
	viewModel = new AppViewModel();
	//Start viewmodel once Google Maps API has loaded successfully
	ko.applyBindings(viewModel);

	//initialize dynamic DOM elements
	$markerListItems = $('.marker-list-item');

	//get data from foursquare
	getLocationData(markerData[0]);
}

//Google error handling function
function googleError() {
	$errorMessage.text('Unable to load Google Maps');
}

//Foursquare API
function getLocationData(data) {
	var nextIndex = data.id + 1;
	var venueid = data.foursquareid;
	var requestUrl = 'https://api.foursquare.com/v2/venues/'+ venueid + '?oauth_token=EGRINEY0X2INPJMNRSSLI2LIFFGBAEKBD3JNEDQ1GWDPFJND&v=20151118';

	$.ajax({
		url: requestUrl
	}).done(function(response) {
		var venueinfo = response.response.venue;
		var content = '<div class="address">' + venueinfo.location.address +'</div><div class="details">Rating: ' + venueinfo.rating + '</div><div class="details">Price: ' + venueinfo.attributes.groups[0].summary + '</div>';
		viewModel.markerList()[data.id].setInfoContent(content);

		//Get Location Data for the next marker in the list
		if(nextIndex < numLocation) {
			getLocationData(markerData[nextIndex]);
		}
	}).fail(function(response){
		$errorMessage.text('Unable to request data from Foursquare');
	});
}