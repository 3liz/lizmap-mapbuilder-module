{jmessage}
{if $mcList && $mcCount > 0}
Géosignets
<table class="table table-sm">
  {foreach $mcList as $mc}
  <tr>
    <td>{$mc->name}</td>
    <td>
      {if $loggedUser}<button class="btn-mapcontext-del btn btn-mini" value="{$mc->id}" title=""><i class="fas fa-trash"></i></button>{/if}
      <button class="btn-mapcontext-run btn btn-mini" value="{$mc->id}" title=""><i class="fas fa-search-plus"></i></button>
    </td>
  </tr>
  {/foreach}
</table>
{/if}
