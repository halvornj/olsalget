import Button from "./Button";
import { View, Dimensions, StyleSheet } from "react-native";
import { DataTable } from "react-native-paper";
import { useState } from "react";

import React, { useImperativeHandle, forwardRef } from "react";

export default function WeekView(props: { dayTimeTuples: string[][] }) {
  const [displaying, setDisplaying] = useState<"none" | "flex">("none");

  return (
    <View style={styles.container}>
      <DataTable style={[styles.table, { display: displaying }]}>
        <DataTable.Row style={styles.tr}>
          <DataTable.Cell style={styles.key}>
            {props.dayTimeTuples[0][0]}
          </DataTable.Cell>
          <DataTable.Cell style={styles.val}>
            {props.dayTimeTuples[0][1]}
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row style={styles.tr}>
          <DataTable.Cell style={styles.key}>
            {props.dayTimeTuples[1][0]}
          </DataTable.Cell>
          <DataTable.Cell style={styles.val}>
            {props.dayTimeTuples[1][1]}
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row style={styles.tr}>
          <DataTable.Cell style={styles.key}>
            {props.dayTimeTuples[2][0]}
          </DataTable.Cell>
          <DataTable.Cell style={styles.val}>
            {props.dayTimeTuples[2][1]}
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row style={styles.tr}>
          <DataTable.Cell style={styles.key}>
            {props.dayTimeTuples[3][0]}
          </DataTable.Cell>
          <DataTable.Cell style={styles.val}>
            {props.dayTimeTuples[3][1]}
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row style={styles.tr}>
          <DataTable.Cell style={styles.key}>
            {props.dayTimeTuples[4][0]}
          </DataTable.Cell>
          <DataTable.Cell style={styles.val}>
            {props.dayTimeTuples[4][1]}
          </DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row style={styles.tr}>
          <DataTable.Cell style={styles.key}>
            {props.dayTimeTuples[5][0]}
          </DataTable.Cell>
          <DataTable.Cell style={styles.val}>
            {props.dayTimeTuples[5][1]}
          </DataTable.Cell>
        </DataTable.Row>
      </DataTable>
      <Button
        label="Hva med kommende uke?"
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
    alignItems: "center",
  },
  tr: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    width: windowWidth * 0.35,
    paddingBottom: 0,
    marginBottom: 0,
  },
  key: {
    justifyContent: "flex-end",
  },
  val: {
    alignContent: "flex-start",
    paddingLeft: 10,
  },
});
