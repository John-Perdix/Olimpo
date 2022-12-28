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
const month = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
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
                    console.log("A sessão é: " + req.session.nome_funcionario);
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
    }
    else {
        var html = "";
        html += head;
        html += "<h2>Login Funcionário</h2>\n";
        html += "<p>dados de autenticação do funcionário não definidos</p>\n";
        html += footer;
        res.send(html);
    }
});




/*________________________________Perfil________________________________*/
servidor.get("/perfil_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html");
    }
    console.log(req.session.id_funcionario);

    var html = "";
    html += head;

    if (req.session.id_funcionario) {

        var query = "SELECT id_funcionario, nome_funcionario, nif_funcionario, cc_funcionario, dn_funcionario, data_entrada_funcionario, fotografia_funcionario FROM Funcionarios INNER JOIN Cinemas USING(id_cinema) WHERE id_funcionario = '" + req.session.id_funcionario + "';";
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
    }
    else {
        var html = "";
        html += head;
        html += "<h2>Perfil</h2>\n";
        html += "<p>Não tem sessão iniciada</p>\n";
        html += "<p>Faça <a href='/login'>Login</p>\n";
        html += footer;
        res.send(html);
    }
});

/*________________________________Altera Funcionário________________________________*/
servidor.get("/altera_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
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
        }
        else {
            var html = "";
            html += head;
            html += "<h2>Altera Funcionário</h2>\n";
            html += "<p>Funcionário não especificado</p>\n";
            html += footer;
            res.send(html);
        }
    
    
});

/*________________________________Processa Altera Funcionário________________________________*/
servidor.post("/processa_altera_funcionario", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
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
    }
    else {
        var html = "";
        html += head;
        html += "<h2>Altera Funcionário</h2>\n";
        html += "<p>Funcionário não autenticado ou utilizador sem permissões</p>\n";
        html += footer;
        res.send(html);
    }
});



// Logout do Funcionário
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
                    html += "<tr><td>" + result[i].titulo_filme + "</td><td>" + result[i].nome_diretor + "</td><td>" + result[i].ano_filme + "</td><td>" + result[i].runtime_filme + " min.</td><td>" + result[i].classificacao_filme + "</td><td>" + result[i].premios_filme + "</td><td><img class='poster_filme' src='recursos/posteres_filmes/" + result[i].poster_filme + "' alt='Poster do filme'></td></tr>\n";
                    console.log(i);
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

/*________________________________Página de Erro________________________________*/
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

