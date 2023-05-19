var KOMMUNE;
var HOYTIDER;
var KOMMUNENUMMER;
var KOMMUNER;

const alkoholLoven = {
  kommuneNavn: "alkoholLoven",
  Electionday: "none",
  Forstejuledag: "08-15",
  Forstenyttarsdag: "08-15",
  Forstepinsedag: "08-15",
  Grunnlovsdag: "standard",
  Kristihimmelfartsdag: "standard",
  Offentlighoytidsdag: "standard",
  Skjertorsdag: "08-15",
  Forstepaskedag: "08-15",
  default: "08-18",
  sat: "08-15",
  Palmesondag: "08-15",
};

async function geoLocSuccess(position) {
  var geoPos = position.coords;
  var lat = geoPos.latitude;
  var lon = geoPos.longitude;
  const response = await fetch(
    "https://ws.geonorge.no/kommuneinfo/v1/punkt?nord=" +
      lat +
      "&koordsys=4326&ost=" +
      lon
  );
  const jsonData = await response.json();

  //* SAVE jsonData.kommunenummer for later use
  KOMMUNENUMMER = jsonData.kommunenummer;

  geoLocDone(jsonData.kommunenavn);
}
function geoLocError() {
  alert("Vi fant ikke din posisjon, så vi antar at du er i Oslo");
  geoLocDone("Oslo");
}

async function geoLocDone(kommuneNavn) {
  //code converges here, so this is where the bulk of the code is
  var year = new Date().getFullYear();
  if (HOYTIDER === undefined) {
    const hoytiderResponse = await fetch(
      "https://webapi.no/api/v1/holidays/" + year
    );
    const hoytiderJson = await hoytiderResponse.json();
    var hoytider = hoytiderJson.data;
    hoytider.shift();
    HOYTIDER = hoytider;
  }
  var hoytider = HOYTIDER;

  if (KOMMUNER === undefined) {
    const kommuner = await fetch("kommuner.json");
    var kommuneData = await kommuner.json();
    KOMMUNER = kommuneData;
  }
  var kommuneData = KOMMUNER;

  var lokalKommuneData = kommuneData.find(
    (kommune) => kommune.kommuneNavn === kommuneNavn
  );
  KOMMUNE = lokalKommuneData;

  var today = new Date(Date.now());

  var timesToday = findSalesTimes(lokalKommuneData, hoytider, today);
  if (
    timesToday === undefined ||
    timesToday === null ||
    timesToday === "stengt"
  ) {
    salesTimes.innerHTML = `I ${lokalKommuneData.kommuneNavn} er Ølsalget stengt i dag`;
    //this text is larger than the current other output, so decreases font-size
    salesTimes.style.fontSize = "2.5em";
  } else {
    document.getElementById(
      "salesTimesFlavourText"
    ).innerHTML = `I ${lokalKommuneData.kommuneNavn} er ølsalget åpent fra `;
    salesTimes.innerHTML = timesToday;
  }
  createSearchField(kommuneData);
}

//returns opening times for today as string, e.g."09-20". if closed, returns null
//@param kommune: object containing hoytidsdata for kommune
function findSalesTimes(kommune, hoytider, today) {
  //today is a Date object reffering to the day we want to find opening hours for
  var tomorrow = new Date(today.getTime() + 86400000);
  var todayStr = today.toISOString().slice(0, 10);
  var tomorrowStr = tomorrow.toISOString().slice(0, 10);

  if (!kommune.utvidet) {
    kommune = alkoholLoven;
  }

  var hoytidISOStrings = [];
  for (var i = 0; i < hoytider.length; i++) {
    hoytidISOStrings.push(hoytider[i].date.slice(0, 10));
  }

  // *logikk
  //føler myndighetene har litt vage presedens-regler angående dette, men tror dette stemmer
  if (today.getDay() === 0) {
    //today is sunday
    return null;
  }

  if (hoytidISOStrings.includes(todayStr)) {
    return null;
  }

  //fuck lindesnes, all my homies hate lindesnes
  if (kommune.kommuneNavn === "Lindesnes") {
    for (i = 0; i < hoytider.length; i++) {
      if (hoytid.date.slice(0, 10) === tomorrowStr) {
        if (today.getDay === 6) {
          return kommune.sat;
        } else {
          return kommune.default;
        }
      }
    }
  }

  //special jan 1. case
  if (tomorrowStr.slice(5, 10) === "01-01") {
    return kommune.Forstenyttarsdag;
  }

  //handling day before all holidays
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

      if (kommune[hoyTidString] === "standard") {
        if (today.getDay() === 6) {
          return kommune.sat;
        }
        return kommune.default;
      }
      return kommune[hoyTidString];
    }
  }
  if (todayStr.slice(5, 10) === "12-23" && kommune.Lillejulaften != undefined) {
    return kommune.Lillejulaften;
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
    alert(
      "denne nettleseren støtter ikke geolokasjon, så vi antar at du er i Oslo"
    );
    geoLocError();
  }
}
main();

