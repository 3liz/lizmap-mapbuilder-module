{jmessage}
{if $mcOwnList && $mcOwnCount > 0}
<div>
	Personnel
	<table class="table table-sm">
	  {foreach $mcOwnList as $mc}
	  <tr>
	    <td>{$mc->name}</td>
	    <td>
	      {if $loggedUser}<button class="btn-mapcontext-del btn btn-mini" value="{$mc->id}" title=""><i class="fas fa-trash"></i></button>{/if}
	      <button class="btn-mapcontext-run btn btn-mini" value="{$mc->id}" title=""><i class="fas fa-search-plus"></i></button>
	    </td>
	    <td>{if $mc->is_public}<i class="fas fa-share" data-toggle="tooltip" data-placement="right" title="Public"></i>{/if}</td>
	  </tr>
	  {/foreach}
	</table>
</div>
{/if}
{if $mcSharedList && $mcSharedCount > 0}
<div>
	{if $loggedUser}Public{/if}
	<table class="table table-sm">
	  {foreach $mcSharedList as $mc}
	  <tr>
	    <td>{$mc->name}</td>
	    <td>
	      <button class="btn-mapcontext-run btn btn-mini" value="{$mc->id}" title=""><i class="fas fa-search-plus"></i></button>
	    </td>
	  </tr>
	  {/foreach}
	</table>
</div>
{/if}