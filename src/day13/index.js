const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const getEarlierstDeparture = (id, earliest_departure) => {
    return earliest_departure + (id - earliest_departure % id)
}

const busesWithCorrectOffsets = (t, buses) => {
    return buses.filter(bus => {
        return (t + bus.index) % bus.id == 0
    })

    return is_ok
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    var earliest_departure = parseInt(lines[0])
    var buses = lines[1].split(",")
        .map( (id, index) => {
            let id_int = id != 'x' ? parseInt(id) : 'x'
            return {id: id_int, index, departure: getEarlierstDeparture(id_int, earliest_departure)}
        })
        .filter(bus => bus.id !== 'x')
        .sort((bus1, bus2) => bus1.departure - bus2.departure)

    first_bus = _.first(buses)
    
    console.log(first_bus.id * (first_bus.departure-earliest_departure))

    let t = 0
    let increase = 1
    while(1) {
        correct_buses = busesWithCorrectOffsets(t, buses)
        if( correct_buses.length != 0 ) {
            // Once we have a "correct" t for a bus, we just integrate its id in the increment and forget
            // about it
            correct_buses.forEach(bus => {
                increase *= bus.id // Here we use that we know all ids are prime
                buses = buses.filter(iter_bus => iter_bus.id != bus.id)
            })
        }
        if(buses.length == 0)
            break

        t += increase
    }
    console.log(t)
})
