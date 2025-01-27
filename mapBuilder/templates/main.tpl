{meta_html csstheme 'css/main.css'}

<div id="header">
  <div id="logo">
  </div>
  <div id="title">
    <h1>{$repositoryLabel}</h1>
  </div>

  <nav id="headermenu" class="navbar">
    <div id="auth" class="navbar-inner">
      <ul class="nav justify-content-end">
        <li class="home nav-item">
          <a href="{jurl 'view~default:index'}" class="nav-link">
            <span class="icon"></span>
            <span class="text">{@view~default.repository.list.title@}</span>
          </a>
        </li>
        {if $isConnected}
          <li class="user nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
              <span class="icon"></span>
              <span class="text">{$user->login|eschtml}</span>
            </a>
            <div class="dropdown-menu dropdown-menu-right">
              {ifacl2 'auth.user.view'}
              <a class="dropdown-item" href="{jurl 'jcommunity~account:show', array('user'=>$user->login)}">{@master_admin~gui.header.your.account@}</a>
              {/ifacl2}
              <a class="dropdown-item" href="{jurl 'jcommunity~login:out'}?auth_url_return={jurl 'view~default:index'}">{@view~default.header.disconnect@}</a>
            </div>
          </li>
        {else}
          <li class="login nav-item">
            <a class="nav-link" href="{jurl 'jcommunity~login:index', array('auth_url_return'=>$auth_url_return)}">
              <span class="icon"></span>
              <span class="text">{@view~default.header.connect@}</span>
            </a>
          </li>
          {if isset($allowUserAccountRequests) and $allowUserAccountRequests == '1'}
          <li class="registered nav-item">
            <a class="nav-link" href="{jurl 'jcommunity~registration:index'}">
              <span class="icon"></span>
              <span class="text">{@view~default.header.createAccount@}</span>
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
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="{@view~map.layers@}">
      <a id="layerswitcher-tab" class="nav-link active dock" data-toggle="tab" href="#layerswitcher" role="tab" aria-controls="layerswitcher">
        <i class="fas fa-layer-group"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="{@mapBuilder~default.selector.layers.selection@}">
      <a id="layerselection-tab" class="nav-link dock" data-toggle="tab" href="#layerselection" role="tab" aria-controls="layerselection">
      <i class="fas fa-clipboard-list"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="{@view~map.legend@}">
      <a id="legend-tab" class="nav-link dock" data-toggle="tab" href="#legend" role="tab" aria-controls="legend">
      <i class="fas fa-image"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Popup">
      <a id="popup-display-tab" class="nav-link dock d-none" data-toggle="tab" href="#popup-display" role="tab" aria-controls="popup-display">
      <i class="fas fa-comment-alt"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="{@mapBuilder~pdfprint.pdfprint@}">
      <a id="pdf-print-tab" class="nav-link dock" data-toggle="tab" href="#pdf-print" role="tab" aria-controls="pdf-print">
      <i class="fas fa-file-pdf"></i>
      </a>
    </li>
    {if $attributeTableTool}
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="{@view~map.attributeLayers.toolbar.title@}">
      <a id="attribute-btn" class="nav-link bottom-dock" aria-controls="attribute">
      <i class="fas fa-list-ul"></i>
      </a>
    </li>
    {/if}
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="{@mapBuilder~mapcontext.mymaps@}">
      <a id="mapcontext-tab" class="nav-link dock" data-toggle="tab" href="#mapcontext" role="tab" aria-controls="mapcontext">
      <i class="fas fa-external-link-alt"></i>
      </a>
    </li>
  </ul>
</div>

