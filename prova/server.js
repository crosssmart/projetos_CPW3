const express = require('express');
const app = express();

app.use(express.json());

let musicas = [
  { id: 1, titulo: "Blinding Lights", artista: "The Weeknd", nota: 10 },
  { id: 2, titulo: "Starboy", artista: "The Weeknd", nota: 9 },
  { id: 3, titulo: "Sweater Weather", artista: "The Neighbourhood", nota: 8 },
  { id: 4, titulo: "505", artista: "Arctic Monkeys", nota: 10 }
];

app.get('/musicas', (req, res) => {
  res.status(200).json(musicas);
});

app.get('/musicas/:id', (req, res) => {
  const id = Number(req.params.id);
  const musica = musicas.find(m => m.id === id);

  if (!musica) {
    return res.status(404).send({
      erro: "Música não encontrada!"
    });
  }

  res.status(200).send(musica);
});


app.get('/top', (req, res) => {
  const topMusicas = musicas.filter(m => m.nota >= 9);
  res.status(200).send(topMusicas);
});


app.post('/musicas', (req, res) => {
  const { titulo, artista, nota } = req.body;

  if (!titulo || !artista || !nota) {
    return res.status(400).send({
      erro: "Todos os campos são obrigatórios"
    });
  }

  const novoId = musicas.length > 0
    ? Math.max(...musicas.map(m => m.id)) + 1
    : 1;

  const novaMusica = {
    id: novoId,
    titulo,
    artista,
    nota
  };

  musicas.push(novaMusica);

  res.status(201).send(novaMusica);
});

app.delete('/musicas/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = musicas.findIndex(m => m.id === id);

  if (indice === -1) {
    return res.status(404).send({
      erro: "Música não encontrada"
    });
  }

  musicas.splice(indice, 1);

  res.status(200).send({
    mensagem: "Música removida com sucesso"
  });
});

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});