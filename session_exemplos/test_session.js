const express = require('express');
const session = require('express-session');

const app = express();

// Configuração da Sessão e do Cookie
app.use(session({
  secret: 'chave_secreta_e_segura_aqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,       // Impede acesso via JavaScript (XSS)
    secure: false,        // Mantenha 'false' no localhost; mude para 'true' em produção (HTTPS)
    sameSite: 'lax',      // Protege contra CSRF
    maxAge: 1000 * 60 * 15 // Expira em 15 minutos
  }
}));

// Rota 1: Simula o Login (Cria a sessão e envia o cookie ao navegador)
app.get('/login', (req, res) => {
  req.session.user = { id: 105, nome: 'Rogerio', role: 'admin' };
  res.send('Login realizado com sucesso! Cookie criado.');
});

// Rota 2: Acessa os dados salvos na sessão
app.get('/perfil', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Acesso negado. Faça login primeiro em /login');
  }
  res.send(`Bem-vinda, ${req.session.user.nome}! Seus dados estão salvos na sessÃ£o.`);
});

// Rota 3: Logout (Destrói a sessão e limpa o cookie)
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.send('Sessão encerrada e cookie removido.');
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});