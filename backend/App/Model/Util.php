<?php
namespace App\Model;

class Util
{
    public function IsEmptyString($data)
    {
        foreach ($data as $key => $value) {
            if (trim($value) === '' || !isset($data->$key)) {
                $value = null;
            }
            $data->$key = $value;
        }
        unset($value);
        return $data;
    }
    public function setObjectSchema($object, $keys)
    {
        foreach ($keys as $key => $value) {
            if (!isset($object->{$value})) {
                $object->{$value} = "";
            }
        }
        unset($value);
        return $object;
    }
}
