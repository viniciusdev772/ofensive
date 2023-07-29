const express = require('express');
const mysql = require('mysql2/promise'); // Usando mysql2 com suporte a promessas
const app = express();
const port = 3005;

// Configurações do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'chat',
  password: 'vinicius',
  database: 'chat',
};

//definir titulo
app.set('title', 'OFENSIVES');

// Criação do pool de conexões com o banco de dados
const pool = mysql.createPool(dbConfig);

// Middleware para receber dados JSON em requisições POST
app.use(express.json());

// Rota para receber a chave "text" via POST
app.post('/api', async (req, res) => {
  const text = req.body.text;
  if (text) {
    try {
      // Verifica se a palavra é proibida
      const result = await verificarPalavrasProibidas(text);
      if (result.quantidadePalavrasProibidas > 0) {
        res.status(200).json(result);
      } else {
        res.status(200).json({ mensagem: `Texto recebido via POST: ${text}` });
      }
    } catch (err) {
      res.status(500).send('Erro ao processar a requisição.');
    }
  } else {
    res.status(400).send('A chave "text" não foi fornecida na requisição POST  Versão 2.0 da Api.');
  }
});

// Rota para receber a chave "text" via GET
app.get('/api', async (req, res) => {
  const text = req.query.text;
  if (text) {
    try {
      // Verifica se a palavra é proibida
      const result = await verificarPalavrasProibidas(text);
      if (result.quantidadePalavrasProibidas > 0) {
        res.status(200).json(result);
      } else {
        res.status(200).json({ mensagem: `Texto recebido via GET: ${text}` });
      }
    } catch (err) {
      res.status(500).send('Erro ao processar a requisição.');
    }
  } else {
    res.status(400).send('A chave "text" não foi fornecida na requisição GET Versão 2.0 da Api.');
  }
});

// Função para verificar palavras proibidas em um texto
async function verificarPalavrasProibidas(text) {
  // Quebra o texto em palavras usando espaço como delimitador
  const palavras = text.split(' ');

  const sqlQuery = 'SELECT palavra FROM badwords WHERE palavra REGEXP ?';

  // Procurar por palavras proibidas no cache em memória primeiro
  const cacheKey = palavras.join('|');
  if (verificarPalavrasProibidas.cache[cacheKey]) {
    return verificarPalavrasProibidas.cache[cacheKey];
  }

  const [results] = await pool.query(sqlQuery, [cacheKey]);
  const palavrasProibidas = results.map((row) => row.palavra);
  const quantidadePalavrasProibidas = palavrasProibidas.length;

  // Armazenar resultado em cache por 1 minuto (ajuste conforme necessidade)
  verificarPalavrasProibidas.cache[cacheKey] = {
    quantidadePalavrasProibidas,
    palavrasProibidas,
  };

  return { quantidadePalavrasProibidas, palavrasProibidas };
}
// Cache em memória com tempo de vida de 1 minuto para resultados
verificarPalavrasProibidas.cache = {};

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
