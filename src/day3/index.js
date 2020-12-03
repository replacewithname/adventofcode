const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const eachLine = Promise.promisify(lineReader.eachLine);

function numTreesOnNaivePath(steps_right, steps_down) {
    xpos = 0
    ypos = 0
    num_trees = 0
    while (ypos < area.length) {
        num_trees += area[ypos][xpos] == '#'
        ypos += steps_down
        xpos = (xpos + steps_right) % area_width
    }
    return num_trees
}

var lines = []
var area = []
var area_width = 0

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    area = lines.map(line => Array.from(line))
    area_width = area[0].length

    console.log(numTreesOnNaivePath(3,1))

    factors = new Array(5)
    factors[0] = numTreesOnNaivePath(1,1)
    factors[1] = numTreesOnNaivePath(3,1)
    factors[2] = numTreesOnNaivePath(5,1)
    factors[3] = numTreesOnNaivePath(7,1)
    factors[4] = numTreesOnNaivePath(1,2)

    console.log(factors.reduce((a,b)=> a*b))
})
