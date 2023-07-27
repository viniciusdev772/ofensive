const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Configurações do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'chat',
  password: 'vinicius',
  database: 'chat',
};

// Criação da conexão com o banco de dados
const connection = mysql.createConnection(dbConfig);

// Conectando ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

// Middleware para receber dados JSON em requisições POST
app.use(express.json());

// Rota para receber a chave "text" via POST
app.post('/', async (req, res) => {
  const text = req.body.text;
  if (text) {
    // Verifica se a palavra é proibida
    const result = await checkForProhibitedWords(text);
    if (result.prohibitedCount > 0) {
      res.status(403).json(result);
    } else {
      res.status(200).json({ message: `Texto recebido via POST: ${text}` });
    }
  } else {
    res.status(400).send('A chave "text" não foi fornecida na requisição POST.');
  }
});

// Rota para receber a chave "text" via GET
app.get('/', async (req, res) => {
  const text = req.query.text;
  if (text) {
    // Verifica se a palavra é proibida
    const result = await checkForProhibitedWords(text);
    if (result.prohibitedCount > 0) {
      res.status(403).json(result);
    } else {
      res.status(200).json({ message: `Texto recebido via GET: ${text}` });
    }
  } else {
    res.status(400).send('A chave "text" não foi fornecida na requisição GET.');
  }
});

// Função para verificar palavras proibidas em um texto
function checkForProhibitedWords(text) {
    // Quebra o texto em palavras usando espaço como delimitador
    const words = text.split(' ');
  
    const sqlQuery = 'SELECT palavra FROM badwords WHERE palavra REGEXP ?';
    return new Promise((resolve, reject) => {
      connection.query(sqlQuery, [words.join('|')], (err, results) => {
        if (err) {
          reject(err);
        } else {
          const prohibitedWords = results.map((row) => row.palavra);
          const prohibitedCount = prohibitedWords.length;
          resolve({ prohibitedCount, prohibitedWords });
        }
      });
    });
  }
  

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
