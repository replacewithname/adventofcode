const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

// Turns a string line to a vector of ["sw", "e"] and so on
const lineToDirections = (line) => {
    let intermediate = ""
    let result = []
    Array.from(line).forEach(c => {
        if(["n", "s"].includes(c)) {
            intermediate = c
        }
        else {
            result.push(intermediate + c)
            intermediate = ""
        }
    })

    return result
}

const coordinates = {
    e: [1,0],
    se: [0,-1],
    ne: [1,1],
    w: [-1,0],
    sw: [-1,-1],
    nw: [0,1],
}

const coordinatesFromDirection = (direction) => {
    return coordinates[direction]
}

const neighborsOf = (tile) => {
    neighbors = []
    for(let coord of Object.values(coordinates)) {
        neighbors.push([tile[0] + coord[0], tile[1] + coord[1]])
    }
    return neighbors
}

const flipTiles = (black_tiles) => {
    let tiles = {}
    black_tiles.forEach(tile => {
        tile_str = tile.toString()
        tiles[tile_str] = tiles[tile_str] || {tile, num_black_neighbors: 0, is_black: true}
    })
    
    // All neighbors are processed AFTER all black tiles. Therefore the is_black-property is correct
    black_tiles.forEach(tile => {
        for(neighbor of neighborsOf(tile)) {
            neighbor_str = neighbor.toString()
            tiles[neighbor_str] = tiles[neighbor_str] || {tile: neighbor, num_black_neighbors: 0, is_black: false}
            tiles[neighbor_str].num_black_neighbors++
        }
    })

    let new_black_tiles = []

    for(value of Object.values(tiles)) {
        if(value.is_black) {
            if([1,2].includes(value.num_black_neighbors)) {
                new_black_tiles.push(value.tile)
            }
        }
        else {
            if(value.num_black_neighbors == 2) {
                new_black_tiles.push(value.tile)
            }
        }
    }
    return new_black_tiles
}

var lines = []
var num_cups = 0
eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    tiles = {}
    black_tiles = []
    lines.map(lineToDirections)
        .map(dirs => { 
            return dirs.map(dir => {return coordinatesFromDirection(dir) } ) 
        } )
        .map(dirs => { 
            return dirs.reduce((a,b) => [a[0]+b[0], a[1] + b[1]], [0,0]) 
        } )
        .forEach(tile => {
            tile_str = tile.toString()
            tiles[tile_str] = tiles[tile_str] || {tile, is_black: false}
            tiles[tile_str].is_black = !tiles[tile_str].is_black
        })

    black_tiles = Object.values(tiles).filter(value => value.is_black).map(value => value.tile)

    // First result
    console.log(black_tiles.length)

    for(i in _.range(100)) {
        black_tiles = flipTiles(black_tiles)
    }

    // Second result
    console.log(black_tiles.length)
})
