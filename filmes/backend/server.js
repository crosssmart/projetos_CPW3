const express = require("express");
const app = express();
app.use(express.json());

let filmes = [];
let id = 1;

//get
app.get("/filmes", (req, res) => {
  res.json(filmes);
});

app.get("/filmes/:id", (req, res) => {
  const filme = filmes.find(f => f.id ==
    req.params.id);
  if (!filme) {
    return res.status(404).json({
      erro: "Filme não encontrado"
    });
  }
  res.json(filme);
});

app.get("/filmes/bem-avaliados", (req, res) => {
  const filme = filmes.find(f => f.nota >= 9);
  if (!filme) {
    return res.status(404).json({
      erro: "Filme(s) não encontrado(s)"
    });
  }
  res.json(filme);
});

app.get("/filmes/ano/:ano", (req, res) => {
  let filmesAno = [];
  filmesAno.push(filmes.find(f => f.ano == req.params.ano));
  if (filmesAno.length == 0) {
    return res.status(404).json({
      erro: "Filme(s) não encontrado(s)"
    });
  }
  res.json(filmesAno);
});

//post pra criar
app.post("/filmes", (req, res) => {
  const { titulo, ano, nota } = req.body;
  if (!titulo || !ano || !nota) {
    return res.status(400).json({
      erro: "Dados inválidos"
    });
  }
  const novoFilme = {
    id: id++
    ,
    titulo,
    ano,
    nota
  };
  filmes.push(novoFilme);
  res.status(201).json(novoFilme);
});

//porta pra subir o servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});