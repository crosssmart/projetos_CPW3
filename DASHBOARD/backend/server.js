const express = require('express');
const session = require('express-session');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
require('dotenv').config();

// Importa o SQLite nativo
const sqlite3 = require('sqlite3').verbose();

// --- CONFIGURAÇÃO DO BANCO DE DADOS (SQLite) ---
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Garante que a tabela existe no arranque da aplicação
db.serialize(() => {
  db.run(`
CREATE TABLE IF NOT EXISTS produtos (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
preco REAL NOT NULL,
quantidade INTEGER NOT NULL
)
`);
});

// Permite que o Node leia os dados enviados pelo formulário HTML
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração da Sessão (Expira em 1 minuto — tempo para receber o código)
app.use(session({
  secret: 'minha_chave_secreta',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 1 minuto
}));

const EMAIL_REMETENTE = process.env.EMAIL_REMETENTE;
const EMAIL_SENHA_APP = process.env.EMAIL_SENHA_APP; // Palavra-passe de aplicação (16 chars)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_REMETENTE,
    pass: EMAIL_SENHA_APP
  }
});

// Função auxiliar: gera um código numérico de 4 dígitos
function gerarCodigo() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 1000–9999
}

// Middleware de proteção
function verificaAcesso(req, res, next) {
  if (req.session.user && req.session.verificado) {
    next();
  } else {
    res.redirect('/login');
  }
}

// ------------ ROTAS ---------------
// Página de login — pede APENAS o email
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Recebe o email, gera o código e envia por email
app.post('/login', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.send('Email inválido. <a href="/login">Voltar</a>');
  }

  // 1. Gera o código de 4 dígitos
  const codigo = gerarCodigo();

  // 2. Guarda na sessão (junto com o email, para validar no final)
  req.session.codigo = codigo;
  req.session.email = email;
  req.session.verificado = false;

  // 3. Envia o email real
  try {
    await transporter.sendMail({
      from: `"Sistema de Login" <${EMAIL_REMETENTE}>`,
      to: email,
      subject: 'O teu código de verificação',
      html: `
        <h2>Autenticação em dois passos</h2>
        <p>O código de verificação é:</p>
        <h1 style="color:#2c3e50; letter-spacing:8px;">${codigo}</h1>
        <p>Este código expira em 1 minuto.</p>
      `
    });
    console.log(`Código enviado para ${email}: ${codigo}`);

    // 4. Redireciona para a página de confirmação
    res.redirect('/confirmar');
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    res.status(500).send('Erro ao enviar o email. Verificar a configuração. <a href="/login">Voltar</a>');
  }
});

// Página onde o utilizador digita o código
app.get('/confirmar', (req, res) => {
  // Se não tem código na sessão, volta ao login
  if (!req.session.codigo) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/confirmar.html'));
});

// Valida o código digitado
app.post('/confirmar', (req, res) => {
  const { codigo } = req.body;

  // Compara o código digitado com o da sessão
  if (req.session.codigo && codigo === req.session.codigo) {
    req.session.verificado = true;
    req.session.user = req.session.email; // marca como autenticado
    // Limpa o código (já foi usado)
    delete req.session.codigo;

    return res.redirect('/dashboard');
  }

  // Código errado → volta ao início
  req.session.destroy(() => {
    return res.redirect('/login');
  });
});

// Rota protegida
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// ----------- ROTAS DO BD ------------
app.get('/api/produtos', verificaAcesso, (req, res) => {
  const sql = 'SELECT * FROM produtos';

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
    }
    res.json(rows);
  });
});

//create
app.post('/api/produtos/novo', verificaAcesso, (req, res) => {
  const { nome, preco, quantidade } = req.body;
  const sql = 'INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)';

  db.run(sql, [nome, preco, quantidade], function (err) {
    if (err) {
      return res.status(500).send('Erro ao cadastrar produto');
    }
    res.redirect('/dashboard');
  });
});

//delete
app.get('/api/produtos/deletar/:id', verificaAcesso, (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM produtos WHERE id = ?';

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).send('Erro ao excluir produto');
    }
    res.redirect('/dashboard');
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor a correr! Aceda a: http://localhost:3000/login');
});