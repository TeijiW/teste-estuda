<?php
require_once "vendor/autoload.php";


if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
}


use App\Model\Connection;
use App\Model\Alunos;
use App\Model\Turmas;
use App\Model\Escolas;
use App\Model\Router;

$connection = new Connection();
$alunos = new Alunos();
$turmas = new Turmas();
$escolas = new Escolas();
$router = new Router();


$router->route("get", "/alunos", function ($data) {
    $alunos = new Alunos();
    $alunos->read($data);
});

$router->route("post", "/alunos", function ($data) {
    $alunos = new Alunos();
    $alunos->create($data);
});

$router->route("put", "/alunos", function ($data) {
    $alunos = new Alunos();
    $alunos->update($data);
});

$router->route("delete", "/alunos", function ($data) {
    $alunos = new Alunos();
    $alunos->delete($data);
});

$router->route("get", "/alunos/getLastID", function (){
    $alunos = new Alunos();
    $alunos->getLastID();
});

$router->route("get", "/turmas", function ($data) {
    $turmas = new Turmas();
    $turmas->read($data);
});

$router->route("post", "/turmas", function ($data) {
    $turmas = new Turmas();
    $turmas->create($data);
});

$router->route("put", "/turmas", function ($data) {
    $turmas = new Turmas();
    $turmas->update($data);
});

$router->route("delete", "/turmas", function ($data) {
    $turmas = new Turmas();
    $turmas->delete($data);
});

$router->route("get", "/escolas", function ($data) {
    $escolas = new Escolas();
    $escolas->read($data);
});

$router->route("post", "/escolas", function ($data) {
    $escolas = new Escolas();
    $escolas->create($data);
});

$router->route("put", "/escolas", function ($data) {
    $escolas = new Escolas();
    $escolas->update($data);
});

$router->route("delete", "/escolas", function ($data) {
    $escolas = new Escolas();
    $escolas->delete($data);
});

$router->route("post", "/escolas/api", function () {
    $escolas = new Escolas();
    $escolas->updateWithAPI();
});

$router->run();
?>