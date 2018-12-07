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

<div id="mapmenu" style="">
  <ul class="nav nav-tabs flex-column">
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Couches">
      <a id="layerswitcher-tab" class="nav-link active" data-toggle="tab" href="#layerswitcher" role="tab" aria-controls="layerswitcher">
        <i class="fas fa-layer-group"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Couches sélectionnées">
      <a id="layerselection-tab" class="nav-link" data-toggle="tab" href="#layerselection" role="tab" aria-controls="layerselection">
      <i class="fas fa-clipboard-list"></i>
      </a>
    </li>
    <li class="nav-item" data-toggle="tooltip" data-placement="right" title="Popup">
      <a id="popupcontent-tab" class="nav-link" data-toggle="tab" href="#popupcontent" role="tab" aria-controls="popupcontent">
      <i class="fas fa-comment-alt"></i>
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
                <col width="70px">
                <col>
            </colgroup>
            <thead>
                <tr>
                    <th>Couche</th>
                    <th>Style</th>
                    <th>Ajout</th>
                </tr>
            </thead>
            <!-- Otionally define a row that serves as template, when new nodes are created: -->
            <tbody>
                <tr>
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
                <th>Infos</th>
                <th class="hide">Style</th>
                <th class="hide">Légende</th>
                <th class="hide">Opacité</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td class="changeOrder"></td>
                <td class="deleteLayerButton"></td>
                <td class="zoomToExtentButton"></td>
                <td class="toggleInfos"></td>
                <td class="layerSelectedStyles hide"></td>
                <td class="toggleLegend hide"></td>
                <td class="changeOpacityButton hide"></td>
              </tr>
            </tbody>
        </table>
      </div>
      <div class="tab-pane fade" id="popupcontent" role="tabpanel" aria-labelledby="popupcontent-tab">
      </div>
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
