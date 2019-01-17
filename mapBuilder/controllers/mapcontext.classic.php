<?php
/**
* @package   lizmap
* @subpackage mapBuilder
* @author    3liz
* @copyright 2011-2018 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/

class mapcontextCtrl extends jController {
    /*
     * Add a mapcontext
     *
     */
    function add() {

        $rep = $this->getResponse('htmlfragment');

        // Make sure that it is a POST request.
        if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
            throw new Exception('Request method must be POST!');
        }

        // Check name
        $name = filter_var( $this->param('name'), FILTER_SANITIZE_STRING );
        if( empty($name) ){
            jMessage::add('Please give a name', 'error');
        }else{
            $dao = jDao::get('mapBuilder~mapcontext');
            $record = jDao::createRecord('mapBuilder~mapcontext');

            $record->login = jAuth::getUserSession()->login;
            $record->name = $name;
            $record->is_public = $this->param('is_public');
            $record->mapcontext = $this->param('mapcontext');
            
            // Save the new mapcontext
            $id = Null;
            try{
                $id = $dao->insert($record);
            }catch(Exception $e){
                jLog::log( 'Error while inserting the mapcontext');
                jLog::log( $e->getMessage());
                jMessage::add( 'Error while inserting the mapcontext', 'error' );
            }
        }

        $rep->addContent(jZone::get('list_mapcontext'));
        return $rep;
    }

    /*
     * Delete mapcontext by id
     *
     */
    function delete(){

        $rep = $this->getResponse('htmlfragment');

        // Make sure that it is a POST request.
        if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
            throw new Exception('Request method must be POST!');
        }

        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;

        // mapcontext id
        $id = $this->intParam('id');

        // Conditions to get the mapcontext
        $daomc = jDao::get('mapBuilder~mapcontext');
        $conditions = jDao::createConditions();
        $conditions->addCondition('login','=',$usr_login);
        $conditions->addCondition('id','=',$id);
        $mcCount = $daomc->countBy($conditions);

        if( $mcCount != 1 ){
            jMessage::add('You can\'t delete this map context or it doesn\'t exist', 'error');
        }else{
            try{
                $daomc->delete($id);
            }catch(Exception $e){
                jLog::log( 'Error while deleting the mapcontext');
                jLog::log( $e->getMessage());
                jMessage::add( 'Error while deleting the mapcontext', 'error' );
            }
        }

        $rep->addContent(jZone::get('list_mapcontext'));

        return $rep;
    }

    /*
     * Get mapcontext by id
     *
     */
    function get(){

        // Get user
        $juser = jAuth::getUserSession();
        $usr_login = $juser->login;

        // Bookmark id
        $id = $this->intParam('id');

        // Conditions to get the bookmark
        $daomc = jDao::get('mapBuilder~mapcontext');
        $conditions = jDao::createConditions();
        $conditions->addCondition('id','=',$id);
        // Get map context if saved by logged user or public ones
        $conditions->startGroup('OR');
            $conditions->addCondition('login','=',$usr_login);
            $conditions->addCondition('is_public','=',true);
        $conditions->endGroup();
        $mcCount = $daomc->countBy($conditions);

        if( $mcCount != 1 ){
            jMessage::add('You don\'t have access to this map context or it doesn\'t exist' , 'error');
            return $this->error();
        }else{
            $mcList = $daomc->findBy($conditions);
            $mcParams = array();
            foreach( $mcList as $mc ){
                $mcParams = json_decode(htmlspecialchars_decode($mc->mapcontext,ENT_QUOTES ));
            }
            $rep = $this->getResponse('json');
            $rep->data = $mcParams;
            return $rep;
        }
    }
    
}