/*________________________________Consulta de Alugueres e Distribuidoras________________________________*/
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

    var html = "";
    html += head;

    var query1 = "SELECT * FROM Distribuidoras;\n";

    //res.send(query);

    //consulta distribuidoras
    pool.query(query1, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                html += "<div class='container-body'>\n";
                html += "<div class='container-body-item'>\n";
                html += "<div class='container'>\n";
                html += "<h2>Distribuidoras</h2>";
                for (var i = 0; i < result.length; i++) {
                    html += "<div class='container-distribuidora'><div class='barra'></div><table><tr><td>" + result[i].id_distribuidora + "</td></tr><tr><td>" + result[i].nome_distribuidora + "</td></tr><tr><td>" + result[i].morada_distribuidora + "</td></tr><tr><td>" + result[i].email_distribuidora + "</td></tr><tr><td>" + result[i].telefone_distribuidora + "</td></tr></table></div>\n";
                }
                html += "</div>\n";
                html += "</div>\n";

            }
            else {
                html += sem_distribuidoras;
            }
        }
        else {
            html += error_page;
        }
    });


    //consulta alugueres que estão neste momento ativos
    var query2 = "SELECT id_aluguer, id_filme, titulo_filme, nome_distribuidora, data_inicio_aluguer, data_fim_aluguer  FROM Alugueres INNER JOIN Distribuidoras using(id_distribuidora) INNER JOIN Filmes using(id_filme) WHERE NOW() BETWEEN data_inicio_aluguer AND data_fim_aluguer;";
    //res.send(query);
    pool.query(query2, function (err, result, fields) {
        if (!err) {
            html += "<div class='container-body-item'>\n";
            html += "<div class='container-filmes'>";
            html += "<div class='container-filmes-item1'>";
            html += "<h2>Alugueres disponiveis</h2>\n";


            if (result && result.length > 0) {
                html += "<table class='tabela'>\n";
                html += "<tr><th>Titulo do Filme</th><th>Id do filme</th><th>Id do aluguer</th><th>Data do inicio do aluguer</th><th>Data do fim do aluguer</th><th>Status</th></tr>\n";
                for (var i = 0; i < result.length; i++) {
                    const ini = result[i].data_inicio_aluguer;
                    const f = result[i].data_fim_aluguer;
                    let inicio = month[ini.getMonth()];
                    let fim = month[f.getMonth()];

                    //Definição da data com nome do mês
                    html += "<tr><td>" + result[i].titulo_filme + "</td><td>" + result[i].id_filme + "</td><td>" + result[i].id_aluguer + "</td><td>" + result[i].data_inicio_aluguer.getDate() + "/" + inicio + "/" + result[i].data_inicio_aluguer.getFullYear() + "</td><td>" + result[i].data_fim_aluguer.getDate() + "/" + fim + "/" + result[i].data_fim_aluguer.getFullYear()+ "</td><td><i class='fa-solid fa-circle-check ativo'></i></td></tr>\n";
                }
                html += "</table>"
            }
            else {
                html += "<p>Não há filmes alugados.</p>\n";
            }
        }
        else {
            html += error_page;
        }
    });

        //consulta alugueres que NÃO estão neste momento ativos
        var query2 = "SELECT id_aluguer, id_filme, titulo_filme, nome_distribuidora, data_inicio_aluguer, data_fim_aluguer  FROM Alugueres INNER JOIN Distribuidoras using(id_distribuidora) INNER JOIN Filmes using(id_filme) WHERE NOW() NOT BETWEEN data_inicio_aluguer AND data_fim_aluguer;";
        //res.send(query);
        pool.query(query2, function (err, result, fields) {
            if (!err) {
                if (result && result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        html += "<tr><td>" + result[i].titulo_filme + "</td><td>" + result[i].id_filme + "</td><td>" + result[i].id_aluguer + "</td><td>" + result[i].data_inicio_aluguer.getDate() + "/" + result[i].data_inicio_aluguer.getMonth() + "/" + result[i].data_inicio_aluguer.getFullYear() + "</td><td>" + result[i].data_fim_aluguer.getDate() + "/" + result[i].data_fim_aluguer.getMonth() + "/" + result[i].data_fim_aluguer.getFullYear() + "</td><td><i class='fa-solid fa-circle-xmark desativo'></i></td></tr>\n";
                    }
                    html += "</table>\n";
                    html += "</div>";
                    html += "<div class='container-filmes-item2'>";
                    html += "</div>";
                    html += "</div>";
                    html += "</div>\n";
                }
                else {
                    html += "<p>Não há filmes alugados.</p>\n";
                }
            }
            else {
                html += error_page;
            }
            html += "<div class='container-filmes-item2'>";
            html += "</div>";
            html += "</div>";
        });

        //form para adicionar aluguer
    //consulta de filmes para a o select filmes
    var query3 = "SELECT id_filme, titulo_filme FROM Filmes;";
    //res.send(query);
    pool.query(query3, function (err, result, fields) {
        if (!err) {
            html += adiciona_aluguer1;
            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    html += "<option value='" + result[i].id_filme + "' name='" + result[i].id_filme + "'>" + result[i].titulo_filme + "</option>";
                }
            }
            else {
                html += "<p>Não há filmes alugados.</p>\n";
            }
        }
        else {
            html += error_page;
        }

        //html += adiciona_aluguer2;
        //html +="<tr><td><td> <span class='password_alert' id='valida_filme'> </span></td></td></tr>";

    });

    var query4 = "SELECT id_distribuidora, nome_distribuidora FROM Distribuidoras;";
    pool.query(query4, function (err, result, fields) {
        html += "<td><select name='id_distribuidora' id='id_distribuidora' title='id_distribuidora'>";
        if (!err) {
            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    console.log("os resultados das distrubuiodoras são maoires que 0");
                    html += "<option value='" + result[i].id_distribuidora + "' name='" + result[i].id_distribuidora + "'>" + result[i].nome_distribuidora + "</option>";
                }
                html+= "</select></td>";
                html +="<tr><td><std> <span class='password_alert' id='valida_distribuidora'> </span></td></td></tr>";
            }
            else {
                html += "<p>Não há Distribuidoras alugados.</p>\n";
            }
        }
        else {
            html += error_page;
        }
        html += adiciona_aluguer2;
        html += "<div class='container-filmes-item2'>";
        html += "</div>";
        html += "</div>";

        html += footer;
        res.send(html);
    });
});

