{jmessage}
{if $mcList && $mcCount > 0}
Géosignets
<table class="table table-sm">
  {foreach $mcList as $mc}
  <tr>
    <td>{$mc->name}</td>
    <td>
      <button class="btn-mapcontext-del btn btn-mini" value="{$mc->id}" title=""><i class="fas fa-trash"></i></button>
      <button class="btn-mapcontext-run btn btn-mini" value="{$mc->id}" title=""><i class="fas fa-search-plus"></i></button>
    </td>
  </tr>
  {/foreach}
</table>
{/if}