<div id="dock" class="bg-white">
  <div id="dock-close"><button class="btn btn-sm btn-outline-dark">{@view~dictionnary.generic.btn.close.title@}</button></div>
  <div id="mapBuilder" class="tab-content">
    <div class="tab-pane fade show active" id="layerswitcher" role="tabpanel" aria-labelledby="layerswitcher-tab">
      <div class="dock-tab-title">{@view~map.layers@}
        <span id="layers-loading"></span>
      </div>
      <div id="layer-store-holder">

      </div>
      <div id="base-layer">
        {@view~map.baselayermenu.title@}
        <select id="baseLayerSelect" class="custom-select custom-select-sm">
        {foreach $baseLayer as $cle => $valeur}
          <option {if $baseLayerDefault == $cle}selected{/if} value="{$cle}">{$valeur}</option>
        {/foreach}
        </select>
      </div>
    </div>
    <div class="tab-pane fade" id="layerselection" role="tabpanel" aria-labelledby="layerselection-tab">
      <div class="dock-tab-title">{@mapBuilder~default.selector.layers.selection@}</div>
      <div id="layer-selected-holder">
      </div>
    </div>
    <div class="tab-pane fade" id="legend" role="tabpanel" aria-labelledby="legend-tab">
      <div class="dock-tab-title">{@view~map.legend@}</div>
      <div id="legend-content"></div>
    </div>
    <div class="tab-pane fade" id="popup-display" role="tabpanel" aria-labelledby="popup-display-tab">
      <div class="dock-tab-title">Popup</div>
      <div id="popup-content"></div>
    </div>
    <div class="tab-pane fade" id="pdf-print" role="tabpanel" aria-labelledby="pdf-print-tab">
      <div class="dock-tab-title">{@mapBuilder~pdfprint.pdfprint@}</div>
      <input id="pdf-print-title" class="form-control" type="text" placeholder="{@mapBuilder~pdfprint.title@}">
      <select id="format-pdf-print" class="custom-select" data-toggle="tooltip" title="{@mapBuilder~pdfprint.format@}">
        <option value="a0">A0</option>
        <option value="a1">A1</option>
        <option value="a2">A2</option>
        <option value="a3">A3</option>
        <option value="a4" selected>A4</option>
        <option value="a5">A5</option>
      </select>
      <select id="resolution-pdf-print" class="custom-select" data-toggle="tooltip" title="{@mapBuilder~pdfprint.resolution@}" disabled>
        <option value="90">90 dpi</option>
      </select>
      <button id="pdf-print-btn" type="button" class="btn btn-sm btn-block btn-outline-dark">{@view~map.print.toolbar.title@}</button>
    </div>
    <div class="tab-pane fade" id="mapcontext" role="tabpanel" aria-labelledby="mapcontext-tab">
      <div class="dock-tab-title">{@mapBuilder~mapcontext.mymaps@}</div>
      {if $isConnected}
      <input id="mapcontext-name" class="form-control" type="text" placeholder="{@mapBuilder~mapcontext.mymaps.name@}">
      {ifacl2 "mapBuilder.mapcontext.public.manage"}
      <div class="form-check form-control-sm">
        <input class="form-check-input" type="checkbox" value="" id="publicmapcontext">
        <label class="form-check-label" for="publicmapcontext">
          {@mapBuilder~mapcontext.public@}
        </label>
      </div>
      {/ifacl2}
      <button id="mapcontext-add-btn" type="button" class="btn btn-sm btn-block btn-outline-dark">{@mapBuilder~mapcontext.mymaps.add@}</button>
      {/if}
      <div id="mapcontext-container">
        {$LIST_MAPCONTEXT}
      </div>
    </div>
  </div>
</div>

<div id="bottom-dock">
  <ul id="attribute-layers-tabs" class="nav nav-tabs" role="tablist">
    <li class="nav-item">
        <a class="nav-link disabled text-light" href="#" tabindex="-1" aria-disabled="true"><strong>{@view~map.attributeLayers.toolbar.title@}</strong></a>
      </li>
  </ul>
  <div class="tab-content" id="attribute-layers-content"></div>
  <div id="bottom-dock-window-buttons">
    <button id="hideBottomDock" class="btn btn-sm btn-outline-light" type="button">{@view~dictionnary.generic.btn.close.title@}</button>
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
