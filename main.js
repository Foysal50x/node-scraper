import Progressor from "progressor";
import Puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

Puppeteer.use(StealthPlugin());

const progressor = new Progressor(
  {
    format: " %current%/%max% [%task%] %percent:3s%% Memory Use: %memory:6s%",
  },
  8
);
const URL = "https://copart.com/locations/";
const SearchText = "New York";
const InputSelector =
  "copart-location-list div > div.search-input-group.p-input-icon-left.p-flex-wrap > div.p-d-flex.p-flex-wrap.search-input-field.p-flex-column > div.p-position-relative > input";
const SearchButtonSelector =
  "#mainBody > div.inner-wrap.d-f-c.f-1 > div.d-f-c.f-1 > div > app-root > copart-location-list > div > div.cprt-location-overview-page.clearfix > div > div.search-input-group.p-input-icon-left.p-flex-wrap > div.p-jc-start.search-button-section > button";
const SearchResultSelector =
  "copart-search-location div.p-carousel-content address.p-mt-4.p-mb-1";

async function main() {
  progressor.setMessage("🕠 Lifting Up...", "task");
  /**
   * Launch the browser
   */
  progressor.start();
  progressor.setMessage("🚀 Launching browser...", "task");

  const browser = await Puppeteer.launch({
    headless: true,
    timeout: 0,
    args: ["--window-size=1920,1080"],
  });
  progressor.advance();

  /**
   * Create a new page
   * and navigate to the URL
   * specified above
   * */
  progressor.setMessage("⏳ Creating new page...", "task");
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 0 });
  progressor.advance();

  /**
   * Wait for the input field to be visible
   * and type the search text
   * */
  progressor.setMessage("⏳ Waiting for input field to be visible...", "task");
  await page.waitForNetworkIdle({ timeout: 3000 }).catch((e) => {});
  await page.$(InputSelector);
  await page.type(InputSelector, SearchText);
  progressor.advance();

  /**
   * submit the location search from
   * */
  progressor.setMessage("⏳ Submitting location search...", "task");
  await page.click(SearchButtonSelector);
  progressor.advance();

  /**
   * Wait for the search results to be visible
   * */
  progressor.setMessage(
    "⏳ Waiting for search results to be visible...",
    "task"
  );
  await page.waitForNetworkIdle({ timeout: 3000 }).catch((e) => {});
  await page.waitForSelector(
    "copart-search-location div.copart-search-location div.p-carousel-content address.p-mt-4.p-mb-1",
    {
      timeout: 500,
      visible: true,
      hidden: true,
    }
  );
  progressor.advance();

  /**
   * Scrape addresses from the search results
   * */
  progressor.setMessage("⏳ Scraping addresses from search results...", "task");
  const Addresses = await page.$$eval(SearchResultSelector, (element) => {
    return Array.from(element).map((el) => el.outerText);
  });
  progressor.advance();

  /**
   * take a screenshot of the search results
   * */
  progressor.setMessage("⏳ Taking screenshot of search results...", "task");
  await page.screenshot({ path: "copart-locations.png" });
  progressor.advance();

  /**
   * Close the browser instance
   * */
  progressor.setMessage("\nClosing browser...", "task");
  await browser.close();
  progressor.advance();
  progressor.setMessage("✅ Scrapping Finished And closed The Browser", "task");
  progressor.finish();

  /**
   * Scrapping results
   * */
  console.log(
    "\n\n::::::::::::[ Scraped results for location " +
      SearchText +
      " ]::::::::::::\n"
  );
  console.table(Addresses);
}

main().catch(console.error);

// async function scrollDown(page) {
//   await page.$eval("body", (e) => {
//     e.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
//   });
// }

// const address = await page.$eval(".p-carousel-content", (el) =>
//   Array.from(el.childNodes)
//     .map((child) =>
//       Array.from(child.childNodes).map((grandChild) =>
//         grandChild.textContent.trim()
//       )
//     )
//     .reduce((acc, curr) => acc.concat(curr), [])
//     .filter(Boolean)
// );
