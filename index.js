var KOMMUNE;
var HOYTIDER;

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
  //code converges here, so this is where the bulk of the code is
  var year = new Date().getFullYear();

  const hoytiderResponse = await fetch(
    "https://webapi.no/api/v1/holidays/" + year
  );
  const hoytiderJson = await hoytiderResponse.json();
  var hoytider = hoytiderJson.data;
  hoytider.shift();
  HOYTIDER = hoytider;
  console.log(hoytider);

  const kommuner = await fetch("kommuner.json");
  var kommuneData = await kommuner.json();

  var kommuneData = kommuneData.filter(
    (kommune) => kommune.kommuneNavn === kommuneNavn
  )[0];
  console.log(kommuneData);
  KOMMUNE = kommuneData;

  var today = new Date(Date.now());

  var timesToday = findSalesTimes(kommuneData, hoytider, today);
  console.log(timesToday);
  if (timesToday === null) {
    salesTimes.innerHTML = "Ølsalget er stengt i dag";
    //this text is larger than the current other output, so decreases font-size
    salesTimes.style.fontSize = "2.5em";
  } else {
    salesTimes.innerHTML = timesToday;
  }
}

//returns opening times for today as string, e.g."09-20". if closed, returns null
function findSalesTimes(kommune, hoytider, today) {
  //today is a Date object reffering to the day we want to find opening hours for
  var tomorrow = new Date(today.getTime() + 86400000);
  var todayStr = today.toISOString().slice(0, 10);
  var tomorrowStr = tomorrow.toISOString().slice(0, 10);

  var hoytidISOStrings = [];
  for (var i = 0; i < hoytider.length; i++) {
    hoytidISOStrings.push(hoytider[i].date.slice(0, 10));
  }

  //logikk
  //føler myndighetene har litt vage presedens-regler angående dette, men tror dette stemmer
  console.log(todayStr);
  console.log(hoytidISOStrings);
  console.log(today);
  if (today.getDay() === 0 || hoytidISOStrings.includes(todayStr)) {
    //today is sunday or a holiday
    return null;
  }
  for (i = 0; i < hoytider.length; i++) {
    var hoytid = hoytider[i];
    if (hoytid.date.slice(0, 10) === tomorrowStr) {
      //tomorrow is a holiday
      var hoyTidString = hoytid.description;
      //this could absolutely be done w/ regex, but i'm too lazy to figure it out
      hoyTidString = hoyTidString
        .replace("æ", "e")
        .replace("ø", "o")
        .replace("å", "a")
        .replace(" ", "");
      if (kommune.hoyTidString === "standard") {
        if (today.getDay() === 6) {
          return kommune.sat;
        }
        return kommune.default;
      }
      return kommune.hoyTidString;
    }
  }
  if (today.getDay() === 6) {
    return kommune.sat;
  }
  return kommune.default;
}

//? todo: maybe add function todayIsHoliday()?

function main() {
  const salesTimes = document.getElementById("salesTimes");

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

function comingWeek(today) {
  var weekdays = [
    "søn: ",
    "man: ",
    "tir: ",
    "ons: ",
    "tor: ",
    "fre: ",
    "lør: ",
  ];
  var weekDiv = document.getElementById("comingWeekDiv");
  
  weekDiv.style.display = "block";
  var weekList = document.getElementById("comingWeekList");
  weekList.innerHTML = "";
  for (var i = 0; i < 6; i++) {
    var getForDay = new Date(today.getTime() + i * 86400000);
    var times = findSalesTimes(KOMMUNE, HOYTIDER, getForDay);
    var listEl = document.createElement("li");
    if (times === null) {
      listEl.innerHTML = weekdays[getForDay.getDay()] + "Stengt";
    } else {
      listEl.innerHTML = weekdays[getForDay.getDay()] + times;
    }
    weekList.appendChild(listEl);
  }
}
