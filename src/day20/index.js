const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");
const { string } = require('mathjs');
const { matches, range } = require('lodash');

const tileFromLines = (lines) => {
    tile = {}
    let id = parseInt(lines[0].match(/\d+/)[0])
    tile.id = id
    tile.lines = lines.slice(1)
    tile.top = [..._.first(tile.lines)]
    let width = tile.top.length
    tile.bottom = [..._.last(tile.lines)]
    tile.left = _.range(tile.lines.length).map(i => _.first(tile.lines[i]))
    tile.right = _.range(tile.lines.length).map(i => _.last(tile.lines[i]))

    return tile
}

const getMatchingEdgesFixedRotation = (first, second) => {
    let matches = []
    if(_.isEqual(first.top, second.bottom)) {
        matches.push("top") // match on top of first
    }
    if(_.isEqual(first.right, second.left)) {
        matches.push("right")
    }
    if(_.isEqual(first.bottom, second.top)) {
        matches.push("bottom") // match on top of first
    }
    if(_.isEqual(first.left, second.right)) {
        matches.push("left") // match on top of first
    }

    return matches
}

const getRotatedAndFlippedEdges = (tile, rotation, flip) => {
    let new_tile = {}
    let old_lines = [_.clone(tile.top), _.clone(tile.right), _.clone(tile.bottom), _.clone(tile.left)]
    new_tile.top = old_lines[(4-rotation) % 4]
    new_tile.right = old_lines[(4 + 1 - rotation) % 4]
    new_tile.bottom = old_lines[(4 + 2 - rotation) % 4]
    new_tile.left = old_lines[(4 + 3 - rotation) % 4]

    // rows are store left-to-right and top-to-bottom. On rotation, this needs be reversed, depending on how far we go.
    if(rotation == 1) {
        new_tile.top.reverse()
        new_tile.bottom.reverse()
    }
    if(rotation == 2) {
        new_tile.top.reverse()
        new_tile.left.reverse()
        new_tile.bottom.reverse()
        new_tile.right.reverse()
    }
    if(rotation == 3) {
        new_tile.left.reverse()
        new_tile.right.reverse()
    }

    if(flip) {
        new_tile.top.reverse()
        new_tile.bottom.reverse()
        let old_left = new_tile.left
        new_tile.left = new_tile.right
        new_tile.right = old_left
    }

    return new_tile
}

const getMatchesWithRotation = (first, second) => {
    let matches = []
    _.range(4).forEach(rotation => {
        [false, true].forEach(flip => {
             let rotated_first = getRotatedAndFlippedEdges(first, rotation, flip)
             getMatchingEdgesFixedRotation(rotated_first, second).forEach(edge => {
                matches.push({
                    first,
                    first_rotation: rotation,
                    first_flipped: flip,
                    second,
                    second_rotation: 0,
                    second_flipped: false,
                    edge
                })    
            })
        })
    })

    return matches
}

const allIsFixed = (field) => {
    let all_is_fixed = true
    field.forEach(x => {
        field[x].foreach(spot => {
            if(!spot.is_fixed) {
                all_is_fixed = false;
            }
        })
    })

    return all_is_fixed
}

const fixSpot = (field, x, y, tile, rotation, flipped) => {
    dim = field.length
    field[y][x].is_fixed = true;
    field[y][x].tile = tile;
    field[y][x].rotation = rotation;
    field[y][x].flipped = flipped
    field[y][x].candidates = [tile]
    field.forEach(col => col.forEach(spot => {
        spot.candidates = spot.candidates.filter(candidate => candidate.tile != tile)
    }))

    _.range(4).forEach((dir_int) => {
        if(dir_int == 0) {
            xpos = x
            ypos = y-1
            edge = "top"
        }
        if(dir_int == 1) {
            xpos = x+1
            ypos = y
            edge = "right"
        }
        if(dir_int == 2) {
            xpos = x
            ypos = y+1
            edge = "bottom"
        }
        if(dir_int == 3) {
            xpos = x-1
            ypos = y
            edge = "left"
        }
        if(xpos >= 0 && xpos < dim && ypos >= 0 && ypos < dim) {
            let spot = field[ypos][xpos]
            if(!spot.is_fixed) {
                let candidates_by_matches = tile.matches
                    .filter(match => {return match.edge == edge && match.first_rotation == rotation && match.first_flipped == flipped} )
                    .map(match => {
                        return {
                            tile: match.second,
                            rotation: match.second_rotation,
                            flipped: match.second_flipped
                        }
                    })
                if(candidates_by_matches.length == 1) {
                    let tile_to_fix = candidates_by_matches[0]
                    fixSpot(field, xpos, ypos, tile_to_fix.tile, tile_to_fix.rotation, tile_to_fix.flipped)
                }
                else {
                    spot.candidates = _.intersectionWith(spot.candidates, candidates_by_matches, (l,r) => {
                        return l.tile.id == r.tile.id && l.rotation == r.rotation && l.flipped == r.flipped
                    })
                    let test
                }
            }
        }
    })
}

