<?php
/**
* mapBuilder administration
* @package   lizmap
* @subpackage mapBuilderAdmin
* @author    3liz
* @copyright 2019-2020 3liz
* @link      https://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class configCtrl extends jController {

  // Configure access via jacl2 rights management
  public $pluginParams = array(
    '*' => array( 'jacl2.right'=>'mapBuilder.access'),
    'modify' => array( 'jacl2.right'=>'lizmap.admin.services.update'),
    'edit' => array( 'jacl2.right'=>'lizmap.admin.services.update'),
    'save' => array( 'jacl2.right'=>'lizmap.admin.services.update'),
    'validate' => array( 'jacl2.right'=>'lizmap.admin.services.update')
  );

  private $ini = null;

  function __construct( $request ) {
    parent::__construct( $request );
        $monfichier = jApp::varconfigPath('mapBuilder.ini.php');
        $this->ini = new \Jelix\IniFile\IniModifier($monfichier);
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
        if( $ctrl->ref == 'baseLayer' ){
          $val = explode(',', $val);
        }
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
          if( $ctrl->ref == 'baseLayer' ){
            $val = explode(',', $val);
          }
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
    $form = jForms::get('mapBuilderAdmin~config');

    // token
    $token = $this->param('__JFORMS_TOKEN__');
    if( !$token ){
      // redirection vers la page d'erreur
      $rep= $this->getResponse("redirect");
      $rep->action="mapBuilderAdmin~config:index";
      return $rep;
    }

    // If the form is not defined, redirection
    if( !$form ){
      $rep= $this->getResponse("redirect");
      $rep->action="mapBuilderAdmin~config:index";
      return $rep;
    }

    // Set the other form data from the request data
    $form->initFromRequest();

    // Check the form
    if ( !$form->check() ) {
      // Errors : redirection to the display action
      $rep = $this->getResponse('redirect');
      $rep->action='mapBuilderAdmin~config:edit';
      $rep->params['errors']= "1";
      return $rep;
    }

    // Save the data
    foreach ( $form->getControls() as $ctrl ) {
      if ( $ctrl->type != 'submit' ){
        $val = $form->getData( $ctrl->ref );
        if( $ctrl->ref == 'baseLayer' ){
          $val = implode(',', $val);
        }
        $this->ini->setValue( $ctrl->ref, $val);
      }
    }
    $this->ini->save();

    // Redirect to the validation page
    $rep= $this->getResponse("redirect");
    $rep->action="mapBuilderAdmin~config:validate";

    return $rep;
  }

  /**
  * Validate the data for the config : destroy form and redirect.
  * @return Redirect to the index.
  */
  function validate(){

    // Destroy the form
    if($form = jForms::get('mapBuilderAdmin~config')){
      jForms::destroy('mapBuilderAdmin~config');
    }

    // Redirect to the index
    $rep= $this->getResponse("redirect");
    $rep->action="mapBuilderAdmin~config:index";

    return $rep;
  }
}
