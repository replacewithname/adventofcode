const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const isOver = (cards1, cards2) => {
    return cards1.length == 0 || cards2.length == 0
}

const playOnRound = (cards1, cards2) => {
    first_card = cards1[0]
    second_card = cards2[0]
    if(first_card > second_card) {
        cards1.push(first_card)
        cards1.push(second_card)
    }
    else {
        cards2.push(second_card)
        cards2.push(first_card)
    }

    return [cards1.slice(1), cards2.slice(1)]
}

const valueOfGame = (cards1, cards2) => {
    cards = cards1
    if(cards.length == 0) {
        cards = cards2
    }
    return cards.reverse().map((c, index) => c * (index + 1)).reduce((a,b) => a+b)
}

const stringRepresentation = (cards1, cards2) => {
    return cards1.join("-") + ":" + cards2.join("-")
}

const playRecursiveGame = (cards1, cards2) => {
    let str = stringRepresentation(cards1, cards2)
     if(gameRegistry.has(str)) {
        return {
            winner: gameRegistry.get(str)
        }
    }

    let winner = 0
    let past_cards = [str]

    while(!isOver(cards1, cards2)) {
        if(cards1[0] <= cards1.length - 1 && cards2[0] <= cards2.length - 1) {
            round_winner = playRecursiveGame(cards1.slice(1, cards1[0] + 1), cards2.slice(1, cards2[0] + 1)).winner
        }
        else {
            round_winner = cards1[0] > cards2[0] ? 1 : 2
        }
        if(round_winner == 1) {
            cards1.push(cards1[0])
            cards1.push(cards2[0])
        }
        else {
            cards2.push(cards2[0])           
            cards2.push(cards1[0])            
        }
        cards1 = cards1.slice(1)
        cards2 = cards2.slice(1)

        let str2 = stringRepresentation(cards1, cards2)
        if (past_cards.includes(str2)) {
            winner = 1
            break
        }
        past_cards.push(str2)
    }

    if(winner == 0) {
        winner = cards1.length > 0 ? 1 : 2
    }

    gameRegistry.set(str, winner)

    return {
        winner,
        cards1,
        cards2
    }
}

var lines = []
var gameRegistry = new Map()
eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {

    let [cards1, cards2] = lines.join("\n").split("\n\n").map(line => {
        return line.split("\n").slice(1).map(n => parseInt(n))
    })

    while(!isOver(cards1, cards2)) {
        [cards1, cards2] = playOnRound(cards1, cards2)
    }

    console.log(valueOfGame(cards1, cards2))

    let [c1, c2] = lines.join("\n").split("\n\n").map(line => {
        return line.split("\n").slice(1).map(n => parseInt(n))
    })

    let result = playRecursiveGame(c1, c2)

    console.log(valueOfGame(result.cards1, result.cards2))
})
