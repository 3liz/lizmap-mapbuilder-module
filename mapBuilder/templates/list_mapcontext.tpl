{jmessage}
{if $mcOwnList && $mcOwnCount > 0}
<div>
	<strong>{@mapBuilder~mapcontext.private@}</strong>
	<table class="table table-sm">
	  {foreach $mcOwnList as $mc}
	  <tr>
	    <td>{$mc->name}</td>
	    <td>
	      {if $loggedUser}
	      	<button class="btn-mapcontext-del btn btn-mini" value="{$mc->id}" data-toggle="tooltip" title="{@view~map.permalink.geobookmark.button.del@}"><i class="fas fa-trash"></i></button>
	      {/if}
	      <button class="btn-mapcontext-run btn btn-mini" value="{$mc->id}" data-toggle="tooltip" title="{@view~map.permalink.geobookmark.button.run@}"><i class="fas fa-search-plus"></i></button>
	    </td>
	    <td>{if $mc->is_public}<i class="fas fa-share" data-toggle="tooltip" title="{@mapBuilder~mapcontext.public@}"></i>{/if}</td>
	  </tr>
	  {/foreach}
	</table>
</div>
{/if}
{if $mcSharedList && $mcSharedCount > 0}
<div>
	{if $loggedUser}<strong>{@mapBuilder~mapcontext.public@}</strong>{/if}
	<table class="table table-sm">
	  {foreach $mcSharedList as $mc}
	  <tr>
	    <td>{$mc->name}</td>
	    <td>
	      <button class="btn-mapcontext-run btn btn-mini" value="{$mc->id}" data-toggle="tooltip" title="{@view~map.permalink.geobookmark.button.run@}"><i class="fas fa-search-plus"></i></button>
	    </td>
	  </tr>
	  {/foreach}
	</table>
</div>
{/if}