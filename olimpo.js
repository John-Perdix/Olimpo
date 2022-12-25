//servidor Olimpo.js


/*
módulos (externos) necessários:
* mysql: npm install mysql
* express: npm install express
* express-session: npm install express-session
* express-fileupload: npm install express-fileupload
* body-parser: npm install body-parser
* nodemon (opcional, e para usar em vez do node no lançamento das aplicações): npm install -g nodemon
*/
const express = require('express');
const fs = require('fs');
const sha1 = require('sha1');
const session = require("express-session");
const { get } = require('http');
const { contentType } = require('express/lib/response');
const mysql = require("mysql");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const { homedir } = require('os');
const servidor = express();
// const bootstrap = require('bootstrap');
var porto = 9090;

// pasta a partir da qual se pode aceder a páginas ou recursos estáticos (não gerados pelo Node.js) e a outros ficheiros, como, por exemplo, ficheiros CSS ou JS
servidor.use(express.static("public"));

// utilização do fileUpload
servidor.use(fileUpload());

// criação das sessões
servidor.use(session({
    secret: "supercalifragilisticexpialidocious",
    resave: false,
    saveUninitialized: true
}));

var server = servidor.listen(porto, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("servidor a ser executado em " + host + ":" + port);
});

// objecto necessário para o processamento de pedidos através do método POST
var urlEncodedParser = bodyParser.urlencoded({
    extended: true
});

//Isto é que fez o post funcionar... Que crazy, o mundo é mesmo pequeno
servidor.use(express.urlencoded({ extended: true }))
//servidor.use(bodyParser);


// criação da ligação à base de dados, especificando o endereço, username, password e a base de dados propriamente dita
var con = mysql.createConnection({
    host: "saturno.esec.pt",
    user: "a2020120187",
    password: "cdmfbd2223",
    database: "a2020120187_olimpo",
    charset: "utf8",
    dateStrings: 'date'
});

// dados para estabeler a ligação ao servidor MySQL
var pool = mysql.createPool({
    host: "saturno.esec.pt",
    user: "a2020120187",
    password: "cdmfbd2223",
    database: "a2020120187_olimpo",
    charset: "utf8",
    // possibilidade de execução de várias instruções SQL em sequência
    multipleStatements: true
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Ligação estabelecida à base de dados...");
    var query = 'SELECT titulo_filme FROM Filmes;';
    con.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log("Resultado da execução da consulta:");
        console.log(result);
        console.log("Campos envolvidos na consulta:");
        console.log(fields);
    });
});

/*servidor.listen(porto, function () {
    console.log("Servidor a ser executado e à espera em http://localhost://" + porto);
});

/*===========================================================================*/
/*============================== CODIGO BADASS ==============================*/
/*===========================================================================*/

// Homepage
servidor.get("/", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
        consultas= fs.readFileSync("public/consultas_home.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    var html = "";
    html += head;
    html += content;
    html += consultas;
    
    html += footer;
    res.send(html);
});

// Login
servidor.get("/login", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        login = fs.readFileSync("public/login.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    var html = "";
    html += head;
    html += login;
    
    html += footer;
    res.send(html);
});

// Consulta de Filmes na Base de Dados
servidor.get("/filmes", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
        adiciona_filme = fs.readFileSync("public/adiciona_filme.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;

    var query = "SELECT titulo_filme, ano_filme, classificacao_filme, runtime_filme, premios_filme, poster_filme, nome_diretor FROM Filmes INNER JOIN Diretores USING(ID_FILME);";
    //res.send(query);
    pool.query(query, function (err, result, fields) {

        html += "<h2>Filmes</h2>\n";
        if (!err) {
            html += "<div class='container-filmes'>";
            html += "<div class='container-filmes-item1'>";
            if (result && result.length > 0) {
                html += "<table class='tabela'>\n";
                html += "<tr><th>Titulo do Filme</th><th>Diretor</th><th>Ano</th><th>Duração</th><th>Classificação</th><th>Premio</th><th>Poster</th></tr>\n";
                for (var i = 0; i < result.length; i++) {
                    console.log("os resultados são maiores que 0");
                    html += "<tr><td>" + result[i].titulo_filme + "</td><td>" + result[i].nome_diretor +  "</td><td>" + result[i].ano_filme +  "</td><td>" + result[i].runtime_filme +  " min.</td><td>" + result[i].classificacao_filme +  "</td><td>" + result[i].premios_filme + "</td><td><img class='poster_filme' src='recursos/" + result[i].poster_filme + "' alt='Poster do filme'></td</tr>\n";
                }
                html += "</table>\n";
                html += "</div>"
            }
            else {
                html += "<p>Não há filmes.</p>\n";
            }
        }
        else {
            html += error;
        }
        html += "<div class='container-filmes-item2'>";
        html += adiciona_filme;
        html += "</div>";
        html += "</div>";
        html += footer;
        res.send(html);
    });
});

