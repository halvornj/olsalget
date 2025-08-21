//defines
const ONE_DAY_MS = 86400000;
export class Coordinate {
    constructor(lat, lon) {
        this.lat = lat;
        this.lon = lon;
    }
}
//classes
export class CacheData {
    constructor(kommunenavn, position) {
        this.kommunenavn = kommunenavn;
        this.position = position;
    }
}
export class Holiday {
    constructor(date, description) {
        this.description = description;
        if (date instanceof Date) {
            this.date = date;
        }
        else {
            //do the conversion here
            this.date = new Date(date); //if the string is malformed, you fucked up. you're on your own
        }
    }
    static fromObject(obj) {
        const r = new Holiday(0, ""); //jan 1 1970, we will assign later
        Object.assign(r, obj);
        return r;
    }
}
export class Municipality {
    constructor(kommuneNavn, altNavn, electionday, forstejuledag, forstenyttarsdag, forstepinsedag, grunnlovsdag, kristihimmelfartsdag, offentlighoytidsdag, skjertorsdag, forstepaskedag, standard, saturday, palmesondag) {
        this.kommuneNavn = kommuneNavn;
        this.altNavn = altNavn;
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
    /* ! BIG COMPLAINT ALERT !
    Apparently, js just does not have casting. One of the most fucking basic things in existence. You just cannot do clean polymorphism, one of the basic things you learn in fucking first year CS.
    So, what do you do when you get an object on the fly, like a Municipality from an api, and you need to cast the Object to Municipality? well in ts, you just use `as`.
    But guess what. Tsc just straight up ignores that. because it cannot cast. What is the solution to casting, then?
    Well, you make a constructor that takes a generic object. Then, if you want things to be proper, you have a shitload of checks to ensure the `Object` is properly formed for a safe cast. (of course you dont actually bother, just assume and allow unsafe casting because fuck it)
    
    Solved, right? NO because neither js or ts support multiple constructors. The general consensus for multiple constructors in ts is, and i shit you not, the following:
      Say you want `constructor(obj: Object)`, and a second `constructor(name:string, altName:string, [and so on...])`.
      What you do is `constructor(obj_or_name: Object|string, standard?: string [and the rest are all also optional])`
    
    "muh TS makes oop and clean patterns in the web so easy now" no. Shut the hell up. This sucks. I just want a fucking cast, now i have to make the entire constructor optional???
    So, instead I'm doing a static method that returns a properly copied/assigned Municipality instance from a generic object.
  
    _ inb4 static methods dont exist either, they probably dont because this is isnt a fleshed out programming language its a mutant of a simple cobbled together scripting-format _
    */
    static fromObject(obj) {
        const r = new Municipality("", null, null, null, null, null, null, null, null, null, null, "", "", null);
        Object.assign(r, obj);
        return r;
    }
    /*
    @param date: the day we want the opening times for. If we want opening times today, pass a `new Date()`.
    @param holidays: an array of Holiday-objects.
    */
    getStringForDate(date, holidays) {
        var _a, _b;
        if (date.getDay() === 0) {
            return "stengt";
        }
        const todayString = date.toDateString();
        const tomorrow = new Date(date.getTime() + ONE_DAY_MS);
        const tomorrowString = tomorrow.toDateString(); //get unix time stamp,
        for (const holiday of holidays) {
            const holidayString = holiday.date.toDateString();
            if (holidayString == todayString) {
                //today is holiday
                return "stengt";
            }
            if (holidayString == tomorrowString) {
                //tomorrow is holiday, but today is not
                const holidayName = holiday.description;
                console.log(this[holidayName]);
                console.log(holidayName);
                return (
                //so, this whole shape means: return
                (_a = this[holidayName]) !== null && _a !== void 0 ? _a : (date.getDay() === 6 ? this.saturday : this.standard) //so this.saturday if today is sat, otherwise this.standard.
                );
            }
        }
        //special jan 1. case
        if (tomorrow.getDate() === 1 && tomorrow.getMonth() === 1) {
            return ((_b = this.forstenyttarsdag) !== null && _b !== void 0 ? _b : (date.getDay() === 6 ? this.saturday : this.standard));
        }
        //by this point: it is not sunday, today is not a holiday and neither is tomorrow.
        //at that point, we just do sat or standard
        return date.getDay() === 6 ? this.saturday : this.standard;
    }
}
