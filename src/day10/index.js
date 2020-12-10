const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const { map } = require('bluebird');
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("underscore");

const getNumberOfPossibleWays = numbers => {
    let ways_from = new Array(numbers.length).fill(0)

    // Only one choice from the end
    ways_from[ways_from.length - 1] = 1

    // recursively walk back
    for(let i= ways_from.length - 2; i>=0 ; i--) {
        let start = numbers[i]
        _.range(1, 4).forEach(j => {
            if (i+j < numbers.length && numbers[i+j] <= start + 3) {
                ways_from[i] += ways_from[i+j]
            }
        })
    }

    return ways_from[0]
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    const numbers = [] 
    lines.forEach(line => numbers.push(parseInt(line)))

    numbers.push(0)
    let max = _.max(numbers)
    numbers.push(max + 3)
    numbers.sort((a,b) => a-b)

    increments = [0,0,0]
    _.range(numbers.length -1).forEach(i => {
        increments[numbers[i+1] - numbers[i] - 1]++
    })

    console.log(increments[0] * increments[2])
    
    console.log(getNumberOfPossibleWays(numbers))
})