// Página de Erro
servidor.get("/error", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        sem_distribuidoras = fs.readFileSync("public/sem_distribuidoras.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;
    html += error;

    html += footer;
    res.send(html);

});

// Consulta de Alugueres
servidor.get("/alugueres", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        sem_distribuidoras = fs.readFileSync("public/sem_distribuidoras.html", "utf-8");
        adiciona_aluguer1 = fs.readFileSync("public/aadiciona_aluguer1.html", "utf-8");
        adiciona_aluguer1 = fs.readFileSync("public/aadiciona_aluguer2.html", "utf-8");
        adiciona_aluguer1 = fs.readFileSync("public/aadiciona_aluguer3.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;

    var query = "SELECT * FROM Distribuidoras;";
    //res.send(query);
    pool.query(query, function (err, result, fields) {
        html += "<h2>Alugueres</h2>\n";
        if (!err) {
            if (result && result.length > 0) {
                html += "<div class='container'>\n";
                html += "<h2>Distribuidoras</h2>";
                for (var i = 0; i < result.length; i++) {
                    console.log("os resultados são maiores que 0");
                    html += "<div class='container-distribuidora'><div class='barra'></div><table><tr><td>" + result[i].id_distribuidora + "</td></tr><tr><td>" + result[i].nome_distribuidora + "</td></tr><tr><td>" + result[i].morada_distribuidora+ "</td></tr><tr><td>" + result[i].email_distribuidora+ "</td></tr><tr><td>" + result[i].telefone_distribuidora + "</td></tr></table></div>\n";
                }
                html += "</div>\n";
            }
            else {
                html += sem_distribuidoras;
            }
        }
        else {
            html += error;
        }

        
        html += footer;
        res.send(html);
    });
});

// Adiciona Filmes
servidor.get("/adiciona_filme", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        adiciona_filme = fs.readFileSync("public/adiciona_filme.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    var html = "";
    html += head;
    html += adiciona_filme;

    html += footer;
    res.send(html);
});

// Processa Adiciona Filmes
servidor.post("/processa_adiciona_filme", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }
    console.log(req.body);

    if (req.body.titulo_filme && req.body.ano_filme && req.body.classificacao_filme && req.body.genero_filme && req.body.duracao_filme && req.body.premios_filme && req.body.poster_filme) {
        var query = "INSERT INTO Filmes VALUES (null, '" + req.body.titulo_filme + "', '" + req.body.ano_filme + "', '" + req.body.classificacao_filme + "', '" + req.body.genero_filme + "', '" + req.body.poster_filme + "', '" + req.body.duracao_filme + "', '" + req.body.premios_filme + "');";
        
        if (!req.files) {
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Adiciona um Filme</h2>";
                console.log(err);

                if (!err) {
                    if (result) {
                        html += "<p>O Filme '" + req.body.titulo_filme + "'foi inserido com sucesso</p>";
                    }
                    else {
                        html += "<p>Não foi possível inserir o Filme '" + req.body.titulo_filme + "'</p>";
                    }
                }
                else {
                    html += "<p>erro ao executar pedido ao servidor</p>\n";
                }
                html += footer;
                res.send(html);
            });
        }
        else {
            var html = "";
            html += head;
            html += "<h2>Adiciona Filme</h2>\n";
            html += "<p>Dados </p>\n";
            html += fundo;
            res.send(html);
        }
    }
});

// Consulta de Clientes
servidor.get("/clientes", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;

    var query = "SELECT nome_cliente, dn_cliente, telefone_cliente, email_cliente, nif_cliente FROM Clientes;";
    //res.send(query);
    pool.query(query, function (err, result, fields) {

        html += "<h2>Clientes</h2>\n";
        if (!err) {
            if (result && result.length > 0) {
                html += "<table class='tabela'>\n";
                html += "<tr><th>Nome</th><th>Data de nascimento</th><th>Nº telemovel</th><th>Email</th><th>NIF</th><th>Bilhetes comprados</th></tr>\n";
                for (var i = 0; i < result.length; i++) {
                    console.log("os resultados são maiores que 0");
                    html += "<tr><td>" + result[i].nome_cliente + "</td><td>" + result[i].dn_cliente +  "</td><td>" + result[i].telefone_cliente +  "</td><td>" + result[i].email_cliente +  "</td><td>" + result[i].nif_cliente +  "</td</tr>\n";
                }
                html += "</table>\n";
            }
            else {
                html += "<p>Não há nenhum cliente.</p>\n";
            }
        }
        else {
            html += "<p>Aconteceu um erro no servidor</p>\n";
        }
        html += footer;
        res.send(html);
    });
});

