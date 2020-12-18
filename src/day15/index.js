const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);
const _ = require("lodash");

const next_number = (numbers) => {
    nums = _.cloneDeep(numbers)

    last_num = nums.pop()

    last_entry = _.last(nums.map((n, i) => [n,i]).filter(([n,i]) => n == last_num))

    ret = 0
    if(last_entry) {
        // The second is the inced
        ret = nums.length - last_entry[1]
    }

    return ret
}

const update_state = (state, number) => {
//    last_number = state.last_number
    state.array[state.last_number] = state.num_rounds

    state.num_rounds++

    state.last_number = number
}

const next_number2 = (state) => {
    n = state.array[state.last_number] > 0 ? state.num_rounds - state.array[state.last_number] : 0

    return n
}


var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    starting_numbers = lines[0].split(",").map(n => parseInt(n))

    numbers = _.cloneDeep(starting_numbers)

    while(numbers.length < 2020) {
        numbers.push(next_number(numbers))
    }

    console.log(_.last(numbers))

    numbers = _.cloneDeep(starting_numbers)


    let state={num_rounds: 1, last_number: starting_numbers[0]}
    state["array"] = new Array(30000000);
    _.fill(state.array, 0)
    for ( let i = 1 ; i< starting_numbers.length; i++) {
        update_state(state, starting_numbers[i])
    }
    while(state.num_rounds < 30000000) {
        new_number = next_number2(state)
        update_state(state, new_number)

        if(state.num_rounds % 1000000 == 0) {
            console.log(state.length)
        }
    }

    console.log(state.last_number)
})