const getAllEquivalentMatches = (match) => {
    let edges = ["top", "right", "bottom", "left"]
    let matching_edge_int = edges.indexOf(match.edge)
    let equivalent_matches = []
    if(! match.first_flipped) {
        _.range(4).forEach((extra_rotation) => {
            [false, true].forEach(extra_flip => {
                let edge_index = (matching_edge_int + extra_rotation) % 4
                if(extra_flip && [1,3].includes(edge_index)) {
                    // Mirror left to right
                    edge_index = 4 - edge_index
                }
                let equivalent_match = {
                    first: match.first,
                    second: match.second,
                    first_rotation: (match.first_rotation + extra_rotation) % 4,
                    first_flipped: extra_flip,
                    second_rotation: extra_rotation,
                    second_flipped: extra_flip,
                    edge: edges[edge_index]
                }
                equivalent_matches.push(equivalent_match)
            })
        })
    }
    else {
        _.range(4).forEach((extra_rotation) => {
            [false, true].forEach(extra_flip => {
                if(!extra_flip) {
                    let edge_index = (4 + matching_edge_int - extra_rotation) % 4
                    if(extra_flip && [1,3].includes(edge)) {
                        // Mirror left to right
                        edge_index = 4 - edge_index
                    }
                    let equivalent_match = {
                        first: match.first,
                        second: match.second,
                        first_rotation: (match.first_rotation + extra_rotation) % 4,
                        first_flipped: !extra_flip,
                        second_rotation: (4 - extra_rotation) % 4,
                        second_flipped: extra_flip,
                        edge: edges[edge_index]
                    }
                    equivalent_matches.push(equivalent_match)
                }
                else {
                    // It was flipped and now we flip "back"
                    edge_after_backflip = matching_edge_int
                    if([1,3].includes(edge_after_backflip)) {
                        edge_after_backflip =  4 - edge_after_backflip
                    }
                    let edge_index = (edge_after_backflip + extra_rotation) % 4
                    // The second rotation (after flip) is on the other side of edge
                    let target_second_edge = (edge_index + 2) % 4
                    let target_second_edge_before_flip = [1,3].includes(target_second_edge) ? 4-target_second_edge : target_second_edge
                    let initial_second_edge = (matching_edge_int + 2) % 4
                    let second_rotation = (4 + target_second_edge_before_flip - initial_second_edge) % 4
                    let equivalent_match = {
                        first: match.first,
                        second: match.second,
                        first_rotation: (match.first_rotation + extra_rotation) % 4,
                        first_flipped: !extra_flip,
                        second_rotation: second_rotation,
                        second_flipped: extra_flip,
                        edge: edges[edge_index]
                    }
                    equivalent_matches.push(equivalent_match)
                }
            })
        })
    }
    return equivalent_matches
}

const mirroredMatch = (match) => {
    let edges = ["top", "right", "bottom", "left"]
    let matching_edge_int = edges.indexOf(match.edge)

    return {
        first: match.second,
        second: match.first,
        first_rotation: match.second_rotation,
        first_flipped: match.second_flipped,
        second_rotation: match.first_rotation,
        second_flipped: match.first_flipped,
        edge: edges[(matching_edge_int + 2) % 4]
    }
}

const orientationWithRightAndBottomMatch = (tile) => {
    let orientations_with_right_match = tile.matches.filter(match => match.edge == "right").map(match => {return {
        rotation: match.first_rotation,
        flipped: match.first_flipped
        }
    })
    let orientations_with_bottom_match = tile.matches.filter(match => match.edge == "bottom").map(match => {return {
            rotation: match.first_rotation,
            flipped: match.first_flipped
        }
    })

    return _.intersectionWith(
            orientations_with_right_match, 
            orientations_with_bottom_match, 
            (l,r) => { return l.rotation == r.rotation && l.flipped == r.flipped}
        )
}

const pictureFromTile = (tile) => {
    let pic = []
    return _.range(1, tile.lines.length -1).map(i => tile.lines[i].substring(1, tile.lines[i].length -1 ))
}

const rotatePic = (pic) => {
    dim = pic.length
    return _.range(dim).map(linnum => {
        return _.range(dim).map(colnum => pic[dim - 1 - colnum][linnum]).join("")
    })
}