//DUVIDAS
/*
COMO É QUE FAZEMOS O QUERY QUANDO SÃO VARIAS CONSULTAS, OU VARIAS INSERTS E CENAS
Como fazer aparecer o filme com o inner join mesmo que não haja diretor

De grosso modo,
Será trivial?


Duvida quanto ao diagrama ERR 
Os assentos não devião estar diretamente relacionados com o bilhete?

Duvidas sobre bilhetes... Criamos um bilhete novo para cada nova sessão? As sessões são unicas ou temos de ter uma por dia?????????????????????????? 

Formulários e tratamento de dados

Pagina do destino
cabeçalho da 
after 5 sec segundos redirect
<meta http-equiv="refresh" content="3;url=http://www.google.com/" />

===================Assentos e bilhetes===================
Solução para não utilizar o memso assento na mesma sessão
select para os bilhetes que não foram vendidos para a seesão
No javascript não permitir 


*///===================================================================
/* ===========================processa login===========================
   ====================================================================
/// página que realiza a autenticação (login)
servidor.get("/processa_login_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head_timer.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    

    if (req.query.id_funcionario && req.query.password_funcionario) {
        var query = "SELECT id_funcionario FROM Funcionarios WHERE id_funcionario = '" + req.query.id_funcionario + "' AND password_funcionario = SHA('" + req.query.password_funcionario + "');";
        //res.send(query);
        pool.query(query, function (err, result, fields) {
            var html = "";
            html += head;
            html += "<h2>Login funcionário</h2>\n";
            if (!err) {
                if (result && result.length > 0) {
                    html += "<p>O funcionario '" + req.query.id_funcionario + "' foi autenticado com sucesso</p>\n";
                    req.session.id_funcionario = result[0].id_funcionario;
                }
                else {
                    html += "<p>não foi possível autenticar o funcionário " + req.query.id_funcionario + "</p>\n";
                }
            }
            else {
                html += "<p>erro ao executar pedido ao servidor</p>\n";
            }
            html += footer;
            res.send(html);
        });
    }
    else {
        var html = "";
        html += head;
        html += "<h2>login funcionário</h2>\n";
        html += "<p>dados de autenticação do funcionário não definidos</p>\n";
        html += footer;
        res.send(html);
    }
});*/

/*________________________________Consulta de Funcionários________________________________*/
servidor.get("/funcionarios", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
        adiciona_filme = fs.readFileSync("public/criar_funcionario.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;
  
    var query = "SELECT nome_funcionario, nif_funcionario, cc_funcionario, dn_funcionario, data_entrada_funcionario, password_funcionario, fotografia_funcionario FROM Funcionarios INNER JOIN Cinemas USING(id_cinema);";
    //res.send(query);
    pool.query(query, function (err, result, fields) {

        html += "<h2>Funcionários</h2>\n";
        if (!err) {
            html += "<div class='container-filmes'>";
            html += "<div class='container-filmes-item1'>";
            if (result && result.length > 0) {
                html += "<table class='tabela'>\n";
                html += "<tr><th>Nome</th><th>Número de Identificação Fiscal</th><th>Cartão de Cidadão</th><th>Data de Nascimento</th><th>Data de Entrada</th><th>Password</th><th>Fotografia</th></tr>\n";
                for (var i = 0; i < result.length; i++) {
                    console.log("os resultados são maiores que 0");
                    html += "<tr><td>" + result[i].nome_funcionario + "</td><td>" + result[i].nif_funcionario +  "</td><td>" + result[i].cc_funcionario +  "</td><td>" + result[i].dn_funcionario +  "</td><td>" + result[i].data_entrada_funcionario +  "</td><td>" + result[i].password_funcionario + "</td><td><img class='fotografia_funcionario' src='recursos/" + result[i].fotografia_funcionario + "' alt='Fotografia do Funcionário'></td</tr>\n";
                }
                html += "</table>\n";
                html += "</div>"
            }
            else {
                html += "<p>Não há Funcionários.</p>\n";
            }
        }
        else {
            html += error;
        }
        html += "<div class='container-filmes-item2'>";
        html += adiciona_filme;
        html += "</div>";
        html += "</div>";
        html += footer;
        res.send(html);
    });
});

/*________________________________Criar Funcionários________________________________*/
servidor.get("/criar_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        criar_funcionario = fs.readFileSync("public/criar_funcionario.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    var html = "";
    html += head;
    html += criar_funcionario;
    
    html += footer;
    res.send(html);
});

