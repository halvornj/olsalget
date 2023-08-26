import Button from "./Button";
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
  const [row0key, setRow0key] = useState<string>("loading");
  const [row0val, setRow0] = useState<string>("loading");
  const [row1key, setRow1key] = useState<string>("loading");
  const [row1val, setRow1] = useState<string>("loading");
  const [row2key, setRow2key] = useState<string>("loading");
  const [row2val, setRow2] = useState<string>("loading");
  const [row3key, setRow3key] = useState<string>("loading");
  const [row3val, setRow3] = useState<string>("loading");
  const [row4key, setRow4key] = useState<string>("loading");
  const [row4val, setRow4] = useState<string>("loading");
  const [row5key, setRow5key] = useState<string>("loading");
  const [row5val, setRow5] = useState<string>("loading");

  return (
    <View style={styles.container}>
      <DataTable style={[styles.table, { display: displaying }]}>
        <DataTable.Row>
          <DataTable.Cell>{row0key}</DataTable.Cell>
          <DataTable.Cell>{row0val}</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>{row1key}</DataTable.Cell>
          <DataTable.Cell>{row1val}</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>{row2key}</DataTable.Cell>
          <DataTable.Cell>{row2val}</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>{row3key}</DataTable.Cell>
          <DataTable.Cell>{row3val}</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>{row4key}</DataTable.Cell>
          <DataTable.Cell>{row4val}</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell>{row5key}</DataTable.Cell>
          <DataTable.Cell>{row5val}</DataTable.Cell>
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

const populateTable = () => {};
