const fs = require("fs");

const mb9 = fs.readFileSync("./assets/img-9mb.jpg");

fs.writeFileSync(
  "./assets/9mb.js",
  `
     const imgUrl = 'data:image/png;base64,${mb9.toString("base64")}'
     console.log('mb9')
  `
);


const mb16 = fs.readFileSync("./assets/img-16mb.png");

fs.writeFileSync(
  "./assets/16mb.js",
  `
     const imgUrl = 'data:image/png;base64,${mb16.toString("base64")}'
     console.log('16mb')
  `
);
