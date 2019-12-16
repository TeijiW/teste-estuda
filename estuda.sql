drop database if exists estuda;
create database if not exists estuda
default character set utf8mb4
default collate utf8mb4_general_ci; 
use estuda;

create table if not exists alunos(
id int auto_increment,
nome varchar(60) not null,
telefone varchar(20),
email varchar(60) not null,
nascimento date,
genero enum('Masculino', 'Feminino'),
primary key (id)
)DEFAULT CHARSET=utf8mb4;

create table if not exists escolas(
id int auto_increment not null,
nome varchar(60),
endereco varchar(60),
`data` date not null,
situacao enum('Em atividade', 'Paralisada', 'Extinta', 'Extinta no ano anterior') not null,
primary key(id)
)DEFAULT CHARSET=utf8mb4;


create table if not exists turmas(
id int auto_increment,
nivel enum('Fundamental', 'Medio'),
turno enum('Integral','Matutino', 'Vespertino', 'Noturno'),
ano year,
serie enum('1','2','3','4','5','6','7','8','9'),
id_escola int,
primary key(id),
foreign key(id_escola) references escolas(id)
)DEFAULT CHARSET=utf8mb4;

create table if not exists alunos_turmas(
id_aluno int,
id_turma int,
foreign key(id_aluno) references alunos(id) on delete cascade,
foreign key(id_turma) references turmas(id) on delete cascade,
primary key(id_aluno, id_turma)
)DEFAULT CHARSET=utf8mb4;

replace into escolas (id, nome, data, situacao) values (51036207, 'CEEF COLEGIO MASTER JUNIOR', '2019-12-16', 'Em atividade') ,(51036193, 'CENTRO EDUC ALBERT EINSTEIN COLEGIO MASTER', '2019-12-16', 'Em atividade') ,(51064910, 'MASTER
CENTRO DE ENSINO LTDA', '2019-12-16', 'Em atividade') ,(51024543, 'MCE MASTER CENTRO EDUCACIONAL', '2019-12-16',
'Paralisada');

