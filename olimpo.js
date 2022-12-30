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
//costante para definir o array com os meses do ano
const month = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
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

/*________________________________Homepage________________________________*/
servidor.get("/", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
        consultas = fs.readFileSync("public/consultas_home.html", "utf-8");
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


/*========================================================================================================*/
/*========================================================================================================*/
/*===========================================FUNCIONARIOS=================================================*/
/*========================================================================================================*/
/*========================================================================================================*/
/*________________________________Login________________________________*/
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

/*________________________________Processa Login________________________________*/
servidor.get("/processa_login_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head_timer.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    if (req.query.id_funcionario && req.query.password_funcionario) {
        var query = "SELECT * FROM Funcionarios WHERE id_funcionario = '" + req.query.id_funcionario + "' AND password_funcionario = SHA('" + req.query.password_funcionario + "');";
        //res.send(query);
        pool.query(query, function (err, result, fields) {
            var html = "";
            html += head;
            html += "<h2>Login Funcionário</h2>\n";
            if (!err) {
                if (result && result.length > 0) {
                    html += "<p>O funcionario " + result[0].nome_funcionario + " foi autenticado com sucesso</p>\n";
                    req.session.id_funcionario = result[0].id_funcionario;
                    console.log(req.query.nome_funcionario);
                    console.log(result);
                    console.log("A sessão é: " + req.session.id_funcionario);
                }
                else {
                    html += "<p>Não foi possível autenticar o funcionário " + req.query.id_funcionario + "</p>\n";
                    //html += "<a href='login'>Volta para trás</a>";
                }
            }
            else {
                html += "<p>erro ao executar pedido ao servidor</p>\n";
            }
            html += footer;
            res.send(html);
        });
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }
});




/*________________________________Perfil________________________________*/
servidor.get("/perfil_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    var html = "";
    html += head;

    if (req.session.id_funcionario) {

        var query = "SELECT id_funcionario, nome_funcionario, nif_funcionario, cc_funcionario, dn_funcionario, data_entrada_funcionario, fotografia_funcionario, password_funcionario FROM Funcionarios INNER JOIN Cinemas USING(id_cinema) WHERE id_funcionario = '" + req.session.id_funcionario + "';";
        //res.send(query);
        pool.query(query, function (err, result, fields) {


            html += "<h2>Perfil</h2>\n";
            if (!err) {

                if (result && result.length > 0) {

                    html += "<div class='container-filmes'>";
                    for (var i = 0; i < result.length; i++) {
                        //definição de variaveis para alterar o nome do mês nas datas
                        const entrada = result[i].data_entrada_funcionario;
                        const dn = result[i].dn_funcionario;
                        let mes_entrada = month[entrada.getMonth()];
                        let mes_nascimento = month[dn.getMonth()];

                        html += "<div class='container-filmes-item1'>";
                        html += "<img class='fotografia_funcionario' src='recursos/fotografias_funcionarios/" + result[i].fotografia_funcionario + "' alt='fotografia do funcionario'>";
                        html += "</div>";

                        html += "<div class='container-filmes-item1'>";
                        html += "<table class='tabela tabela_perfil'>\n";
                        html += "<tr><th>ID</th> <td>" + result[i].id_funcionario + "</td></tr>\n";
                        html += "<tr><th>Nome</th> <td>" + result[i].nome_funcionario + "</td></tr>\n";
                        html += "<tr><th>NIF</th> <td>" + result[i].nif_funcionario + "</td></tr>\n";
                        html += "<tr><th>CC</th> <td>" + result[i].cc_funcionario + "</td></tr>\n";

                        //data_nascimento
                        html += "<tr><th>Data de Nascimento</th> <td>" + result[i].dn_funcionario.getDate() + "-" + mes_nascimento + "-" + result[i].dn_funcionario.getFullYear() + "</td></tr>\n";

                        //data de entrada
                        html += "<tr><th>Data de Entrada</th> <td>" + result[i].data_entrada_funcionario.getDate() + "-" + mes_entrada + "-" + result[i].data_entrada_funcionario.getFullYear() + "</td></tr>\n";
                        html += "</table>\n";
                        html += "</div>";

                        html += "<td><a href='altera_funcionario'>Alterar &#9998;</a></td><td><a href='logout_funcionario'>Terminar Sessão &#10007;</a></td><td><a href='altera_password'>Alterar Password</a></td>\n";


                        console.log(result[i].nome_funcionario);
                    }
                    html += "</div>";
                }
                else {
                    html += "<p>Não há Funcionários para ninguém.</p>\n";
                }
            }
            else {
                html += error;
            }


            html += footer;
            res.send(html);
        });
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }
});

/*________________________________Altera Funcionário________________________________*/
servidor.get("/altera_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    var html = "";
    html += head;

    if (req.session.id_funcionario) {
        console.log("A sessão é esta: " + req.session.id_funcionario);
        var query = "SELECT id_funcionario, nome_funcionario, nif_funcionario, cc_funcionario, dn_funcionario FROM Funcionarios WHERE id_funcionario = " + req.session.id_funcionario + ";";
        //res.send(query);
        pool.query(query, function (err, result, fields) {
            html += "<h2>Altera Funcionário</h2>\n";
            if (!err) {
                if (result && result.length == 1) {
                    html += "<form name='form_altera_funcionario' method='post' action='processa_altera_funcionario'>\n";
                    html += "<input type='hidden' value='" + req.query.id_funcionar + "' name='id_funcionario'>\n";
                    html += "<table>\n";
                    html += "<tr><td>Nome:</td><td><input type='text' name='nome_funcionario' placeholder='Nome do Funcionário' value='" + result[0].nome_funcionario + "'></td></tr>\n";
                    html += "<tr><td>NIF:</td><td><input type='number' name='nif_funcionario' placeholder='123456789' pattern='[0-9]{9}' value='" + result[0].nif_funcionario + "'></td></tr>\n";
                    html += "<tr><td>Cartão de Cidadão:</td><td><input type='number' name='cc_funcionario' placeholder='12345678' pattern='[0-9]{8}' value='" + result[0].cc_funcionario + "'></td></tr>\n";
                    html += "<tr><td>Data de Nascimento:</td><td><input type='date' name='dn_funcionario' value='" + result[0].dn_funcionario + "'></td></tr>\n";
                    html += "<tr><td colspan='2'><input type='submit' value='Alterar'>&nbsp;</td></tr>\n";
                    html += "</table>\n";
                    html += "</form>\n";
                }
                else {
                    html += "<p>erro ao executar pedido ao servidor</p>\n";
                }
                html += footer;
                res.send(html);
            }
            else {
                var html = "";
                html += head;
                html += "<h2>Altera Funcionário</h2>\n";
                html += "<p>Funcionário não Encontrado</p>\n";
                console.log(err);
                html += footer;
                res.send(html);
            }
        });
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
    }


});

/*________________________________Processa Altera Funcionário________________________________*/
servidor.post("/processa_altera_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");

    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    if (req.session.id_funcionario) {
        if (req.body.nome_funcionario && req.body.nif_funcionario && req.body.cc_funcionario && req.body.dn_funcionario) {
            var query = "UPDATE Funcionarios SET nome_funcionario = " + mysql.escape(req.body.nome_funcionario) + ", nif_funcionario = " + mysql.escape(req.body.nif_funcionario) + ", cc_funcionario = " + mysql.escape(req.body.cc_funcionario) + ", dn_funcionario = " + mysql.escape(req.body.dn_funcionario) + " WHERE id_funcionario = " + req.session.id_funcionario + ";";
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Altera Funcionário</h2>\n";
                if (!err) {
                    html += "<p>\n";
                    if (result && result.affectedRows > 0) {
                        html += "Funcionario alterado com sucesso para: '" + req.body.nome_funcionario + " / " + req.body.nif_funcionario + " / " + req.body.cc_funcionario + " / " + req.body.dn_funcionario + "'\n";
                    } else {
                        html += "Falha ao alterar Funcionário\n";
                    }
                    html += "</p>\n";
                }
                else {
                    html += "<p>Erro ao executar pedido ao servidor</p>\n";
                    console.log(err);
                }
                html += footer;
                res.send(html);
            });
        } else {
            var html = "";
            html += head;
            html += "<h2>Altera Funcionário</h2>\n";
            html += "<p>Por favor, identifique previamente o Funcionário</p>\n";
            console.log(req.body);
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
    }
});



