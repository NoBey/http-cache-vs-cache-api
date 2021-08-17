const puppeteer = require("puppeteer-core");
const fs = require("fs");
const findChrome = require("./findChrome");

// puppeteer.networkConditions
// https://github.com/puppeteer/puppeteer/blob/main/src/common/NetworkConditions.ts

// 测试 script 加载 资源区别
// type: 9mb | 16mb
// cache: boolean


async function loadPerformanceTest({
  option = {},
  type = "9mb",
  cache = false,
  cycle = 50,
}) {
  const opt = await findChrome(option);
  // opt.headless = false
  // opt.args = ['--incognito']
  const browser = await puppeteer.launch(opt);
  // const context = await browser.createIncognitoBrowserContext();
  const url = `http://127.0.0.1:${
    cache ? "8081" : "8080"
  }/assets/${type}_load.html`;
  // const context = await browser.createIncognitoBrowserContext();
  const records = [];

  for (let i = 0; i < cycle; i++) {
    const page = await browser.newPage();
    page.setCacheEnabled(cache);
    console.time("time");
    // console.log(url)
    let now = Date.now();
    page.on("load", () => {
      records.push(Date.now() - now);
      console.timeEnd("time");
    });
    await page.goto(url);
    await page.close();
  }

  await browser.close();
  return records;
  // fs.writeFileSync('no-cache-16mb.json', JSON.stringify(records))
}

// 测试 fetch 在有缓存和🈚️缓存情况下 差别
async function fetchApiTest({
  option = {},
  type = "9mb",
  cache = false,
  cycle = 50,
}) {
  const opt = await findChrome(option);
  // opt.headless = false
  // opt.args = ['--incognito']
  const browser = await puppeteer.launch(opt);
  // const context = await browser.createIncognitoBrowserContext();
  const records = [];

  for (let i = 0; i < cycle; i++) {
    const page = await browser.newPage();
    page.setCacheEnabled(cache);

    // await page.setRequestInterception(true);
    await page.emulateNetworkConditions({
      // 3G Slow
      download: ((50000 * 1000) / 8) * 0.8,
      upload: ((5000 * 1000) / 8) * 0.8,
      latency: 1,
    });

    await page.goto(
      `http://127.0.0.1:${cache ? "8081" : "8080"}/assets/index.html`
    );
    await page.exposeFunction("getUrl", () => type + ".js");

    const time = await page.evaluate(async () => {
      async function fetchUrl(url) {
        const response = await fetch(url, { cache: "no-cache" });
        const text = await response.text();
        return text;
      }
      let now = Date.now();
      await fetchUrl(await window.getUrl());
      return Date.now() - now;
    });
    console.log(`time: ${time} ms`);
    records.push(time);
    await page.close();
  }

  return records;
}

// 测试 Cache api
async function CacheApiTest({
  option = {},
  type = "9mb",
  cycle = 50,
  cache = false,
}) {
  const opt = await findChrome(option);
  // opt.headless = false
  // opt.args = ['--incognito']
  const browser = await puppeteer.launch(opt);
  // const context = await browser.createIncognitoBrowserContext();
  const records = [];

  for (let i = 0; i < cycle; i++) {
    const page = await browser.newPage();
    // page.setCacheEnabled(cache)

    // await page.setRequestInterception(true);
    await page.emulateNetworkConditions({
      // 3G Slow
      download: ((50000 * 1000) / 8) * 0.8,
      upload: ((5000 * 1000) / 8) * 0.8,
      latency: 1,
    });

    await page.goto(
      `http://127.0.0.1:${cache ? "8081" : "8080"}/assets/index.html`
    );
    await page.exposeFunction("getUrl", () => type + ".js");

    const time = await page.evaluate(async () => {
      const v1 = await caches.open("v1");

      async function fetchUrl(url) {
        let response = await v1.match(url);
        if (!response) {
          await v1.add(url);
          response = await v1.match(url);
        }
        const text = await response.text();
        return text;
      }
      let now = Date.now();
      await fetchUrl(await window.getUrl());
      return Date.now() - now;
    });
    console.log(`time: ${time} ms`);
    records.push(time);
    await page.close();
  }

  return records;
}



;(async () => {

  // 有无 http 缓存对比
  const records_9_no = await loadPerformanceTest({ type: '9mb' })
  fs.writeFileSync('no-cache-9mb.json', JSON.stringify(records_9_no))

  const records_16_no = await loadPerformanceTest({ type: '16mb' })
  fs.writeFileSync('no-cache-9mb.json', JSON.stringify(records_16_no))

  const records_9 = await loadPerformanceTest({ type: '9mb', cache: true })
  fs.writeFileSync('cache-9mb_laod.json', JSON.stringify(records_9))

  const records_16 = await loadPerformanceTest({ type: '16mb', cache: true })
  fs.writeFileSync('cache-16mb_load.json', JSON.stringify(records_16))



  // fetch cache_api 对比
  const fetch_cache_9mb_5000kb = await fetchApiTest({ type: '9mb', cache: true })
  fs.writeFileSync('fetch_cache_9mb_5000kb.json', JSON.stringify(fetch_cache_9mb_5000kb))

  const cache_api_9mb_5000kb = await CacheApiTest({ type: '9mb' })
  fs.writeFileSync('cache_api_9mb_5000kb.json', JSON.stringify(cache_api_9mb_5000kb))

  const fetch_cache_16mb_5000kb = await fetchApiTest({ type: '16mb', cache: true })
  fs.writeFileSync('fetch_cache_16mb_5000kb.json', JSON.stringify(fetch_cache_16mb_5000kb))

  const cache_api_16mb_5000kb = await CacheApiTest({ type: '16mb' })
  fs.writeFileSync('cache_api_16mb_5000kb.json', JSON.stringify(cache_api_16mb_5000kb))


  // await fetchApiTest({ type: "16mb", cache: true });
  // await CacheApiTest({ type: "16mb" });
})();
