import { search } from "yt-search"

class YTSearch {
  pageStart = 1;
  pageEnd = 1;

  async find(keyword:string) {
    const options = this.generateOptions(keyword);

    const { videos } = await search(options);

    const { seconds, title, videoId, url } = await this.getFirstValid(videos);
    return {
      seconds,
      title,
      videoId,
      url,
    };
  }

  generateOptions(query:any) {
    return {
      query,
      pageStart: this.pageStart,
      pageEnd: this.pageEnd,
    };
  }

  getFirstValid(videos:any):any {
    return videos[0].seconds <= 900
      ? videos[0]
      : this.getFirstValid(videos.slice(1));
  }
}

export default YTSearch