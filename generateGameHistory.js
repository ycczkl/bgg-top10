import jsonData from "./bggHistoryCollectionLinks.json";
import axios from "axios";
import cheerio from "cheerio";
import { promises as fs } from "fs";

main();

async function main() {
  const { allLinks } = jsonData;
  const tasks = allLinks.map((linkObj) => getTopTenGamesByList(linkObj));
  try {
    const results = await Promise.all(tasks);
    await fs.writeFile("gameHistory.json", JSON.stringify(results), "utf8");
  } catch (error) {
    console.log(error);
  }
}

async function getTopTenGamesByList(linkObj) {
  const { geekListId, yearMonthCn } = linkObj;
  try {
    const { data } = await axios.get(
      `https://www.boardgamegeek.com/geeklist/${geekListId}`
    );
    const $ = cheerio.load(data);

    const top10GamesName = $(".geeklist_item_title a[href]")
      .filter(
        (_, el) =>
          $(el).attr("href").includes("boardgame") &&
          !$(el).attr("href").includes("rank")
      )
      .map((_, el) => $(el).text())
      .get();

    const top10GameImg = $(".doubleleft img")
      .filter((_, el) => $(el).attr("src").includes("images"))
      .map((_, el) => $(el).attr("src"))
      .get();

    const top10Object = top10GamesName.map((name, i) => {
      return { name, image: top10GameImg[i] };
    });

    return { yearMonthCn, top10Object };
  } catch (error) {}
}