/*________________________________Logout do Funcionário________________________________*/
servidor.get("/logout_funcionario", function (req, res) {
    // destruir variáveis de sessão individualmente
    //req.session.id_funcionario = null;
    // ou destruir a sessão completa

    try {
        head = fs.readFileSync("public/head_timer.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    req.session.destroy();
    var html = "";
    html += head;
    html += "<h2>Sessão do Funcionário terminada</h2>\n";
    html += "<p>Aguarde. Será redireccionado para outra página</p>\n";
    html += footer;
    res.send(html);
});


/*========================================================================================================*/
/*========================================================================================================*/
/*================================================DIRETORES===============================================*/
/*========================================================================================================*/
/*========================================================================================================*/
/*________________________________Consulta de Diretores________________________________*/
servidor.get("/diretores", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;

    var query = "SELECT nome_diretor, dn_diretor, premios_diretor FROM Diretores;";
    //res.send(query);
    pool.query(query, function (err, result, fields) {

        html += "<h2>Diretores</h2>\n";
        if (!err) {
            html += "<div class='container-filmes'>";
            html += "<div class='container-filmes-item1'>";
            if (result && result.length > 0) {
                html += "<table class='tabela'>\n";
                html += "<tr><th>Nome</th><th>Data de Nascimento</th><th>Prémio</th></tr>\n";
                for (var i = 0; i < result.length; i++) {
                    html += "<tr><td>" + result[i].nome_diretor + "</td><td>" + result[i].dn_diretor + "</td><td>" + result[i].premios_diretor + "</td></tr>\n";
                }
                html += "</table>\n";
                html += "</div>"
            }
            else {
                html += "<p>Não há Diretores.</p>\n";
            }
        }
        else {
            html += error;
        }
        html += "<div class='container-filmes-item2'>";
        html += "</div>";
        html += "</div>";
        html += footer;
        res.send(html);
    });
});

/*________________________________Adiciona Diretor________________________________*/
servidor.get("/adiciona_diretor", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
        adiciona_diretor = fs.readFileSync("public/adiciona_diretor.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;
    html += adiciona_diretor;

    html += footer;
    res.send(html);
});

/*________________________________Processa Adiciona Diretores________________________________*/
servidor.post("/processa_adiciona_diretor", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }
    console.log(req.body);

    if (req.body.nome_diretor && req.body.dn_diretor && req.body.premios_diretor) {
        var query = "INSERT INTO Diretores VALUES (null, '" + req.body.nome_diretor + "', '" + req.body.dn_diretor + "', '" + req.body.premios_diretor + "', null);";

        if (!req.files) {
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Adiciona um Diretor</h2>";

                if (!err) {
                    if (result) {
                        html += "<p>O Diretor '" + req.body.nome_diretor + "'foi inserido com sucesso</p>";
                    }
                    else {
                        html += "<p>Não foi possível inserir o Diretor '" + req.body.nome_diretor + "'</p>";
                    }
                }
                else {
                    html += "<p>Erro ao executar pedido ao servidor</p>\n";
                    console.log(err);
                }
                html += footer;
                res.send(html);
            });
        }
        else {
            var html = "";
            html += head;
            html += "<h2>Adiciona Diretor</h2>\n";
            html += "<p>Dados não registados</p>\n";
            html += footer;
            res.send(html);
        }
    }
});





/*========================================================================================================*/
/*========================================================================================================*/
/*=================================================FILMES=================================================*/
/*========================================================================================================*/
/*========================================================================================================*/
/*________________________________Consulta de Filmes________________________________*/
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

    var query = "SELECT titulo_filme, ano_filme, classificacao_filme, runtime_filme, premios_filme, poster_filme, nome_diretor, nome_genero FROM Filmes INNER JOIN Diretores USING(id_diretor) INNER JOIN Generos USING(id_genero);";
    //res.send(query);
    pool.query(query, function (err, result, fields) {

        html += "<h2>Filmes</h2>\n";
        if (!err) {
            html += "<div class='container-filmes'>";
            html += "<div class='container-filmes-item1'>";
            if (result && result.length > 0) {
                html += "<table class='tabela'>\n";
                html += "<tr><th>Titulo do Filme</th><th>Diretor</th><th>Ano</th><th>Duração</th><th>Classificação</th><th>Premio</th><th>Género</th><th>Poster</th></tr>\n";
                for (var i = 0; i < result.length; i++) {
                    console.log("os resultados são maiores que 0");
                    html += "<tr><td>" + result[i].titulo_filme + "</td><td>" + result[i].nome_diretor + "</td><td>" + result[i].ano_filme + "</td><td>" + result[i].runtime_filme + " min.</td><td>" + result[i].classificacao_filme + "</td><td>" + result[i].premios_filme + "</td><td>" + result[i].nome_genero + "</td><td><img class='poster_filme' src='recursos/posteres_filmes/" + result[i].poster_filme + "' alt='Poster do filme'></td> <td> <a href='altera_filme?id_filme=" + result[i].id_filme + "'>&#9998;</a> </td> <td> <a href='confirma_apaga_filme?id_filme=" + result[i].id_filme + "'>&#10007;</a> </td> </tr>\n";
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


/*________________________________Adiciona Filmes________________________________*/
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

    var query = "SELECT * FROM Generos;";

    pool.query(query, function (err, result, fields) {
        if (!err) {
            html += head;

            //=============Consulta dos Géneros=============
            if (result[0] && result[0].length > 0) {
                html += adiciona_filme;
                for (var i = 0; i < result[0].length; i++) {
                    html += "<option value='" + result[0][i].id_genero + "' name='" + result[0][i].id_genero + "'>" + result[0][i].nome_genero + "</option>";
                }
                html += "</select></td></tr>";
            }
            else {
                html += "<p>Não há filmes alugados.</p>\n";
            }

        }
    });

    html += footer;
    res.send(html);
});

/*________________________________Processa Adiciona Filmes________________________________*/
servidor.post("/processa_adiciona_filme", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }
    console.log(req.body);

    if (req.body.titulo_filme && req.body.ano_filme && req.body.classificacao_filme && req.body.duracao_filme && req.body.premios_filme && req.body.poster_filme && req.body.id_genero && req.body.nome_genero && req.body.id_diretor) {
        var query = "INSERT INTO Filmes VALUES (null, '" + req.body.titulo_filme + "', '" + req.body.ano_filme + "', '" + req.body.classificacao_filme + "', 'poster', '" + req.body.duracao_filme + "', '" + req.body.premios_filme + "', '" + req.body.id_genero + "', '" + req.body.id_diretor + "');";

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
        //Guardar o todos os dados e deixar em branco o poster do filme (com placeholder)
        //Depois no req.files fazer alter do atributo e passar o poster_filme com o nome do ficheiro
        else if (req.files.poster_filme) {
            //novo query para fazer o update do atributo
            console.log("Estamos no req.files");
            query2 = "UPDATE Filmes SET poster_filme = '" + req.files.fotografia_poster_filme.name + "' WHERE id_funcionario = LAST_INSERT_ID();";
            pool.query(query2, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Adicionar Filme</h2>\n";
                if (!err) {
                    if (result) {
                        html += "<p>O poster do filme'" + req.body.titulo_filme + "' foi inserido com sucesso</p>\n";
                    }
                    else {
                        html += "<p>Não foi possivel inserir o poster do filme '" + req.body.titulo_filme + "'</p>\n";
                    }
                    req.files.poster_filme.mv("public/recursos/posteres_filmes/" + req.files.poster_filme.name, function (err) {
                        if (err) {
                            console.error(err);
                            console.error("Erro ao guardar a imagem no ficheiro");
                        }
                    });
                }
                else {
                    console.log(err);
                    html += error_page;
                }
                html += footer;
                res.send(html);
            });
        }
    }
});



