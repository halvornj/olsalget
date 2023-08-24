import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Platform,
  Touchable,
  Dimensions,
} from "react-native";

const offBlack = "#1c1c1c";
const offWhite = "#f0f0f0";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

type ButtonProps = {
  label: String;
  onPress: Function;
  width?: Number; //todo: not yet implemented. maybe tie this to a state-object?
  height?: Number; //todo: not yet implemented.
  type?: String; //todo: if type =="icon"
};

export default function Button(props: ButtonProps) {
  generateBoxShadowStyle(0, 1, "#000", 0.22, 2.22, 3, "#000");

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[styles.button, styles.boxShadow]}
        onPress={() => {
          //why the fuck is it this way
          //why doesnt the Function-class just have a method 'call' or some shit
          //? what if the props obj actually has a 'onPress()'-method?? who gets called where?
          props.onPress();
        }}
      >
        <Text style={styles.buttonLabel}>{props.label}</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  buttonContainer: {
    marginHorizontal: 20,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },

  boxShadow: {
    //filled by the generateBoxShadowStyle-function
  },

  button: {
    backgroundColor: "#0A7637",
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    zIndex: 1,
  },
  buttonLabel: {
    color: offWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
});

const generateBoxShadowStyle = (
  xOffset: Number,
  yOffset: Number,
  shadowColorIos: String,
  shadowOpacity: Number,
  shadowRadius: Number,
  elevation: Number,
  shadowColorAndroid: String
) => {
  if (Platform.OS === "ios") {
    styles.boxShadow = {
      shadowColor: shadowColorIos,
      shadowOffset: { width: xOffset, height: yOffset },
      shadowOpacity,
      shadowRadius,
    };
  } else if (Platform.OS === "android") {
    styles.boxShadow = {
      elevation,
      shadowColor: shadowColorAndroid,
    };
  }
};
