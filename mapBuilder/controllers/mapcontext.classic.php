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

        $rep = $this->getResponse('text');

        // Make sure that it is a POST request.
        if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
            throw new Exception('Request method must be POST!');
        }

        // Save in database
        $rep->content = 'ok';

        // Check name
        $name = filter_var( $this->param('name'), FILTER_SANITIZE_STRING );
        if( empty($name) ){
            $rep->content = 'nok';
        }
        if( $rep->content = 'ok' ){
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
            }
        }

        return $rep;
    }
}