/*________________________________Confirma Apaga Filme________________________________*/
servidor.get("/confirma_apaga_filme", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    if (req.session.id_funcionario) {
        if (req.query.id_filme) {
            var query = "SELECT id_filme, titulo_filme, poster_filme FROM Filmes WHERE id_filme = " + mysql.escape(req.query.id_filme) + ";";
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Apaga Filme</h2>\n";
                if (!err) {
                    if (result && result.length == 1) {
                        html += "<p> <img class='poster_filme' src='recursos/" + result[0].poster_filme + " alt='Poster do Filme'></p>"
                        html += "<p>Tem a certeza que quer apagar o Filme '" + result[0].titulo_filme + "' com o id " + result[0].id_filme + "?<br><a href='/processa_apaga_filme?id_filme=" + req.query.id_filme + "'>Sim</a><br><a href='javascript:history.back()'>Não</a></p>\n";
                        console.log("Consulta" + result);

                    } else {
                        html += "<p>Filme não identificado</p>\n";
                        console.log("Consulta" + result);
                    }
                }
                else {
                    html += "<p>Erro ao executar pedido ao servidor</p>\n";
                }
                html += footer;
                res.send(html);
            });
        } else {
            var html = "";
            html += head;
            html += "<h2>Apaga Filme</h2>\n";
            html += "<p>Por favor, identifique previamente o Filme</p>\n";
            console.log("Consulta:" + req.body);
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
    }
});

/*________________________________Processa Apaga Filme________________________________*/
servidor.get("/processa_apaga_filme", function (req, res) {
    try {
        head = fs.readFileSync("public/head_timer.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");

    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    if (req.session.id_funcionario) {
        if (req.query.id_filme) {
            console.log("Consulta: " + req.query);
            var query = "DELETE FROM Filmes WHERE id_filme = " + mysql.escape(req.query.id_filme) + ";";
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Apaga Filme</h2>\n";
                if (!err) {
                    html += "<p>\n";
                    if (result && result.affectedRows == 1) {
                        html += "Filme com o id " + req.query.id_filme + " apagado com sucesso.\n";
                        console.log("Resultado:" + result);
                    } else {
                        html += "Falha ao apagar o Filme\n";
                        console.log("Resultado:" + result);
                    }
                    html += "</p>\n";

                }
                else {
                    html += "<p>Erro ao executar pedido ao servidor</p>\n";
                    console.log(err);
                }
                html += footer;
                res.send(html);
            });
        } else {
            var html = "";
            html += head;
            html += "<h2>Apaga Filme</h2>\n";
            html += "<p>Por favor, identifique previamente o Filme</p>\n";
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
    }
});



/*________________________________Altera Filme________________________________*/
servidor.get("/altera_filme", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;

    if (req.session.id_funcionario) {
        var query = "SELECT id_filme, titulo_filme, ano_filme, classificacao_filme, genero_filme, runtime_filme, premios_filme  FROM Filmes WHERE id_filme = " + req.query.id_filme + ";";
        //res.send(query);
        pool.query(query, function (err, result, fields) {
            html += "<h2>Altera Filme</h2>\n";
            if (!err) {
                if (result && result.length == 1) {
                    html += "<form name='form_altera_filme' method='post' action='processa_altera_filme'>\n";
                    html += "<input type='hidden' value='" + result[0].id_filme + "' name='id_filme'>\n";
                    html += "<table>\n";
                    html += "<tr><td>ID:</td><td><label>" + result[0].id_filme + "</label></td></tr>"
                    html += "<tr><td>Título:</td><td><input type='text' name='titulo_filme' placeholder='Insira o nome do Filme' value='" + result[0].titulo_filme + "'></td></tr>\n";
                    html += "<tr><td>Ano de Lançamento:</td><td><input type='number' name='ano_filme' placeholder='Insira o ano de Lançamento' pattern='[0-9]{4}' value='" + result[0].ano_filme + "'></td></tr>\n";
                    html += "<tr><td>Classificação:</td><td><input type='text' name='classificacao_filme' placeholder='Insira a classificação do IMDB' value='" + result[0].classificacao_filme + "'></td></tr>\n";
                    html += "<tr><td>Género:</td><td><input type='text' name='genero_filme' placeholder:'Insira o Género do Filme' value='" + result[0].genero_filme + "'></td></tr>\n";
                    html += "<tr><td>Duração:</td><td><input type='number' name='runtime_filme' step='.01' placeholder:'Insira a Duração do Filme' value='" + result[0].runtime_filme + "'></td></tr>\n";
                    html += "<tr><td>Prémios:</td><td><input type='text' name='premios_filme' placeholder:'Insira o melhor prémio atribuído' value='" + result[0].premios_filme + "'></td></tr>\n";

                    html += "<tr><td colspan='2'><input type='submit' value='Alterar'>&nbsp;</td></tr>\n";
                    html += "</table>\n";
                    html += "</form>\n";
                }
                else {
                    html += "<p>Erro ao executar pedido ao servidor</p>\n";
                }
                html += footer;
                res.send(html);
            }
            else {
                var html = "";
                html += head;
                html += "<h2>Altera Filme</h2>\n";
                html += "<p>Filme não Encontrado</p>\n";
                console.log(err);
                html += footer;
                res.send(html);
            }
        });
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
    }
});

/*________________________________Processa Altera Filme________________________________*/
servidor.post("/processa_altera_filme", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    if (req.session.id_funcionario) {
        if (req.body.id_filme && req.body.titulo_filme && req.body.ano_filme && req.body.classificacao_filme && req.body.genero_filme && req.body.runtime_filme && req.body.premios_filme) {
            var query = "UPDATE Filmes SET titulo_filme = " + mysql.escape(req.body.titulo_filme) + ", ano_filme = " + mysql.escape(req.body.ano_filme) + ", classificacao_filme = " + mysql.escape(req.body.classificacao_filme) + ", genero_filme = " + mysql.escape(req.body.genero_filme) + ", runtime_filme = " + mysql.escape(req.body.runtime_filme) + ", premios_filme = " + mysql.escape(req.body.premios_filme) + " WHERE id_filme = " + req.body.id_filme + ";";
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Altera Filme</h2>\n";
                if (!err) {
                    html += "<p>\n";
                    if (result && result.affectedRows > 0) {
                        html += "Filme alterado com sucesso para: '" + req.body.titulo_filme + " / " + req.body.ano_filme + " / " + req.body.classificacao_filme + " / " + req.body.genero_filme + " / " + req.body.runtime_filme + " / " + req.body.premios_filme + "'\n";
                    } else {
                        html += "Falha ao alterar Filme\n";
                    }
                    html += "</p>\n";
                }
                else {
                    html += "<p>Erro ao executar pedido ao servidor</p>\n";
                    console.log(err);
                    console.log(err);
                }
                html += footer;
                res.send(html);
            });
        } else {
            var html = "";
            html += head;
            html += "<h2>Altera Filme</h2>\n";
            html += "<p>Por favor, identifique previamente o Filme</p>\n";
            console.log(req.body);
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
    }
});



