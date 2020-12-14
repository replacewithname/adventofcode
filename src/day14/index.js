const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");
const { forEach } = require('lodash');

const lineToInstruction = (line) => {
    match = line.match(/^(\w+)\[?(\d*)\]? = ([\w\d]+)$/)
    if (match[1] == 'mask') {
        and= match[3].replace(/X/g, 1)
        and = parseInt(and, 2)
        return {type: "mask", 
                mask: match[3],
                // This was from when I thought you could actually use bitwise operators in JavaScript
                // Turns out you should never do this if you risk to have numbers above 32bits length
                // Learned by lesson so this stays here as a monument
                and: parseInt(match[3].replace(/X/g, 1), 2), 
                or: parseInt(match[3].replace(/X/g, 0), 2)
            }
    }
    return {type: "mem", address: parseInt(match[2]), value: parseInt(match[3]) }
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    var instructions = lines.map(lineToInstruction)

    max_address = _.max(instructions.filter(instr => instr.type == 'mem')
    .map(instr => instr.address))

    var values = new Array(max_address)
    _.fill(values, 0)

    var mask
    instructions.forEach(instr => {
        if(instr.type == 'mask')
            mask = instr
        else {
            let value_str = instr.value.toString(2)
            value_str = value_str.padStart(mask.mask.length, "0")
            value_str_array = Array.from(value_str)
            Array.from(mask.mask).forEach((char, index) => {
                if(char != 'X')
                    value_str_array[index] = char
            })
            values[instr.address] = parseInt(value_str_array.join(""), 2)
        }
    })

    console.log(_.sum(values))

    addr_space = {}
    instructions.forEach(instr => {
        if(instr.type == 'mask')
            mask = instr
        else {
            address_str = instr.address.toString(2)
            address_str = address_str.padStart(mask.length, "0")
            address_str_array = Array.from(address_str)
            floating_indices = []
            Array.from(mask.mask).forEach((char, index) => {
                if(char != '0')
                    address_str_array[index] = char
                if(char == 'X')
                    floating_indices.push(index)
            })

            variations = Math.pow(2, floating_indices.length)
            _.range(variations).forEach(number => {
                number_array = Array.from(number.toString(2).padStart(floating_indices.length, "0"))
                copy = _.cloneDeep(address_str_array)
                number_array.forEach((digit, index) => {
                    copy[floating_indices[index]] = digit
                })
                addr_space[copy.join("")] = instr.value         
            })
        }
    })

    console.log(_.sum(Object.values(addr_space)))
})
