//for the first pass, I'm writing this in the same style i like to write C
import { Municipality } from "./lib.js";
import { Holiday } from "./lib.js";
import { CacheData } from "./lib.js";
import { Coordinate } from "./lib.js";
//defines/macros
//#define TODAY_IDX 0;
const TODAY_IDX: number = 0;
const WEEKDAYABBREVS: Array<string> = [
    "søn",
    "man",
    "tir",
    "ons",
    "tor",
    "fre",
    "lør",
];
const ONE_DAY_MS: number = 86400000;

/*global ui state variables and promises
 */
let holidays: Array<Holiday> = [];
const holidayPromise: Promise<void> = fetch(
    "./data/" + new Date().getFullYear() + ".json"
).then(
    (res) => {
        res.json().then(
            (data) => {
                holidays = data.map((it: any) => {
                    return new Holiday(it.date, it.description);
                });
            },
            (err_data) => {
                console.error(err_data);
                alert(
                    "Noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator."
                );
            }
        );
    },
    (err_res) => {
        console.error(err_res);
        alert(
            "Noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator."
        );
    }
);


const namePromise: Promise<void> = fetch("https://api.olsalget.no/municipalities/names").then(
    (res) => {
        res.json().then(
            (data) => {
                //TODO dont set a global var, just set a datalist-thingy directly here.
                const datalistEl: HTMLElement | null = document.getElementById("kommunenavnListe");
                if (datalistEl == null) {
                    throw new ReferenceError("error: element #kommunenavnListe not found.")
                }
                for (const name of data) {
                    //todo this does not handle altNavn, as altnavn is not returned by the server.
                    const option = document.createElement("option");
                    option.value = name;
                    datalistEl.appendChild(option);
                }
            },
            (err_data) => {
                console.error(err_data);
                alert("noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator")
            })
    },
    (err_res) => {
        console.error(err_res);
        alert("noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator")
    });



//let location
async function geoLocSuccess(location: GeolocationPosition) {
    const res = await fetch("https://api.kartverket.no/kommuneinfo/v1//punkt?nord=" +
        location.coords.latitude +
        "&koordsys=4326&ost=" +
        location.coords.longitude).catch((err) => {
            console.error(err);
            alert("fant ikke din posisjon");
        });
    if (res == null) {
        throw new Error("bad response from kartverket");
        alert("noe gikk galt")
    }
    const data = await res.json()
    //set cached data
    localStorage.setItem("cache", JSON.stringify(new CacheData(data.kommunenavn, new Coordinate(location.coords.latitude, location.coords.longitude))));

    changeMunicipality(data.kommunenavn);
}

async function geoLocError(error: GeolocationPositionError) {

}





let weekTimes: Array<string> = [
    "mantim...",
    "tirtim...",
    "onsm...",
    "torm...",
    "frem...",
    "lørm...",
    "sønm...",
];
let currentMunicName: string = "ukjent";

//alkoholloven
let currentMunicipality: Municipality = new Municipality( //no named arguments?? really...
    "ukjent", // kommuneNavn
    null, // altNavn
    null, // electionday
    "08-15", // forstejuledag
    "08-15", // forstenyttarsdag
    "08-15", // forstepinsedag
    null, // grunnlovsdag
    null, // kristihimmelfartsdag
    null, // offentlighoytidsdag
    "08-15", // skjertorsdag
    "08-15", // forstepaskedag
    "08-18", // standard
    "08-15", // saturday
    "08-15" // palmesondag
);

/*getters and setters? for ui states
 */
const setMainDisplay = () => {
    console.log("setmain called");
    let salesTimesContainer: HTMLElement | null =
        document.getElementById("salesTimes");
    if (salesTimesContainer == null) {
        throw new ReferenceError("error: element #salesTimes not found.");
    }
    if (weekTimes[0] === null || weekTimes[0] === "stengt") {
        salesTimesContainer.innerText = `I ${currentMunicName} er ølsalget stengt i dag`;
    }
    let flavourTextContainer: HTMLElement | null = document.getElementById("salesTimesFlavourText");
    if (flavourTextContainer == null) {
        throw new ReferenceError("error: element #salesTimesFlavourText not found.")
    }
    flavourTextContainer.innerText = `I ${currentMunicName} er ølsalget åpent fra `;
    salesTimesContainer.innerText = weekTimes[0];
};