/*________________________________Página de Erro________________________________*/
/*__________________________________PARA TESTE__________________________________*/
servidor.get("/error", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
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
/*========================================================================================================*/
/*========================================================================================================*/
/*==============================================ALUGUERES=================================================*/
/*========================================================================================================*/
/*========================================================================================================*/
/*______________________________________________________________________________________________________*/
/*________________________________Consulta de Alugueres e Distribuidoras________________________________*/
/*_______________________________________________Original________________________________________________*/
/*______________________________________________________________________________________________________*/
servidor.get("/alugueres", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        sem_distribuidoras = fs.readFileSync("public/sem_distribuidoras.html", "utf-8");
        adiciona_aluguer1 = fs.readFileSync("public/adiciona_aluguer1.html", "utf-8");
        adiciona_aluguer2 = fs.readFileSync("public/adiciona_aluguer2.html", "utf-8");
        error_page = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }
    //consulta alugueres que estão neste momento ativos
    //consulta alugueres que NÃO estão neste momento ativos
    //consulta de filmes para a o select filmes

    var query = "SELECT * FROM Distribuidoras; SELECT id_aluguer, id_filme, titulo_filme, nome_distribuidora, data_inicio_aluguer, data_fim_aluguer  FROM Alugueres INNER JOIN Distribuidoras using(id_distribuidora) INNER JOIN Filmes using(id_filme) WHERE NOW() BETWEEN data_inicio_aluguer AND data_fim_aluguer; SELECT id_aluguer, id_filme, titulo_filme, nome_distribuidora, data_inicio_aluguer, data_fim_aluguer  FROM Alugueres INNER JOIN Distribuidoras using(id_distribuidora) INNER JOIN Filmes using(id_filme) WHERE NOW() NOT BETWEEN data_inicio_aluguer AND data_fim_aluguer; SELECT id_filme, titulo_filme FROM Filmes; SELECT id_distribuidora, nome_distribuidora FROM Distribuidoras;";

    //res.send(query);

    pool.query(query, function (err, result, fields) {
        if (!err) {
            html = "";
            html += head;
            console.log(result);

            //=======================
            //consulta distribuidoras
            if (result[0] && result[0].length > 0) {
                html += "<div class='container-body'>\n";
                html += "<div class='container-body-item'>\n";
                html += "<div class='container'>\n";
                html += "<h2>Distribuidoras</h2>";
                for (var i = 0; i < result[0].length; i++) {
                    html += "<div class='container-distribuidora'><div class='barra'></div><table><tr><td>" + result[0][i].id_distribuidora + "</td></tr><tr><td>" + result[0][i].nome_distribuidora + "</td></tr><tr><td>" + result[0][i].morada_distribuidora + "</td></tr><tr><td>" + result[0][i].email_distribuidora + "</td></tr><tr><td>" + result[0][i].telefone_distribuidora + "</td></tr></table></div>\n";
                }
                html += "</div>\n";
                html += "</div>\n";
            }
            else {
                html += sem_distribuidoras;
            }

            //==============================================
            //consulta dos filmes alugados ativos no momento
            if (result[1] && result[1].length > 0) {
                html += "<div class='container-body-item'>\n";
                html += "<div class='container-filmes'>";
                html += "<div class='container-filmes-item1'>";
                html += "<h2>Alugueres disponiveis</h2>\n";
                html += "<table class='tabela'>\n";
                html += "<tr><th>Titulo do Filme</th><th>Id do filme</th><th>Id do aluguer</th><th>Data do inicio do aluguer</th><th>Data do fim do aluguer</th><th>Status</th></tr>\n";
                for (var i = 0; i < result[1].length; i++) {
                    const ini = result[1][i].data_inicio_aluguer;
                    const f = result[1][i].data_fim_aluguer;
                    let inicio = month[ini.getMonth()];
                    let fim = month[f.getMonth()];

                    //Definição da data com nome do mês
                    html += "<tr><td>" + result[1][i].titulo_filme + "</td><td>" + result[1][i].id_filme + "</td><td>" + result[1][i].id_aluguer + "</td><td>" + result[1][i].data_inicio_aluguer.getDate() + "/" + inicio + "/" + result[1][i].data_inicio_aluguer.getFullYear() + "</td><td>" + result[1][i].data_fim_aluguer.getDate() + "/" + fim + "/" + result[1][i].data_fim_aluguer.getFullYear() + "</td><td><i class='fa-solid fa-circle-check ativo'></i></td></tr>\n";
                }
                html += "</table>"
            } else {
                html += "<p>Não há filmes alugados.</p>\n";
            }

            //==================================================
            //consulta dos filmes alugados NÃO ativos no momento
            if (result[2] && result[2].length > 0) {
                for (var i = 0; i < result[2].length; i++) {
                    html += "<tr><td>" + result[2][i].titulo_filme + "</td><td>" + result[2][i].id_filme + "</td><td>" + result[2][i].id_aluguer + "</td><td>" + result[2][i].data_inicio_aluguer.getDate() + "/" + result[2][i].data_inicio_aluguer.getMonth() + "/" + result[2][i].data_inicio_aluguer.getFullYear() + "</td><td>" + result[2][i].data_fim_aluguer.getDate() + "/" + result[2][i].data_fim_aluguer.getMonth() + "/" + result[2][i].data_fim_aluguer.getFullYear() + "</td><td><i class='fa-solid fa-circle-xmark desativo'></i></td></tr>\n";
                }
                html += "</table>\n";
                html += "</div>";
                html += "<div class='container-filmes-item2'>";
                html += "</div>";
                html += "</div>";
                html += "</div>\n";
            }
            else {
                html += "<p>Não há filmes alugados que não estão ativos no momento.</p>\n";
            }

            //======================================
            //consulta dos filmes para o form select
            if (result[3] && result[3].length > 0) {
                html += adiciona_aluguer1;
                for (var i = 0; i < result[3].length; i++) {
                    html += "<option value='" + result[3][i].id_filme + "' name='" + result[3][i].id_filme + "'>" + result[3][i].titulo_filme + "</option>";
                }
                html += "</select></td>";
            }
            else {
                html += "<p>Não há filmes alugados.</p>\n";
            }

            //==============================================
            //consulta dos distribuidoras para o form select
            if (result[4] && result[4].length > 0) {
                html += "<td><select name='id_distribuidora' id='id_distribuidora' title='id_distribuidora'>";
                html += "<option disabled selected value> -- Seleciona uma distribuidora -- </option>";
                for (var i = 0; i < result[4].length; i++) {
                    console.log("os resultados das distrubuiodoras são maoires que 0");
                    html += "<option value='" + result[4][i].id_distribuidora + "' name='" + result[4][i].id_distribuidora + "'>" + result[4][i].nome_distribuidora + "</option>";
                }
                html += "</select></td>";
            }
            else {
                html += "<p>Não há Distribuidoras alugados.</p>\n";
            }

            html += adiciona_aluguer2;
        }
        else {
            var html = "";
            html += head;
            html += error_page;
            html += footer;
        }

        html += footer;
        res.send(html);

    });
});

/*________________________________Processa Adiciona alugueres________________________________*/
servidor.post("/processa_adiciona_aluguer", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error_page = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html)");
    }
    console.log(req.body);

    if (req.body.id_filme && req.body.id_distribuidora && req.body.data_inicio_aluguer && req.body.data_fim_aluguer) {
        var query = "INSERT INTO Alugueres VALUES (null, '" + req.body.id_filme + "', '" + req.body.id_distribuidora + "', '" + req.body.data_inicio_aluguer + "', '" + req.body.data_fim_aluguer + "');\n";
        //query += "SELECT titulo_filme FROM Filmes INNER JOIN Alugueres USING(id_filme) WHERE id_aluguer =  LAST INSERTED id_alugueres;";

        pool.query(query, function (err, result, fields) {
            var html = "";
            html += head;
            html += "<h2>Adicionar um aluguer</h2>";
            console.log(err);
            console.log(result);

            if (!err) {
                if (result) {
                    /*SERÁ QUE ISTO FUNCIONA? isto fica undefined
                    query1 = "SELECT titulo_filme FROM Filmes INNER JOIN Alugueres USING(id_filme) WHERE id_aluguer =  LAST INSERTED id_alugueres;";
                    pool.query(query1, function (err, result, fields){
                        if(!err){
                            if (result){
                            html += "<p>O aluguer do Filme '" + req.body.titulo_filme + "'foi inserido com sucesso</p>";
                        }else{
                            html += "<p>O filme foi adicionado com sucesso</p>";
                        }
                    }
                });*/
                    html += "<p>O filme foi adicionado com sucesso</p>";

                }
                else {
                    html += "<p>Não foi possível inserir o aluguer do Filme '" + req.body.titulo_filme + "'</p>";
                }
            }
            else {
                html += error_page;
            }
            html += footer;
            res.send(html);
        });
    }
});


/*========================================================================================================*/
/*========================================================================================================*/
/*===============================================CLIENTES=================================================*/
/*========================================================================================================*/
/*========================================================================================================*/
/*________________________________Consulta de Clientes________________________________*/
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
                    html += "<tr><td>" + result[i].nome_cliente + "</td><td>" + result[i].dn_cliente + "</td><td>" + result[i].telefone_cliente + "</td><td>" + result[i].email_cliente + "</td><td>" + result[i].nif_cliente + "</td> <td>-</td> <td> <a href='altera_cliente?id_cliente=" + result[i].id_cliente + "'>&#9998;</a> </td> <td> <a href='confirma_apaga_cliente?id_cliente=" + result[i].id_cliente + "'>&#10007;</a> </td> </tr>\n";
                }
                html += "</table>\n";
            }
            else {
                html += "<p>Não há nenhum cliente.</p>\n";
            }
        }
        else {
            html += error_page;
        }
        html += footer;
        res.send(html);
    });
});



