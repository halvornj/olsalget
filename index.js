import { Kommune } from "./Kommune.js";

async function geoLocSuccess(position) {
  console.log("geoLocsuccess");
  var geoPos = position.coords;
  console.log(geoPos);
  var lat = geoPos.latitude;
  var lon = geoPos.longitude;
  const response = await fetch(
    "https://ws.geonorge.no/kommuneinfo/v1/punkt?nord=" +
      lat +
      "&koordsys=4326&ost=" +
      lon
  );
  const jsonData = await response.json();
  geoLocDone(jsonData.kommunenavn);
}
function geoLocError() {
  console.log("geoLocerror");
  alert("Vi fant ikke din posisjon, så vi antar at du er i Oslo");
  geoLocDone("Oslo");
}

async function geoLocDone(kommuneNavn) {
  var year = new Date().getFullYear();

  const hoytiderResponse = await fetch(
    "https://webapi.no/api/v1/holidays/" + year
  );
  const hoytiderJson = await hoytiderResponse.json();
  var hoytider = hoytiderJson.data;
  hoytider.shift();
  console.log(hoytider);
  var today = new Date().toISOString().slice(0, 10);
  var tomorrow = new Date(Date.now() + 86400000);

  tomorrow = tomorrow.toISOString().slice(0, 10);

  const kommuner = await fetch("kommuner.json");
  var kommuneData = await kommuner.json();

  var kommuneData = kommuneData.filter(
    (kommune) => kommune.kommuneNavn === kommuneNavn
  )[0];
  console.log(kommuneData);

  hoytider.forEach((hoytid) => {
    switch (hoytid.date.slice(0, 10)) {
      case today:
        document.getElementById(
          "content"
        ).innerHTML = `<h1>Det selges ikke alkohol i dag!</h1>`;
        break;
      case tomorrow:
        var timeString = hoytid.description.replace("ø", "o");
        timeString = timeString.description.replace("æ", "e");
        timeString = timeString.description.replace("å", "a");
        timeString = timeString.description.replace(" ", "");
        timeString = "dayBefore" + timeString;
        times = kommuneData.timeString.split("-");
        document.getElementById(
          "content"
        ).innerHTML = `<h1>i dag selges det alkohol fra ${times[0]} til ${times[1]}</h1>`;
        break;
      default:
        var times = kommuneData.default.split("-");
        document.getElementById(
          "content"
        ).innerHTML = `<h1>Det selges alkohol fra ${times[0]} til ${times[1]}</h1>`;
        break;
    }
  });
}

function main() {
  const content = document.getElementById("content");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoLocSuccess, geoLocError);
  } else {
    console.log("geolocation not supported");
    alert(
      "denne nettleseren støtter ikke geolokasjon, så vi antar at du er i Oslo"
    );
    geoLocError();
  }
}
main();