/*______________________________________________________________________________________________________*/
/*________________________________Consulta de Alugueres e Distribuidoras________________________________*/
/*_______________________________________________TESTE__________________________________________________*/
/*______________________________________________________________________________________________________*/
servidor.get("/alugueres2", function (req, res) {
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

    var html = "";
    html += head;

    var query = "SELECT * FROM Distribuidoras; SELECT id_aluguer, id_filme, titulo_filme, nome_distribuidora, data_inicio_aluguer, data_fim_aluguer  FROM Alugueres INNER JOIN Distribuidoras using(id_distribuidora) INNER JOIN Filmes using(id_filme) WHERE NOW() BETWEEN data_inicio_aluguer AND data_fim_aluguer; SELECT id_aluguer, id_filme, titulo_filme, nome_distribuidora, data_inicio_aluguer, data_fim_aluguer  FROM Alugueres INNER JOIN Distribuidoras using(id_distribuidora) INNER JOIN Filmes using(id_filme) WHERE NOW() NOT BETWEEN data_inicio_aluguer AND data_fim_aluguer; SELECT id_filme, titulo_filme FROM Filmes; SELECT id_distribuidora, nome_distribuidora FROM Distribuidoras;";

    //res.send(query);

    //consulta distribuidoras
    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result[0] && result.length[0] > 0) {
                html += "<div class='container-body'>\n";
                html += "<div class='container-body-item'>\n";
                html += "<div class='container'>\n";
                html += "<h2>Distribuidoras</h2>";
                for (var i = 0; i < result.length[0]; i++) {
                    html += "<div class='container-distribuidora'><div class='barra'></div><table><tr><td>" + result[0][i].id_distribuidora + "</td></tr><tr><td>" + result[0][i].nome_distribuidora + "</td></tr><tr><td>" + result[0][i].morada_distribuidora + "</td></tr><tr><td>" + result[0][i].email_distribuidora + "</td></tr><tr><td>" + result[0][i].telefone_distribuidora + "</td></tr></table></div>\n";
                }
                html += "</div>\n";
                html += "</div>\n";

            }
            else {
                html += sem_distribuidoras;
            }
        }
        else {
            html += error_page;
        }
    });


    //consulta alugueres que estão neste momento ativos
    /*query += "SELECT id_aluguer, id_filme, titulo_filme, nome_distribuidora, data_inicio_aluguer, data_fim_aluguer  FROM Alugueres INNER JOIN Distribuidoras using(id_distribuidora) INNER JOIN Filmes using(id_filme) WHERE NOW() BETWEEN data_inicio_aluguer AND data_fim_aluguer; ";*/
    //res.send(query);
    pool.query(query, function (err, result, fields) {
        if (!err) {
            html += "<div class='container-body-item'>\n";
            html += "<div class='container-filmes'>";
            html += "<div class='container-filmes-item1'>";
            html += "<h2>Alugueres disponiveis</h2>\n";


            if (result[1] && result.length[1] > 0) {
                html += "<table class='tabela'>\n";
                html += "<tr><th>Titulo do Filme</th><th>Id do filme</th><th>Id do aluguer</th><th>Data do inicio do aluguer</th><th>Data do fim do aluguer</th><th>Status</th></tr>\n";
                for (var i = 0; i < result.length[1]; i++) {
                    const ini = result[1][i].data_inicio_aluguer;
                    const f = result[1][i].data_fim_aluguer;
                    let inicio = month[ini.getMonth()];
                    let fim = month[f.getMonth()];

                    //Definição da data com nome do mês
                    html += "<tr><td>" + result[1][i].titulo_filme + "</td><td>" + result[1][i].id_filme + "</td><td>" + result[1][i].id_aluguer + "</td><td>" + result[1][i].data_inicio_aluguer.getDate() + "/" + inicio + "/" + result[1][i].data_inicio_aluguer.getFullYear() + "</td><td>" + result[1][i].data_fim_aluguer.getDate() + "/" + fim + "/" + result[1][i].data_fim_aluguer.getFullYear()+ "</td><td><i class='fa-solid fa-circle-check ativo'></i></td></tr>\n";
                }
                html += "</table>"
            }
            else {
                html += "<p>Não há filmes alugados.</p>\n";
            }
        }
        else {
            html += error_page;
        }
    });

        //consulta alugueres que NÃO estão neste momento ativos
        /*query += "SELECT id_aluguer, id_filme, titulo_filme, nome_distribuidora, data_inicio_aluguer, data_fim_aluguer  FROM Alugueres INNER JOIN Distribuidoras using(id_distribuidora) INNER JOIN Filmes using(id_filme) WHERE NOW() NOT BETWEEN data_inicio_aluguer AND data_fim_aluguer;";*/
        //res.send(query);
        pool.query(query, function (err, result, fields) {
            if (!err) {
                if (result[2] && result.length[2] > 0) {
                    for (var i = 0; i < result.length[2]; i++) {
                        html += "<tr><td>" + result[2][i].titulo_filme + "</td><td>" + result[2][i].id_filme + "</td><td>" + result[2][i].id_aluguer + "</td><td>" + result[2][i].data_inicio_aluguer.getDate() + "/" + result[2][i].data_inicio_aluguer.getMonth() + "/" + result[i].data_inicio_aluguer.getFullYear() + "</td><td>" + result[2][i].data_fim_aluguer.getDate() + "/" + result[2][i].data_fim_aluguer.getMonth() + "/" + result[i].data_fim_aluguer.getFullYear() + "</td><td><i class='fa-solid fa-circle-xmark desativo'></i></td></tr>\n";
                    }
                    html += "</table>\n";
                    html += "</div>";
                    html += "<div class='container-filmes-item2'>";
                    html += "</div>";
                    html += "</div>";
                    html += "</div>\n";
                }
                else {
                    html += "<p>Não há filmes alugados.</p>\n";
                }
            }
            else {
                html += error_page;
            }
            html += "<div class='container-filmes-item2'>";
            html += "</div>";
            html += "</div>";
        });

    //consulta de filmes para a o select filmes
    //query += "SELECT id_filme, titulo_filme FROM Filmes;";
    //res.send(query);
    pool.query(query, function (err, result, fields) {
        if (!err) {
            html += adiciona_aluguer1;
            if (result[3] && result.length[3] > 0) {
                for (var i = 0; i < result.length[3]; i++) {
                    html += "<option value='" + result[3][i].id_filme + "' name='" + result[3][i].id_filme + "'>" + result[3][i].titulo_filme + "</option>";
                }
            }
            else {
                html += "<p>Não há filmes alugados.</p>\n";
            }
        }
        else {
            html += error_page;
        }

        //html += adiciona_aluguer2;
        //html +="<tr><td><td> <span class='password_alert' id='valida_filme'> </span></td></td></tr>";

    });

    //query += "SELECT id_distribuidora, nome_distribuidora FROM Distribuidoras;";
    pool.query(query, function (err, result, fields) {
        html += "<td><select name='id_distribuidora' id='id_distribuidora' title='id_distribuidora'>";
        if (!err) {
            if (result[4] && result.length[4] > 0) {
                for (var i = 0; i < result.length[4]; i++) {
                    console.log("os resultados das distrubuiodoras são maoires que 0");
                    html += "<option value='" + result[4][i].id_distribuidora + "' name='" + result[4][i].id_distribuidora + "'>" + result[4][i].nome_distribuidora + "</option>";
                }
                html+= "</select></td>";
                html +="<tr><td><std> <span class='password_alert' id='valida_distribuidora'> </span></td></td></tr>";
            }
            else {
                html += "<p>Não há Distribuidoras alugados.</p>\n";
            }
        }
        else {
            html += error_page;
        }
        html += adiciona_aluguer2;
        html += "<div class='container-filmes-item2'>";
        html += "</div>";
        html += "</div>";

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
                        //html += "não dá burro";
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
    html += head;
    html += adiciona_filme;

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

    if (req.body.titulo_filme && req.body.ano_filme && req.body.classificacao_filme && req.body.genero_filme && req.body.duracao_filme && req.body.premios_filme && req.body.poster_filme) {
        var query = "INSERT INTO Filmes VALUES (null, '" + req.body.titulo_filme + "', '" + req.body.ano_filme + "', '" + req.body.classificacao_filme + "', '" + req.body.genero_filme + "', 'poster', '" + req.body.duracao_filme + "', '" + req.body.premios_filme + "');";

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
                    html += "<p>Erro ao executar pedido ao servidor</p>\n";
                }
                html += footer;
                res.send(html);
            });
        }
    }
});

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
                    html += "<tr><td>" + result[i].nome_cliente + "</td><td>" + result[i].dn_cliente + "</td><td>" + result[i].telefone_cliente + "</td><td>" + result[i].email_cliente + "</td><td>" + result[i].nif_cliente + "</td</tr>\n";
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

