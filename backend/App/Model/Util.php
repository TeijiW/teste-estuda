<?php
namespace App\Model;

class Util{
    function IsEmptyString($data){
        foreach ($data as $key => $value) { 
            if (trim($value) === '' || !isset($data->$key)){$value = null;}
            $data->$key = $value; 
        }
        unset($value);
        return $data;
    }
    function setObjectSchema($object, $keys){
        foreach($keys as $key => $value){
            if(!isset($object->{$value})){
                $object->{$value} = "";
            }
        }
        unset($value);
        return $object;
    }

    // function setAllKeysLow($object){
        
    //     $objectArray = array_change_key_case(array($object), CASE_LOWER);
    //     // print_r($objectArray);
    //     return json_encode($objectArray);
    //     // $newObject;
    //     // foreach($object as $key => $value){
    //     //     $newObject->{strtolower($key)};
    //     // }
    //     // return $newObject;
    // }
}
?>