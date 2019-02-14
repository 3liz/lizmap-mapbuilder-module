<?php
/**
* mapBuilder administration
* @package   lizmap
* @subpackage mapBuilderAdmin
* @author    3liz
* @copyright 2019 3liz
* @link      https://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class configCtrl extends jController {

  /**
  * mapBuilder administration
  */
  function index() {
    $rep = $this->getResponse('html');

    return $rep;
  }
}
