export default class Kommune {
  kommuneNavn: String;
  altNavn: String;
  utvidet: boolean;
  Electionday: String;
  Forstejuledag: String;
  Forstenyttarsdag: String;
  Forstepinsedag: String;
  Grunnlovsdag: String;
  Kristihimmelfartsdag: String;
  Offentlighoytidsdag: String;
  Skjertorsdag: String;
  Forstepaskedag: String;
  default: String;
  sat: String;
  Palmesondag: String;
  Lillejulaften?: String;

  constructor(
    kommuneNavn: String,
    utvidet: boolean,
    altNavn?: String,
    Electionday?: String,
    Forstejuledag?: String,
    Forstenyttarsdag?: String,
    Forstepinsedag?: String,
    Grunnlovsdag?: String,
    Kristihimmelfartsdag?: String,
    Offentlighoytidsdag?: String,
    Skjertorsdag?: String,
    Forstepaskedag?: String,
    default_?: String,
    sat?: String,
    Palmesondag?: String
  ) {
    this.kommuneNavn = kommuneNavn;
    this.altNavn = altNavn;
    this.utvidet = utvidet;
    this.Electionday = Electionday;
    this.Forstejuledag = Forstejuledag;
    this.Forstenyttarsdag = Forstenyttarsdag;
    this.Forstepinsedag = Forstepinsedag;
    this.Grunnlovsdag = Grunnlovsdag;
    this.Kristihimmelfartsdag = Kristihimmelfartsdag;
    this.Offentlighoytidsdag = Offentlighoytidsdag;
    this.Skjertorsdag = Skjertorsdag;
    this.Forstepaskedag = Forstepaskedag;
    this.default = default_;
    this.sat = sat;
    this.Palmesondag = Palmesondag;
  }
}
