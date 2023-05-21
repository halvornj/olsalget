class Store {
  constructor(id, name, status, streetAdress, gpsCoordinates, openingHours) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.streetAdress = streetAdress;
    this.gpsCoordinates = gpsCoordinates;
    this.openingHours = openingHours;
  }
  //getters, so far no setters needed
  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
  getStatus() {
    return this.status;
  }
  getStreetAdress() {
    return this.streetAdress;
  }
  getGpsCoordinates() {
    return this.gpsCoordinates;
  }
  getOpeningHours() {
    return this.openingHours;
  }

  distanceFrom(north, east) {}
}

export { Store };
