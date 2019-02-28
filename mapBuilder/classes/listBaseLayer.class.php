<?php 

require_once (JELIX_LIB_PATH.'forms/jFormsDatasource.class.php');

class listBaseLayer implements jIFormsDatasource
{
  protected $formId = 0;

  protected $data = array();

  function __construct($id)
  {
    $this->formId = $id;

    $this->data = array(
      'osmMapnik' => 'OSM Mapnik',
      'osmStamenToner' => 'OSM Stamen Toner',
      'osmCyclemap' => 'OSM Cyclemap',
      'bingStreets' => 'Bing Streets',
      'bingSatellite' => 'Bing Satellite',
      'bingHybrid' => 'Bing Hybrid',
      'ignTerrain' => 'IGN Terrain',
      'ignStreets' => 'IGN Streets',
      'ignSatellite' => 'IGN Satellite',
      'ignCadastral' => 'IGN Cadastral',
      'emptyBaselayer' => jLocale::get('view~dictionnary.baselayer.empty.title')
    );
  }

  public function getData($form)
  {
    return ($this->data);
  }

  public function getLabel($key)
  {
    if(isset($this->data[$key]))
      return $this->data[$key];
    else
      return null;
  }

}
?>