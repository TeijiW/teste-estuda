<?php
namespace App\model;
use PDO;
class Connection{
    const dbHost = "mysql:host=localhost;dbname=estuda;charset=utf8";
    const dbUser = "root";
    const dbPassword = "";
    private static $instance;
    private static $updateHandle;
    
    public static function getConnection(){
        if(!isset(self::$instance)){
            try{
                self::$instance = new PDO(self::dbHost, self::dbUser, self::dbPassword);
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