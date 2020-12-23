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


const playOnRound = (game) => {
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

const playOnRound2 = (game) => {
    let current_cup_label = game.labels[game.current_cup_index]
    let take_index = correctIndex(game.current_cup_index + 1)
    let take_cups = []
    for(let i of _.range(3)) {
        take_cups.push(labels[take_index])
        take_index ++
        if (take_index >= num_cups)
            take_index = 0
    }

    target_cup_label = correctLabel(current_cup_label - 1)
    while (take_cups.includes(target_cup_label))
        target_cup_label = correctLabel(target_cup_label - 1)

    target_cup_index = game.positions[target_cup_label]

    // Adjust every position
    if(target_cup_index < game.current_cup_index) {
        // go from the right so we don't overwrite anything.
        for(let i = game.current_cup_index; i >=  target_cup_index + 1 ; i--) {
            let label = game.labels[i]
            new_index = (i + 3) % num_cups
            game.positions[label] = new_index
            game.labels[new_index] = label
        }
    }
// Move all in between to the left ( 3 positions )  
    else {
        for(let i = game.current_cup_index + 4; i <= target_cup_index; i++) {
            actual_index = i % num_cups
            label = game.labels[actual_index]
            new_index = (num_cups + actual_index - 3) % num_cups
            game.positions[label] = new_index
            game.labels[new_index] = label
        }
        // Adjust the target cup indes, as well
        target_cup_index -= 3
    }
    // Fill in the three numbers
    for(let i = 0; i< 3; i++) {
        actual_index = (target_cup_index + 1 + i) % num_cups
        game.labels[actual_index] = take_cups[i]
        game.positions[take_cups[i]] = actual_index
    }

    // Determine the new "current_cup"
    current_cup_new_index = game.positions[current_cup_label]
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
        console.log(i + ": " + game.cups)
        playOnRound(game)
    }

    let index = game.cups.findIndex(n => n == 1);
    console.log(game.cups.slice(index + 1).join("") + game.cups.slice(0, index).join(""))

    console.log("final: " + game.cups)

    cups = Array.from(lines[0]).map(n => parseInt(n))
    
    positions = _.range(1000000 + 1) // label = index
    labels = _.range(1, 1000001)
    cups.forEach((label, index) => {
        positions[label] = index
        labels[index] = label
    })
    num_cups = labels.length

    game = {positions, labels, current_cup_index: 0}

    for(i of _.range(10000000)) {
        if(i < 10) {
            console.log("labels: " + game.labels.slice(0,20))
            console.log("positions: " + game.positions.slice(0,20))
            console.log("current_index: " + game.current_cup_index)
            console.log("")
        }
        playOnRound2(game)
         if(i % 100000 == 0)
            console.log(i)
    }

    index = game.positions[1];
    console.log(game.labels[correctIndex(index + 1)] * game.labels[correctIndex(index + 2)])

})
