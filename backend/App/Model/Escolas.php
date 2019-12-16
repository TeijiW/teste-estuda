<?php
namespace App\Model;

use App\Model\Util;

class Escolas
{
    private $table = "escolas";
    private $keys = ["nome", "endereco", "data", "situacao"];
    
    public function updateWithAPI()
    {
        $url = 'http://educacao.dadosabertosbr.com/api/escolas/buscaavancada?nome=master&estado=MT';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $url);
        $result=curl_exec($ch);
        curl_close($ch);
        $parsed = json_decode($result, true);
        $jsonArray = json_decode(json_encode($parsed[1]));
        $jsonArrayLength = count((array)$jsonArray);
        $sql = "replace into $this->table (id, nome, data, situacao) values ";
        foreach ($jsonArray as $index => $json) {
            $id = $json->cod;
            $nome = $json->nome;
            $data = date("Y-m-d");
            $situacao = $json->situacaoFuncionamentoTxt;
            $sql .= "($id, '$nome', '$data', '$situacao')";
            if ($index+1 !== $jsonArrayLength) {
                $sql .= " ,";
            }
        }
        $stmt = Connection::getConnection()->prepare($sql);
        $stmt->execute() ? http_response_code(204) : http_response_code(500);
    }

    public function read($data)
    {
        $paramaters = isset($data->id) ? " where id=$data->id limit 1;" : ";";
        $sql = "select id, nome, endereco, data, situacao from $this->table".$paramaters;
        $stmt = Connection::getConnection()->prepare($sql);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($result as $index => $item) {
                $data =  $item['data'];
                if ($data !== "" && $data !== null) {
                    $dateArray = explode("-", $data);
                    $dateArray = array($dateArray[2], $dateArray[1], $dateArray[0]);
                    $dateArray = implode("/", $dateArray);
                    $result[$index]['data'] = $dateArray;
                }
            }
            echo json_encode($result, JSON_UNESCAPED_SLASHES);
        } else {
            http_response_code(204);
        }
    }

    // Ajustar
    public function create($data)
    {
        $keysForCreate = ["nome", "endereco", "data", "situacao"];
        $util = new Util();
        $data->data = date("Y-m-d");
        $data = $util->setObjectSchema($data, $keysForCreate);
        $data = $util->isEmptyString($data);
        $sql = "insert into $this->table (nome, endereco, data, situacao ) values (?, ?, ?, ?)";
        $stmt = Connection::getConnection()->prepare($sql);
        foreach ($keysForCreate as $index => $value) {
            $stmt->bindValue($index+1, $data->{$value});
        }
        $stmt->execute() ? http_response_code(200) : http_response_code(400);
        $lastID = Connection::getLastID();
        $lastID = array("id"=>$lastID);
        echo json_encode($lastID);
    }

    public function update($data)
    {
        $data->data = date("Y-m-d");
        $util = new Util();
        $data = $util->isEmptyString($data);
        if (isset($data->id)) {
            $sql = "update $this->table set ";
            $index = 0;
            $dataLength = count((array)$data);
            $data->data = date("Y-m-d");
            foreach ($data as $key => $value) {
                $index++;
                if ($key === "id") {
                    continue;
                }
                if ($value === null || $value === "") {
                    $index -= 1;
                    continue;
                }
                if (gettype($value) === "string") {
                    $sql .= "$key = '$value'";
                } else {
                    $sql .= "$key = $value";
                }
                if ($index !== $dataLength) {
                    $sql .= ", ";
                }
            }
            if (substr($sql, -2) === ", ") {
                $sql = substr($sql, 0, -2);
            }
            $sql .= " where id = $data->id;";
            $stmt = Connection::getConnection()->prepare($sql);
            if ($stmt->execute()) {
                http_response_code(204);
            } else {
                var_dump($stmt->errorInfo());
                http_response_code(500);
            }
        } else {
            http_response_code(400);
        }
    }

    public function delete($data)
    {
        if (isset($data->id)) {
            $sql = "delete from $this->table where id = $data->id;";
            $stmt = Connection::getConnection()->prepare($sql);
            $stmt->execute() ? http_response_code(204) : http_response_code(400);
        } else {
            http_response_code(400);
        }
    }
}
