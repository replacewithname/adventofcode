const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const { map } = require('bluebird');
const eachLine = Promise.promisify(lineReader.eachLine);

var lines = []

const numOfAllAnswersInGroup = (line) => {
    answer_lines =  line.split("#")
    .filter(line => line.length > 0)

    num_people = answer_lines.length;

    pivot = answer_lines
        .map(line => Array.from(line))
        .reduce((rv,a) => {
        a.forEach(b => {
            rv[b] = rv[b] || 0
            rv[b]++
        })
        
        return rv
    },{})

    return Object.values(pivot)
    .filter(a => a == num_people)
    .length
/*     .values()
    .filter(a => a == num_people)
    .length
 */
}

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    sum = lines.map(line => line.length == 0 ? ";" : line )
    .reduce((a,b) => a+b)
    .split(";")
    .map(line => Array.from(line))
    .map(array => [...new Set(array)].length)
    .reduce((a,b) => a+b)
    console.log(sum)


    sum = lines.map(line => line.length == 0 ? ";" : line + "#" )
    .reduce((a,b) => a+b)
    .split(";")
    .map(numOfAllAnswersInGroup)
    .reduce((a,b) => a+b)
    console.log(sum)
})
