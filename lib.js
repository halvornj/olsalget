export default class Municipality {
    constructor(kommunenavn, altnavn, electionday, forstejuledag, forstenyttarsdag, forstepinsedag, grunnlovsdag, kristihimmelfartsdag, offentlighoytidsdag, skjertorsdag, forstepaskedag, standard, saturday, palmesondag) {
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
    getStringForDate(date) {
        //TODO
        return "00-24";
    }
}
