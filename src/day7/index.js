const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const { map } = require('bluebird');
const eachLine = Promise.promisify(lineReader.eachLine);

const ruleFromLine = (line) => {
    let [, color, rest] = line.match(/(.*) bags contain (.*)\./)
    colors = {}
    if(rest !== "no other bags")
        rest.split(", ").forEach(a => {
            [, num, col] = a.match(/(\d+) (.*) bags?/)
            colors[col] = num
        })

    return {color, contains: colors}
}

const getColorsDirectlyContaining = (colors, rules) => {
    return_colors = []
    for (rule of rules) {
        for (key of Object.keys(rule["contains"])) {
            if (colors.includes(key)) {
                return_colors.push(rule["color"])
                break;
            }
        }
    } 
    return return_colors
}

const getNumberOfBagsInColor = (color, rules) => {
    for (let rule of rules) {
        if (rule['color'] === color) {
            let contains = rule["contains"]
            let num_colors = 0
            for(col of Object.keys(contains)) {
                // Plus one because the bag itself counts!
                num_colors += contains[col] * (getNumberOfBagsInColor(col, [...rules]) + 1)
            }
            return num_colors
        }
    }
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    rules = lines.map(ruleFromLine)
    // This is an array of single rules. Not too practical

    bag_colors = getColorsDirectlyContaining(['shiny gold'], rules)

    do {
        old_length = bag_colors.length
        new_bag_colors = getColorsDirectlyContaining(bag_colors, rules)
        for( color of new_bag_colors) {
            if (!bag_colors.includes(color))
                bag_colors.push(color)
        }
        
    } while (old_length != bag_colors.length)

    console.log(bag_colors.length)

    // Second one
    console.log(getNumberOfBagsInColor('shiny gold', rules))

})