/*________________________________Adiciona Clientes________________________________*/
servidor.get("/adiciona_cliente", function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        criar_funcionario = fs.readFileSync("public/adiciona_cliente.html", "utf-8");
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

/*________________________________Processa Adiciona Clientes________________________________*/
servidor.post("/processa_adiciona_cliente", urlEncodedParser, function (req, res) {
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    //if (req.session.id_funcionario) {
        if (req.body.nome_cliente && req.body.nif_cliente && req.body.telefone_cliente && req.body.dn_cliente && req.body.email_cliente) {
            var query = "INSERT INTO Clientes VALUES (null, '" + req.body.nome_cliente + "', '" + req.body.dn_cliente + "', '" + req.body.telefone_cliente + "', '" + req.body.email_cliente + "', '" + req.body.nif_cliente + "');";
            //res.send(query);
            console.log("nome: " + req.body.nome_cliente + "\n" + "dn: " + req.body.dn_cliente + "\n" + "telefone: " + req.body.telefone_cliente + "\n" + "email:" + req.body.email_cliente + "\n" + "nif: " + req.body.nif_cliente + "\n");
            if (!req.files) {
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
                        html += "<p>Erro ao executar pedido ao servidor</p>\n";
                    }
                    html += footer;
                    res.send(html);
                });
            }
            //Guardar o todos os dados e deixar em branco o fotografia_funcionario
            //depois no req.files fazer alter do atributo e passar o fotografia_funcionario com o nome do ficheiro
            
        }
        else {
            var html = "";
            html += head;
            html += "<h2>Erro ao Adicionar Cliente</h2>\n";
            html += "<p>Dados incompletos, tenta de novo</p>\n";
            html += footer;
            res.send(html);
        }
    });

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
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros head.html e footer.html (ou, pelo menos, um deles)");
    }

    //if (req.session.id_funcionario) {
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
                        html += "<p>Erro ao executar pedido ao servidor</p>\n";
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
});


