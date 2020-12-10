const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const { map } = require('bluebird');
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("underscore")

const codeLineFromRawLine = (line) => {
    let [, command, number] = line.match(/^(\w+) ([\-+]?\d+)$/)

    return [command, parseInt(number)]
}

const executeOnFirstTask = program => {
    let value = 0
    let current_line = 0
    let reached_lines = []
    while(current_line <= program.length) {
        // Check whether the line was already reached
        if(reached_lines.includes(current_line)) {
            console.log("Loop reached. Value: " + value)
            return -1;
        }
        reached_lines.push(current_line)

        let command = program[current_line][0]
        if(command == "acc") {
            value += program[current_line][1]
            current_line ++
        } 
        else if(command == "jmp") {
            current_line += program[current_line][1]
        }
        else if(command == "nop") {
            current_line ++
        }
        else {
            console.log("unknown command " + command)
        }
    }

    return value
}

const executeOnSecondTask = prog => {
    let value = 0
    let current_line = 0
    let reached_lines = []
    while(current_line < prog.length) {

        // Check whether the line was already reached
        if(reached_lines.includes(current_line)) {
            // breaking
            return [0]
        }
        reached_lines.push(current_line)

        let command = prog[current_line][0]
        if(command == "acc") {
            value += prog[current_line][1]
            current_line ++
        } 
        else if(command == "jmp") {
            current_line += prog[current_line][1]
        }
        else if(command == "nop") {
            current_line ++
        }
        else {
            console.log("unknown command " + command)
        }
    }
    return [1, value]
}

const swapLineOfProgram = (prog, index) => {
    const p = [...prog]
    line = [...p[index]];
    line[0] = (line[0] == 'jmp' ? 'nop' : 'jmp')
    p[index] = line
    return p
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    const program = lines.map(codeLineFromRawLine)

    executeOnFirstTask(program)

      _.range(program.length)
    .filter(index => ['jmp', 'nop'].includes(program[index][0]))
    .map(index => {
        let p = [...program]
        p = swapLineOfProgram(p, index)
        let res = executeOnSecondTask(p)
        if(res[0] == 1) {
            console.log("index = " + index + ", value = " + res[1])
        }
        return res
    })
    .filter(res => res[0] == 1)
    .forEach(res => console.log("Value: " + res[1]))

    console.log("done")
})
