const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const eachLine = Promise.promisify(lineReader.eachLine);


var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    numbers = lines
        .map(line => 
            line.replace(/[FL]/g, 0).replace(/[BR]/g, 1))
        .map(line => parseInt(line, 2))
        .sort((a,b) => a-b)

    console.log(numbers[numbers.length -1])

    for(i=0; i< numbers.length -1; i++) {
        if(numbers[i+1]- numbers[i] == 2)
            console.log(numbers[i])
    }
})
