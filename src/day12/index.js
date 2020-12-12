const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const nextPosition = (pos, inst) => {
    new_pos = _.cloneDeep(pos)
    switch(inst.instruction) {
        case 'E':
            new_pos.x += inst.value
            break
        case 'S':
            new_pos.y -= inst.value
            break
        case 'W':
            new_pos.x -= inst.value
            break
        case 'N':
            new_pos.y += inst.value
            break
        case 'L':
            new_pos.orientation += inst.value
            break;
        case 'R':
            new_pos.orientation -= inst.value
            break
        case 'F':
            new_pos.x += inst.value * Math.cos(Math.PI * (pos.orientation / 180))
            new_pos.y += inst.value * Math.sin(Math.PI * (pos.orientation / 180))
            break
        default:
            console.log("unknown command")
            break
        }

    return new_pos
}

const nextPosition2 = (pos, inst) => {
    new_pos = _.cloneDeep(pos)
    radiant_value = Math.PI * (inst.value / 180)
    switch(inst.instruction) {
        case 'E':
            new_pos.wpx += inst.value
            break
        case 'S':
            new_pos.wpy -= inst.value
            break
        case 'W':
            new_pos.wpx -= inst.value
            break
        case 'N':
            new_pos.wpy += inst.value
            break
        case 'R':
            radiant_value = -radiant_value
        case 'L':
            new_pos.wpx = Math.cos(radiant_value) * pos.wpx - Math.sin(radiant_value) * pos.wpy
            new_pos.wpy = Math.sin(radiant_value) * pos.wpx + Math.cos(radiant_value) * pos.wpy
            break;
        case 'F':
            new_pos.x += inst.value * pos.wpx
            new_pos.y += inst.value * pos.wpy
            break
        default:
            console.log("unknown command")
            break
        }

    return new_pos
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    instructions = lines.map(line => {
        let [, instruction, value] = line.match(/(\w)(\d+)/)
        value = parseInt(value)
        return {instruction, value}
    })

    const starting_pos = {x: 0, y: 0, orientation: 0}
    let pos = _.cloneDeep(starting_pos)
    instructions.forEach(inst => {
        pos = nextPosition(pos, inst)
    })

    console.log(Math.round(Math.abs(pos.x) + Math.abs(pos.y)))

    const starting_pos2 = {x: 0, y: 0, wpx: 10, wpy: 1}
    pos = _.cloneDeep(starting_pos2)
    instructions.forEach(inst => {
        pos = nextPosition2(pos, inst)
    })

    console.log(Math.round(Math.abs(pos.x) + Math.abs(pos.y)))

})
