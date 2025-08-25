var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//for the first pass, I'm writing this in the same style i like to write C
import { Municipality } from "./lib.js";
import { Holiday } from "./lib.js";
import { CacheData } from "./lib.js";
import { Coordinate } from "./lib.js";
//defines/macros
//#define TODAY_IDX 0;
const TODAY_IDX = 0;
const WEEKDAYABBREVS = [
    "søn",
    "man",
    "tir",
    "ons",
    "tor",
    "fre",
    "lør",
];
const ONE_DAY_MS = 86400000;
/*global ui state variables and promises
 */
let holidays = [];
const holidayPromise = fetch("./data/" + new Date().getFullYear() + ".json").then((res) => {
    res.json().then((data) => {
        holidays = data.map((it) => {
            return new Holiday(it.date, it.description);
        });
    }, (err_data) => {
        console.error(err_data);
        alert("Noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator.");
    });
}, (err_res) => {
    console.error(err_res);
    alert("Noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator.");
});
let allMunicNames = [];
const namePromise = fetch("https://api.olsalget.no/municipalities/names").then((res) => {
    res.json().then((data) => {
        //TODO dont set a global var, just set a datalist-thingy directly here.
        const datalistEl = document.getElementById("kommunenavnListe");
        if (datalistEl == null) {
            throw new ReferenceError("error: element #kommunenavnListe not found.");
        }
        for (const name of data) {
            //todo this does not handle altNavn, as altnavn is not returned by the server.
            const option = document.createElement("option");
            option.value = name;
            datalistEl.appendChild(option);
        }
        allMunicNames = data.map((el) => { return el.toLowerCase(); });
    }, (err_data) => {
        console.error(err_data);
        alert("noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator");
    });
}, (err_res) => {
    console.error(err_res);
    alert("noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator");
});
//let location
function geoLocSuccess(location) {
    return __awaiter(this, void 0, void 0, function* () {
        const newLocation = new Coordinate(location.coords.latitude, location.coords.longitude);
        console.timeEnd("geo");
        console.log("in geoLcoSuccess");
        //!TESTING
        // const newLocation: Coordinate = new Coordinate(63.43028202211008, 10.3940199423931); // trondheim
        const old_data_str = localStorage.getItem("cache");
        if (old_data_str != null) {
            const old_data = JSON.parse(old_data_str);
            if (Math.abs(old_data.position.lat - newLocation.lat) < 0.001 && Math.abs(old_data.position.lon - newLocation.lon) < 0.001) {
                //new location is so close to cached location, we guessed right with our cached guess
                console.log("old location was close to new, aborting...");
                return;
            }
        }
        const res = yield fetch("https://api.kartverket.no/kommuneinfo/v1//punkt?nord=" +
            newLocation.lat +
            "&koordsys=4326&ost=" +
            newLocation.lon).catch((err) => {
            console.error(err);
            alert("fant ikke din posisjon");
        });
        if (res == null) {
            throw new Error("bad response from kartverket");
            alert("noe gikk galt");
        }
        const data = yield res.json();
        //set cached data
        localStorage.setItem("cache", JSON.stringify(new CacheData(data.kommunenavn, newLocation)));
        changeMunicipality(data.kommunenavn);
    });
}
function geoLocError(error) {
    return __awaiter(this, void 0, void 0, function* () {
        console.error(error);
        alert("Noe gikk galt, vennligst prøv på nytt eller søk på din kommune");
    });
}
let weekTimes = [
    "loading...",
    "loading...",
    "loading...",
    "loading...",
    "loading...",
    "loading...",
    "loading...",
];
let currentMunicName = "ukjent";
//alkoholloven
let currentMunicipality = new Municipality(//no named arguments?? really...
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
    let salesTimesContainer = document.getElementById("salesTimes");
    if (salesTimesContainer == null) {
        throw new ReferenceError("error: element #salesTimes not found.");
    }
    if (weekTimes[0] === null || weekTimes[0] === "stengt") {
        salesTimesContainer.innerText = `I ${currentMunicName} er ølsalget stengt i dag`;
    }
    let flavourTextContainer = document.getElementById("salesTimesFlavourText");
    if (flavourTextContainer == null) {
        throw new ReferenceError("error: element #salesTimesFlavourText not found.");
    }
    flavourTextContainer.innerText = `I ${currentMunicName} er ølsalget åpent fra `;
    salesTimesContainer.innerText = weekTimes[0];
};
const setNextWeek = () => {
    let nextWeekTable = document.getElementById("comingWeekTable");
    if (nextWeekTable == null) {
        throw new ReferenceError("error: element #comingWeekTable not found.");
    }
    //empty table
    nextWeekTable.replaceChildren(); //should remove all child nodes - rebuild new table.
    let currentWeekdayIdx = new Date().getDay();
    //fill table
    for (let i = 1; i < weekTimes.length; i++) {
        //start at 1, because we dont want today in the table. thats in the big header element.
        let currentString = weekTimes[i];
        let currentAbbr = WEEKDAYABBREVS[(currentWeekdayIdx + i) % WEEKDAYABBREVS.length]; //currentWeekdayIdx is the index of the abbreviation for today. By adding i and modding length, we wrap around. This means that if today is tuesday, aka IDX 2, we get weektimes[0] and abbrevs[2]
        let keyTD = document.createElement("td");
        keyTD.innerText = currentAbbr;
        let valTD = document.createElement("td");
        valTD.innerText = currentString;
        let row = document.createElement("tr");
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
function changeMunicipality(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch("https://api.olsalget.no/municipalities/" + name);
        if (!res.ok) {
            throw new Error("bad api call: " + res.statusText);
        }
        const munic = Municipality.fromObject(yield res.json());
        currentMunicName = name;
        yield holidayPromise; //cant get string until we have holidays
        //const today: Date = new Date();
        const today = new Date();
        weekTimes[0] = munic.getStringForDate(today, holidays); //we know holidays is set because we awaited the promise. in theory
        setMainDisplay(); //first we calculate today and set the main display.
        //then, calculate rest of the week, and set the table.
        const todayUnixTimestamp = today.getTime();
        for (let numDaysInFuture = 1; numDaysInFuture < weekTimes.length; numDaysInFuture++) {
            weekTimes[numDaysInFuture] = munic.getStringForDate(new Date(todayUnixTimestamp + ONE_DAY_MS * numDaysInFuture), holidays);
        }
        setNextWeek();
    });
}
function toggleComingWeekTable() {
    console.log("toggle called");
    //get reference
    let nextWeekTable = document.getElementById("comingWeekDiv");
    if (nextWeekTable == null) {
        throw new ReferenceError("element #comingWeekTable not found");
    }
    //simple toggle
    if (nextWeekTable.style.display == "none") {
        nextWeekTable.style.display = "block";
    }
    else {
        nextWeekTable.style.display = "none";
    }
}
function setEventListeners() {
    var _a;
    (_a = document
        .getElementById("comingWeekButton")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", toggleComingWeekTable);
    //TODO more listeners for the other buttons
    const forms = document.forms;
    let form = null;
    if (forms[0].name != "kommunenavnListeForm") {
        throw new Error("first form is not #kommunenavnListeForm. Typescript does not support named gets of forms because it sucks.");
    }
    form = forms[0];
    //    const form: HTMLFormElement | null = document.getElementById("kommunenavnListeForm");
    if (form === null) {
        throw new ReferenceError("error: #kommunenavnListeForm not found");
    }
    const input = document.getElementById("kommunenavnInput");
    if (input === null) {
        throw new ReferenceError("error: #kommunenavnInput not found");
    }
    form.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        e.preventDefault();
        if (e === null) {
            return;
        }
        console.log(e);
        const formData = new FormData(form);
        let enteredName = (_a = formData.get("kommunenavnInput")) === null || _a === void 0 ? void 0 : _a.toString();
        if (enteredName === null) {
            throw new Error("entered form value is null");
        }
        if (enteredName === undefined) {
            throw new Error("entered form value is undefined");
        }
        if (enteredName === "") {
            throw new Error("entered form value is empty");
        }
        if (enteredName.includes("/")) {
            enteredName = enteredName.split("/")[0];
        }
        enteredName = enteredName.toLowerCase();
        yield namePromise; // we need to ensure the names have arrived (pretty much guaranteed at this point), so we can do basic name catching here
        let found = false;
        for (const name of allMunicNames) {
            if (name.includes("/")) { // has altname, was concatted by the server for ez transfer
                const multinames = name.split("/");
                for (const altname of multinames) {
                    if (enteredName == altname.toLowerCase()) {
                        found = true;
                        console.log("found multiname");
                        enteredName = multinames[0]; // we get the canonical name, which comes first before the concat, as teh server only accepts the canonical kommunenavn. It could easily be updated to accept altnames.
                        //TODO make `municipalities/:name` accept altnames. something like `WHERE kommunenavn=? OR altnavn=?`
                        break; // i want to do a kotlin-y break@outer, but i dont think that is a thing. And that is sad.
                    }
                }
            }
            else { //not multiname
                if (enteredName == name.toLowerCase()) {
                    found = true;
                }
            }
            if (found) { //we found it in a multiname
                break; //this is the break@outer
            }
        }
        if (!found) {
            throw new Error(`Entered name not found: ${enteredName}`);
        }
        console.log(`changing munic to ${enteredName}`);
        changeMunicipality(enteredName.toString());
    }));
}
function sendCachedRequest() {
    return __awaiter(this, void 0, void 0, function* () {
        let cached_data;
        const cached_data_str = localStorage.getItem("cache");
        if (cached_data_str == null) {
            cached_data = new CacheData("Oslo", new Coordinate(59.91745924838579, 10.727435739549525));
            localStorage.setItem("cache", JSON.stringify(cached_data)); //set the default.
        }
        else {
            cached_data = JSON.parse(cached_data_str);
        }
        console.log("use cached data:");
        console.log(cached_data.kommunenavn);
        changeMunicipality(cached_data.kommunenavn);
    });
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
sendCachedRequest();
//then, actually get position.
if (navigator.geolocation) {
    console.log("browser supports nav");
    console.time("geo");
    navigator.geolocation.getCurrentPosition(geoLocSuccess, geoLocError, {
        enableHighAccuracy: false,
        maximumAge: 600000 //600 seconds, 10 minutes
    });
}
else {
    alert("denne nettleseren støtter ikke geolokasjon, så vi antar at du er i Oslo. Du kan søke på en annen kommune i søkefeltet.");
}
//setMainDisplay();
//setNextWeek();
