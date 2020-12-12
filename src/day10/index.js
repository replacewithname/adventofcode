const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const possibleNextPositions = (pos, sorted_ratings) => {
    return _.range(pos + 1,pos + 4)
    .filter(new_pos => new_pos < sorted_ratings.length)
    .filter(new_pos => sorted_ratings[new_pos] - sorted_ratings[pos] <= 3)
}

const numberOfPossibleWays = sorted_ratings => {
    // A vector: How many possible ways are there from each position?
    let ways_from = new Array(sorted_ratings.length).fill(null)

    // Only one choice from the end
    ways_from[ways_from.length - 1] = 1

    // recursively walk backwards
    for(let pos = ways_from.length - 2; pos>=0; pos--) {
        possibleNextPositions(pos, sorted_ratings)
        .forEach(next_pos => ways_from[pos] += ways_from[next_pos] )
    }

    return ways_from[0]
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    const ratings = [] 
    lines.forEach(line => ratings.push(parseInt(line)))

    ratings.push(0)
    ratings.push(_.max(ratings) + 3)
    ratings.sort((a,b) => a-b)

    // How many 1,2 or 3-increments are there? Including zero-position for better readability
    let num_increments = [0,0,0,0]
    _.zip(ratings, ratings.slice(1))
    .forEach(pair => {
        num_increments[pair[1] - pair[0]]++
    })

    console.log(num_increments[1] * num_increments[3])
    
    console.log(numberOfPossibleWays(ratings))
})
