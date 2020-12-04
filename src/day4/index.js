const lineReader = require('line-reader');
const Promise = require("bluebird");
const { connected } = require('process');
const { DEFAULT_MIN_VERSION } = require('tls');
const eachLine = Promise.promisify(lineReader.eachLine);

function stringToDocument(str) {
    var doc = {}
    str.split(" ")
      .filter(a => a.length > 0)
      .forEach(a => {
        tmp = a.split(":",2)
        doc[tmp[0]] = tmp[1]
    })

    return doc
}

function documentIsValidPassport1(doc) {
    var keys = Object.keys(doc)
    is_valid = true
    necessary_fields = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"]
    necessary_fields.forEach(a => {
        if(! keys.includes(a)) {
            is_valid = false
        }
    })
    return is_valid;
}

function documentIsValidPassport2(doc) {
    var keys = Object.keys(doc)
    is_valid = documentIsValidPassport1(doc)
    if(is_valid) {
        if(doc['byr'].match(/^\d{4}$/) == null || parseInt(doc['byr']) < 1920 || parseInt(doc['byr']) > 2002) {
            is_valid = false
        }
        if(doc['iyr'].match(/^\d{4}$/) == null || parseInt(doc['iyr']) < 2010 || parseInt(doc['iyr']) > 2020) {
            is_valid = false
        }
        if(doc['eyr'].match(/^\d{4}$/) == null || parseInt(doc['eyr']) < 2020 || parseInt(doc['eyr']) > 2030) {
            is_valid = false
        }

        hgt_match = doc['hgt'].match(/^(\d+)(cm|in)$/)
        if(hgt_match == null)
        is_valid = false
        else {
            num = parseInt(hgt_match[1])
            if(hgt_match[2] === "cm" && (num < 150 || num > 193) )
                is_valid =false
            else if(hgt_match[2] === "in" && (num < 59 || num > 76) )
                is_valid =false
        }

        if(doc['hcl'].match(/^#[0-9a-f]{6}$/) == null)
            is_valid = false

        if(doc['ecl'].match(/^(amb|blu|brn|gry|grn|hzl|oth)$/) == null)
            is_valid = false
    
        if(doc['pid'].match(/^\d{9}$/) == null)
            is_valid = false

    }

    return is_valid;
}

var lines = []

eachLine('input', (line) => {
    lines.push(line)
  }
).then( () => {
    num_correct = lines.map(line => line === "" ? ";" : line)
        .reduce((a,b) => a + " " +b ) // This hurts a little...
        .split(";")
        .map(stringToDocument)
        .filter(documentIsValidPassport1)
        .length

    console.log(num_correct)

    num_correct2 = lines.map(line => line === "" ? ";" : line)
        .reduce((a,b) => a + " " +b )
        .split(";")
        .map(stringToDocument)
        .filter(documentIsValidPassport2)
        .length

    console.log(num_correct2)

})
