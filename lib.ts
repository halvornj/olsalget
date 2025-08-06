export default class Municipality {
  readonly kommunenavn: string;
  readonly altnavn: string | null;
  readonly electionday: string | null;
  readonly forstejuledag: string | null;
  readonly forstenyttarsdag: string | null;
  readonly forstepinsedag: string | null;
  readonly grunnlovsdag: string | null;
  readonly kristihimmelfartsdag: string | null;
  readonly offentlighoytidsdag: string | null;
  readonly skjertorsdag: string | null;
  readonly forstepaskedag: string | null;
  readonly standard: string;
  readonly saturday: string;
  readonly palmesondag: string | null;

  constructor(
    kommunenavn: string,
    altnavn: string | null,
    electionday: string | null,
    forstejuledag: string | null,
    forstenyttarsdag: string | null,
    forstepinsedag: string | null,
    grunnlovsdag: string | null,
    kristihimmelfartsdag: string | null,
    offentlighoytidsdag: string | null,
    skjertorsdag: string | null,
    forstepaskedag: string | null,
    standard: string,
    saturday: string,
    palmesondag: string | null
  ) {
    this.kommunenavn = kommunenavn;
    this.altnavn = altnavn;
    this.electionday = electionday;
    this.forstejuledag = forstejuledag;
    this.forstenyttarsdag = forstenyttarsdag;
    this.forstepinsedag = forstepinsedag;
    this.grunnlovsdag = grunnlovsdag;
    this.kristihimmelfartsdag = kristihimmelfartsdag;
    this.offentlighoytidsdag = offentlighoytidsdag;
    this.skjertorsdag = skjertorsdag;
    this.forstepaskedag = forstepaskedag;
    this.standard = standard;
    this.saturday = saturday;
    this.palmesondag = palmesondag;
  }

  getStringForDate(date: Date): string {
    //TODO
    return "00-24";
  }
}
