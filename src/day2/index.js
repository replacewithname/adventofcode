const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const eachLine = Promise.promisify(lineReader.eachLine);

var lines = []

function passIsOK1(line) {
    let left, pass
    [left, pass] = line.split(": ")
    let [cond, char] = left.split(" ")
    let [min, max] = cond.split("-").map(a => parseInt(a))

    let len = Array.from(pass).filter(c => c == char).length
    return min <= len && max >= len;
}

function passIsOK2(line) {
    let left, pass
    [left, pass] = line.split(": ")
    let [cond, char] = left.split(" ")
    let [first, second] = cond.split("-").map(a => parseInt(a))

    let num = (pass.substr(first-1, 1) == char) + (pass.substr(second-1, 1) == char)
    return num == 1;
}

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    res = lines.filter(line => passIsOK1(line)).length;

    console.log(res)

    res = lines.filter(line => passIsOK2(line) ).length;

    console.log(res)
})