const setNextWeek = () => {
    let nextWeekTable: HTMLElement | null =
        document.getElementById("comingWeekTable");
    if (nextWeekTable == null) {
        throw new ReferenceError("error: element #comingWeekTable not found.");
    }
    //empty table
    nextWeekTable.replaceChildren(); //should remove all child nodes - rebuild new table.

    let currentWeekdayIdx: number = new Date().getDay();

    //fill table
    for (let i: number = 1; i < weekTimes.length; i++) {
        //start at 1, because we dont want today in the table. thats in the big header element.
        let currentString: string = weekTimes[i];
        let currentAbbr: string =
            WEEKDAYABBREVS[(currentWeekdayIdx + i) % WEEKDAYABBREVS.length]; //currentWeekdayIdx is the index of the abbreviation for today. By adding i and modding length, we wrap around. This means that if today is tuesday, aka IDX 2, we get weektimes[0] and abbrevs[2]
        let keyTD: HTMLTableCellElement = document.createElement("td");
        keyTD.innerText = currentAbbr;
        let valTD: HTMLTableCellElement = document.createElement("td");
        valTD.innerText = currentString;
        let row: HTMLTableRowElement = document.createElement("tr");
        row.appendChild(keyTD);
        row.appendChild(valTD);
        nextWeekTable.appendChild(row);
    }
};

/*
 *this function should be called whenever a new municipality is selected. This happens 2 main ways:
 * 1. the page loads. This means that either we used cached data from localstore, or got gps from user, then name from kartverket.
 * 2. We got input in the change-field.
 * These two scenarios should behave the same.
 */
async function changeMunicipality(name: string): Promise<void> {
    const res = await fetch("https://api.olsalget.no/municipalities/" + name);
    if (!res.ok) {
        throw new Error("bad api call: " + res.statusText);
    }

    const munic = Municipality.fromObject(await res.json());
    currentMunicName = name;

    await holidayPromise; //cant get string until we have holidays

    //const today: Date = new Date();
    const today: Date = new Date();

    weekTimes[0] = munic.getStringForDate(today, holidays); //we know holidays is set because we awaited the promise. in theory
    setMainDisplay(); //first we calculate today and set the main display.
    //then, calculate rest of the week, and set the table.
    const todayUnixTimestamp = today.getTime();
    for (
        let numDaysInFuture: number = 1;
        numDaysInFuture < weekTimes.length;
        numDaysInFuture++
    ) {
        weekTimes[numDaysInFuture] = munic.getStringForDate(
            new Date(todayUnixTimestamp + ONE_DAY_MS * numDaysInFuture),
            holidays
        );
    }
    setNextWeek();
}

function toggleComingWeekTable(): void {
    console.log("toggle called");
    //get reference
    let nextWeekTable: HTMLElement | null =
        document.getElementById("comingWeekDiv");
    if (nextWeekTable == null) {
        throw new ReferenceError("element #comingWeekTable not found");
    }
    //simple toggle
    if (nextWeekTable.style.display == "none") {
        nextWeekTable.style.display = "block";
    } else {
        nextWeekTable.style.display = "none";
    }
}



function setEventListeners() {
    document
        .getElementById("comingWeekButton")
        ?.addEventListener("click", toggleComingWeekTable);
    //TODO more listeners for the other buttons
}

async function sendCachedRequest() {
    let cached_data: CacheData;
    const cached_data_str = localStorage.getItem("cache");
    if (cached_data_str == null) {
        cached_data = new CacheData("Oslo", new Coordinate(59.91745924838579, 10.727435739549525))
        localStorage.setItem("cache", JSON.stringify(cached_data)) //set the default.
    } else {
        cached_data = JSON.parse(cached_data_str);
    }
    console.log("use cached data:");
    console.log(cached_data.kommunenavn);

    changeMunicipality(cached_data.kommunenavn);
}

//this is where actual execution starts:
//TODO move functions out to lib?
//add event listeners
setEventListeners();

/*
 * the plan here:
 * spawn 3 jobs async:
 * 1. get user location
 * 2. get all kommune-names from backend
 * 3. get holidays.
 *
 * after all spawned, wait on number 1. When 1 completes, call backend with kommune-navn
 */
//start cached search
sendCachedRequest()

//then, actually get position.
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoLocSuccess, geoLocError);
} else {
    alert(
        "denne nettleseren støtter ikke geolokasjon, så vi antar at du er i Oslo. Du kan søke på en annen kommune i søkefeltet."
    );
}

//setMainDisplay();
//setNextWeek();
