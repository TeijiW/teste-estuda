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
genero enum('M', 'F'),
primary key (id)
)DEFAULT CHARSET=utf8mb4;

create table if not exists escolas(
id int not null,
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
foreign key(id_aluno) references alunos(id),
foreign key(id_turma) references turmas(id)
)DEFAULT CHARSET=utf8mb4;