//bilhetes
servidor.get("/bilhetes", function(req, res){
    try {
        head = fs.readFileSync("public/head.html", "utf-8");
        footer = fs.readFileSync("public/footer.html", "utf-8");
        content = fs.readFileSync("public/home.html", "utf-8");
    }
    catch (error) {
        console.error("Erro ao ler os ficheiros html)");
    }
    var html = "";
    html+= head;
    
    var query = "SELECT * FROM Clientes Funcionarios INNER JOIN Bilhetes USING(id_funcionario) INNER JOIN Vendas USING(id_venda) INNER JOIN Assentos USING(id_assento) INNER JOIN Salas INNER JOIN Sessoes INNER JOIN Filmes INNER JOIN Cartazes_has_Filmes INNER JOIN Cinemas";
    pool.query(query, function (err, result, fields) {
        var html = "";
        html += head;
        html += "<h2>Novo Funcionário</h2>\n";
        console.log("Estamos no !req.files");
        if (!err) {
            console.log("estamos no !req.files e deu erro aqui");
            console.log(err);
            if (result) {
                html += "<div class='adiciona-filme'>";
                html += "<form name ='adiciona_bilhete' id='adiciona_bilhete' action='processa_adiciona_bilhete' method='post'>";
                html += "<table class='table-adiciona-filme'>";
                html += "<tr>";
                html += "<th>Adiciona um aluguer</th>";
                html += "</tr>";
                html += "<tr>";
                html += "<td><label>Filme</label></td>";
                html += "<td><label>Distribuidoras</label></td>";
                html += "</tr>";
                html += "<tr>";
                html += "<td><select name='id_filme' id='id_filme' title='titulo_filme'>";
                for(var i=0; i<result.length; i++ ){
                    "<option value='" + result[i].id_filme + "'>" + result[i].titulo.filme + "</option>"
            }
            html += "</select>";


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

    
    html += footer;

});

/*
// página para efectuar o logout do funcionário
site.get("/logout_funcionario", function (req, res) {
    // destruir variáveis de sessão individualmente
    //req.session.id_funcionario = null;
    // ou destruir a sessão completa
    req.session.destroy();
    var html = "";
    html += topo;
    html += "<h2>logout funcionário</h2>\n";
    html += "<p>sessão do funcionário terminada</p>\n";
    html += fundo;
    res.send(html);
});*/

