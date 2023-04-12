export class Kommune {
  constructor(name, standardTime, specialTime) {
    this.name = name;
    this.standardTime = standardTime;
    this.specialTime = specialTime;
  }
  getName() {
    return this.name;
  }
  getStandardTime() {
    return this.standardTime;
  }

  getSpecialTime() {
    return this.specialTime;
  }
}
