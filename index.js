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
/*global ui state variables
 */
let holidays = [];
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
        const munic = Municipality.fromObject(yield res.json());
        let todayStr = munic.getStringForDate(new Date(), []);
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
}
function fetchHolidays() {
    return __awaiter(this, void 0, void 0, function* () {
        fetch("./data/" + new Date().getFullYear() + ".json").then((res) => {
            res.json().then((data) => {
                holidays = data.map(Holiday.fromObject);
                console.log("fetchholidays finished execution");
            }, (err_data) => {
                console.error(err_data);
                alert("Noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator.");
            });
        }, (err_res) => {
            console.error(err_res);
            alert("Noe gikk galt. Vennligst prøv på nytt, eller kontakt administrator.");
        });
    });
}
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
    fetchHolidays();
    console.log("fetchholidays initiated");
    //!testing
    changeMunicipality("Oslo");
    //setMainDisplay();
    //setNextWeek();
};
main();
