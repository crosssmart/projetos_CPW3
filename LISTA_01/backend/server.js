const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

//importando dados
const vetores = require("./data/vetores.js");

app.get('/', (req, res) => {
  res.send(`API está funcionando da maneira correta!`)
});

//JOGOS 
app.get('/jogos', (req, res) => {
  res.send(vetores.jogos);
});

app.get('/jogos/melhores', (req, res) => {
  const melhores = vetores.jogos.filter(j => j.nota >= 8)

  if (melhores === 0) {
    return res.status(404).json({ erro: "Jogo(s) não encontrado(s)!" });
  }

  res.json(melhores);
});

app.get('/jogos/:id', (req, res) => {
  const jogoId = Number(req.params.id)
  const jogo = vetores.jogos.find(jogo => jogo.id === jogoId);

  if (!jogo) {
    return res.status(404).json({ erro: "Jogo não encontrado!" });
  }

  res.json(jogo);
});

app.post('/jogos', (req, res) => {
  const { titulo, genero, ano, nota } = req.body;

  if (!titulo || !genero) {
    return res.status(400).json({ erro: "Título e gênero são obrigatórios!" });
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

app.put('/jogos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const jogoIndex = vetores.jogos.findIndex(j => j.id === id);

  if (jogoIndex === -1) {
    return res.status(404).json({
      erro: "Jogo não encontrado!"
    });
  }

  const { titulo, genero, ano, nota } = req.body;

  if (!titulo || !genero) {
    return res.status(400).json({
      erro: "Campos obrigatórios: titulo e genero!"
    });
  }

  vetores.jogos[jogoIndex] = {
    id: id,
    titulo,
    genero,
    ano,
    nota: nota || "Não definido"
  };

  res.json({
    mensagem: "Jogo atualizado com sucesso",
    jogos: vetores.jogos[jogoIndex]
  });
})

app.delete("/jogos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const jogoIndex = vetores.jogos.findIndex(j => j.id === id);

  if (jogoIndex === -1) {
    return res.status(404).json({
      erro: "Jogo não encontrado!"
    });
  }

  const jogoRemovido = vetores.jogos[jogoIndex];
  vetores.jogos.splice(jogoIndex, 1);

  res.json({
    mensagem: "Jogo removido com sucesso!",
    jogo: jogoRemovido
  });
})

app.listen(port, () => {
  console.log(`Está funcionando em http://localhost:${port}`);
})