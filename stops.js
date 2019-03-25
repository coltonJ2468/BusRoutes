$(document).ready(initMap);

var map;
var routes;
var infowindow;
var name;
var infotext;

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (p) {
    initStops(p.coords.latitude, p.coords.longitude);
    });
  }
  else {
    alert('Geo Location feature is not supported in this browser.');
  }
}

function callback (results, status) {
  for (var ix = 0; ix < results.stops.length; ix++) {
    createMarker(results.stops[ix]);
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.coordinates;
  var marker = new google.maps.Marker({
    map: map,
    position: {lat: placeLoc[1], lng: placeLoc[0]}
  });

  google.maps.event.addListener(marker, 'click', function() {
    var stops = "<h3>Routes Servicing Stop: ";
    for (var ix = 0; ix < place.routes_serving_stop.length; ix ++) {
      
      stops += place.routes_serving_stop[ix].route_name;
      if (ix != place.routes_serving_stop.length - 1)
        stops += ", ";
    }
    stops += "</h3>"
    $.get("http://transit.land/api/v1/schedule_stop_pairs?destination_onestop_id=" +place.onestop_id+ "&origin_departure_between=now,now+3600&date=today", {} , gotDestination, "json");
    infowindow.setContent(stops +infotext);
    infowindow.open(map, this);
  });
}

function initStops(lat, lng){
  var curLoc = {lat: lat, lng: lng};
  map = new google.maps.Map(document.getElementById('map'), {
    center: curLoc,
    zoom: 15
  });
	
	google.maps.event.addListener(map, 'click', function(event) {
    var coords = event.latLng;
		initStops(coords.lat(), coords.lng());
	});
  infowindow = new google.maps.InfoWindow();
  $.get("https://transit.land/api/v1/stops?lon=" + curLoc.lng + "&lat=" + curLoc.lat + "&r=2000", {} , callback, "json");
}

function gotDestination(results) {
  incoming_buses = results.schedule_stop_pairs;
  console.log(incoming_buses);
  var test = "<body>";
  for(ix = 0; ix < incoming_buses.length; ix++){
      var text = String(incoming_buses[ix].destination_arrival_time);
      var bus = String(incoming_buses[ix].trip_headsign);
      test += "<i><b>"+ bus+ "</i></b> will arrive at:<b> " +text+ "</b><br>";
  }
  if(incoming_buses.length == 0){
    test += "There are no buses arriving shortly";
  }
  test += "</body>";
  infotext = test;
  test = "";
}

