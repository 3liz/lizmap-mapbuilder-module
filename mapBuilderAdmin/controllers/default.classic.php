<?php

/**
 * @author    your name
 * @copyright 2018-2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class defaultCtrl extends jController
{
    public function index()
    {
        return $this->getResponse('html');
    }
}