/*________________________________Confirma Apaga Clientes________________________________*/
servidor.get("/confirma_apaga_cliente", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    //if (req.session.id_funcionario) {
    if (req.query.id_cliente) {
        var query = "SELECT id_cliente, nome_cliente, dn_cliente, telefone_cliente, email_cliente, nif_cliente FROM Clientes WHERE id_cliente = " + mysql.escape(req.query.id_cliente) + ";";
        console.log("ID do Ciente: " + req.query.id_cliente);
        pool.query(query, function (err, result, fields) {
            var html = "";
            html += head;
            html += "<h2>Apaga Cliente</h2>\n";
            if (!err) {
                if (result && result.length == 1) {
                    html += "<p>Tem a certeza que quer apagar o Cliente '" + result[0].nome_cliente + "' com o id " + result[0].id_cliente + "?<br><a href='/processa_apaga_cliente?id_cliente=" + req.query.id_cliente + "'>Sim</a><br><a href='javascript:history.back()'>Não</a></p>\n";
                    console.log("Consulta" + result);

                } else {
                    html += "<p>Cliente não identificado</p>\n";
                    console.log("Consulta" + result);
                    console.log("Query: " + req.query);
                }
            }
            else {
                html += "<p>Erro ao executar pedido ao servidor</p>\n";
            }
            html += footer;
            res.send(html);
        });
    } else {
        var html = "";
        html += head;
        html += "<h2>Apaga Cliente</h2>\n";
        html += "<p>Por favor, identifique previamente o Cliente</p>\n";
        console.log("Consulta:" + req.body);
        html += footer;
        res.send(html);
    }
    /*}
    else {
        var html = "";
        html += topo;
        html += "<h2>apaga autor</h2>\n";
        html += "<p>funcionário não autenticado ou utilizador sem permissões</p>\n";
        html += fundo;
        res.send(html);
    }*/
});

/*________________________________Processa Apaga Clientes________________________________*/
servidor.get("/processa_apaga_cliente", function (req, res) {
    try {
        head = fs.readFileSync("public/head_timer.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    //if (req.session.id_funcionario) {
    if (req.query.id_cliente) {
        console.log("Consulta: " + req.query);
        var query = "DELETE FROM Clientes WHERE id_cliente = " + mysql.escape(req.query.id_cliente) + ";";
        pool.query(query, function (err, result, fields) {
            var html = "";
            html += head;
            html += "<h2>Apaga Cliente</h2>\n";
            if (!err) {
                html += "<p>\n";
                if (result && result.affectedRows == 1) {
                    html += "Cliente com o id " + req.query.id_cliente + " apagado com sucesso.\n";
                    console.log("Resultado:" + result);
                } else {
                    html += "Falha ao apagar o Cliente\n";
                    console.log("Resultado:" + result);
                }
                html += "</p>\n";

            }
            else {
                html += "<p>Erro ao executar pedido ao servidor</p>\n";
                console.log(err);
            }
            html += footer;
            res.send(html);
        });
    } else {
        var html = "";
        html += head;
        html += "<h2>Apaga Cliente</h2>\n";
        html += "<p>Por favor, identifique previamente o Cliente</p>\n";
        html += footer;
        res.send(html);
    }
    /*}
    else {
        var html = "";
        html += topo;
        html += "<h2>apaga autor</h2>\n";
        html += "<p>funcionário não autenticado ou utilizador sem permissões</p>\n";
        html += fundo;
        res.send(html);
    }*/
});



/*________________________________Altera Clientes________________________________*/
servidor.get("/altera_cliente", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error = fs.readFileSync("public/error.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    var html = "";
    html += head;

    //if (req.session.id_funcionario) {
    var query = "SELECT id_cliente, nome_cliente, dn_cliente, telefone_cliente, email_cliente, nif_cliente FROM Clientes WHERE id_cliente = " + req.query.id_cliente + ";";
    //res.send(query);
    pool.query(query, function (err, result, fields) {
        html += "<h2>Altera Cliente</h2>\n";
        if (!err) {
            if (result && result.length == 1) {
                html += "<form name='form_altera_cliente' method='post' action='processa_altera_cliente'>\n";
                html += "<input type='hidden' value='" + result[0].id_cliente + "' name='id_cliente'>\n";
                html += "<table>\n";
                html += "<tr><td>ID:</td><td><label>" + result[0].id_cliente + "</label></td></tr>"
                html += "<tr><td>Nome:</td><td><input type='text' name='nome_cliente' placeholder='Insira o nome do Cliente' value='" + result[0].nome_cliente + "'></td></tr>\n";
                html += "<tr><td>Data de Nascimento:</td><td><input type='date' name='dn_cliente' placeholder='Insira a Data de Nascimento' value='" + result[0].dn_cliente + "'></td></tr>\n";
                html += "<tr><td>Telefone:</td><td><input type='number' name='telefone_cliente' placeholder='123456789' pattern='[0-9]{9}' value='" + result[0].telefone_cliente + "'></td></tr>\n";
                html += "<tr><td>Email:</td><td><input type='email' name='email_cliente' placeholder:'Insira o email do Cliente' value='" + result[0].email_cliente + "'></td></tr>\n";
                html += "<tr><td>NIF:</td><td><input type='number' name='nif_cliente' placeholder:'123456789' value='" + result[0].nif_cliente + "'></td></tr>\n";

                html += "<tr><td colspan='2'><input type='submit' value='Alterar'>&nbsp;</td></tr>\n";
                html += "</table>\n";
                html += "</form>\n";
            }
            else {
                html += "<p>Erro ao executar pedido ao servidor</p>\n";
            }
            html += footer;
            res.send(html);
        }
        else {
            var html = "";
            html += head;
            html += "<h2>Altera Cliente</h2>\n";
            html += "<p>Cliente não Encontrado</p>\n";
            console.log(err);
            html += footer;
            res.send(html);
        }
    });
    /*}
    else {
        var html = "";
        html += head;
        html += "<h2>Altera Filme</h2>\n";
        html += "<p>Filme não especificado</p>\n";
        html += footer;
        res.send(html);
    }*/
});



/*________________________________Processa Altera Clientes________________________________*/
servidor.post("/processa_altera_cliente", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    //if (req.session.id_funcionario) {
    if (req.body.id_cliente && req.body.nome_cliente && req.body.dn_cliente && req.body.telefone_cliente && req.body.email_cliente && req.body.nif_cliente) {
        var query = "UPDATE Clientes SET nome_cliente = " + mysql.escape(req.body.nome_cliente) + ", dn_cliente = " + mysql.escape(req.body.dn_cliente) + ", telefone_cliente = " + mysql.escape(req.body.telefone_cliente) + ", email_cliente = " + mysql.escape(req.body.email_cliente) + ", nif_cliente = " + mysql.escape(req.body.nif_cliente) + " WHERE id_cliente = " + req.body.id_cliente + ";";
        pool.query(query, function (err, result, fields) {
            var html = "";
            html += head;
            html += "<h2>Altera Cliente</h2>\n";
            if (!err) {
                html += "<p>\n";
                if (result && result.affectedRows > 0) {
                    html += "Cliente alterado com sucesso para: '" + req.body.nome_cliente + " / " + req.body.dn_cliente + " / " + req.body.telefone_cliente + " / " + req.body.email_cliente + " / " + req.body.nif_cliente + "'\n";
                } else {
                    html += "Falha ao alterar Cliente\n";
                }
                html += "</p>\n";
            }
            else {
                html += "<p>Erro ao executar pedido ao servidor</p>\n";
                console.log(err);
                console.log(err);
            }
            html += footer;
            res.send(html);
        });
    } else {
        var html = "";
        html += head;
        html += "<h2>Altera Cliente</h2>\n";
        html += "<p>Por favor, identifique previamente o Cliente</p>\n";
        console.log(req.body);
        html += footer;
        res.send(html);
    }
    /*}
    else {
        var html = "";
        html += head;
        html += "<h2>Altera Funcionário</h2>\n";
        html += "<p>Funcionário não autenticado ou utilizador sem permissões</p>\n";
        html += footer;
        res.send(html);
    }*/
});


/*________________________________Adiciona Clientes________________________________*/
servidor.get("/adiciona_cliente", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        criar_cliente = fs.readFileSync("public/adiciona_cliente.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }
    if (req.session.id_funcionario) {

        var html = "";
        html += head;
        html += criar_cliente;

    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }


});

/*________________________________Processa Adiciona Clientes________________________________*/
servidor.post("/processa_adiciona_cliente", urlEncodedParser, function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    if (req.session.id_funcionario) {
        if (req.body.nome_cliente && req.body.nif_cliente && req.body.telefone_cliente && req.body.dn_cliente && req.body.email_cliente) {
            var query = "INSERT INTO Clientes VALUES (null, '" + req.body.nome_cliente + "', '" + req.body.dn_cliente + "', '" + req.body.telefone_cliente + "', '" + req.body.email_cliente + "', '" + req.body.nif_cliente + "');";
            //res.send(query);
            console.log("nome: " + req.body.nome_cliente + "\n" + "dn: " + req.body.dn_cliente + "\n" + "telefone: " + req.body.telefone_cliente + "\n" + "email:" + req.body.email_cliente + "\n" + "nif: " + req.body.nif_cliente + "\n");

            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Novo Cliente</h2>\n";
                if (!err) {
                    console.log(err);
                    if (result) {
                        html += "<p>" + req.body.nome_cliente + " registado como novo cliente" + "</p>\n";
                    }
                    else {
                        html += "<p>Não foi possivel registar '" + req.body.nome_cliente + "' como novo cliente</p>\n";
                    }
                }
                else {
                    html += error_page;
                }
                html += footer;
                res.send(html);
            });
        }
        else {
            var html = "";
            html += head;
            html += "<h2>Erro ao Adicionar Cliente</h2>\n";
            html += "<p>Dados incompletos, tenta de novo</p>\n";
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }
});

