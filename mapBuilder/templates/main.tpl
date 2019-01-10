{meta_html csstheme 'css/main.css'}

<div id="header">
  <div id="logo">
  </div>
  <div id="title">
    <h1>{$repositoryLabel}</h1>
  </div>

  <nav id="headermenu" class="navbar navbar-fixed-top">
    <div id="auth" class="navbar-inner">
      <ul class="nav float-right">
        {if $isConnected}
        <li class="user dropdown">
          <div class="dropdown">
            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="icon"></span>
              <span id="info-user-login" class="text">{$user->login|eschtml}</span>
              <span class="caret"></span>
            </button>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
              {ifacl2 'auth.user.view'}
              <a class="dropdown-item" href="{jurl 'jcommunity~account:show', array('user'=>$user->login)}">{@master_admin~gui.header.your.account@}</a>
              {/ifacl2}
              <a class="dropdown-item" href="{jurl 'jcommunity~login:out'}?auth_url_return={jurl 'view~default:index'}">{@view~default.header.disconnect@}</a>
            </div>
          </div>
        </li>
        {else}
        <li class="login">
          <a href="{jurl 'jcommunity~login:index', array('auth_url_return'=>$auth_url_return)}">
            <span class="icon"></span>
            <span class="text text-secondary">{@view~default.header.connect@}</span>
          </a>
        </li>
          {if isset($allowUserAccountRequests) and $allowUserAccountRequests == '1'}
          <li class="registered">
            <a href="{jurl 'jcommunity~registration:index'}">
              <span class="icon"></span>
              <span class="text text-secondary">{@view~default.header.createAccount@}</span>
            </a>
          </li>
          {/if}
        {/if}
      </ul>
    </div>
  </nav>
</div>

<div id="message"></div>

<div id="mapmenu" style="">
  <ul class="nav nav-tabs flex-column">
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Couches">
      <a id="layerswitcher-tab" class="nav-link active dock" data-toggle="tab" href="#layerswitcher" role="tab" aria-controls="layerswitcher">
        <i class="fas fa-layer-group"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Couches sélectionnées">
      <a id="layerselection-tab" class="nav-link dock" data-toggle="tab" href="#layerselection" role="tab" aria-controls="layerselection">
      <i class="fas fa-clipboard-list"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Légende">
      <a id="legend-tab" class="nav-link dock" data-toggle="tab" href="#legend" role="tab" aria-controls="legend">
      <i class="fas fa-image"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Popup">
      <a id="popupcontent-tab" class="nav-link dock" data-toggle="tab" href="#popupcontent" role="tab" aria-controls="popupcontent">
      <i class="fas fa-comment-alt"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Impression PDF">
      <a id="pdf-print-tab" class="nav-link dock" data-toggle="tab" href="#pdf-print" role="tab" aria-controls="pdf-print">
      <i class="fas fa-file-pdf"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Données">
      <a id="attribute-btn" class="nav-link bottom-dock" aria-controls="attribute">
      <i class="fas fa-list-ul"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Géosignets">
      <a id="geobookmark-tab" class="nav-link dock" data-toggle="tab" href="#geobookmark" role="tab" aria-controls="geobookmark">
      <i class="fas fa-external-link-alt"></i>
      </a>
    </li>
  </ul>
</div>

<div id="dock" class="bg-white">
  <div id="dock-close"><button class="btn btn-sm">Fermer</button></div>
  <div id="mapBuilder" class="tab-content">
    <div class="tab-pane fade show active" id="layerswitcher" role="tabpanel" aria-labelledby="layerswitcher-tab">
      <table id="layerStore">
        <colgroup>
          <col>
          <col width="90px">
          <col>
          <col>
        </colgroup>
        <thead>
          <tr>
            <th>Couche</th>
            <th>Style</th>
            <th>Ajout</th>
            <th>Données</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="tab-pane fade" id="layerselection" role="tabpanel" aria-labelledby="layerselection-tab">
      <table id="layerSelected">
        <colgroup>
          <col>
          <col>
          <col>
          <col>
          <col>
          <col span="3">
        </colgroup>
        <thead>
          <tr>
            <th>Couche</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>Infos</th>
            <th class="hide">Style</th>
            <th class="hide">Opacité</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td class="changeOrder"></td>
            <td class="deleteLayerButton"></td>
            <td class="toggleVisibilityButton"></td>
            <td class="zoomToExtentButton"></td>
            <td class="toggleInfos"></td>
            <td class="layerSelectedStyles hide"></td>
            <td class="changeOpacityButton hide"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="tab-pane fade" id="legend" role="tabpanel" aria-labelledby="legend-tab">
    </div>
    <div class="tab-pane fade" id="popupcontent" role="tabpanel" aria-labelledby="popupcontent-tab">
    </div>
    <div class="tab-pane fade" id="pdf-print" role="tabpanel" aria-labelledby="pdf-print-tab">
      <input id="pdf-print-title" class="form-control" type="text" placeholder="Titre de la carte">
      <label>Format de la page</label>
      <select id="format-pdf-print" class="custom-select">
        <option value="a0">A0</option>
        <option value="a1">A1</option>
        <option value="a2">A2</option>
        <option value="a3">A3</option>
        <option value="a4" selected>A4</option>
        <option value="a5">A5</option>
      </select>
      <label>Resolution </label>
      <select id="resolution-pdf-print" class="custom-select">
        <option value="72">72 dpi</option>
        <option value="150">150 dpi</option>
        <option value="300">300 dpi</option>
      </select>
      <button id="pdf-print-btn" type="button" class="btn btn-sm btn-block">Imprimer</button>
    </div>
    <div class="tab-pane fade" id="geobookmark" role="tabpanel" aria-labelledby="geobookmark-tab">
      <input id="geobookmark-name" class="form-control" type="text" placeholder="Nom du signet">
      <button id="geobookmark-save-btn" type="button" class="btn btn-sm btn-block">Ajouter un géosignet</button>
      <div id="geobookmark-container">
        <table></table>
      </div>
    </div>
  </div>
</div>

<div id="bottom-dock">
  <ul id="attributeLayersTabs" class="nav nav-tabs" role="tablist"></ul>
  <div class="tab-content" id="attributeLayersContent"></div>
  <div id="bottom-dock-window-buttons">
    <button id="hideBottomDock" class="btn btn-sm" type="button" title="Fermer">Fermer</button>
  </div>
</div>

<div id="map" class="map"></div>

<footer class="footer">
  <p class="float-right">
    <img src="{$j_themepath.'css/img/logo_footer.png'}" alt=""/>
  </p>
</footer>

{if isset($googleAnalyticsID) && $googleAnalyticsID != ''}
<!-- Google Analytics -->
<script type="text/javascript">
{literal}
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
{/literal}
ga('create', '{$googleAnalyticsID}', 'auto');
ga('send', 'pageview');
</script>
<!-- End Google Analytics -->
{/if}
