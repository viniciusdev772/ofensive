const express = require('express');
const mysql = require('mysql2/promise'); // Usando mysql2 com suporte a promessas
const NodeCache = require('node-cache');
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

// Criação do cache em memória com tempo de vida de 1 hora (3.600.000 milissegundos)
const cache = new NodeCache({ stdTTL: 3600 });

// Rota para receber a chave "text" via POST
app.post('/api', async (req, res) => {
  const text = req.body.text;
  if (text) {
    try {
      // Verifica se a palavra é proibida
      const result = await verificarPalavrasProibidas(text);
      res.status(200).json({ ...result, cached: result.cached });
    } catch (err) {
      res.status(500).send('Erro ao processar a requisição.');
    }
  } else {
    res.status(400).send('A chave "text" não foi fornecida na requisição POST.');
  }
});

// Rota para receber a chave "text" via GET
app.get('/api', async (req, res) => {
  const text = req.query.text;
  if (text) {
    try {
      // Verifica se a palavra é proibida
      const result = await verificarPalavrasProibidas(text);
      res.status(200).json({ ...result, cached: result.cached });
    } catch (err) {
      res.status(500).send('Erro ao processar a requisição.');
    }
  } else {
    res.status(400).send('A chave "text" não foi fornecida na requisição GET.');
  }
});

// Função para transformar uma palavra em uma expressão regular que ignora vogais e diferencia letras maiúsculas e minúsculas
function criarRegExp(palavra) {
  return new RegExp(palavra.replace(/[aeiou]/gi, '.'), 'i');
}

// Função para verificar palavras proibidas em um texto
async function verificarPalavrasProibidas(text) {
  // Quebra o texto em palavras usando espaço como delimitador
  const palavras = text.split(' ');

  // Criar um array de expressões regulares para todas as palavras proibidas
  const regexArray = palavras.map(criarRegExp);

  const sqlQuery = `SELECT palavra FROM badwords WHERE ${regexArray.map(() => 'palavra REGEXP ?').join(' OR ')}`;

  // Procurar por palavras proibidas no cache em memória primeiro
  const cacheKey = palavras.join('|');
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return { ...cachedResult, cached: true };
  }

  try {
    const [results] = await pool.query(sqlQuery, regexArray);
    const palavrasProibidas = results.map((row) => row.palavra);
    const quantidadePalavrasProibidas = palavrasProibidas.length;

    // Armazenar resultado em cache por 1 hora (3.600.000 milissegundos) em memória
    cache.set(cacheKey, { quantidadePalavrasProibidas, palavrasProibidas: palavrasProibidas.join(', '), cached: false }, 3600);

    return { quantidadePalavrasProibidas, palavrasProibidas: palavrasProibidas.join(', '), cached: false };
  } catch (err) {
    // Tratar erros de conexão com o banco de dados ou outras exceções aqui
    throw err;
  }
}

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
