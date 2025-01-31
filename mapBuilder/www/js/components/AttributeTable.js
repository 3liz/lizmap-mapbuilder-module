import {html, render} from 'lit-html';

export class AttributeTable extends HTMLElement {

    constructor(elements) {
        // Elements : [repositoryId, projectId, layerName, features, aliases, visibleProperties]

        super();
        // Declare reactive properties
        this.repositoryId = elements[0];
        this.projectId = elements[1];
        this.layerName = elements[2];

        var features = elements[3]
        var aliases = elements[4];
        var visibleProperties = elements[5];

        //Headers
        var columnName = [];
        for (var i = 0; i < visibleProperties.length; i++) {
            columnName.push(aliases[visibleProperties[i]] !== "" ? aliases[visibleProperties[i]] : visibleProperties[i]);
        }

        //Data
        var lignes = [];

        for (var k = 0; k < features.length; k++) {
            var feature = features[k];
            lignes.push(html`<tr>`)
            lignes.push(html`
                  <td>
                      <button type="button" title="${lizDict['zoomin']}" class="btn btn-sm zoomToFeatureExtent"
                              data-feature-extent="${JSON.stringify(feature.bbox)}">
                          <i class="fas fa-search-plus"></i>
                      </button>
                  </td>
          `);

            for (var j = 0; j < visibleProperties.length; j++) {
                var propertieValue = feature.properties[visibleProperties[j]];

                // Replace url or media by link
                if(typeof propertieValue === 'string'){
                    if( propertieValue.slice(0,6) === 'media/' || propertieValue.slice(0,6) === '/media/' ){
                        var rdatamedia = propertieValue;
                        if( propertieValue.slice(0,6) === '/media/' )
                            rdatamedia = propertieValue.slice(1);
                        lignes.push(html`
                          <td>
                              <a href="${lizUrls.media}?repository=${this.repositoryId}&project=${this.projectId}&path=/${rdatamedia}"
                                 target="_blank">${aliases[visibleProperties[j]]}</a>
                          </td>`);
                    }
                    else if( propertieValue.slice(0,4) === 'http' || propertieValue.slice(0,3) === 'www' ){
                        var rdataweb = propertieValue;
                        if(propertieValue.slice(0,3) === 'www')
                            rdataweb = 'http://' + propertieValue;
                        lignes.push(html`
                          <td>
                              <a href="${rdataweb}" target="_blank">${propertieValue}</a>
                          </td>`);
                    } else {
                        lignes.push(html`
                          <td>${propertieValue}</td>`);
                    }
                } else {
                    lignes.push(html`
                      <td>${propertieValue}</td>`);
                }
            }
            lignes.push(html`</tr>`);
        }

        this.columnName = columnName;
        this.lignes = lignes;

        this.setAttribute('class', 'tab-pane fade show active');
        this.setAttribute('role', 'tabpanel');
        this.setAttribute('id', `attributeLayer-${this.repositoryId}-${this.projectId}-${this.layerName}`);

        this.render();
    }

    updateContent() {
        render(this.render(), this);
    }

    render() {
        return html`
            <div class="table">
                <table class="table">
                    <tbody>
                    <tr>
                        <th></th>
                        ${this.columnName.map((name) =>
                                html`
                                    <th>${name}</th>
                                `
                        )}
                    </tr>
                    ${this.lignes}
                    </tbody>
                </table>
            </div>
        `;
    }
}

customElements.define('lizmap-attribute-table', AttributeTable);
