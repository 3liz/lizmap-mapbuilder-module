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
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="icon"></span>
              <span id="info-user-login" class="text">{$user->login|eschtml}</span>
              <span class="caret"></span>
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
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

<div id="content" class="container">
{jmessage_bootstrap}

<h2>Catalogue de couches</h2>
<table id="layerSelection">
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
<h2>Couches sélectionnées</h2>
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

<div id="map" class="map"></div>

<footer class="footer">
  <p class="pull-right">
    {image $j_themepath.'css/img/logo_footer.png'}
  </p>
</footer>
</div>

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
