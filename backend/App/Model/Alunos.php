<?php 
namespace App\Model;
use App\Model\Util;
Class Alunos{
    // private $id, $nome, $telefone, $email, $nascimento, $genero;
    private $table = "alunos";
    private $keys = ["nome", "telefone", "email", "nascimento", "genero"];

    public function read($data) {
        $paramaters = isset($data->id) ? " where id=$data->id limit 1" : "";
        $sql = "select id, nome, telefone, email, nascimento, genero from $this->table".$paramaters;
        $stmt = Connection::getConnection()->prepare($sql);
        $stmt->execute();
        if ($stmt->rowCount() > 0){
            http_response_code(200);
            $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            // print("<pre>".print_r($result,true)."</pre>");
            foreach ($result as $index => $item) { 
                $nascimento =  $item['nascimento'];
                if ($nascimento !== "" && $nascimento !== null){
                    $dateArray = explode("-", $nascimento);
                    $dateArray = array ($dateArray[2], $dateArray[1], $dateArray[0]);
                    $dateArray = implode("/", $dateArray);
                    $result[$index]['nascimento'] = $dateArray;
                }
            }
                echo json_encode($result, JSON_UNESCAPED_SLASHES);
        }else{
            http_response_code(204);
        }
    }

    public function create($data) {
        $util = new Util();
        $data = $util->setObjectSchema($data, $this->keys);
        $data = $util->isEmptyString($data);
        if (isset($data->nascimento)) {
            $dateArray = explode("/", $data->nascimento);
            $data->nascimento = "$dateArray[2]-$dateArray[1]-$dateArray[0]";
        }
        if (isset($data->nome) && isset($data->email)){
            $sql = "insert into $this->table (nome, telefone, email, nascimento, genero) values (?, ?, ?, ?, ?)";
            $stmt = Connection::getConnection()->prepare($sql);
            foreach($this->keys as $index => $value){
                $stmt->bindValue($index+1, $data->{$value});
            }
            $stmt->execute() ? http_response_code(200) : http_response_code(400);
            $lastID = Connection::getLastID();
            $lastID = array("id"=>$lastID);
            echo json_encode($lastID);
        }else{
            http_response_code(400);
        }
    }

    public function update($data) {
        $util = new Util();
        $data = $util->isEmptyString($data);
        if (isset($data->id)){
            $sql = "update $this->table set ";
            $index = 0;
            $dataLength = count((array)$data);
            foreach ($data as $key => $value) { 
                if ($key === "nascimento" && $value !== null && $value !== ""){
                    $dateArray = explode("/", $value);
                    $data->nascimento = "$dateArray[2]-$dateArray[1]-$dateArray[0]";
                    $value = "$dateArray[2]-$dateArray[1]-$dateArray[0]";
                }
                $index += 1;
                if ($key === "id") continue;
                if ($value === null || $value === "") {
                    $index -= 1;
                    continue;
                }
                if (gettype($value) === "string"){
                    $sql .= "$key = '$value'";
                }else{
                    $sql .= "$key = $value";
                }
                if($index !== $dataLength){
                    $sql .= ", ";
                }
            }
            if (substr($sql, -2) === ", "){
                $sql = substr($sql, 0, -2);
            }
            $sql .= " where id = $data->id;";
            $stmt = Connection::getConnection()->prepare($sql);
            if ($stmt->execute()){
                http_response_code(204);
            }else{
                http_response_code(500);
            }
        }else{
            http_response_code(400);
        }
    }

    public function delete($data) {
        if(isset($data->id)){
            $sql = "delete from $this->table where id = $data->id;";
            $stmt = Connection::getConnection()->prepare($sql);
            $stmt->execute() ? http_response_code(204) : http_response_code(400);
        }else{
            http_response_code(400);
        }
    }

    public function saveTurmas($data){
        $sql = "delete from alunos_turmas where id_aluno = $data->id_aluno;";
        $sql .= "replace into alunos_turmas (id_aluno, id_turma) values ";
        $turmasLength = count($data->turmas);
        $index = 0;
        foreach($data->turmas as $turma){
            $index += 1;
            $sql .= "($data->id_aluno, $turma->id)";
            if($index !== $turmasLength){
                $sql .= " ,";
            }else{
                $sql .= ";";
            }
        }
        $stmt = Connection::getConnection()->prepare($sql);
        $stmt->execute() ? http_response_code(204) : http_response_code(500);
    }

    public function getTurmas($data){
        if (isset($data->id)){
            $sql = "select turmas.id, turmas.nivel, turmas.turno, turmas.ano, turmas.serie, turmas.id_escola from turmas, alunos, alunos_turmas where turmas.id = alunos_turmas.id_turma and alunos_turmas.id_aluno = $data->id and alunos.id = $data->id";
            $stmt = Connection::getConnection()->prepare($sql);
            $stmt->execute();
            if ($stmt->rowCount() > 0){
                $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                echo json_encode($result, JSON_UNESCAPED_SLASHES);
            }else{
                http_response_code(204);
            }
        }else{
            http_response_code(400);
        }
    }
}

?>