const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const { map } = require('bluebird');
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("underscore");
const { max } = require('underscore');

const nextValues = (preamble) => {
    values = []
    preamble.forEach(a => {
        preamble.forEach(b => {
            if(a != b) {
                values.push(a+b)
            }
        })
    })

    return _.uniq(values)
}

const isValid = (number, preamble) => {
    return nextValues(preamble).includes(number)
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    const numbers = [] 
    lines.forEach(line => numbers.push(parseInt(line)))

      _.range(numbers.length - 26)
    .filter(index => {
        preamble = numbers.slice(index, index + 25)
        number = numbers[index + 25]
        if (! isValid(number, preamble)) {
            console.log(number)
        }
    })

    target = 105950735 // hardcode for now

    _.range(numbers.length).forEach(i => {
        let count = 0
        let sum = 0
        do {
            count ++
            sum = numbers.slice(i, i+count).reduce((a,b) => a+b)
        } while(sum < target )
        if(sum == target) {
            mn = numbers.slice(i, i+count).reduce((a,b) => Math.min(a,b))
            mx = numbers.slice(i, i+count).reduce((a,b) => Math.max(a,b))
            console.log(numbers.slice(i, i+count))
            console.log(`Min = ${mn}`)
            console.log(`Max = ${mx}`)
            sum = mn + mx
            console.log(sum)
        }
    })
    
})
