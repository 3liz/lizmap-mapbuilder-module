export class KeywordsManager {

    constructor() {
        this.keywords = [];
        this.visibleKeywords = [];
        this.selectedKeywords = [];
        this.calculationMethod = "union";
    }

    /**
     * Add all keywords from a list without duplicates.
     * @param {string[]} keywordList - List of keywords to add.
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
        document.getElementById("filter-keywords-list-words").innerHTML = "";
    }

    addKeywordsHtml() {
        this.visibleKeywords.forEach(word => {
            let div = document.createElement("div");

            div.id = "filter-keyword";
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

            document.getElementById("filter-keywords-list-words").append(div);
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
