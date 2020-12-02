const lineReader = require('line-reader');
const Promise = require("bluebird");
const eachLine = Promise.promisify(lineReader.eachLine);

var lines = []

function getPairWithSum(sum, list){
    index_l = 0
    index_r = list.length;
    while (index_l < index_r) {
        current_sum =  list[index_l] + list[index_r]
        if (current_sum == sum)
            return [list[index_l], list[index_r]]
        if (current_sum < sum) {
            index_l ++;
        }
        else {
            index_r --;
        }
    }
    return undefined
}

function getNWithSum(sum, list, N){
    var res  = undefined
    list.forEach(entry => {
            if(res == undefined) {
                if(N-1 == 2)
                    res = getPairWithSum(sum - entry, list)
                else
                    res = getNWithSum(sum - entry, list, N-1)
                if (res != undefined) {
                    res.push(entry)
                }
        }
    });    
    return res;
}

eachLine('input', (line) => {
    lines.push(parseInt(line))
  }
).then( () => {
    lines = lines.sort((a,b)=> a-b)
    let res = 0
    res = getPairWithSum(2020, lines) 
    console.log(res)
    res = getNWithSum(2020, lines, 3) 
    console.log(res)
})
