<?php
namespace App\model;
use PDO;
class Connection{
    private $dbHost;
    private $dbUser;
    private $dbPassword; 
    private static $instance;
    private static $updateHandle;
    
    public static function getConnection(){
        $str = file_get_contents(__DIR__."/../db.json");
        $json = json_decode($str, true);
        $dbHost = $json['dbHost'];
        $dbUser = $json['dbUser'];
        $dbPassword = $json['dbPassword'];
        if(!isset(self::$instance)){
            try{
                self::$instance = new PDO($dbHost, $dbUser, $dbPassword);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }catch(PDOException $error){
                throw new PDOExcepction($error);
                print_r($error);
            }
            return self::$instance;
        }
    }

    public static function getLastID(){
        return self::$instance->lastInsertId();
    }
}