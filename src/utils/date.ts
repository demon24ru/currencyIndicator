import store from "../store/global";

export function dateToISOString(date: Date): string {
    function pad(number: number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    ' ' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds())
}

export function dateCompensationTimeZone(ts: number): number {
    return ts + ((new Date()).getTimezoneOffset() * 60 * 1000);
}
