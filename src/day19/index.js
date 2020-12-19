const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");
const { string } = require('mathjs');

const ruleFromLine = (line) => {
    let test
    let [, index, content] = line.match(/^(\d+): (.*)/)
    index = parseInt(index)
    let options = content.split(" | ")
        .map(option => {
            return option.split(" ")
                .map(entry => {
                return entry[0] == '"' ? entry.slice(1, entry.length -1) : parseInt(entry)
                })
            })
    
    return {index, options}
}

const evaluateRule = (rule, rules) => {
    if(! rule.evaluated) { // use buffer if we can
        rule.evaluated = rule.options.flatMap(option => evaluateRuleOption(option, rules))
    }
    return rule.evaluated
}

const evaluateRuleOption = (option, rules) => {
    let result = [""]
    option.forEach(entry => {
        if(isNaN(entry)) {
            // String. We're fine
            result = result.map(s => s + entry)
        }
        else {
            resolved = evaluateRule(rules[entry], rules)
            result = result.flatMap(s =>
                resolved.map(res => s + res)
            )
        }
    })

    return result
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    rules = []

    strings = []

    lines.forEach(line => {
        if(line.includes(":")) {
            rule = ruleFromLine(line)
            rules[rule.index] = rule
        }
        else if(line.length > 0) {
            strings.push(line)
        }
    })

    resolved_rule = evaluateRule(rules[0], rules)

    // Result 1
    console.log(_.intersection(resolved_rule, strings).length)

    // 0: 8 11
    // 8: 42 8 (vorher 42)
    // 11: 42 31 | 42 11 31 (vorher 42 31)
    // => 0: 42... 31... wobei 31 weniger häufig vorkommen muss als 42, aber mindestens einmal
    count = strings.filter(str => {
        count31 = 0
        count42 = 0
        // Eine 31 brauchen wir am Ende!
        if (rules[31].evaluated.includes(str.substring(str.length -8, str.length))) {
            count31++
            str = str.slice(0, str.length -8)
        }
        else {
            return false
        }
        
        // 42 muss häufiger vorkommen, also prüfen wir das wohlwollend zuerst
        while(str.length >= 8 && rules[42].evaluated.includes(str.substring(0,8))) {
            str = str.slice(8)
            count42++
        }
        while(str.length >= 8 && rules[31].evaluated.includes(str.substring(0,8))) {
            str = str.slice(8)
            count31++
        }

        return str.length == 0 && count42 > count31
    }).length

    // Result 2
    console.log(count)

})
