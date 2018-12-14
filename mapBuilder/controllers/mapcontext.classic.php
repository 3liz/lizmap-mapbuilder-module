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
    /**
    *
    */
    function save() {

        $rep = $this->getResponse('text');

        // Make sure that it is a POST request.
        if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
            throw new Exception('Request method must be POST!');
        }

        // Make sure that the content type of the POST request has been set to application/json
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        if(strcasecmp($contentType, 'application/json') != 0){
            throw new Exception('Content type must be: application/json');
        }

        $content = json_decode($this->param('__httpbody'), true);
         
        // If json_decode failed, the JSON is invalid.
        if(!is_array($content)){
            throw new Exception('Received content contained invalid JSON!');
        }

        $_SESSION['mapcontext'] = $content;

        $rep->content = 'ok';
        return $rep;
    }
}
