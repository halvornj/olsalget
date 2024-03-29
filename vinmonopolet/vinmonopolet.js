console.time("TTL");
import { Position } from "./Position.js";
import { Store } from "./Store.js";
//getCoords() returns a promise that resolves to a Position object
// basically, if geCoords succeeds we return a position object to caller, else we call geoLocError
const getCoords = async () => {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, geoLocError);
  });

  return new Position(pos.coords.latitude, pos.coords.longitude);
};
function geoLocError() {
  alert("kan ikke finne ditt nærmeste vinmonopol uten å vite hvor du er :)");
  window.location.href = "../index.htm";

  return; //unreachable, but makes the linter happy
}

async function initMap(userPosition, closestStores) {
  //Main mapping function to utilize Google Maps API to get a route from user to closest store
  document.getElementById("map-canvas-text").style.display = "none";
  
  var pointA = new google.maps.LatLng(
      userPosition.getLat(),
      userPosition.getLon()
    ),
    pointB = new google.maps.LatLng(
      closestStores.position.getLat(),
      closestStores.position.getLon()
    ),
    myOptions = {
      zoom: 7,
      center: pointA,
      mapTypeControl: false,
    },
    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions),
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer({
      map: map,
    }),
    markerA = new google.maps.Marker({
      position: pointA,
      title: "Din posisjon",
      label: "A",
      map: map,
    }),
    markerB = new google.maps.Marker({
      position: pointB,
      title: "Vinmonopolet",
      label: "B",
      map: map,
    });

  // get route from A to B
  calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB)
    .catch((error) => {
      // Handle the error by calling the fallback function
      console.log(error);
      loadLeafletMap(userPosition, closestStores);
    });
}

async function calculateAndDisplayRoute(
  directionsService,
  directionsDisplay,
  pointA,
  pointB
) {
  directionsService.route(
    {
      origin: pointA,
      destination: pointB,
      avoidTolls: false,
      avoidHighways: false,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        throw "Error: " + status;
      }
    }
  );
}

function loadLeafletMap(userPosition, closestStore) {
  //Secondary mapping function that runs if Google Maps API fails
  //Only shows the closest store on a map
  document.getElementById("map-canvas").innerHTML = ""; 

  let map = L.map("map-canvas").setView(
    [closestStore.position.getLat(), closestStore.position.getLon()],
    13
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);

  L.marker([closestStore.position.getLat(), closestStore.position.getLon()]).addTo(map);

  map.on('click', function(e) {
    window.open("https://www.google.com/maps/dir/?api=1&origin=" + userPosition.getLat() + "," + userPosition.getLon() + "&destination=" + closestStore.position.getLat() + "," + closestStore.position.getLon() + "&travelmode=driving");
  });
  document.getElementById("map-canvas-text").innerHTML += "Klikk på kartet for å få veibeskrivelse til vinmonopolet: <u>" + closestStore.name + "</u>";
  document.getElementById("map-canvas-text").style.display = "block";

  setTimeout(function(){ map.invalidateSize()}, 1);
}

