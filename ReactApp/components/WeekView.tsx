import Button from "./Button";
import ComingWeek from "./ComingWeek";
import { View, Dimensions, StyleSheet } from "react-native";
import { DataTable } from "react-native-paper";
import { useState } from "react";

import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from "react-native-table-component";

export default function WeekView() {
  const [displaying, setDisplaying] = useState<"none" | "flex">("none");

  return (
    <View style={styles.container}>
      <DataTable style={[styles.table, { display: displaying }]}>
        <DataTable.Row>
          <DataTable.Cell>day1</DataTable.Cell>
          <DataTable.Cell>val1</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>day2</DataTable.Cell>
          <DataTable.Cell>val2</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>day3</DataTable.Cell>
          <DataTable.Cell>val3</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>day4</DataTable.Cell>
          <DataTable.Cell>val4</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>day5</DataTable.Cell>
          <DataTable.Cell>val5</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>day6</DataTable.Cell>
          <DataTable.Cell>val6</DataTable.Cell>
        </DataTable.Row>
      </DataTable>
      <Button
        label="testLabel"
        onPress={() => {
          if (displaying === "none") {
            setDisplaying("flex");
          } else {
            setDisplaying("none");
          }
        }}
      />
    </View>
  );
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    width: windowWidth * 0.5,
    height: 100,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  table: {
    //todo this should be dictated by state, and the 'clicked()'method changes state.
  },
});

function clicked() {
  console.log("ay caramba");
}
