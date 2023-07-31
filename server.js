const express = require('express');
const mysql = require('mysql2/promise');
const NodeCache = require('node-cache');
const app = express();
const port = 3005;

const dolarController = require('./controllers/dolar.js');

const dbConfig = {
    host: 'localhost',
    user: 'chat',
    password: 'vinicius',
    database: 'chat',
};

const pool = mysql.createPool(dbConfig);
const cache = new NodeCache({ stdTTL: 3600 });

app.post('/api', async (req, res) => {
    const text = req.body.text;
    if (!text) {
        return res.status(400).send('A chave "text" não foi fornecida na requisição POST.');
    }

    try {
        const result = await verificarPalavrasProibidas(text);
        res.status(200).json({ ...result, cached: result.cached });
    } catch (err) {
        res.status(500).send('Erro ao processar a requisição.');
    }
});


app.get('/api/dolar', async (req, res) => {
    try {
        const result = await dolarController();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).send('Erro ao processar a requisição.');
    }
});

app.get('/api', async (req, res) => {
    const text = req.query.text;
    if (!text) {
        return res.status(400).send('A chave "text" não foi fornecida na requisição GET.');
    }

    try {
        const result = await verificarPalavrasProibidas(text);
        res.status(200).json({ ...result, cached: result.cached });
    } catch (err) {
        res.status(500).send('Erro ao processar a requisição.');
    }
});

async function verificarPalavrasProibidas(text) {
    const palavras = text.split(' ');
    const sqlQuery = 'SELECT palavra FROM badwords WHERE palavra REGEXP ?';
    const cacheKey = palavras.join('|');
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return { ...cachedResult, cached: true };
    }

    const [results] = await pool.query(sqlQuery, [cacheKey]);
    const palavrasProibidas = results.map((row) => row.palavra);
    const quantidadePalavrasProibidas = palavrasProibidas.length;

    cache.set(cacheKey, { quantidadePalavrasProibidas, palavrasProibidas, cached: false }, 3600);

    return { quantidadePalavrasProibidas, palavrasProibidas: palavrasProibidas.join(', '), cached: false };
}

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
