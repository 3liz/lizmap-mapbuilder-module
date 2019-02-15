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

  private $ini = null;

  function __construct( $request ) {
      parent::__construct( $request );
      $monfichier = jApp::configPath('mapBuilder.ini.php');
      $this->ini = new jIniFileModifier ($monfichier);
  }

  /**
  * mapBuilder administration
  */
  function index() {
    $rep = $this->getResponse('html');

    // Create the form
    $form = jForms::create('mapBuilderAdmin~config');

    // Set form data values
    foreach ( $form->getControls() as $ctrl ) {
      if ( $ctrl->type != 'submit' ){
        $val = $this->ini->getValue( $ctrl->ref);
        $form->setData( $ctrl->ref, $val );
      }
    }

    $tpl = new jTpl();
    $tpl->assign( 'form', $form );
    $rep->body->assign('MAIN', $tpl->fetch('config_view'));

    return $rep;
  }

  /**
   * Modification of the configuration.
   * @return Redirect to the form display action.
   */
  public function modify(){
    // Create the form
    $form = jForms::create('mapBuilderAdmin~config');

    // Set form data values
    foreach ( $form->getControls() as $ctrl ) {
        if ( $ctrl->type != 'submit' ){
            $val = $this->ini->getValue( $ctrl->ref);
            $form->setData( $ctrl->ref, $val );
        }
    }

    // redirect to the form display action
    $rep= $this->getResponse("redirect");
    $rep->action="mapBuilderAdmin~config:edit";
    return $rep;
  }

    /**
     * Display the form to modify the config.
     * @return Display the form.
     */
    public function edit(){
      $rep = $this->getResponse('html');

      // Get the form
      $form = jForms::get('mapBuilderAdmin~config');

      if ( !$form ) {
          // redirect to default page
          jMessage::add('error in edit');
          $rep =  $this->getResponse('redirect');
          $rep->action ='mapBuilderAdmin~config:index';
          return $rep;
      }
      // Display form
      $tpl = new jTpl();
      $tpl->assign('form', $form);
      $rep->body->assign('MAIN', $tpl->fetch('mapBuilderAdmin~config_edit'));
      return $rep;
  }

    /**
  * Save the data for the config.
  * @return Redirect to the index.
  */
  function save(){
  }
}
