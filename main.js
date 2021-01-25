import { writeFile } from "fs";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

main();

async function main() {
  const tasks = [];
  for (let i = 1; i <= 7; i++) {
    tasks.push(getLinksFromListPage(i));
  }

  try {
    const allLinkArrays = await Promise.all(tasks);
    const jsonData = JSON.stringify({
      allLinks: allLinkArrays.reduce((acc, cur) => acc.concat(cur), []),
    });
    writeFile("bggHistoryCollectionLinks.json", jsonData, "utf8", (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

async function getLinksFromListPage(pageNumber) {
  try {
    const response = await axios.get(
      `https://api.geekdo.com/api/articles?threadid=305522&pageid=${pageNumber}`
    );

    return response.data.articles
      .filter((article) => {
        const postDate = article.postdate;
        const content = article.body;

        // 过滤掉无用评论
        if (!content.includes("geeklist")) {
          return false;
        }
        return true;
      })
      .map((article) => {
        const postDate = article.postdate;
        const content = article.body;
        const numberPattern = /\d+/g;

        return {
          yearMonthRaw: postDate,
          yearMonthCn: `${dayjs(postDate.slice(0, 10)).format("YYYY MMMM")}`,
          geekListId: content.match(numberPattern).pop(),
        };
      });
  } catch (error) {
    console.error(error);
  }
}
