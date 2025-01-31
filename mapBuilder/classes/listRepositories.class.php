<?php

class listRepositories implements jIFormsDatasource
{
    protected $formId = 0;

    protected $data = array();

    public function __construct($id)
    {
        $this->formId = $id;

        $repositories = array();

        foreach (lizmap::getRepositoryList() as $repositoryName) {
            $repository = lizmap::getRepository($repositoryName);
            if (jAcl2::check('lizmap.repositories.view', $repository->getKey())) {
                $repositories[$repository->getKey()] = $repository->getData('label');
            }
        }

        $this->data = $repositories;
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
