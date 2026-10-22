-- Projeto Integrador em Computação I - PJL110 - Grupo 18--

-- Criação do Banco de dados-- workload_v2 -- 
CREATE DATABASE workload_v2;
USE workload_v2;

-- Criando a Tabela dos analistas --
CREATE TABLE analysts (
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
-- Criando a Tabela dos Processos --
CREATE TABLE processes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_number VARCHAR(50) NOT NULL UNIQUE,
    priority INT DEFAULT 1,
    status ENUM('OPEN', 'IN_PROCESS', 'DONE') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
-- Criando a Tabela das Tarefas --
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_id INT,
    analyst_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (process_id) REFERENCES processes(id),
    FOREIGN KEY (analyst_id) REFERENCES analysts(id)
    );
    
-- Dados para testes --
INSERT INTO analysts (name) VALUES
('ANALYST A'),
('ANALYST B'),
('ANALYST C');

INSERT INTO processes (process_number) VALUES
('P001'),
('P002'),
('P003');

INSERT INTO assignments (process_id, analyst_id) VALUES
(1,1),
(2,1),
(3,2);

-- Teste --
SELECT * FROM analysts;
SELECT * FROM processes;
SELECT * FROM assignments;

SELECT * FROM processes;
SELECT * FROM assignments;

SHOW COLUMNS FROM processes;

-- Alteração na Tabela Processos 'IN_PROCESS' PARA 'IN_PROGRESS' --
ALTER TABLE processes
MODIFY status ENUM('OPEN', 'IN_PROGRESS', 'DONE') DEFAULT 'OPEN';

-- Padronização do campo status da tabela analistas para evitar erro nas consultas do backend --

ALTER TABLE analysts 
MODIFY status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE';

-- Teste2 --
SELECT DISTINCT status FROM analysts;
SELECT DISTINCT status FROM processes;
UPDATE analysts SET status = 'INACTIVE' WHERE id = 1;
SELECT DISTINCT status FROM analysts;

-- Evitar que o banco aceite dados inválidos --
ALTER TABLE assignments 
MODIFY process_id INT NOT NULL,
MODIFY analyst_id INT NOT NULL;

-- Garantir que o banco se limpe sozinho quando deletar dados --

-- Descobrir nomes das FKs --
SHOW CREATE TABLE assignments;

-- Remover as FKs atuais --
ALTER TABLE assignments 
DROP FOREIGN KEY assignments_ibfk_1;

ALTER TABLE assignments 
DROP FOREIGN KEY assignments_ibfk_2;

-- REcriar as FKS --
ALTER TABLE assignments
ADD CONSTRAINT fk_process
FOREIGN KEY (process_id) REFERENCES processes(id)
ON DELETE CASCADE;

ALTER TABLE assignments
ADD CONSTRAINT fk_analyst
FOREIGN KEY (analyst_id) REFERENCES analysts(id)
ON DELETE CASCADE;

-- Teste3 --
SHOW CREATE TABLE assignments;

-- Teste4 --
SELECT * FROM processes WHERE process_number = 'P100';
SELECT * FROM assignments 
WHERE process_id = (
  SELECT id FROM processes WHERE process_number = 'P100'
);

-- Teste5 Verificar duplicidade --
SELECT * FROM processes WHERE process_number = 'P100';

-- teste6 Contagem exata --
SELECT COUNT(*) FROM processes WHERE process_number = 'P100';

-- teste7 Validação --
SELECT COUNT(*) 
FROM assignments 
WHERE process_id = 5;

USE workload_v2;

-- Alterações efetuadas após o primeiro teste no local --
-- Incluindo coluna inatividade --
ALTER TABLE analysts
ADD inactive_days INT DEFAULT 0;

DESCRIBE analysts;

-- incluindo a separação da descrição do processo --
ALTER TABLE processes
ADD prefix VARCHAR(10),
ADD process_year INT;

DESCRIBE processes;

SELECT *
FROM processes;

UPDATE processes
SET
  prefix = 'SB',
  process_year = 2026
WHERE prefix IS NULL;

UPDATE processes
SET
  prefix = 'SB',
  process_year = 2026
WHERE id > 0
AND prefix IS NULL;

SELECT id, name, status
FROM analysts;

-- 2026/10/06 - Alterando a Tabela Analistas incluindo a coluna processo final --

ALTER TABLE analysts
ADD COLUMN process_final TINYINT NULL;

DESCRIBE analysts;

-- 2026/10/08 - Conferir o cadastro pelo banco / Cadastro do analista → nome + final do processo → banco de dados. --

SELECT id, name, status, process_final
FROM analysts
ORDER BY id;

UPDATE analysts
SET process_final = 1
WHERE id = 14;

SELECT id, name, status, process_final
FROM analysts
ORDER BY id;

SELECT id, name, status, process_final
FROM analysts
ORDER BY id;


-- 2026/10/16 - conferir os analistas cadastrados → banco de dados. --

SELECT id, name, status, process_final
FROM analysts
ORDER BY process_final;

SELECT id, name, status, process_final
FROM analysts
ORDER BY id;


-- 2026/10/17 - Criar uma coluna para guardar a data de inativação --

DESCRIBE analysts;

ALTER TABLE analysts
ADD COLUMN inactive_since DATE NULL;




















    

   
    
    