async function main() {
  var userPosition;
  if (navigator.geolocation) {
    userPosition = await getCoords();
  } else {
    geoLocError();
  }
  //*invariant: position is known

  //getting the stores
  const stores = await fetch("stores.json");
  var storeArray = await stores.json();

  var closestStores = []; //array of 5 closest stores
  //find insertPosition for closestStores recursively
  function findInsertPosition(distance, fromIndex) {
    if (fromIndex <= 0) {
      return 0;
    }
    if (distance < closestStores[fromIndex - 1].getDistanceFromUser()) {
      return findInsertPosition(distance, fromIndex - 1);
    } else {
      return fromIndex;
    }
  }
  for (var i = 0; i < storeArray.length; i++) {
    var storePosition = new Position(
      parseFloat(storeArray[i].gpsCoord.split(";")[0]),
      parseFloat(storeArray[i].gpsCoord.split(";")[1])
    );
    storeArray[i] = new Store(
      storeArray[i].storeId,
      storeArray[i].storeName,
      storePosition
    );
    storeArray[i].setDistanceFromUser(userPosition);
    if (closestStores.length < 5) {
      closestStores.push(storeArray[i]);
    } else if (
      storeArray[i].getDistanceFromUser() <
      closestStores[4].getDistanceFromUser()
    ) {
      closestStores.splice(
        findInsertPosition(storeArray[i].getDistanceFromUser(), 4),
        0,
        storeArray[i]
      );
      closestStores.pop();
    }
  }
  //* invariant: top 5 closest stores are now known
  //might as well generate table here
  document
    .getElementById("showOtherStoresButton")
    .addEventListener("click", () => {
      if (
        document.getElementById("closestStoresDiv").style.display === "none"
      ) {
        document.getElementById("closestStoresDiv").style.display = "block";
        document.getElementById("showOtherStoresButton").innerText =
          "Skjul vinmonopol i nærheten";
      } else {
        document.getElementById("closestStoresDiv").style.display = "none";
        document.getElementById("showOtherStoresButton").innerText =
          "Vis vinmonopol i nærheten";
      }
    });

  document.getElementById("getRouteBtn").addEventListener("click", async () => {
    if (document.getElementById("map-canvas").style.display === "none") {
      if (document.getElementById("map-canvas").innerHTML === "") {
        try {
          const result = await initMap(userPosition, closestStores[0]);
        } catch (error) {
          loadLeafletMap(userPosition, closestStores[0]);
        }
      }
      document.getElementById("map-canvas").style.display = "block";
      document.getElementById("getRouteBtn").innerText = "Skjul kart";
    } else {
      document.getElementById("map-canvas").style.display = "none";
      document.getElementById("map-canvas-text").style.display = "none";
      document.getElementById("getRouteBtn").innerText = "Vis i kart";
    }
  });

  document.getElementById("closestStoreTitleText").innerText = `Nærmeste vinmonopol:`;
  document.getElementById("closestStoreTitle").innerText = closestStores[0].getName();
  console.log(closestStores[0]);
  document.getElementById("closestStoreDistance").innerText = `${Math.round(closestStores[0].getDistanceFromUser() * 100) / 100}km unna`;
  document.getElementById("closestStoreTimeText").innerText = 'Åpent:';

  var openingTimes = openingHoursForDay(
    await getStoreJson(closestStores[0].getId()),
    new Date(Date.now())
  );
  document.getElementById("closestStoreTime").innerText = openingTimes;
  //todo: handle too many requests or permission denied
  //todo: if error429, throw up loading symbol and try again in 5(?) seconds

  //generate table
  var closestStoresTable = document.getElementById("closestStoresTable");
  for (var i = 1; i < closestStores.length; i++) {
    let row = document.createElement("tr");
    let storeName = document.createElement("td");
    let storeDistance = document.createElement("td");
    let storeOpeningHours = document.createElement("td");
    storeName.innerText = closestStores[i].getName() + ":";
    storeDistance.innerText = `${
      Math.round(closestStores[i].getDistanceFromUser() * 100) / 100
    }km`;
    storeOpeningHours.innerText = openingHoursForDay(
      await getStoreJson(closestStores[i].getId()),
      new Date(Date.now())
    );
    row.appendChild(storeName);
    row.appendChild(storeDistance);
    row.appendChild(storeOpeningHours);
    closestStoresTable.appendChild(row);
  }
}

async function getStoreJson(storeId) {
  const response = await fetch(
    "https://apis.vinmonopolet.no/stores/v0/details?storeId=" + storeId,
    {
      method: "GET",
      // Request headers
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": "5e84979b75fe4d4e87348476bd1d89a5",
      },
    }
  ).catch((error) => {
    //todo: Check if error correctly handled
    console.log(error);
  });
  const json = await response.json();
  return json[0];
}

function openingHoursForDay(storeJson, date) {
  var todayISOstr = date.toISOString().slice(0, 10);
  var fullOpeningHours = storeJson.openingHours;
  //first, check if today is in exceptionHours
  for (var i = 0; i < fullOpeningHours.exceptionHours.length; i++) {
    let exceptionObj = fullOpeningHours.exceptionHours[i];
    if (exceptionObj.date === todayISOstr) {
      //today is an exception
      if (
        exceptionObj.closed ||
        exceptionObj.message === "Stengt" ||
        (exceptionObj.openingTime === "" && exceptionObj.closingTime === "")
      ) {
        return "stengt";
      }
      //exception date, but not closed. return specified opening hours
      return `${exceptionObj.openingTime}-${exceptionObj.closingTime}`;
    }
  }
  //today is not an exception. check if it's still closed
  //get day of week, transale 0= sunday to 0=monday, use that as index in regularHours
  let currentDay = date.getDay();
  currentDay--;
  if (currentDay === -1) {
    currentDay = 6;
  }
  let currentHours = fullOpeningHours.regularHours[currentDay];
  if (
    currentHours.closed ||
    (currentHours.openingTime === "" && currentHours.closingTime === "")
  ) {
    return "stengt";
  } else {
    //today is not an exception, and not closed. return specified opening hours
    return `${currentHours.openingTime}-${currentHours.closingTime}`;
  }
}

main();

console.timeEnd("TTL")