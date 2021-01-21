<?php
/**
 * Construct the mapcontext list.
 *
 * @author    3liz
 * @copyright 2019-2020 3liz
 *
 * @see      https://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class list_mapcontextZone extends jZone
{
    protected $_tplname = 'list_mapcontext';

    protected function _prepareTpl()
    {
        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;
        $loggedUser = false;

        // Get user mapcontexts
        if ($usr_login) {
            $loggedUser = true;

            $daomc = jDao::get('mapBuilder~mapcontext');
            $conditions = jDao::createConditions();
            $conditions->addCondition('login', '=', $usr_login);
            $mcOwnList = $daomc->findBy($conditions);
            $mcOwnCount = $daomc->countBy($conditions);

            $this->_tpl->assign('mcOwnList', $mcOwnList);
            $this->_tpl->assign('mcOwnCount', $mcOwnCount);
        }

        // Get public mapcontexts
        $daomc = jDao::get('mapBuilder~mapcontext');
        $conditions = jDao::createConditions();
        // Don't display logged user map context twice
        if ($usr_login) {
            $conditions->addCondition('login', '!=', $usr_login);
        }
        $conditions->addCondition('is_public', '=', true);
        $mcSharedList = $daomc->findBy($conditions);
        $mcSharedCount = $daomc->countBy($conditions);

        // Get html content
        $this->_tpl->assign('loggedUser', $loggedUser);
        $this->_tpl->assign('mcSharedList', $mcSharedList);
        $this->_tpl->assign('mcSharedCount', $mcSharedCount);
    }
}
