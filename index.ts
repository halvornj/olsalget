//for the first pass, I'm writing this in the same style i like to write C
//imports
import { Municipality } from "./lib";

//defines/macros
//#define TODAY_IDX 0;
const TODAY_IDX: number = 0;

/*global ui state variables
 */
let weekTimes: Array<string> = [
  "Loading...",
  "Loading...",
  "Loading...",
  "Loading...",
  "Loading...",
  "Loading...",
  "Loading...",
];
let currentMunicipality: Municipality = new Municipality( //no named arguments?? really...
  "ukjent", // kommunenavn
  null, // altnavn
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
const getMainDisplay = () => weekTimes[0];
