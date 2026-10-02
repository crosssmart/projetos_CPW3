const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
app.use(express.json());

//importando dados
const vetores = require("./dados/vetor.js");
const caminho = path.join(__dirname, 'dados', 'jogos.json');
const log_caminho = path.join(__dirname, 'dados', 'historico.txt');

//----------------------LOG
function registrarLog(acao, jogo) {
  try {
    const data = new Date().toLocaleDateString('pt-BR');
    const linha = `[${data}] ${acao}: "${jogo.titulo}" \n`;
    fs.appendFileSync(log_caminho, linha, 'utf-8');
  } catch (erro) {
    console.error('Erro ao registrar log:', erro.message);
  }
}

function lerLog() {
  try {
    return fs.readFileSync(log_caminho, 'utf-8');
  } catch (erro) {
    if (erro.code === 'ENOENT') {
      console.warn('Arquivo de log ainda não existe. Retornando vazio.');
      return '';
    }
    console.error('Erro ao ler log:', erro.message);
    throw erro;
  }
}

//------------------JOGOS
function lerJogos() {
  try {
    const conteudo = fs.readFileSync(caminho, 'utf-8');
    return JSON.parse(conteudo);
  } catch (erro) {
    if (erro.code === 'ENOENT') {
      console.warn('jogos.json não existe. Criando arquivo vazio...');
      fs.writeFileSync(caminho, '[]', 'utf-8');
      return [];
    }
    console.error('Erro ao ler jogos.json:', erro.message);
    throw erro;
  }
}

function salvarJogos(jogos) {
  try {
    fs.writeFileSync(caminho, JSON.stringify(jogos, null, 2), 'utf-8');
  } catch (erro) {
    console.error('Erro ao salvar jogos.json:', erro.message);
    throw erro; // repassa para o endpoint responder 500
  }
}

//-------------------ROTAS
app.get('/', (req, res) => {
  res.send(`API está funcionando da maneira correta!`)
});

//HISTÓRICO

app.get('/historico', (req, res) => {
  res.send(lerLog());
})


//JOGOS 
app.get('/jogos', (req, res) => {
  res.json(lerJogos());
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

  // Lê os jogos atuais do arquivo (em vez de usar vetores.jogos)
  const jogos = lerJogos();

  /* Usando o Math.max(...) que separa o array em partes para conseguir pegar
  o maior e adicionar mais um para ser o novo ID, caso não tenha seria 1 mesmo */
  const novoId = jogos.length > 0
    ? Math.max(...jogos.map(j => j.id)) + 1
    : 1;

  const novoJogo = {
    id: novoId,
    titulo,
    genero,
    ano: ano || "Não definido",
    nota: nota || "Não definido"
  };

  jogos.push(novoJogo);

  // Grava o array atualizado de volta no jogos.json
  salvarJogos(jogos);

  registrarLog("CADASTRO", novoJogo);

  res.status(201).json({ message: "Jogo adicionado com sucesso!", novoJogo });
});

app.put('/jogos/:id', (req, res) => {
  const id = Number(req.params.id);
  const jogos = lerJogos();
  const index = jogos.findIndex(j => j.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Jogo não encontrado!" });
  }

  //com o spread operator ele sobrescreve os dados
  jogos[index] = { ...jogos[index], ...req.body, id };
  salvarJogos(jogos);

  registrarLog("ALTERAÇÃO", jogos[index]);

  res.json({ message: "Jogo atualizado com sucesso!", jogo: jogos[index] });
});

app.delete("/jogos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const jogos = lerJogos();
  const jogoIndex = jogos.findIndex(j => j.id === id);

  if (jogoIndex === -1) {
    return res.status(404).json({
      erro: "Jogo não encontrado!"
    });
  }

  const jogoRemovido = jogos.splice(jogoIndex, 1)[0];
  salvarJogos(jogos);

  registrarLog("EXCLUSÃO", jogoRemovido);

  res.json({
    mensagem: "Jogo removido com sucesso!",
    jogo: jogoRemovido
  });
})

app.listen(port, () => {
  console.log(`Está funcionando em http://localhost:${port}`);
})