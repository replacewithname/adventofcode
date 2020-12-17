const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const neighborsOf = (point) => {
    let [x,y,z] = point
    let neighbors = []
    _.range(-1, 2).forEach(dx =>{
        _.range(-1, 2).forEach(dy =>{
            _.range(-1, 2).forEach(dz =>{
                if(dx != 0 || dy != 0 || dz != 0)
                    neighbors.push([x+dx, y+dy, z+dz])
            })
            
        })
    })

    return neighbors
}

const isActive = (point, active_points) => {
    for (ap of active_points) {
        if( _.isEqual(ap, point))
            return true
    }
    return false
}

const nextState = (point, active_points) => {
    let num_active_neighbors = neighborsOf(point).filter(point => isActive(point, active_points)).length

    if(isActive(point, active_points)) {
        return [2,3].includes(num_active_neighbors)
    }

    return  num_active_neighbors == 3
}

const neighborsOf4 = (point) => {
    let [x,y,z,w] = point
    let neighbors = []
    _.range(-1, 2).forEach(dx =>{
        _.range(-1, 2).forEach(dy =>{
            _.range(-1, 2).forEach(dz =>{
                _.range(-1, 2).forEach(dw =>{
                    if(dx != 0 || dy != 0 || dz != 0 || dw != 0)
                        neighbors.push([x+dx, y+dy, z+dz, w+dw])
                })
            })    
        })
    })

    return neighbors
}

const nextState4 = (point, active_points) => {
    let num_active_neighbors = neighborsOf4(point).filter(point => isActive(point, active_points)).length

    if(isActive(point, active_points)) {
        return [2,3].includes(num_active_neighbors)
    }

    return  num_active_neighbors == 3
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    let active_points = []

    lines.forEach((line, y) => {
        Array.from(line).forEach((char, x) => {
            if(char == '#') {
                active_points.push( [x, y, 0])
            }
        })
    })

/*    let test = isActive([0,0,0], active_points)

    test = neighborsOf([0,0,0])

    test = nextState([1,0,0], active_points)

    for(let i=0; i< 6; i++) {
        let new_active_points = []
        relevant_candidates = active_points.flatMap(p => {
            return [p, ...neighborsOf(p)]
        })
        relevant_candidates = _.uniqWith(relevant_candidates, _.isEqual)

        relevant_candidates.forEach(p => {
            if(nextState(p, active_points)) {
                new_active_points.push(p)
            }
        })

        active_points = _.cloneDeep(new_active_points)
    }

    console.log(active_points.length)*/

    active_points = []

    lines.forEach((line, y) => {
        Array.from(line).forEach((char, x) => {
            if(char == '#') {
                active_points.push( [x, y, 0, 0])
            }
        })
    })

    for(let i=0; i< 6; i++) {
        console.log(active_points.length)

        let new_active_points = []
        relevant_candidates = active_points.flatMap(p => {
            return [p, ...neighborsOf4(p)]
        })
        relevant_candidates = _.uniqWith(relevant_candidates, _.isEqual)

        relevant_candidates.forEach(p => {
            if(nextState4(p, active_points)) {
                new_active_points.push(p)
            }
        })

        active_points = _.cloneDeep(new_active_points)
    }


    console.log(active_points.length)
})
