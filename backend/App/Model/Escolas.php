<?php 
namespace App\Model;
use App\Model\Util;
Class Escolas{
    // private $id, $nivel, $turno, $ano, $serie, $id_escola;
    private $table = "escolas";
    private $keys = ["nome", "endereco", "data", "situacao"];

    public function updateWithAPI(){
        $url = 'http://educacao.dadosabertosbr.com/api/escolas/buscaavancada?nome=master&estado=MT';
        $contents = file_get_contents($url);
        if($contents !== false){
            // echo gettype($contents);
            echo array($contents);
        }
    }

    public function read($data) {
        $paramaters = isset($data->id) ? " where id=$data->id limit 1" : "";
        $sql = "select id, nome, endereco, data, situacao from $this->table".$paramaters;
        $stmt = Connection::getConnection()->prepare($sql);
        $stmt->execute();
        if ($stmt->rowCount() > 0){
            http_response_code(200);
            $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode($result);
        }
    }

    public function create($data) {
        $util = new Util();
        $data = $util->setObjectSchema($data, $this->keys);
        $data = $util->isEmptyString($data);
        $sql = "insert into $this->table (nome, endereco, data, situacao ) values (?, ?, ?, ?)";
        $stmt = Connection::getConnection()->prepare($sql);
        foreach($this->keys as $index => $value){
            $stmt->bindValue($index+1, $data->{$value});
        }
        $stmt->execute() ? http_response_code(204) : http_response_code(400);
    }

    public function update($data) {
        $util = new Util();
        $data = $util->isEmptyString($data);
        if (isset($data->id)){
            $sql = "update $this->table set ";
            $count = 0;
            $dataLength = count((array)$data);
            foreach ($data as $key => $value) { 
                $count += 1;
                if ($key === "id") continue;
                if (gettype($value) === "string"){
                    $sql .= "$key = '$value'";
                }else{
                    $sql .= "$key = $value";
                }
                if($count !== $dataLength){
                    $sql .= ", ";
                }
            }
            $sql .= " where id = $data->id;";
            $stmt = Connection::getConnection()->prepare($sql);
            if ($stmt->execute()){
                http_response_code(204);
            }else{
                var_dump( $stmt->errorInfo()); 
                http_response_code(500);
            }
        }else{
            http_response_code(400);
        }
    }

    public function delete($data) {
        if(isset($data->id)){
            $sql = "delete from $this->table where id = $data->id;";
            echo $sql;
            $stmt = Connection::getConnection()->prepare($sql);
            $stmt->execute() ? http_response_code(204) : http_response_code(400);
        }else{
            http_response_code(400);
        }
    }
}

?>