export class KeywordsManager {

  /**
   * @type {string[]} Keywords.
   */
  keywords;
  /**
   * @type {string[]} Selected keywords.
   */
  selectedKeywords;
  /**
   * @type {string} Calculation method for the filter.
   */
  calculationMethod = "union";

  constructor() {
    this.keywords = [];
    this.visibleKeywords = [];
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
      }
    });
    this.refreshKeywordsFromSearch(document.getElementById("keywordsFindInput").textContent);
  }

  handleKeywordHtml() {
    this.removeAllVisibleKeywordsHtml();
    this.addKeywordsHtml()
  }

  removeAllVisibleKeywordsHtml() {
    document.getElementById("filterKeywordsListWords").innerHTML = "";
  }

  addKeywordsHtml() {
    this.visibleKeywords.forEach(word => {
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

      if (this.selectedKeywords.includes(word)) {
        div.className = "active";
      }

      document.getElementById("filterKeywordsListWords").append(div);
    });
  }

  refreshKeywordsFromSearch(searchContent) {
    if (searchContent.length === "") {
      this.visibleKeywords = this.keywords;
    } else {
      this.visibleKeywords = [];
      this.keywords.forEach(word => {
        if (word.toLowerCase().includes(searchContent.toLowerCase())) {
          this.visibleKeywords.push(word);
        }
      });
    }
    this.handleKeywordHtml();
  }

  getKeywords() {
    return this.keywords;
  }

  getSelectedKeywords() {
    return this.selectedKeywords;
  }

  getCalculationMethod() {
    return this.calculationMethod;
  }

  setCalculationMethod(method) {
    return this.calculationMethod = method;
  }

}
