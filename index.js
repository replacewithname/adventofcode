current_day = new Date().getDate();

// Uncomment the following line to chose a different day:
//current_day = 2

app = require("./src/day" + current_day + "/index.js")