/*________________________________Processa Criar Funcionários________________________________*/
servidor.post("/processa_criar_funcionario", urlEncodedParser, function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    //if (req.session.id_funcionario) {
        if (req.body.nome_funcionario && req.body.nif_funcionario && req.body.cc_funcionario && req.body.dn_funcionario && req.body.password_funcionario && req.body.id_cinema && req.files.fotografia_funcionario) {
            var query = "INSERT INTO Funcionarios VALUES (null, '" + req.body.id_cinema + "', '" + req.body.nome_funcionario + "', '" + req.body.nif_funcionario + "', '" + req.body.cc_funcionario + "', '" + req.body.dn_funcionario + "', NOW(),'" + sha1(req.body.password_funcionario) + "', 'fotografia');";
            //res.send(query);
            console.log("nome: " + req.body.nome_funcionario + "\n" + "nif: " + req.body.nif_funcionario + "\n" + "cc: " + req.body.cc_funcionario + "\n" + "dn: " + req.body.dn_funcionario + "\n" + "password: " + req.body.password_funcionario + "\n" + "cinema: " + req.body.id_cinema);
            if (!req.files) {
                pool.query(query, function (err, result, fields) {
                    var html = "";
                    html += head;
                    html += "<h2>Novo Funcionário</h2>\n";
                    console.log("Estamos no !req.files");
                    if (!err) {
                        console.log("estamos no !req.files e deu erro aqui");
                        console.log(err);
                        if (result) {
                            html += "<p>Olá " + req.body.nome_funcionario + "</p>\n";
                        }
                        else {
                            html += "<p>Não foi possivel registar '" + req.body.nome_funcionario + "' como novo funcionário</p>\n";
                        }
                    }
                    else {
                        html += "<p>Erro ao executar pedido ao servidor</p>\n";
                    }
                    html += footer;
                    res.send(html);
                });
            }
            //Guardar o todos os dados e deixar em branco o fotografia_funcionario
            //depois no req.files fazer alter do atributo e passar o fotografia_funcionario com o nome do ficheiro
            else if (req.files.fotografia_funcionario) {
                //novo query para fazer o update do atributo
                console.log("Estamos no " + req.files);
                console.log("Estamos no req.files");
                query += "UPDATE Funcionarios SET fotografia_funcionario = " + req.files.fotografia_funcionario + ";";
                //query do ficheiro do stor
                /*query += "INSERT INTO Capas VALUES (null, '" + req.files.nome_imagem_capa.name + "', '" + req.files.nome_imagem_capa.mimetype + "', '0', '0', '', LAST_INSERT_ID());";*/
                pool.query(query, function (err, result, fields) {
                    var html = ""; 
                    html += head;
                    html += "<h2>Regista um funcionário</h2>\n";
                    if (!err) {
                        if (result[0] && result[0].affectedRows > 0) {
                            html += "<p>O funcionário'" + req.body.nome_funcionario + "' foi inserido com sucesso</p>\n";
                        }
                        else {
                            html += "<p>Não foi possivel inserir o funcionário '" + req.body.nome_funcionario + "'</p>\n";
                            html += "<p>Não foi possivel inserir a fotografia de'" + req.body.nome_funcionario + "'</p>\n";
                        }
                        if (result[1] && result[1].affectedRows > 0) {
                            html += "<p>A fotografia de'" + req.body.nome_funcionario + "' foi inserida com sucesso</p>\n";
                        }
                        else {
                            html += "<p>Não foi possivel inserir a  fotografia de '" + req.body.nome_funcionario + "'</p>\n";
                        }
                        req.files.fotografia_funcionario.mv("public/fotografias_funcionarios/" + req.files.fotografia_funcionario, function (err) {
                            if (err) {
                                console.error(err);
                                console.error("Erro ao guardar a imagem no ficheiro");
                            }
                        });
                    }
                    
                    else {
                        console.log(err);
                        html += "<p>Erro ao executar pedido ao servidor</p>\n";
                    }
                    html += footer;
                    res.send(html);
                });
            }
        }
        else {
            var html = "";
            html += head;
            html += "<h2>Erro ao Adicionar Funcionário</h2>\n";
            html += "<p>Dados incompletos, tenta de novo</p>\n";
            console.log("id_cinema = " + req.body.id_cinema);
            console.log("nome do funcionário = " + req.body.nome_funcionario);
            html += footer;
            res.send(html);
        }
   /* }
    else {
        var html = "";
        html += head;
        html += "<h2>insere álbum</h2>\n";
        html += "<p>funcionário não autenticado ou utilizador sem permissões</p>\n";
        html += footer;
        res.send(html);
    }*/
});


/*meter dentro do select pr pesquisr no array de cinemas
for (var i = 0; i < result[0].length; i++) {
html += "<option value='" + result[0][i].id_autor + "'>" + result[0][i].nome_autor + "</option>";
}
*/