function comingWeek(today, kommune) {
  var weekDiv = document.getElementById("comingWeekDiv");
  //if already visible, hide it on button press
  if (weekDiv.style.display !== "none") {
    weekDiv.style.display = "none";
    return;
  }
  var weekdays = [
    "søn: ",
    "man: ",
    "tir: ",
    "ons: ",
    "tor: ",
    "fre: ",
    "lør: ",
  ];

  weekDiv.style.display = "block";
  var weekTable = document.getElementById("comingWeekTable");
  weekTable.innerHTML = "";
  for (var i = 0; i < 6; i++) {
    var getForDay = new Date(today.getTime() + i * 86400000);
    var times;
    if (kommune != null) {
      times = findSalesTimes(kommune, HOYTIDER, getForDay);
    } else {
      times = findSalesTimes(KOMMUNE, HOYTIDER, getForDay);
    }
    var tableRow = document.createElement("tr");
    let tableDataDay = document.createElement("td");
    let tableDataTimes = document.createElement("td");
    tableDataDay.innerHTML = weekdays[getForDay.getDay()];
    if (times === undefined || times === null) {
      tableDataTimes.innerHTML = "stengt";
    } else {
      tableDataTimes.innerHTML = times;
    }
    tableRow.appendChild(tableDataDay);
    tableRow.appendChild(tableDataTimes);
    weekTable.appendChild(tableRow);
  }
}

async function createSearchField(kommuneData) {
  let velgKommuneDiv = document.getElementById("velgKommuneDiv");
  var kommunenavnListe = document.getElementById("kommunenavnListe");
  if (kommunenavnListe.innerHTML != "") {
    return;
  }
  for (let i = 0; i < kommuneData.length; i++) {
    let optionEl = document.createElement("option");
    if (kommuneData[i].altNavn === undefined) {
      optionEl.value = kommuneData[i].kommuneNavn;
    } else {
      optionEl.value =
        kommuneData[i].kommuneNavn + "/" + kommuneData[i].altNavn;
    }
    kommunenavnListe.appendChild(optionEl);
  }

  let textInput = document.getElementById("kommunenavnInput");
  textInput.addEventListener(
    "input",
    function (e) {
      var isInputEvent =
        Object.prototype.toString.call(e).indexOf("InputEvent") > -1;

      if (!isInputEvent) {
        geoLocDone(e.target.value);
        e.target.value = "";
      } else if (e.inputType === "insertReplacementText") {
        geoLocDone(e.data);
        e.target.value = "";
      }
    },
    false
  );
}
async function getForNeighbour(kommuneNavn) {
  geoLocDone(kommuneNavn);
}

function kommunenavnListeFormSubmitted(event, kommuneNavn) {
  event.preventDefault();
  kommuneNavn = kommuneNavn[0].toUpperCase() + kommuneNavn.slice(1);
  kommuneNavn = kommuneNavn.trim();
  var substringMatches = [];
  let kommuneNavnArray = kommuneNavn.split("/");
  for (i = 0; i < KOMMUNER.length; i++) {
    if (
      kommuneNavnArray.includes(KOMMUNER[i].kommuneNavn) ||
      kommuneNavnArray.includes(KOMMUNER[i].altNavn)
    ) {
      geoLocDone(KOMMUNER[i].kommuneNavn);
    } else {
      if (
        KOMMUNER[i].kommuneNavn.includes(kommuneNavn) ||
        (KOMMUNER[i].altNavn !== undefined &&
          KOMMUNER[i].altNavn.includes(kommuneNavn))
      ) {
        substringMatches.push(KOMMUNER[i]);
      }
    }
  }
  if (substringMatches.length === 1) {
    geoLocDone(substringMatches[0].kommuneNavn);
  }
  document.getElementById("comingWeekDiv").style.display = "none";
  event.target[0].value = "";
}
