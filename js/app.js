(function () {
	'use strict';

	//Model - List of Map Markers
	var markers = [
		{title: 'Hello World!', position: {lat: 44.5403, lng: -78.5463}},
		{title: 'Hello World!!', position: {lat: -36.397, lng: 145.644}}
	];

	//ViewModel
	var AppViewModel = function() {
		var self = this;

		this.map;
		this.markerList = ko.observableArray();

		var initialize = function() {
			var mapCanvas = $('#map').get(0);
			var mapOptions = {
				center: new google.maps.LatLng(44.5403, -78.5463),
				zoom: 8
			};
			self.map = new google.maps.Map(mapCanvas, mapOptions);

			markers.forEach(function(marker, index){
				self.markerList.push( new google.maps.Marker({
					position: marker.position,
					map: self.map,
					title: marker.title
				}));
			});
		}
		
		google.maps.event.addDomListener(window, 'load', initialize);
	};

	ko.applyBindings(new AppViewModel());
}());

