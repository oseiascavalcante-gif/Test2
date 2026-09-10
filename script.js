const perguntas = [
    { texto: "Sente cansaço visual ou dor de cabeça ao ler textos longos?", rec: "Permitir pausas curtas durante a leitura e usar fonte ampliada." },
    { texto: "Costuma se perder entre as linhas durante a leitura?", rec: "Usar régua de leitura ou guia de linha física/digital." },
    { texto: "A luz forte da tela ou do papel incomoda seus olhos?", rec: "Utilizar alto contraste, modo escuro ou papel sem brilho." },
    { texto: "Entende e memoriza melhor a matéria ouvindo do que lendo?", rec: "Fornecer conteúdos em áudio e explicações faladas." }
];

let indice = 0;
let respostas = [];
let aluno = {};
let zoomAtual = 100;

// FERRAMENTAS DE ACESSIBILIDADE
function alternarTema() {
    const escuro = document.body.getAttribute('data-tema') === 'escuro';
    document.body.setAttribute('data-tema', escuro ? 'claro' : 'escuro');
    falar(escuro ? "Modo claro" : "Modo escuro");
}

function alternarFonte() {
    document.body.classList.toggle('fonte-adaptada');
    falar("Fonte alterada");
}

function mudarZoom(delta) {
    zoomAtual = Math.min(Math.max(zoomAtual + delta, 80), 140);
    document.documentElement.style.setProperty('--zoom', `${zoomAtual}%`);
}

function alternarRegua() {
    const regua = document.getElementById('regua');
    const ativa = regua.style.display === 'block';
    regua.style.display = ativa ? 'none' : 'block';
}

document.addEventListener('mousemove', (e) => {
    const regua = document.getElementById('regua');
    if (regua.style.display === 'block') {
        regua.style.top = `${e.clientY - 15}px`;
    }
});

function falar(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'pt-BR';
        window.speechSynthesis.speak(msg);
    }
}

// LÓGICA DO QUESTIONÁRIO
function iniciar() {
    const nome = document.getElementById('nome-aluno').value.trim();
    const turma = document.getElementById('turma-aluno').value.trim();

    if (!nome || !turma) {
        alert("Preencha o nome e a turma.");
        return;
    }

    aluno = { nome, turma, data: new Date().toLocaleDateString('pt-BR') };
    document.getElementById('tela-inicio').style.display = 'none';
    document.getElementById('tela-pergunta').style.display = 'flex';
    
    atualizarPergunta();
}

function atualizarPergunta() {
    if (indice < perguntas.length) {
        const pct = (indice / perguntas.length) * 100;
        document.getElementById('barra-progresso').style.width = `${pct}%`;
        document.getElementById('texto-pergunta').textContent = perguntas[indice].texto;
        falar(perguntas[indice].texto);
    } else {
        exibirResultado();
    }
}

function ouvirPergunta() {
    falar(perguntas[indice].texto);
}

function responder(resp) {
    respostas.push({ pergunta: perguntas[indice], resposta: resp });
    indice++;
    atualizarPergunta();
}

// ATALHOS DE TECLADO
document.addEventListener('keydown', (e) => {
    const emPergunta = document.getElementById('tela-pergunta').style.display === 'flex';
    if (!emPergunta) return;

    if (e.key.toLowerCase() === 's' || e.key === 'ArrowRight') responder('SIM');
    if (e.key.toLowerCase() === 'n' || e.key === 'ArrowLeft') responder('NÃO');
});

// EXIBIÇÃO E HISTÓRICO
function exibirResultado() {
    document.getElementById('tela-pergunta').style.display = 'none';
    document.getElementById('tela-resultado').style.display = 'flex';

    document.getElementById('dados-aluno').innerHTML = `
        <p><strong>Aluno:</strong> ${aluno.nome} | <strong>Turma:</strong> ${aluno.turma}</p>
        <p><strong>Data:</strong> ${aluno.data}</p>
    `;

    const lista = document.getElementById('lista-recomendacoes');
    lista.innerHTML = '';

    let adaptacoes = 0;
    respostas.forEach(r => {
        if (r.resposta === 'SIM') {
            const li = document.createElement('li');
            li.textContent = r.pergunta.rec;
            lista.appendChild(li);
            adaptacoes++;
        }
    });

    if (adaptacoes === 0) {
        lista.innerHTML = '<li>Nenhuma adaptação específica requerida.</li>';
    }

    salvarHistorico(adaptacoes);
    falar("Questionário concluído. Relatório gerado.");
}

function salvarHistorico(qtd) {
    let historico = JSON.parse(localStorage.getItem('historico_acess') || '[]');
    historico.unshift({ ...aluno, qtd });
    historico = historico.slice(0, 5); // guarda só os últimos 5
    localStorage.setItem('historico_acess', JSON.stringify(historico));
    carregarHistorico();
}

function carregarHistorico() {
    let historico = JSON.parse(localStorage.getItem('historico_acess') || '[]');
    const ul = document.getElementById('lista-historico');
    ul.innerHTML = historico.length ? '' : '<li>Nenhuma avaliação anterior.</li>';

    historico.forEach(h => {
        const li = document.createElement('li');
        li.textContent = `${h.nome} (${h.turma}) - ${h.qtd} adaptações - ${h.data}`;
        ul.appendChild(li);
    });
}

function imprimirRelatorio() {
    window.print(); // Abre caixa nativa de impressão (onde pode salvar em PDF)
}

function reiniciar() {
    indice = 0;
    respostas = [];
    document.getElementById('nome-aluno').value = '';
    document.getElementById('turma-aluno').value = '';
    document.getElementById('tela-resultado').style.display = 'none';
    document.getElementById('tela-inicio').style.display = 'flex';
}

// INICIALIZAÇÃO
window.onload = carregarHistorico;
