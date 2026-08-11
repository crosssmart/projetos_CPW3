const express = require('express');
const app = express();

//  define endpoint
app.get('/', (req, res) => {
  res.send('Hello World! Este é algo');
});

// Liga o servidor pra escutar na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});