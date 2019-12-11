<?php
namespace App\Model;

class Router{
    private $parsedURL;
    private $requestMethod;
    private $routes = array();
    private $data;
    public function __construct(){
        $baseURL = $_SERVER['PHP_SELF'];
        $fullURL = $_SERVER['REQUEST_URI'];
        if ($baseURL[0] === "/") $baseURL = substr($baseURL, 1);
        $baseURLArray = explode("/", $baseURL);
        array_pop($baseURLArray);
        $baseURL = "/".implode("/", $baseURLArray);
        $json = file_get_contents('php://input');
        $this->parsedURL = str_replace($baseURL, "", $fullURL);
        if(substr($this->parsedURL, -1) === "/") $this->parsedURL = substr($this->parsedURL, 0, -1);
        $this->requestMethod = strtolower($_SERVER['REQUEST_METHOD']);
        $this->data = json_decode($json);
    }

    public function route($method, $url, $callback){
        $method = strtolower($method);
        array_push($this->routes, array("method"=>$method, "url"=>$url, "callback"=>$callback));
    }

    public function run(){
        foreach($this->routes as $route){
            if ($this->parsedURL === $route["url"] && $this->requestMethod === $route["method"]){
                try{
                    $route["callback"]($this->data);
                }catch(Exception $error){
                    http_response_code(500);
                    echo $error;
                }
            } 
        }
    }

}

?>