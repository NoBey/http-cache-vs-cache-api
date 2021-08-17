const cache_api_9mb = require('./cache_api_9mb_5000kb.json')
const fetch_cache_9mb = require('./fetch_cache_9mb_5000kb.json')
const fs = require('fs')

function average(arr){
   return arr.slice(1).reduce((a, b) => a + b, 0) / 49
}

let md_9mb  = ''

md_9mb += `| 平均 | ${average(fetch_cache_9mb)} | ${average(cache_api_9mb)} |`
md_9mb += '\n'

for (let i = 0; i < 50; i++) {
    md_9mb += `| ${i + 1} | ${fetch_cache_9mb[i]} | ${cache_api_9mb[i]} |`
    md_9mb += '\n'
}

fs.writeFileSync('md_9mb.md', md_9mb)



const cache_api_16mb = require('./cache_api_16mb_5000kb.json')
const fetch_cache_16mb = require('./fetch_cache_16mb_5000kb.json')
let md_16mb  = ''

md_16mb += `| 平均 | ${average(fetch_cache_16mb)} | ${average(cache_api_16mb)} |`
md_16mb += '\n'

for (let i = 0; i < 50; i++) {
    md_16mb += `| ${i + 1} | ${fetch_cache_16mb[i]} | ${cache_api_16mb[i]} |`
    md_16mb += '\n'
}

fs.writeFileSync('md_16mb.md', md_16mb)