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
    active_points = []

    lines.forEach((line, y) => {
        Array.from(line).forEach((char, x) => {
            if(char == '#') {
                active_points.push( [x, y, 0])
            }
        })
    })

    for(let i=0; i< 6; i++) {
        let num_active_neighbors = new Map()
        active_points.flatMap(point => neighborsOf(point, active_points))
        .forEach(neighbour => {
            let key = neighbour.toString()
            if(num_active_neighbors.has(key)) {
                num_active_neighbors.get(key).num++
            }
            else {
                num_active_neighbors.set(key, {point: neighbour, num: 1, is_active: isActive(neighbour, active_points)})
            }
        })

        active_points = Array.from(num_active_neighbors.values()).filter(element => element.num == 3 || (element.num == 2 && element.is_active))
                            .map(element => element.point)
    }

    console.log(active_points.length)

    active_points = []

    lines.forEach((line, y) => {
        Array.from(line).forEach((char, x) => {
            if(char == '#') {
                active_points.push( [x, y, 0, 0])
            }
        })
    })

    for(let i=0; i< 6; i++) {
        let num_active_neighbors = new Map()
        active_points.flatMap(point => neighborsOf4(point, active_points))
        .forEach(neighbour => {
            let key = neighbour.toString()
            if(num_active_neighbors.has(key)) {
                num_active_neighbors.get(key).num++
            }
            else {
                num_active_neighbors.set(key, {point: neighbour, num: 1, is_active: isActive(neighbour, active_points)})
            }
        })

        active_points = Array.from(num_active_neighbors.values()).filter(element => element.num == 3 || (element.num == 2 && element.is_active))
                            .map(element => element.point)
    }

    console.log(active_points.length)
})
