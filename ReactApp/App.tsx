import { StatusBar } from "expo-status-bar";

import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  Dimensions,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef, useState, useEffect } from "react";
import Autocomplete from "react-native-autocomplete-input";

import Button from "./components/Button";
import WeekView from "./components/WeekView";
import Kommune from "./Kommune";
import { TextInput } from "react-native-paper";

export default function App() {
  //! i do not know why this works, but this ensures main, the function that runs on startup, only runs once.
  useEffect(() => {
    main();
  }, []);
  /**
   *
   * @returns boolean, wether app has permission to use location. if permission is not granted, calls askPermission to request it
   */
  const checkPermission = async () => {
    const hasPermission = await Location.getForegroundPermissionsAsync();
    if (!(hasPermission.status === "granted")) {
      const permission = await askPermission();
      return permission;
    } else {
      return true;
    }
  };

  //function that asks user to grant permission. should only be called if permission is not already granted.
  const askPermission = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    return permission.status === "granted";
  };
  /**
   *
   * @returns userLocation coordinate object if it can be obtained, null otherwise
   */
  const getUserLocation = async () => {
    const userLocation = await Location.getLastKnownPositionAsync();
    if (userLocation != null) {
      return userLocation.coords;
    }
    return null;
  };

  const main = async () => {
    const hasPermission = await checkPermission();

    var kommunenavn: String = "Oslo";
    if (hasPermission) {
      const userCoordinates = await getUserLocation();
      if (userCoordinates != null) {
        kommunenavn = await getUserKommuneNavn(userCoordinates);
      } else {
        //* error in getting position
        //todo:  make a Toast explaining error
      }
    } else {
      //* didn't get permission
      //todo: make a Toast(?) explaining why Oslo
    }
    geoLocDone(kommunenavn);
  };

  //returns promise of name of kommune given locationObject
  const getUserKommuneNavn = async (
    coords: Location.LocationObjectCoords
  ): Promise<String> => {
    const apiResponse = await fetch(
      "https://ws.geonorge.no/kommuneinfo/v1/punkt?nord=" +
        coords.latitude +
        "&koordsys=4326&ost=" +
        coords.longitude
    );
    const jsonData = await apiResponse.json();
    return jsonData.kommunenavn;
  };

  const geoLocDone = async (kommuneNavn: String) => {
    //*join-point

    const holidays: JSON = await getHolidays();
    const userKommune: Kommune = (await getMunicipality(kommuneNavn))[0];

    setKommune(userKommune);

    const today: Date = new Date(Date.now());
    const salesTimes: String = findSalesTimes(userKommune, holidays, today);
    if (
      salesTimes === null ||
      salesTimes === undefined ||
      salesTimes === "stengt"
    ) {
      setFlavourText(`I ${userKommune.kommuneNavn} er ølsalget stengt i dag`);
      setSalesTimes("");
    } else {
      setFlavourText(`I ${userKommune.kommuneNavn} er ølsalget åpent fra`);
      setSalesTimes(salesTimes);
    }
    //grab data needed for rendering here
    populateTable(userKommune, holidays, new Date(Date.now() + 86400000));
    await populateAllKommuneNames();
  };

  const populateAllKommuneNames = async () => {
    const fullKommuneData = await getMunicipality();
    var allKommuneNames: String[] = [];
    for (var i: number = 0; i < fullKommuneData.length; i++) {
      if (fullKommuneData[i].altNavn != null) {
        allKommuneNames.push(
          fullKommuneData[i].kommuneNavn + "/" + fullKommuneData[i].altNavn
        );
      } else {
        allKommuneNames.push(fullKommuneData[i].kommuneNavn);
      }
    }
    setAllKommuneNames(allKommuneNames);
  };

  const populateTable = (userKommune: Kommune, holidays, fromDate: Date) => {
    const weekdays: string[] = [
      "søn: ",
      "man: ",
      "tir: ",
      "ons: ",
      "tor: ",
      "fre: ",
      "lør: ",
    ];
    var tuples: string[][] = [];
    for (var i = 0; i < 6; i++) {
      var day: Date = new Date(fromDate.getTime() + 86400000 * i);
      var dayString: string = weekdays[day.getDay()];
      //save some compute as compared to calling findSalesTimes() 6 times
      if (dayString == "søn: ") {
        tuples.push([dayString, "stengt"]);
        continue;
      }
      var timesForCurrentDay = findSalesTimes(userKommune, holidays, day);
      //if today is closed, we push "stengt" to the table and move on to next iteration
      if (timesForCurrentDay == null) {
        tuples.push([dayString, "stengt"]);
        continue;
      }
      //today isnt closed
      tuples.push([dayString, timesForCurrentDay]);
    }

    setTableElements(tuples);
  };

  /**
   * function takes a query representing name of kommune, and if it is a valid kommune, calls geoLocDone w/ query as parameter.
   * @param query lowered string of kommuneNavn to search for
   * @returns null
   */
  const onSearch = (query: string) => {
    setKommuneQuery("");
    //capitalize first letter
    query = query[0].toUpperCase() + query.slice(1);
    query = query.trim();
    //? structure: [kommuneNavn, ?altnavn]
    const queryArr: String[] = query.split("/");
    //* logic time
    //this is the one that should trigger on cilck from list
    if (allKommuneNames.includes(query)) {
      geoLocDone(queryArr[0]);
      return;
    }
    if (kommuneSearchRes.length === 1) {
      geoLocDone(kommuneSearchRes[0]);
      return;
    }

    for (var i: number = 0; i < allKommuneNames.length; i++) {
      if (allKommuneNames[i].split("/").some((e) => queryArr.includes(e))) {
        geoLocDone(allKommuneNames[i].split("/")[0]);
        // (allKommuneNames[i].split("/").some((e) => queryArr.includes(e)))) and (geoLocDone(allKommuneNames[i].split("/")[0]))
      }
    }
  };

  /**
   *
   * @returns JSON-array of holidays for the current year
   */
  const getHolidays = async (): Promise<JSON> => {
    const year = new Date().getFullYear();
    if ((await AsyncStorage.getItem(year.toString())) == null) {
      //there is no asyncStorage entry for current year
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
  };

  /**
   * @deprecated this is the method used in the website, should be updated to use db.
   * @param name optional. returns the spesific Kommune-object matching the name if provided, or all Kommune-objects if parameter is null.
   * @returns an array with only the spesific Kommune-object if parameter was supplied, array of all Kommune-objects if no parameter was given.
   */
  const getMunicipality = async (name?: String): Promise<Kommune[]> => {
    const kommunerResponse = await fetch(
      "https://raw.githubusercontent.com/halvornj/olsalget/main/kommuner.json"
    );
    const kommunerJSON = await kommunerResponse.json();
    if (name != null) {
      return [kommunerJSON.find((kommune) => kommune.kommuneNavn === name)];
    } else {
      return kommunerJSON;
    }
  };
  /**
   * @param kommune Kommune-object containing the hoytidsdata for a kommune.
   * @param hoytider the full hoytids-data for the current year. can be retrieved with getHolidays().
   * @param today the date for the spesific salestimes, as a Date-object.
   * @returns string representing salestimes for today, e.g."09-20". if closed, returns null.
   */
  const findSalesTimes = (kommune: Kommune, hoytider, today: Date) => {
    const tomorrow: Date = new Date(today.getTime() + 86400000);
    const tomorrowStr: String = tomorrow.toISOString().slice(0, 10);
    const todayStr: String = today.toISOString().slice(0, 10);

    if (!kommune.utvidet) {
      const alkoholLoven = new Kommune(
        kommune.kommuneNavn,
        false,
        null,
        "none",
        "08-15",
        "08-15",
        "08-15",
        "standard",
        "08-18",
        "standard",
        "08-15",
        "08-15",
        "08-18",
        "08-15",
        "08-15"
      );
      kommune = alkoholLoven;
    }

    var hoytidISOStrings: String[] = [];
    for (var i = 0; i < hoytider.length; i++) {
      hoytidISOStrings.push(hoytider[i].date.slice(0, 10));
    }

    // *logikk
    if (today.getDay() === 0) {
      //today is sunday
      return null;
    }
    if (hoytidISOStrings.includes(todayStr)) {
      return null;
    }

    //fuck lindesnes, all my homies hate lindesnes, respectfully
    if (kommune.kommuneNavn === "Lindesnes") {
      for (i = 0; i < hoytider.length; i++) {
        var hoytid = hoytider[i];
        if (hoytid.date.slice(0, 10) === tomorrowStr) {
          if (today.getDay() === 6) {
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
    if (
      todayStr.slice(5, 10) === "12-23" &&
      kommune.Lillejulaften != undefined
    ) {
      return kommune.Lillejulaften;
    }

    if (today.getDay() === 6) {
      return kommune.sat;
    }
    return kommune.default;
  };

  //states. using these as variables because it works
  const [salesTimes, setSalesTimes] = useState<String>("loading");
  const [kommune, setKommune] = useState<Kommune>(null);
  const [flavourText, setFlavourText] = useState<String>("");
  const [tableElements, setTableElements] = useState<string[][]>([
    [],
    [],
    [],
    [],
    [],
    [],
  ]);
  const [allKommuneNames, setAllKommuneNames] = useState<String[]>([]);

  const [kommuneQuery, setKommuneQuery] = useState<string>("");
  const kommuneSearchRes = allKommuneNames.filter((name) => {
    return name.toLowerCase().includes(kommuneQuery.toLowerCase());
  });

  //main renderer i guess
  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <Text style={styles.salesTimesFlavourText}>{flavourText}</Text>
        <Text style={styles.salesTimes}>{salesTimes}</Text>
      </View>
      <View style={styles.autocompleteContainer}>
        <Autocomplete
          data={kommuneSearchRes}
          value={kommuneQuery}
          onChangeText={(text) => setKommuneQuery(text)}
          flatListProps={{
            renderItem: ({ item }) => (
              <Pressable
                onPress={() => {
                  setKommuneQuery(item.toString());
                  onSearch(item.toString());
                }}
              >
                <Text>{item}</Text>
              </Pressable>
            ),
          }}
          onSubmitEditing={() => onSearch(kommuneQuery)}
          placeholder="Søk etter kommune"
          inputContainerStyle={{
            width: windowWidth * 0.5,
          }}
          listContainerStyle={{
            width: windowWidth * 0.5,
            //i have a brain the size of a neutron star
            height: Math.min(windowHeight * 0.2, kommuneSearchRes.length * 30),
            zIndex: 2,
          }}
          hideResults={kommuneQuery.length === 0 || kommuneSearchRes.length < 1}
        />
      </View>
      <View style={styles.comingWeek}>
        <WeekView dayTimeTuples={tableElements}></WeekView>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrapper: {},
  salesTimesFlavourText: {
    fontSize: 20,
  },
  salesTimes: {
    textAlign: "center",
    fontSize: 30,
  },
  autocompleteContainer: {
    marginTop: 20,
    flex: 1 / 10,
  },
  comingWeek: {
    marginTop: 0,
    flex: 1 / 2,
    alignItems: "center",
    width: 200,
    height: 200,
  },
});
