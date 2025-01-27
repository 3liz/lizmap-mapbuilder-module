<?php

class listBaseLayer implements jIFormsDatasource
{
    protected $formId = 0;

    protected $data = [];

    public function __construct($id)
    {
        $this->formId = $id;

        $this->data = [
            'osmMapnik' => 'OSM Mapnik',
            'osmStadiaMapsToner' => 'OSM StadiaMaps Toner',
            'bingStreets' => 'Bing Streets',
            'bingSatellite' => 'Bing Satellite',
            'bingHybrid' => 'Bing Hybrid',
            'ignStreets' => 'IGN Streets',
            'ignSatellite' => 'IGN Satellite',
            'ignCadastral' => 'IGN Cadastral',
            'emptyBaselayer' => jLocale::get('view~dictionnary.baselayer.empty.title'),
        ];
    }

    public function getData($form)
    {
        return $this->data;
    }

    public function getLabel($key)
    {
        if (isset($this->data[$key])) {
            return $this->data[$key];
        }

        return null;
    }
}