const flipPic = (pic) => {
    return pic.map(line => [...line].reverse().join(""))
}

const appendPic = (l, r) => {
    return l.map((line, index) => line + r[index])
}

const picIsInPicAt = (pic, inpic, start_linenum, start_colnum) => {
    return _.every(_.range(pic.length).map(linenum => {
        picline = pic[linenum].replace(/ /g, ".")
        re = new RegExp(picline)
        return re.test(inpic[start_linenum + linenum].substr(start_colnum, picline.length))
    }))
}

const countPicInPic = (pic, inpic) => {
    let count = 0
    _.range(inpic.length - pic.length + 1).forEach((line_num) => {
        _.range(inpic[0].length - pic[0].length + 1).forEach((col_num) => {
            if(picIsInPicAt(pic, inpic, line_num, col_num))
                count ++
        })
    })
    return count
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    let tiles = lines.join("\n").split("\n\n").map(lines => tileFromLines(lines.split("\n")))
    let matches = []

    tiles.filter(tile => tile.id != 3191)
        .forEach(tile => {
            console.log(tile.id)
            console.log(tile.top.join(""))
            console.log(tile.left.join(""))
            console.log(tile.right.join(""))
            console.log(tile.bottom.join(""))
            console.log([...tile.top].reverse().join(""))
            console.log([...tile.left].reverse().join(""))
            console.log([...tile.bottom].reverse().join(""))
            console.log([...tile.right].reverse().join(""))
            console.log("")
        })

    tiles.forEach(first => {
        tiles.forEach(second => {
            if(first.id < second.id) { // Only once per pair, mirror later
                let res = getMatchesWithRotation(first, second)
                res.forEach(match => {
//                    matches.push(match)
//                    matches.push(mirroredMatch(match))
                    getAllEquivalentMatches(match).forEach(equivalent_match => {
                        matches.push(equivalent_match)
                        matches.push(mirroredMatch(equivalent_match))
                    })
                })
            }
        })
    })

    tiles.forEach(tile => {
        tile.matches = matches.filter(match => match.first === tile)
    })

    // Not completely clean but works for the data
    let corner_tiles = tiles.filter(tile => {return tile.matches.length <= 16})

    let product = corner_tiles.map(tile => tile.id).reduce((a, b) => a * b )
    console.log(product)

    const dim = Math.round(Math.sqrt(tiles.length))
    field = new Array(dim)
    let candidates = _.uniq(matches.flatMap(match => {
        return {
            tile: match.first,
            rotation: match.first_rotation,
            flipped: match.first_flipped
        }
    }))
    _.range(dim).forEach(i => field[i] = new Array(dim))
    _.range(dim).forEach(x => {
        _.range(dim).forEach(y => {
            field[x][y] = {
                candidates: _.clone(candidates),
                is_fixed: false,
            }
        })
    })

    top_left_tile = corner_tiles[0]
    let orientation = orientationWithRightAndBottomMatch(top_left_tile)[0]
    fixSpot(field, 0, 0, top_left_tile, orientation.rotation, orientation.flipped)

/*     let pic = pictureFromTile(field[0][0].tile)

    pic.forEach(line => console.log(line))
    console.log("")
    rotatePic(pic).forEach(line => console.log(line))
    console.log("")
    flipPic(pic).forEach(line => console.log(line))

    console.log("")
    appendPic(pic, flipPic(pic)).forEach(line => console.log(line))
 */
    field_pics = field.map(field_line => field_line.map(field_element => {
        let pic = pictureFromTile(field_element.tile)
        let initial_pic = pic
        _.range(field_element.rotation).forEach(i => { pic = rotatePic(pic)})
        if(field_element.flipped) {
            pic = flipPic(pic)
        }
        return pic
    }))

    final_pic = field_pics.flatMap(field_line => field_line.reduce((res,r) => appendPic(res, r)))

    nessie = ["                  # ", "#    ##    ##    ###", " #  #  #  #  #  #   "]

//    final_pic = rotatePic(final_pic)
//    final_pic = flipPic(final_pic)
    final_pic.forEach(line => console.log(line))

    num_sharps_in_nessie = _.sum(nessie.map(line => line.match(/#/g).length))
    num_sharps_in_final_pic = _.sum(final_pic.map(line => line.match(/#/g).length))

    let counts = []
    _.range(4).forEach(i => {
        counts.push(countPicInPic(nessie, final_pic))
        final_pic = flipPic(final_pic)
        counts.push(countPicInPic(nessie, final_pic))
        final_pic = flipPic(final_pic)
        final_pic = rotatePic(final_pic)
    })

    console.log(num_sharps_in_final_pic - _.max(counts)*num_sharps_in_nessie)
})
