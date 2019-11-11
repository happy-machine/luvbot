import { colours } from '../constants';

function todaysDate(){
    var q = new Date(), m = q.getMonth(), d = q.getDate(), y = q.getFullYear()
    return new Date(y, m, d)
}

function wait(time) {
    return new Promise((resolve, fail) => {
        var start = new Date().getTime();
        var end = start;
        while (end < start + time) {
            end = new Date().getTime();
        }
        resolve()
    })
}

function errorRespond(err) {
    if (err.statusCode !== undefined) {
        if (err.statusCode == '429') {
            return function () {
                console.log(colours.FgRed, "Error 429, Waiting for " + JSON.stringify(err.response.headers["retry-after"]) + ' Seconds..');
                wait((err.response.headers["retry-after"] * 1000) + 1000);
            }();
        } else {
            return function () {
                console.log(colours.FgRed, "Error : " + err.statusCode);
                wait(3000)
            }();
        };
    } else {
        return console.log(colours.FgRed, 'Error:  ' + err.stack)
    }
}

export { todaysDate, wait, errorRespond };