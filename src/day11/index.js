const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const isValisPosition = (x,y) => {
    return x >= 0 && y >= 0 && x < numrows && y < numcols
}

const equals = (area1, area2) => {
    for(let x = 0; x < numrows; x ++){
        for(let y = 0; y < numrows; y ++){
            if(area1[x][y] != area2[x][y]) {
                return false
            }        
        }
    }

    return true
}

const numberOfOccupiedSeats = (pos, area) => {
    let num = 0
    let increments = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]]
    let new_positions = increments.map(incr => [pos[0] + incr[0], pos[1] + incr[1]])
      .filter(p => isValisPosition(p[0], p[1]))

    new_positions.forEach(p => {
        if(p === undefined || p[0] === undefined || area[p[0]] === undefined) {
            console.log("problem")
        }
          if( area[p[0]][p[1]] == '#' ){
            num ++
          }
      })
    return num;
}

const numberOfOccupiedSeats2 = (pos, area) => {
    let num = 0
    let maxsteps = Math.max(numrows, numcols)
    let direction = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]]
    direction.forEach(dir => {

        seats = _.range(1, maxsteps).map(n => 
            [pos[0] + dir[0] * n, pos[1] + dir[1] * n]
        ).filter(p => isValisPosition(p[0], p[1]))
        .filter(p => ['L', '#'].includes(area[p[0]][p[1]])  )

        let first_seat = _.first(seats)
        if (first_seat !== undefined && area[first_seat[0]][first_seat[1]] == '#') {
            num ++
        }
        if(first_seat !== undefined && area[first_seat[0]][first_seat[1]] == '.') {
            console.log("Problem")
        }
    })
    return num;
}

const newIncrement = (area) => {
    new_area = _.cloneDeep(area)

    _.range(numrows).forEach(x => {
        _.range(numcols).forEach(y => {
            num = numberOfOccupiedSeats([x,y], area)
            if (num == 0 && area[x][y] != '.') {
                new_area[x][y] = '#'
            }
            else if (num >= 4 && area[x][y] != '.') {
                new_area[x][y] = 'L'
            }
            else {
                new_area[x][y] = area[x][y]
            }
        })
    })

    return new_area
}

const newIncrement2 = (area) => {
    new_area = _.cloneDeep(area)

    _.range(numrows).forEach(x => {
        _.range(numcols).forEach(y => {
            num = numberOfOccupiedSeats2([x,y], area)
            if (num == 0 && area[x][y] != '.') {
                new_area[x][y] = '#'
            }
            else if (num >= 5 && area[x][y] != '.') {
                new_area[x][y] = 'L'
            }
            else {
                new_area[x][y] = area[x][y]
            }
        })
    })

    return new_area
}

const numOccupiedSeats = (area) => {
    let num_occupied_seats = 0
    area.forEach(row => row.forEach(seat => {
        if(seat == '#')
            num_occupied_seats ++
    }))

    return num_occupied_seats
}

var lines = []
var numcols = 0
var numrows = 0

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    const initial_area = [] 
    lines.forEach(line => initial_area.push(Array.from(line)))

    numcols = initial_area[0].length
    numrows = initial_area.length

    let area = _.cloneDeep(initial_area)
    do {
        old_area = area
        area = newIncrement(old_area)
    } while (! equals(old_area, area))

    console.log(numOccupiedSeats(area))

    area = _.cloneDeep(initial_area)
    do {
        old_area = area
        area = newIncrement2(old_area)
    } while (! equals(old_area, area))

    console.log(numOccupiedSeats(area))
})
