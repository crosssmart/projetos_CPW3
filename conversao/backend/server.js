const fs = require('fs/promises');
const { json } = require('stream/consumers');
async function converterTxtParaJson() {
  try {
    const textoBruto = await fs.readFile('dados_brutos.txt', 'utf-8');
    //quebra o textão em um array de linhas
    //trim() e o filter ajudam a ignorar linhas vazias
    const linhas = textoBruto.split('\n').filter(linha => linha.trim() !== '');
    //pega cada linha e transforma num Objeto Javascript
    const alunosObjeto = linhas.map(linha => {
      //divide os dados pela vírgula
      const [nome, nota, curso] = linha.split(',');
      return {
        nome: nome.trim(),
        nota: Number(nota.trim()),
        curso: curso.trim()
      };
    });
    //Transforma o array/Objeto JS em uma string formato JSON
    // O (dados, null, 2) serve para deixar o JSON formatado bonitinho com recuo de 2 espaços
    const textJson = JSON.stringify(alunosObjeto, null, 2);
    //Salva no disco rígido como um arquivo.json
    await fs.writeFile('alunos_convertidos.json', textJson);
    console.log('Sucesso! Arquivo "alunos_convertidos.json" criado com estrutura de dados.');
  } catch (erro) {
    console.error('Error na conversão: ', erro);
  }
}

converterTxtParaJson();