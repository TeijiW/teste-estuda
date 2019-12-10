<?php
namespace App\model;
// use PDO;
class Connection{
    const dbHost = "mysql:host=localhost;dbname=estuda;charset=utf8";
    const dbUser = "root";
    const dbPassword = "";
    private static $instance;
    
    public static function getConnection(){
        if(!isset(self::$instance)){
            try{
                self::$instance = new \PDO(self::dbHost, self::dbUser, self::dbPassword);
            }catch(PDOException $error){
                throw new PDOExcepction($error);
            }
            return self::$instance;
        }
    }
}