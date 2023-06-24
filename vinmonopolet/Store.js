import { Position } from "./Position.js";

class Store {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.position = position;
  }
  //getters, so far no setters needed
  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
  getPosition() {
    return this.position;
  }
  setDistanceFromUser(userPosition) {
    this.distanceFromUser = Position.getDistanceBetween(
      this.position,
      userPosition
    );
  }
  getDistanceFromUser() {
    return this.distanceFromUser;
  }
}

export { Store };
