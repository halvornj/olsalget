import Button from "./Button";
import ComingWeek from "./ComingWeek";
import { View, Dimensions, StyleSheet } from "react-native";
import { DataTable } from "react-native-paper";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from "react-native-table-component";

export default function WeekView() {
  return (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Row>
          <DataTable.Cell>val1</DataTable.Cell>
          <DataTable.Cell>val2</DataTable.Cell>
        </DataTable.Row>
      </DataTable>
      <Button label="testLabel" onPress={clicked} />
    </View>
  );
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 30,
    width: windowWidth * 0.7,
    height: 200,
    display: "none",
  },
  table: {
    //todo this should be dictated by state, and the 'clicked()'method changes state.
    display: "flex",
  },
});

function clicked() {
  console.log("ay carambert");
}
