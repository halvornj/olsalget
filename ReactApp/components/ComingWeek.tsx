import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Alert, Dimensions } from "react-native";
import { DataTable } from "react-native-paper";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from "react-native-table-component";
import { useState } from "react";

type ComingWeekProps = {
  display?: String;
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function ComingWeek(props: ComingWeekProps) {
  //using this as main / constructor

  return (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>header1</DataTable.Title>
          <DataTable.Title>header2</DataTable.Title>
        </DataTable.Header>
        <DataTable.Row>
          <DataTable.Cell>testKey1</DataTable.Cell>
          <DataTable.Cell>testVal1</DataTable.Cell>
        </DataTable.Row>
      </DataTable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 30,
    width: windowWidth * 0.7,
    height: 200,
    display: "none",
  },
});