/*========================================================================================================*/
/*========================================================================================================*/
/*=================================================ATORES=================================================*/
/*========================================================================================================*/
/*========================================================================================================*/
/*________________________________Adiciona Atores________________________________*/
servidor.get("/adiciona_ator", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        adiciona_ator = fs.readFileSync("public/adiciona_ator.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    var html = "";
    html += head;
    html += adiciona_ator;

    html += footer;
    res.send(html);
});

/*________________________________Processa Adiciona Ator________________________________*/
servidor.post("/processa_adiciona_ator", urlEncodedParser, function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    if (req.session.id_funcionario) {
        if (req.body.nome_ator && req.body.dn_ator && req.body.premios_ator) {
            var query = "INSERT INTO Atores VALUES (null, '" + req.body.nome_ator + "', '" + req.body.dn_ator + "', '" + req.body.premios_ator + "', null);";
            //res.send(query);
            if (!req.files) {
                pool.query(query, function (err, result, fields) {
                    var html = "";
                    html += head;
                    html += "<h2>Novo Ator</h2>\n";
                    if (!err) {
                        if (result) {
                            html += "<p>" + req.body.nome_ator + " registado na base de dados" + "</p>\n";
                        }
                        else {
                            html += "<p>Não foi possivel registar '" + req.body.nome_ator + "' na base de dados</p>\n";
                        }
                    }
                    else {
                        html += error_page;
                        console.log(err);
                    }
                    html += footer;
                    res.send(html);
                });
            }

        }
        else {
            var html = "";
            html += head;
            html += "<h2>Erro ao Adicionar Ator</h2>\n";
            html += "<p>Dados incompletos, tenta de novo</p>\n";
            console.log(req.body);
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
    }

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
 
/*========================================================================================================*/
/*========================================================================================================*/
/*===============================================FUNCIONARIOS=============================================*/
/*========================================================================================================*/
/*========================================================================================================*/
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
                    html += "<tr><td>" + result[i].nome_funcionario + "</td><td>" + result[i].nif_funcionario + "</td><td>" + result[i].cc_funcionario + "</td><td>" + result[i].dn_funcionario + "</td><td>" + result[i].data_entrada_funcionario + "</td><td>" + result[i].password_funcionario + "</td><td><img class='fotografia_funcionario' src='recursos/fotografias_funcionarios/" + result[i].fotografia_funcionario + "' alt='Fotografia do Funcionário'></td</tr>\n";
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
            console.log("Estamos no req.files");
            query += "UPDATE Funcionarios SET fotografia_funcionario = '" + req.files.fotografia_funcionario.name + "' WHERE id_funcionario = LAST_INSERT_ID();";
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Regista um funcionário</h2>\n";
                if (!err) {
                    if (result) {
                        html += "<p>O funcionário'" + req.body.nome_funcionario + "' foi inserido com sucesso</p>\n";
                    }
                    else {
                        html += "<p>Não foi possivel inserir o funcionário '" + req.body.nome_funcionario + "'</p>\n";
                    }
                    req.files.fotografia_funcionario.mv("public/recursos/fotografias_funcionarios/" + req.files.fotografia_funcionario.name, function (err) {
                        if (err) {
                            console.error(err);
                            console.error("Erro ao guardar a imagem no ficheiro");
                        }
                    });
                }
                else {
                    console.log(err);
                    html += error_page;
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
});


/*========================================================================================================*/
/*========================================================================================================*/
/*==================================================CARTAZ================================================*/
/*========================================================================================================*/
/*========================================================================================================*/
//Adiciona cartaz
servidor.get("/cartaz", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        script = fs.readFileSync("public/script_valida_cartaz.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html)");
    }
    var html = "";
    html += head;

    if (req.session.id_funcionario) {
        console.log("Sessão: " + req.session.id_funcionario);
        //FALTA ADICIONAR UMA CONSUTA DO ID_CARTAZ DO CINEMA QUE O FUNCIONARIO TRABALHA, QUE VAMOS BUSCAR AO ID DO REQ.SESISON
        //E PASSAMOS ESSE PARAMETRO PARA O PROCESSA_ADICIONA_CARTAZ
        var sessao = req.session.id_funcionario;

        var query = "SELECT id_filme, titulo_filme, poster_filme FROM Filmes INNER JOIN Cartazes_has_Filmes USING(id_filme) INNER JOIN Cartazes USING(id_cartaz); SELECT id_filme, titulo_filme FROM(SELECT id_filme, titulo_filme FROM Filmes INNER JOIN Alugueres USING(id_filme) INNER JOIN Cartazes_has_Filmes USING(id_filme) WHERE NOW() BETWEEN data_inicio_aluguer AND data_fim_aluguer) AS subconsulta WHERE id_filme NOT IN (SELECT id_filme FROM Cartazes_has_Filmes); SELECT id_cartaz FROM Cartazes INNER JOIN Cinemas USING(id_cinema) WHERE id_cinema = (SELECT id_cinema FROM Cinemas INNER JOIN Funcionarios USING(id_cinema) WHERE id_funcionario ='" + sessao + "');";
        console.log(query);

        pool.query(query, function (err, result, fields) {
            html += "<h2>Cartaz do cinema de </h2>\n";
            if (!err) {
                for (var i = 0; i < result[0].length; i++) {
                    html += "<div class='container-cartaz'>";
                    html += "<div class='container-cartaz-filme'><a href= '/consulta" + result[0][i].titulo_filme + "'><img src='recursos/posteres_filmes/" + result[0][i].poster_filme + "' alt='poster do filme'></a></div>";
                    html += "</div>";
                }

                html += "<div class='grid'>\n";
                html += "<div id='child1'>\n";
                html += "<h1>Adiciona filme ao cartaz</h1>\n";
                html += "</div>\n";
                html += "<div id='child2'>\n";
                html += "<form id='adiciona_cartaz' name='adiciona_cartaz' action='processa_adiciona_cartaz' method='post'onsubmit='validate_filme()'>\n";
                html += "<tr><td><td><span class='password_alert' id='valida_filme'> </span></td></td></tr>\n";
                html += "<table>\n";
                html += "<tr>\n";
                html += "<td>Nome do filme</td>\n";
                html += "<td>Id do cinema</td>\n";
                html += "</tr>\n";
                html += "<tr>\n";
                html += "<td>\n";
                html += "<select name='id_filme' id='id_filme'>\n";
                html += "<option disabled selected value> -- Seleciona um filme -- </option>";
                //Form para adicionar os filmes ao cartaz
                for (var i = 0; i < result[1].length; i++) {
                    html += "<option id='" + result[1][i].id_filme + "' value='" + result[1][i].id_filme + "' name='" + result[1][i].id_filme + "''>" + result[1][i].titulo_filme + "</option>";
                }
                html += "</select>\n";
                //colocar input que não se pode preensher hidden or readonly
                //não percebo o porque de termos de usar um ciclo quando a tabela só tem um resultado
                for (var i = 0; i < result[2].length; i++) {
                    html += "<input type='text' name='id_cartaz' value='" + result[2][i].id_cartaz + "' readonly>";
                }
                html += script;
                console.log(result);
            }

            else {
                html += "<p>Erro ao executar pedido ao servidor</p>\n";
                console.log(err);
            }


            html += footer;
            res.send(html);
        });
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }

});

