let numeroLogado = ''
let conversaSelecionada = null
let historicoConversas = []

function alternarTema() {
  const body = document.body
  const botao = document.getElementById('botaoTema')

  if (body.classList.contains('dark-mode')) {
    body.classList.replace('dark-mode', 'light-mode')
    botao.textContent = '🌙'
  } else {
    body.classList.replace('light-mode', 'dark-mode')
    botao.textContent = '☀️'
  }
}

async function inicializarConversas() {
  numeroLogado = document.getElementById('numeroUsuarioInput').value.trim()
  if (!numeroLogado) {
    alert('Por favor, digite um número.')
    return
  }

  try {
    const resposta = await fetch(`http://localhost:8080/v1/whatssap/usuario/conversas/${numeroLogado}`)
    const json = await resposta.json()

    historicoConversas = json
    listarContatos(json)
    document.getElementById('exibicaoMensagens').innerHTML = ''
    conversaSelecionada = null
    document.getElementById('campoMensagem').disabled = true
    document.getElementById('botaoEnviar').disabled = true
  } catch (erro) {
    alert('Erro ao carregar conversas.')
    console.error(erro)
  }
}

function listarContatos(conversas) {
  const painel = document.getElementById('painelContatos')
  painel.innerHTML = ''

  conversas.forEach(contato => {
    const item = document.createElement('div')
    item.className = 'contato-item'
    item.textContent = contato.nome
    item.onclick = () => {
      exibirMensagensContato(contato)
      conversaSelecionada = contato.nome
      document.getElementById('campoMensagem').disabled = false
      document.getElementById('botaoEnviar').disabled = false
    }
    painel.appendChild(item)
  })
}

function exibirMensagensContato(contato) {
  const areaMensagens = document.getElementById('exibicaoMensagens')
  areaMensagens.innerHTML = ''

  contato.conversas.forEach(m => {
    const linha = document.createElement('p')
    linha.className = m.sender === 'me' ? 'enviada' : 'recebida'
    linha.textContent = `[${m.time}] ${m.content}`
    areaMensagens.appendChild(linha)
  })
}

function filtrarSugestoes() {
  const termo = document.getElementById('campoBuscaContato').value.trim().toLowerCase()
  const sugestoes = document.getElementById('listaSugestoes')

  sugestoes.innerHTML = ''

  if (!termo) return

  const contatosFiltrados = historicoConversas.filter(c => c.nome.toLowerCase().startsWith(termo))

  contatosFiltrados.forEach(contato => {
    const item = document.createElement('div')
    item.className = 'sugestao-item'

    const nome = contato.nome
    const match = nome.substring(0, termo.length)
    const resto = nome.substring(termo.length)

    item.innerHTML = `<strong>${match}</strong>${resto} <small style="color:gray;">(${contato.numero})</small>`

    item.onclick = () => {
      document.getElementById('campoBuscaContato').value = contato.nome
      exibirMensagensContato(contato)
      conversaSelecionada = contato.nome
      sugestoes.innerHTML = ''
      document.getElementById('campoMensagem').disabled = false
      document.getElementById('botaoEnviar').disabled = false
    }

    sugestoes.appendChild(item)
  })
}

function adicionarMensagem() {
  const input = document.getElementById('campoMensagem')
  const texto = input.value.trim()

  if (!texto || !numeroLogado || !conversaSelecionada) return

  const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const exibicao = document.getElementById('exibicaoMensagens')

  const nova = document.createElement('p')
  nova.className = 'enviada'
  nova.textContent = `[${horaAtual}] ${texto}`
  exibicao.appendChild(nova)

  input.value = ''
  input.focus()
}
