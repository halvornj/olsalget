import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Alert } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Button from "./components/Button";
import ComingWeek from "./components/ComingWeek";
import WeekView from "./components/WeekView";

//main renderer i guess
export default function App() {
  return (
    <View style={styles.container}>
      <Text>fuck you</Text>
      <View style={styles.comingWeek}>
        <WeekView></WeekView>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  comingWeek: {
    flex: 1 / 3,
    alignItems: "center",
    width: 200,
    height: 200,
  },
});

//returns boolean, whether app has location permission or not
const checkPermission = async () => {
  const hasPermission = await Location.getForegroundPermissionsAsync();
  if (!(hasPermission.status === "granted")) {
    console.log("the user has not previously granted permission");
    const permission = await askPermission();
    return permission;
  } else {
    console.log("user has already granted permission");
    return true;
  }
};

//function that asks user to grant permission. should only be called if permission is not already granted.
const askPermission = async () => {
  const permission = await Location.requestForegroundPermissionsAsync();
  console.log("user granted permission in askPermission");
  return permission.status === "granted";
};
//returns position object if available, null if not. only call if permission for location is granted
export const getUserLocation = async () => {
  const userLocation = await Location.getLastKnownPositionAsync();
  if (userLocation != null) {
    return userLocation.coords;
  }
  return null;
};

async function main() {
  const hasPermission = await checkPermission();
  var kommunenavn: String = "Oslo";
  if (hasPermission) {
    console.log("have permission, getting coords now");
    const userCoordinates = await getUserLocation();
    console.log("got coords:");
    console.log(userCoordinates);
    if (userCoordinates != null) {
      kommunenavn = await getUserKommuneNavn(userCoordinates);
    } else {
      //* error in getting position
      console.log("got permission, but error in getUserLocation()");
      //todo make a Toast explaining error
    }
  } else {
    //* didn't get permission
    console.log("no permission");
    //todo: make a Toast(?) explaining why Oslo
  }
  geoLocDone(kommunenavn);
}

//returns promise of name of kommune given locationObject
async function getUserKommuneNavn(
  coords: Location.LocationObjectCoords
): Promise<String> {
  console.log("in getUserKommuneNavn");
  const apiResponse = await fetch(
    "https://ws.geonorge.no/kommuneinfo/v1/punkt?nord=" +
      coords.latitude +
      "&koordsys=4326&ost=" +
      coords.longitude
  );
  const jsonData = await apiResponse.json();
  return jsonData.kommunenavn;
}

async function geoLocDone(kommuneNavn: String) {
  //join-point
  console.log("kommunenavn:");
  console.log(kommuneNavn);
  const holidays = await getHolidays();
}

async function getHolidays(): Promise<Object[]> {
  const year = new Date().getFullYear();
  if ((await AsyncStorage.getItem(year.toString())) == null) {
    //there is no asyncStorage entry for current year
    console.log("no asyncstorage entry found");
    //todo split the fetch into separate method that catches errors and gets backup
    const hoytiderResponse = await fetch(
      "https://webapi.no/api/v1/holidays/" + year
    );
    const hoyTiderJson = await hoytiderResponse.json();
    AsyncStorage.setItem(year.toString(), JSON.stringify(hoyTiderJson.data));
    return hoyTiderJson;
  } else {
    //already a local entry for the current year
    const hoyTider = JSON.parse(await AsyncStorage.getItem(year.toString()));
    return hoyTider;
  }
}

main();