//Processa Adiciona cartaz
servidor.post("/processa_adiciona_cartaz", urlEncodedParser, function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        head_timer_cartazes = fs.readFileSync("public/head_timer_cartazes.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    if (req.session.id_funcionario) {
        console.log(req.body);

        if (req.body.id_filme && req.body.id_cartaz) {
            var query = "INSERT INTO Cartazes_has_Filmes VALUES ('" + req.body.id_cartaz + "', '" + req.body.id_filme + "');\n SELECT id_filme, titulo_filme FROM Filmes INNER JOIN Cartazes_has_Filmes USING(id_filme) WHERE id_cartaz ='" + req.body.id_cartaz + "';";
            //res.send(query);
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head_timer_cartazes;
                html += "<h2>Adiciona filme ao cartaz</h2>\n";
                if (!err) {
                    if (result) {
                        html += "<p>O filme '<b>" + result[1].req.body.filme + "'</b> de id <b>" + result[1].req.body.filme + "</b> foi adicionado aos cartazes com sucesso" + "</p>\n";
                    }
                    else {
                        html += "<p>Não foi possivel adicionar o filme '<b>" + result[1].req.body.filme + "'</b> de id <b>" + result[1].req.body.filme + "</b> nos cartazes</p>\n";
                    }
                }
                else {
                    html += "<p>Erro ao executar pedido ao servidor</p>\n";
                    console.log(err);
                }
                html += footer;
                res.send(html);
            });
        }
        else {
            var html = "";
            html += head;
            html += "<h2>Erro ao Adicionar Filme ao cartaz</h2>\n";
            html += "<p>Dados incompletos, tenta de novo</p>\n";
            console.log(req.body);
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
    }
});


/*________________________________Pagina não autenticado________________________________*/
/*______________________________________PARA TESTE______________________________________*/
servidor.get("/nao_autenticado", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }

    var html = "";
    html += head;
    html += nao_autenticado;
    html += footer;
    res.send(html);
});

/*========================================================================================================*/
/*========================================================================================================*/
/*==================================================SESSAO================================================*/
/*========================================================================================================*/
/*========================================================================================================*/


/*_____________________________________Consulta sessao___________________________________*/
/*_______________________________________________________________________________________*/
servidor.get("/sessoes", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error_page = fs.readFileSync("public/error.html", "utf-8");
        script = fs.readFileSync("public/script.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html)");
    }
    var sessao = req.session.id_funcionario;
    var html = "";
    html += head;
    var query = "SELECT * FROM Filmes INNER JOIN Sessoes USING(id_filme) INNER JOIN Bilhetes USING(id_sessao) INNER JOIN Vendas USING(id_venda) INNER JOIN Funcionarios USING(id_funcionario) WHERE id_cinema = (SELECT id_cinema FROM Cinemas INNER JOIN Funcionarios USING(id_cinema) WHERE id_funcionario ='" + sessao + "';)";

    pool.query(query, function (err, result, fields) {
        var html = "";
        html += head;
        html += "<h1>Sessões</h1>\n";
        if (!err) {
            console.log(err);
            html += "<div class='container-filmes'>";
            html += "<div class='container-filmes-item1'>";
            if (result && result.length > 0) {
                html += "<table class='tabela'>\n";
                html += "<tr><th>Data e hora da sessao</th><th>Titulo do Filme</th><th>Diretor</th><th>Ano</th><th>Duração</th><th>Classificação</th><th>Premio</th><th>Género</th><th>Poster</th></tr>\n";
                for (var i = 0; i < result.length; i++) {
                    console.log("os resultados são maiores que 0");
                    html += "<tr><td>" + result[i].data_hora_sessao + "</td><td>" + result[i].titulo_filme + "</td><td>" + result[i].id_filme + "</td><td>" + result[i].id_sessao + "</td><td>" + result[i].poster_filme + "</td><td>" + result[i].premios_filme + "</td><td>" + result[i].nome_genero + "</td><td><img class='poster_filme' src='recursos/posteres_filmes/" + result[i].poster_filme + "' alt='Poster do filme'></td> <td> <a href='altera_sessao?id_filme=" + result[i].id_filme + "'>&#9998;</a> </td> <td> <a href='confirma_apaga_sessao?id_filme=" + result[i].id_filme + "'>&#10007;</a> </td> </tr>\n";
                }
                html += "</table>\n";
                if (req.session.id_funcionario) {
                    html += "<a class='btn_adiciona_sessoes' href='/adiciona_sessao'>Adiciona sessão</a>";
                }
                html += "</div>"
            }
            else {
                if (req.session.id_funcionario) {
                    html += "<a class='btn_adiciona_sessoes' href='/adiciona_sessao'>Adiciona sessão</a>";
                }
                html += "<h1>Não foi possivel aceder aos dados das sessões</h1>\n";
            }
        }
        else {
            html += error_page;
        }
        html += footer;
        res.send(html);
    });
});


/*_____________________________________Adiciona sessao___________________________________*/
/*_______________________________________________________________________________________*/
servidor.get("/adiciona_sessao", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error_page = fs.readFileSync("public/error.html", "utf-8");
        script = fs.readFileSync("public/script.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html)");
    }
    var html = "";
    html += head;

    if (req.session.id_funcionario) {

        var query = "SELECT id_filme, titulo_filme nome_cliente FROM Filmes; SELECT id_sala FROM Salas";
        if (req.session.id_funcionario) {
            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Venda de Bilhete</h2>\n";
                if (!err) {
                    console.log(err);
                    if (result) {
                        console.log(result);
                        html += "<div class='adiciona-filme'>\n";
                        html += "<form name ='seleciona_cliente' id='seleciona_cliente' action='processa_sessao' method='post'>\n";
                        html += "<table class='table-adiciona-filme'>\n";
                        html += "<tr>\n";
                        html += "<th>Venda de Bilhete</th>\n";
                        html += "</tr>\n";
                        html += "<tr>\n";
                        html += "<td><label>Cliente</label></td>\n";
                        html += "</tr>\n";
                        html += "<tr>\n";
                        html += "<td><select name='id_filme' id='id_filme' title='id_filme'>\n";
                        html += "<option disabled selected value> -- Seleciona um filme -- </option>\n";
                        for (var i = 0; i < result[0].length; i++) {
                            html += "<option id='" + result[0][i].id_filme + "' value='" + result[0][i].id_filme + "' name='" + result[0][i].id_filme + "''>" + result[0][i].titulo_filme + "</option>\n";
                        }
                        html += "</select>\n";
                        html += "<option disabled selected value> -- Seleciona uma sala -- </option>\n";
                        for (var i = 0; i < result[1].length; i++) {
                            html += "<option id='" + result[1][i].id_sala + "' value='" + result[1][i].id_sala + "' name='" + result[1][i].id_sala + "''>" + (result[1][i].id_sala - result[1][i].id_sala + i) + "</option>\n";// Utiliza-se: (result[1][i].id_sala - result[1][i].id_sala + i) para que o numero da sala apareça sempre a partir do 1
                        }
                        html += "</select>\n";
                        html += "<tr><td> <span class='password_alert' id='valida_filme'> </span></td><td> <span class='password_alert' id='valida_sala'> </span></td></tr>\n";
                        html += "<tr><td>Data de sessão</td><td><input id='data_sessao' title='data de sessão' name='data_sessao' type='date' required></td></tr>\n";
                        html += "<tr><td>Hora de sessão</td><td><input id='hora_sessao' title='hora de sessão' name='hora_sessao' type='time' required></td></tr>\n";
                        html += "<td colspan='2'><input type='button' onclick='if (validate_filme() validate_data() validate_hora()) { document.getElementById(\"seleciona_cliente\").submit();}' value='Selecionar cliente'></td>\n";
                        html += "</tr>\n";
                        html += "</table>\n";
                        html += "</form>\n";
                        html += "</div>\n";
                        html += script;
                    } else {
                        html += "<div class='adiciona-filme'>\n";
                        html += "<h1>Não foi possivel ligar ao servidor para</h1>\>"
                        html += "</div>\n"
                    }
                }
                else {
                    html += error_page;
                }

                html += footer;
                res.send(html);
            });

        } else {
            var html = "";
            html += head;
            html += nao_autenticado;
            html += footer;
            res.send(html);
        }

    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }
});

