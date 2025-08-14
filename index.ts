//for the first pass, I'm writing this in the same style i like to write C
import { Municipality } from "./lib.js";
import { Holiday } from "./lib.js";

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

/*global ui state variables
 */
let holidays: Array<Holiday> = [];

let weekTimes: Array<string> = [
  "mantim...",
  "tirtim...",
  "onsm...",
  "torm...",
  "frem...",
  "lørm...",
  "sønm...",
];

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
      WEEKDAYABBREVS[(currentWeekdayIdx + i) % WEEKDAYABBREVS.length];

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
  let todayStr = munic.getStringForDate(new Date(), []);
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

async function fetchHolidays() {
  fetch("./data/" + new Date().getFullYear() + ".json").then(
    (res) => {
      res.json().then(
        (data) => {
          holidays = data.map(Holiday.fromObject);
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

  //!testing
  changeMunicipality("Oslo");

  //setMainDisplay();
  //setNextWeek();
};

main();
