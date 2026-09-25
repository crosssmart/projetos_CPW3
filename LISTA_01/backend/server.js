const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

//importando dados
const vetores = require("./data/vetores.js");

app.get('/', async (req, res) => {
  res.send(`API está funcionando da maneira correta!`)
});

//JOGOS 
app.get('/jogos', async (req, res) => {
  res.send(vetores.jogos);
});

app.get('/jogos/:id', async (req, res) => {
  const jogoId = Number(req.params.id)
  const jogo = vetores.jogos.find(jogo => jogo.id === jogoId);

  if (!jogo) {
    return res.status(404).json({ erro: "Jogo não encontrado" });
  }

  res.json(jogo);
});

app.post('/jogos', (req, res) => {
  const { titulo, genero, ano, nota } = req.body;

  if (!titulo || !genero) {
    return res.status(400).json({ erro: "Título e gênero são obrigatórios" });
  }

  /* Usando o Math.max(...) que separa o array em partes para conseguir pegar
  o maior e adicionar mais um para ser o novo ID, caso n tenha seria 1 mesmo*/
  const novoId = vetores.jogos.length > 0
    ? Math.max(...vetores.jogos.map(j => j.id)) + 1
    : 1;

  const novoJogo = {
    id: novoId,
    titulo,
    genero,
    ano,
    nota
  };

  vetores.jogos.push(novoJogo);

  res.status(201).json({ message: "Jogo adicionado com sucesso!", novoJogo });
});

app.listen(port, () => {
  console.log(`Está funcionando em http://localhost:${port}`);
})