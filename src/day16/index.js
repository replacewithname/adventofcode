const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");
const { forEach, remove } = require('lodash');

const ruleFromLine = (line) => {
    let [, name, first_cond, second_cond] = line.match(/^(.*): (.*) or (.*)$/)
    first_cond = first_cond.split("-").map(n => parseInt(n))
    second_cond = second_cond.split("-").map(n => parseInt(n))
    return {name, first_cond, second_cond}
}

const isValid = (number, rule) => {
    return (number >= rule.first_cond[0] && number <= rule.first_cond[1]) || (number >= rule.second_cond[0] && number <= rule.second_cond[1])
}

const isValidForAny = (number, rules) => {
    return _.some(rules.map(rule => isValid(number, rule)))
}

const hasInvalidNumbers = (ticket, rules) => {
    return _.some(ticket.map(n => ! isValidForAny(n, rules)))
}

const removeIndexFromRule = (rule, index) => {
    ind = rule.possible_indices.indexOf(index)
    if(ind > -1) {
        rule.possible_indices.splice(ind, 1)
    }
}

const anyRuleHasMoreThanOnePossibility = rules => {
    return _.some(rules.map(rule => rule.possible_indices.length > 1))
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    let rules = []
    let tickets = []
    lines.forEach(line => {
        if(line.includes(" or ")) {
            rules.push(ruleFromLine(line))
        }
        else if (line.includes(",")) {
            tickets.push(line.split(",").map(n => parseInt(n)))
        }
    })

    let sum = 0
    tickets.forEach(ticket => {
        ticket.forEach(number => {
            if(! isValidForAny(number, rules)) {
                sum += number
            }
        })
    })

    console.log(sum)

    tickets = tickets.filter(ticket => !hasInvalidNumbers(ticket, rules))

    rules.forEach(rule => rule.possible_indices=_.range(tickets[0].length))

    tickets.forEach(ticket => {
        ticket.forEach((number, index) => {
            rules.forEach(rule => {
                if(rule.possible_indices.includes(index)) {
                    if(! isValid(number, rule)) {
                        removeIndexFromRule(rule, index)
                    } 
                }
            })
        })
    })

    indices_already_done = []
    while(anyRuleHasMoreThanOnePossibility(rules)) {
        rules.forEach(rule => {
            if(rule.possible_indices.length == 1) {
                let index = rule.possible_indices[0]
                if(!indices_already_done.includes(index)) {
                    indices_already_done.push(index)
                    console.log("Removing index " + index)
                    rules.forEach(rule2 => {
                        if(rule2 != rule)
                            removeIndexFromRule(rule2, index)
                    })
                    }
            }
        })
    }

    res = rules.filter(rule => rule.name.match(/^departure/) != undefined)
        .map(rule => rule.possible_indices[0])
        .map(ind => tickets[0][ind])
        .reduce((a,b) => a*b)
    console.log(res)
})