/*_____________________________________Adiciona sessao___________________________________*/
/*_______________________________Processa Adiciona sessao________________________________*/
servidor.post("/processa_adiciona_sessao", urlEncodedParser, function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    if (req.session.id_funcionario) {
        if (req.body.id_filme && req.body.id_sala && req.body.data_sessao && req.body.hora_sessao) {
            var query = "INSERT INTO Sessoes VALUES (null, '" + req.body.id_filme + "', '" + req.body.id_sala + "', '" + req.body.data_sessao + " " + req.body.hora_sessao + "');";
            //res.send(query);
            console.log(query);

            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Venda de Bilhete</h2>\n";
                if (!err) {
                    console.log(err);
                    if (result) {
                        console.log(result);

                    }
                    else {
                        html += error_page;
                        html += "<p>Não foi possivel aceder aos dados do formulário</p>\n";
                    }
                }
                else {
                    html += error_page;
                }
                html += footer;
                res.send(html);
            });


        }
        else {
            var html = "";
            html += head;
            html += error_page;
            html += "<h2>Erro ao Adicionar Ator</h2>\n";
            html += "<p>Dados incompletos, tenta de novo</p>\n";
            console.log(req.body);
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }

});
/*========================================================================================================*/
/*========================================================================================================*/
/*===============================================BILHETES=================================================*/
/*========================================================================================================*/
/*========================================================================================================*/


/*______________________________________________________________________________________*/
/*_______________________________________Bilhetes_______________________________________*/
/*______________________________________________________________________________________*/
//Primeiro passo adicionar um venda
//Selecionar o cliente
//O resto é preenchido atomáticamente
//id_funcionario = req.session.id_funcionario
//data e hora da venda utiliza-se a função NOW() do sql
//id_venda que é a chave primaria e é auto incrementada
servidor.get("/bilhetes", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        error_page = fs.readFileSync("public/error.html", "utf-8");
        script = fs.readFileSync("public/script.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html)");
    }
    var html = "";
    html += head;

    //var query = "SELECT * FROM Clientes Funcionarios INNER JOIN Bilhetes USING(id_funcionario) INNER JOIN Vendas USING(id_venda) INNER JOIN Assentos USING(id_assento) INNER JOIN Salas INNER JOIN Sessoes INNER JOIN Filmes INNER JOIN Cartazes_has_Filmes INNER JOIN Cinemas";
    var query = "SELECT id_cliente, nome_cliente FROM Clientes;";
    if (req.session.id_funcionario) {
        pool.query(query, function (err, result, fields) {
            var html = "";
            html += head;
            html += "<h2>Venda de Bilhete</h2>\n";
            if (!err) {
                console.log(err);
                if (result) {
                    console.log(result);
                    html += "<div class='adiciona-filme'>\n";
                    html += "<form name ='seleciona_cliente' id='seleciona_cliente' action='processa_adiciona_venda' method='post'>\n";
                    html += "<table class='table-adiciona-filme'>\n";
                    html += "<tr>\n";
                    html += "<th>Venda de Bilhete</th>\n";
                    html += "</tr>\n";
                    html += "<tr>\n";
                    html += "<td><label>Cliente</label></td>\n";
                    html += "</tr>\n";
                    html += "<tr>\n";
                    html += "<td><select name='id_cliente' id='id_cliente' title='id_cliente'>\n";
                    html += "<option disabled selected value> -- Seleciona um cliente -- </option>\n";
                    for (var i = 0; i < result.length; i++) {
                        html += "<option id='" + result[i].id_cliente + "' value='" + result[i].id_cliente + "' name='" + result[i].id_cliente + "''>" + result[i].nome_cliente + "</option>\n";
                    }
                    html += "</select>\n";
                    html += "<tr><td> <span class='password_alert' id='valida_cliente'> </span></td></tr>\n"
                    html += "<td colspan='2'><input type='button' onclick='if (validate_cliente()) { document.getElementById(\"seleciona_cliente\").submit();}' value='Selecionar cliente'></td>\n";
                    html += "</tr>\n";
                    html += "</table>\n";
                    html += "</form>\n";
                    html += "</div>\n";
                    html += script;
                }
                else {
                    html += "<p>Não foi possivel há clientes para vender bilhetes</p>\n";
                }
            }
            else {
                html += error_page;
            }

            html += footer;
            res.send(html);
        });

    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }
});


/*__________________________Segundo passo de vender um bilhete___________________________*/
/*________________________________Processa Adiciona Venda________________________________*/
servidor.post("/processa_adiciona_venda", urlEncodedParser, function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
        nao_autenticado = fs.readFileSync("public/nao_autenticado.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    if (req.session.id_funcionario) {
        if (req.body.id_cliente) {
            var query = "INSERT INTO Vendas VALUES (null, '" + req.session.id_funcionario + "', '" + req.body.id_cliente + "', NOW()); SELECT LAST_INSERT_ID() AS id_venda; SELECT id_filme, titulo_filme FROM Filmes;";
            //res.send(query);
            console.log(query);

            pool.query(query, function (err, result, fields) {
                var html = "";
                html += head;
                html += "<h2>Venda de Bilhete</h2>\n";
                if (!err) {
                    console.log(err);
                    if (result) {
                        console.log(result);
                        html += "<div class='adiciona-filme'>\n";
                        html += "<form name ='seleciona_filme' id='seleciona_filme' action='processa_seleciona_filme' method='post'>\n";
                        html += "<table class='table-adiciona-filme'>\n";
                        html += "<tr>\n";
                        html += "<th>Venda de Bilhete</th>\n";
                        html += "</tr>\n";
                        html += "<tr>\n";
                        html += "<td><label>Filme</label></td>\n";
                        html += "</tr>\n";
                        html += "<tr>\n";
                        for (var i = 0; i < result[1].length; i++) {
                            html += "<td><input type='hidden' name='id_venda' value='" + result[1][i].id_venda + "'></td>\n";
                        }
                        html += "<td><select name='id_cliente' id='id_filme' title='id_cliente'>\n";
                        html += "<option disabled selected value> -- Seleciona um filme -- </option>\n";
                        for (var i = 0; i < result[2].length; i++) {
                            html += "<option id='" + result[2][i].id_filme + "' value='" + result[2][i].id_filme + "' name='" + result[2][i].id_filme + "''>" + result[2][i].nome_filme + "</option>\n";
                        }
                        html += "</select>\n";
                        html += "<tr><td> <span class='password_alert' id='valida_cliente'> </span></td></tr>\n"
                        html += "<td colspan='2'><input type='button' onclick='if (validate_cliente()) { document.getElementById(\"seleciona_cliente\").submit();' value='Selecionar cliente'></td>\n";
                        html += "</tr>\n";
                        html += "</table>\n";
                        html += "</form>\n";
                        html += script;
                    }
                    else {
                        html += "<p>Não foi possivel há clientes para vender bilhetes</p>\n";
                    }
                }
                else {
                    html += error_page;
                }
                html += footer;
                res.send(html);
            });


        }
        else {
            var html = "";
            html += head;
            html += "<h2>Erro ao Adicionar Ator</h2>\n";
            html += "<p>Dados incompletos, tenta de novo</p>\n";
            console.log(req.body);
            html += footer;
            res.send(html);
        }
    } else {
        var html = "";
        html += head;
        html += nao_autenticado;
        html += footer;
        res.send(html);
    }

});