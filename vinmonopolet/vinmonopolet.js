import { Position } from "./Position.js";
import { Store } from "./Store.js";
//getCoords() returns a promise that resolves to a Position object
// basically, if geCoords succeeds we return a position object to caller, else we call geoLocError
const getCoords = async () => {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, geoLocError);
  });

  return new Position(pos.coords.latitude, pos.coords.longitude);
};
function geoLocError() {
  alert("kan ikke finne ditt nærmeste vinmonopol uten å vite hvor du er :)");
  window.location.href = "../index.htm";

  return; //unreachable, but makes the linter happy
}
async function main() {
  var userPosition;
  if (navigator.geolocation) {
    userPosition = await getCoords();
  } else {
    geoLocError();
  }
  //*invariant: position is known
  console.log("position: ", userPosition);
}
main();
