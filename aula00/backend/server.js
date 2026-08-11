const express = require('express');
const app = express();

//  define endpoint
app.get('/', (req, res) => {
  res.send('BEM VINDO!');
});

app.get('/aluno', (req, res) => {
  res.send("ROTA OKAY");
});

// rota dinâmica (":" é uma variavel )
app.get('/aluno/:nome', (req, res) => {
  const nome = req.params.nome;
  res.send(`Olá, ${nome}`);
});

// com número
app.get('/soma/:a/:b', (req, res) => {
  const a = Number(req.params.a);
  const b = Number(req.params.b);
  const resultado = a + b;
  res.send(`Soma = ${resultado}!`);
});




// Liga o servidor pra escutar na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});