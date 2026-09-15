const express = require('express')
const app = express()

const user = { name: 'Rogerio', role: ' admin' }


//middleware simples 
function eAdmin(req, res, next) {
  if (user.role == 'admin') {
    return next() //papel certo = libera acesso 
  }
  return res.status(403).send('Acesso negado!')
}


//rotas 
app.get('/publico', (req, res) => res.send('Acesso liberado a todos'))
app.get('/admin', (req, res) => res.send('Area restrita [admin]'))

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000')
})