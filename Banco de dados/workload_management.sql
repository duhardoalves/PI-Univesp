-- Projeto Integrador em Computação I - PJL110 - Grupo 18--

-- Substituído pela versão workload_v2 -- 

-- Criação do Banco de dados--

CREATE DATABASE WORKLOAD_MANAGEMENT;
USE WORKLOAD_MANAGEMENT;

-- Criação da Tabela dos Analistas --

CREATE TABLE ANALYSTS (
    ID_ANALYST INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL,
    STATUS ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
);

-- Criação da Tabela do Processo --

CREATE TABLE PROCESSES (
    PROCESS_ID INT AUTO_INCREMENT PRIMARY KEY,
    PROCESS_NUMBER VARCHAR(50) NOT NULL,
    ENTRY_DATE DATE NOT NULL,
    PRIORITY INT DEFAULT 1,
    ID_ANALYST INT,
    FOREIGN KEY (ID_ANALYST) REFERENCES ANALYSTS(ID_ANALYST)
    );
    
-- Inserindo dados para teste --

-- Inserindo os analistas --

INSERT INTO ANALYSTS (NAME) VALUES
   ('ANALYST A'),
   ('ANALYST B'),
   ('ANALYST C');
   
-- Inserindo os processos --

INSERT INTO PROCESSES (PROCESS_NUMBER, ENTRY_DATE, ID_ANALYST) VALUES
   ('P001', CURDATE(), 1),
   ('P002', CURDATE(), 1),
   ('P003', CURDATE(), 2);
   
-- Lógica principal - Distribuição -- 

SELECT ID_ANALYST, COUNT(*) AS WORKLOAD
   FROM PROCESSES
   GROUP BY ID_ANALYST
   ORDER BY WORKLOAD ASC
   LIMIT 1;
 
 -- Essa abordagem inicial apresentou limitações, -- 
 -- como a não considerá analista sem processo e ausência de filtro por status. -- 
 -- Por isso, foi adotada uma nova versão -- 
   
-- Versão final - Distribuição --

INSERT INTO PROCESSES (PROCESS_NUMBER, ENTRY_DATE, ID_ANALYST) 
   VALUES ('P004', CURDATE(),
   ( 
     SELECT A.ID_ANALYST
	 FROM ANALYSTS A
     LEFT JOIN PROCESSES P ON A.ID_ANALYST = P. ID_ANALYST
     WHERE A.STATUS = 'ACTIVE'
     GROUP BY A.ID_ANALYST
     ORDER BY COUNT(P.PROCESS_ID) ASC, A.ID_ANALYST ASC
     LIMIT 1
     )
	);
    
-- Verificando o processo de distribuição --

SELECT * FROM PROCESSES;

-- Tornar o número do processo único --

ALTER TABLE PROCESSES
   ADD CONSTRAINT UNIQUE_PROCESS UNIQUE (PROCESS_NUMBER);
   
   SELECT * FROM PROCESSES;

   -- Substituído pela versão workload_v2 -- 


   
   
   
   
   
   
   
   
    
    
    
    
    
    

