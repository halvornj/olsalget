class Position {
  constructor(lat, lon) {
    this.lat = lat;
    this.lon = lon;
  }
  getLat() {
    return this.lat;
  }
  getLon() {
    return this.lon;
  }
  static getDistanceBetween(pos1, pos2) {
    const toRadian = (angle) => (Math.PI / 180) * angle;
    const distance = (a, b) => (Math.PI / 180) * (a - b);
    const RADIUS_OF_EARTH_IN_KM = 6371;

    const dLat = distance(pos2.lat, pos1.lat);
    const dLon = distance(pos2.lon, pos1.lon);

    var lat1 = toRadian(pos1.lat);
    var lat2 = toRadian(pos2.lat);

    // Haversine Formula
    const a =
      Math.pow(Math.sin(dLat / 2), 2) +
      Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.asin(Math.sqrt(a));

    let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

    return finalDistance;
  }
}
export { Position };
