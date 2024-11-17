class Util {
    static getDateFormatString(locale: string) {
        const formatObj = new Intl.DateTimeFormat(locale).formatToParts(new Date());

        return formatObj
            .map(obj => {
                switch (obj.type) {
                    case "day":
                        return "DD";
                    case "month":
                        return "MM";
                    case "year":
                        return "YYYY";
                    default:
                        return obj.value;
                }
            }).join("");
    }

    static getAnnuallyCompoundInterest(principle: number, rate: number, years: number, days: number) : number {
        if (years < 1) {
            // use another formula for interest less than a year (use days to avoid float precision lost)
            return principle * rate * days / 365;
        }
        // compound interest formula for annually for APY
        return principle * Math.pow(1 + rate, years) - principle;
    }
}

export default Util;