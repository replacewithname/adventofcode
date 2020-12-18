const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const parse = line => {
    let res = {}
    let initial_line = line

    let start = line.match(/^(\d+|\()/)[1]
    if(start == "(") {
        line = line.slice(1)
        res.first = parse(line)
        line = line.slice(res.first.expression.length + 1) // account for the ending parenthesis
    }
    else {
        res.first = parseInt(start)
        line = line.slice(start.length)
    }

    res.operations = []

    while(['*', '+'].includes(line[0])) {
        let operation = {}
        operation.operation = line[0]
        line = line.slice(1)
        start = line.match(/^(\d+|\()/)[1]
        if(start == "(") {
            line = line.slice(1)
            operation.right = parse(line)
            line = line.slice(operation.right.expression.length + 1) // account for the ending parenthesis
        }
        else {
            operation.right = parseInt(start)
            line = line.slice(start.length)
        }

        res.operations.push(operation)
    }

    res.expression = initial_line.slice(0, initial_line.length - line.length)

    return res
}

const applyPlusBeforeTimes = (expression) => {
    if (isNaN(expression.first)) {
        applyPlusBeforeTimes(expression.first)
    }

    expression.operations.forEach(operation => {
        if (isNaN(operation.right)) {
            applyPlusBeforeTimes(operation.right)
        }
    })

    let i = 1
    while (i < expression.operations.length) {
        if(expression.operations[i].operation == "+" && expression.operations[i-1].operation == "*") {
            expression.operations[i-1].right = {
                first: expression.operations[i-1].right,
                operations: [ expression.operations[i] ]
            }
            expression.operations.splice(i, 1)
        }
        else {
            i++
        }
    }

    return expression
}

const evaluate = expression => {
    if(!isNaN(expression)) {
        return expression
    }

    let val = evaluate(expression.first)

    expression.operations.forEach(op => {
        if(op.operation == "*") {
            val *= evaluate(op.right)
        }
        else if(op.operation == "+") {
            val += evaluate(op.right)
        }
    })

    return val
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    test = parse("(7 * 5 * 6 + (9 * 8 + 3 * 3 + 5) + 7) * (6 + 3 * 9) + 6 + 7 + (7 * 5) * 4".replace(/ /g, ''))
    applyPlusBeforeTimes(test)
    value = evaluate(test)

    let sum = lines.map(line => parse(line.replace(/ /g, '')))
        .map(evaluate)
        .reduce((a,b) => a+b)

    console.log(sum)

    sum = lines.map(line => parse(line.replace(/ /g, '')))
    .map(applyPlusBeforeTimes)
    .map(evaluate)
    .reduce((a,b) => a+b)

    console.log(sum)

})
