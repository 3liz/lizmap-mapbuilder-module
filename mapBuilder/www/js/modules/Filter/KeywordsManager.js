export class KeywordsManager {

  /**
   * @type {string[]} Keywords.
   */
  keywords;
  /**
   * @type {string[]} Selected keywords.
   */
  selectedKeywords;

  constructor() {
    this.keywords = [];
    this.selectedKeywords = [];
  }

  /**
   * Add all keywords from a list without duplicates.
   * @param keywordList
   */
  addKeywordFromList(keywordList) {
    keywordList.forEach(keyword => {
      if (!this.keywords.includes(keyword)) {
        this.keywords.push(keyword);
        this.addKeywordHtml(keyword);
      }
    });
  }

  addKeywordHtml(word) {
    let div = document.createElement("div");

    div.id = "filterKeyword";
    div.innerText = word;

    div.addEventListener("click", () => {
      if (div.className.includes("active")) {
        div.className = "";
        this.selectedKeywords.splice(this.selectedKeywords.indexOf(word), 1);
      } else {
        div.className = "active";
        this.selectedKeywords.push(word);
      }

      const event = new CustomEvent('keywordsUpdated');
      document.dispatchEvent(event);
    });

    document.getElementById("filterKeywordsList").append(div);
  }

  getKeywords() {
    return this.keywords;
  }

  getSelectedKeywords() {
    return this.selectedKeywords;
  }

}
