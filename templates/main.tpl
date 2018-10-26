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
            <span class="text">{@view~default.header.connect@}</span>
          </a>
        </li>
          {if isset($allowUserAccountRequests) and $allowUserAccountRequests == '1'}
          <li class="registered">
            <a href="{jurl 'jcommunity~registration:index'}">
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

<div id="mapBuilder" class="bg-white">
  <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
    <li class="nav-item">
      <a class="nav-link active" id="pills-home-tab" data-toggle="pill" href="#pills-home" role="tab" aria-controls="pills-home" aria-selected="true">Catalogue de couches</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">Couches sélectionnées</a>
    </li>
  </ul>
  <div class="tab-content" id="pills-tabContent">
    <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
      <table id="layerStore">
          <colgroup>
              <col>
              </col>
              <col width="70px">
              </col>
              <col>
              </col>
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
    <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
      <table id="layerSelected">
          <colgroup>
              <col>
              </col>
              <col width="70px">
              </col>
              <col>
              </col>
          </colgroup>
          <thead>
              <tr>
                  <th>Couche</th>
                  <th>Style</th>
                  <th>Suppression</th>
              </tr>
          </thead>
          <!-- Otionally define a row that serves as template, when new nodes are created: -->
          <tbody>
              <tr>
                  <td></td>
                  <td class="layerSelectedStyles"></td>
                  <td></td>
              </tr>
          </tbody>
      </table>
    </div>
  </div>
</div>

<div id="map" class="map"></div>

<footer class="footer">
  <p class="pull-right">
    {image $j_themepath.'css/img/logo_footer.png'}
  </p>
</footer>

{if $googleAnalyticsID && $googleAnalyticsID != ''}
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
