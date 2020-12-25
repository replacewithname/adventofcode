const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");


var lines = []
var num_cups = 0
eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    let subject_number = 7
    let value = 1

    let pk_card = parseInt(lines[0])
    let pk_door = parseInt(lines[1])

    let loop_size = 0
    for(i of _.range(20201227)) {
        value = (value * subject_number) % 20201227

        if(value == pk_card) {
            loop_size = i+1
            console.log("Found pk_card with a loop size of " + loop_size)
            subject_number = pk_door
            break;
        }
        else if (value == pk_door) {
            loop_size = i+1
            console.log("Found pk_door with a loop size of " + loop_size)
            subject_number = pk_card
            break;
        }
    }

    value = 1

    for(i of _.range(loop_size)) {
        value = (value * subject_number) % 20201227
    }
    
    // First result
    console.log(value)
})
