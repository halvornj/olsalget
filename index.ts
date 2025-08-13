//for the first pass, I'm writing this in the same style i like to write C
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

//classes
class Municipality {
  readonly kommuneNavn: string;
  readonly altNavn: string | null;
  readonly electionday: string | null;
  readonly forstejuledag: string | null;
  readonly forstenyttarsdag: string | null;
  readonly forstepinsedag: string | null;
  readonly grunnlovsdag: string | null;
  readonly kristihimmelfartsdag: string | null;
  readonly offentlighoytidsdag: string | null;
  readonly skjertorsdag: string | null;
  readonly forstepaskedag: string | null;
  readonly standard: string;
  readonly saturday: string;
  readonly palmesondag: string | null;

  constructor(
    kommuneNavn: string,
    altNavn: string | null,
    electionday: string | null,
    forstejuledag: string | null,
    forstenyttarsdag: string | null,
    forstepinsedag: string | null,
    grunnlovsdag: string | null,
    kristihimmelfartsdag: string | null,
    offentlighoytidsdag: string | null,
    skjertorsdag: string | null,
    forstepaskedag: string | null,
    standard: string,
    saturday: string,
    palmesondag: string | null
  ) {
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

  /* ! BIG COMPLAINT ALERT !
  Apparently, js just does not have casting. One of the most fucking basic things in existence. You just cannot do clean polymorphism, one of the basic things you learn in fucking first year CS.
  So, what do you do when you get an object on the fly, like a Municipality from an api, and you need to cast the Object to Municipality? well in ts, you just use `as`.
  But guess what. Tsc just straight up ignores that. because it cannot cast. What is the solution to casting, then? 
  Well, you make a constructor that takes a generic object. Then, if you want things to be proper, you have a shitload of checks to ensure the `Object` is properly formed for a safe cast. (of course you dont actually bother, just assume and allow unsafe casting because fuck it)
  
  Solved, right? NO because neither js or ts support multiple constructors. The general consensus for multiple constructors in ts is, and i shit you not, the following:
    Say you want `constructor(obj: Object)`, and a second `constructor(name:string, altName:string, [and so on...])`.
    What you do is `constructor(obj_or_name: Object|string, standard?: string [and the rest are all also optional])`
  
  "muh TS makes oop and clean patterns in the web so easy now" no. Shut the hell up. This sucks. I just want a fucking cast, now i have to make the entire constructor optional???
  So, instead I'm doing a static method that returns a properly copied/assigned Municipality instance from a generic object.

  _ inb4 static methods dont exist either, they probably dont because this is isnt a fleshed out programming language its a mutant of a simple cobbled together scripting-format _

  */

  getStringForDate(date: Date): string {
    return "00-24";
  }
}

/*global ui state variables
 */
const holidayPromise = fetch(
  "https://https://webapi.no/api/v1/holidays/" + new Date().getFullYear()
).then(
  () => console.log("holidays fulfilled"),
  () => console.log("holidays failed")
);

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
  const test = await res.json();
  const t2 = test as Municipality;
  //const munic = (await res.json()) as Municipality;

  //console.log(munic.kommuneNavn);
  console.log(t2);
  console.log(t2.kommuneNavn);
  console.log(typeof t2);
  //let todayStr = munic.getStringForDate(new Date());
  let tstr = t2.getStringForDate(new Date());
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

const setEventListeners = () => {
  document
    .getElementById("comingWeekButton")
    ?.addEventListener("click", toggleComingWeekTable);
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
