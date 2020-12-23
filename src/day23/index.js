const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const correctIndex = (index) => {
    while(index < 0)
        index += num_cups
    return index % num_cups
}

const correctLabel = (label) => {
    return correctIndex(label - 1) + 1
}


const playOneRound = (game) => {
    let take_index = correctIndex(game.current_cup_index + 1)
    let take_cups = []
    let current_cup_label = cups[game.current_cup_index]
    for(let i of _.range(3)) {
        take_cups.push(game.cups[take_index])
        game.cups.splice(take_index, 1)
        if (take_index >= game.cups.length)
            take_index = 0
    }

    target_cup_label = correctLabel(current_cup_label - 1)
    while (take_cups.includes(target_cup_label))
        target_cup_label = correctLabel(target_cup_label - 1)

    target_cup_index = correctIndex( game.cups.findIndex(n => n == target_cup_label) + 1 )
    game.cups.splice(target_cup_index, 0, ...take_cups)

    current_cup_new_index = game.cups.findIndex(n => n == current_cup_label)
    game.current_cup_index = correctIndex(current_cup_new_index + 1)

    return game
}

var lines = []
var num_cups = 0
eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    cups = Array.from(lines[0]).map(n => parseInt(n))
    num_cups = cups.length

    game = {cups, current_cup_index: 0}

    for(i of _.range(100)) {
        playOneRound(game)
    }

    let index = game.cups.findIndex(n => n == 1);
    console.log(game.cups.slice(index + 1).join("") + game.cups.slice(0, index).join(""))

    // Second part. Efficient, this time.
    let rightof = [0, ..._.range(2, 1000002)]
    for(i = 0 ; i <cups.length - 1 ; i++) {
        rightof[cups[i]] = cups[i+1]
    }
    rightof[cups[cups.length - 1]] = cups.length + 1
    rightof[1000000] = cups[0]

    current_label = cups[0]
    next_three = [0, 0, 0]

    for(i of _.range(10000000)) {
        next_three[0] = rightof[current_label]
        next_three[1] = rightof[next_three[0]]
        next_three[2] = rightof[next_three[1]]

        // determine next label
        next_label = correctLabel(current_label - 1)
        while(next_three.includes(next_label))
            next_label = correctLabel(next_label - 1)

        // adjust
        rightof[current_label] = rightof[next_three[2]]
        rightof[next_three[2]] = rightof[next_label]
        rightof[next_label] = next_three[0]

        current_label = rightof[current_label]
    }

    console.log(rightof[1] * rightof[rightof[1]])

})
