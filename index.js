"use strict";
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
//classes
class Municipality {
    constructor(kommuneNavn, altNavn, electionday, forstejuledag, forstenyttarsdag, forstepinsedag, grunnlovsdag, kristihimmelfartsdag, offentlighoytidsdag, skjertorsdag, forstepaskedag, standard, saturday, palmesondag) {
        this.kommuneNavn = kommuneNavn;
        this.altNavn = altNavn;
        this.electionday = electionday;
        this.forstejuledag = forstejuledag;
        this.forstenyttarsdag = forstenyttarsdag;
        this.forstepinsedag = forstepinsedag;
        this.grunnlovsdag = grunnlovsdag;
        this.kristihimmelfartsdag = kristihimmelfartsdag;
        this.offentlighoytidsdag = offentlighoytidsdag;
        this.skjertorsdag = skjertorsdag;
        this.forstepaskedag = forstepaskedag;
        this.standard = standard;
        this.saturday = saturday;
        this.palmesondag = palmesondag;
    }
    getStringForDate(date) {
        return "00-24";
    }
}
/*global ui state variables
 */
const holidayPromise = fetch("https://https://webapi.no/api/v1/holidays/" + new Date().getFullYear()).then(() => console.log("holidays fulfilled"), () => console.log("holidays failed"));
let weekTimes = [
    "mantim...",
    "tirtim...",
    "onsm...",
    "torm...",
    "frem...",
    "lørm...",
    "sønm...",
];
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
        let currentAbbr = WEEKDAYABBREVS[(currentWeekdayIdx + i) % WEEKDAYABBREVS.length];
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
        const test = yield res.json();
        const t2 = test;
        //const munic = (await res.json()) as Municipality;
        //console.log(munic.kommuneNavn);
        console.log(t2);
        console.log(t2.kommuneNavn);
        console.log(typeof t2);
        //let todayStr = munic.getStringForDate(new Date());
        let tstr = t2.getStringForDate(new Date());
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
const setEventListeners = () => {
    var _a;
    (_a = document
        .getElementById("comingWeekButton")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", toggleComingWeekTable);
};
const main = () => {
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
    changeMunicipality("Oslo");
    //setMainDisplay();
    //setNextWeek();
};
main();
