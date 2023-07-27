const express = require('express');
const app = express();
const port = 3000; // Porta que o servidor vai escutar

// Configurando o middleware para poder receber dados JSON em requisições POST
app.use(express.json());

// Rota para receber a chave "text" via POST
app.post('/texto', (req, res) => {
  const text = req.body.text;
  if (text) {
    res.status(200).send(`Texto recebido via POST: ${text}`);
  } else {
    res.status(400).send('A chave "text" não foi fornecida na requisição POST.');
  }
});

// Rota para receber a chave "text" via GET
app.get('/texto', (req, res) => {
  const text = req.query.text;
  if (text) {
    res.status(200).send(`Texto recebido via GET: ${text}`);
  } else {
    res.status(400).send('A chave "text" não foi fornecida na requisição GET.');
  }
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
