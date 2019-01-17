<?php
/**
* Construct the mapcontext list.
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2019 3liz
* @link      https://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

class list_mapcontextZone extends jZone {

	protected $_tplname='list_mapcontext';

	protected function _prepareTpl(){
	    // Get user
	    $juser = jAuth::getUserSession();
	    $usr_login = $juser->login;
	    $loggedUser = false;

	    if($usr_login){
	    	$loggedUser = true;
	    }

	    // Get user mapcontexts
	    $daomc = jDao::get('mapBuilder~mapcontext');
	    $conditions = jDao::createConditions();
	    // Get mapcontexts saved by logged user or public ones
	    $conditions->startGroup('OR');
	        $conditions->addCondition('login','=',$usr_login);
	        $conditions->addCondition('is_public','=',true);
	    $conditions->endGroup();
	    $mcList = $daomc->findBy($conditions);
	    $mcCount = $daomc->countBy($conditions);

	    // Get html content
	    $this->_tpl->assign('loggedUser',$loggedUser);
	    $this->_tpl->assign('mcList',$mcList);
	    $this->_tpl->assign('mcCount',$mcCount);
	}
}
