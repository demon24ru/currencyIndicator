
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
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds())
}
