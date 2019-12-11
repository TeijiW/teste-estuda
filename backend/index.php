<?php
require_once "vendor/autoload.php";
use App\Model\Connection;
use App\Model\Alunos;
use App\Model\Turmas;
use App\Model\Escolas;

$connection = new Connection();
$json = file_get_contents('php://input');
$data = json_decode($json);
$alunos = new Alunos();
$turmas = new Turmas();
$escolas = new Escolas();
// $alunos->read($data);
// $alunos->create($data);
// $alunos->update($data);
// $alunos->delete($data);
// $turmas->read($data);
// $turmas->create($data);
// $turmas->update($data);
// $turmas->delete($data);
// $escolas->read($data);
$escolas->updateWithAPI();
?>