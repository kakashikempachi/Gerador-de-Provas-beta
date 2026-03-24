let questoes = [];

function adicionarQuestao() {
    const tipo = document.getElementById('select-tipo').value;
    const q = {
        id: Date.now(),
        tipo: tipo,
        enunciado: "",
        itensEsq: ["", "", ""], // Para Ligue os Pontos
        itensDir: ["", "", ""], // Para Ligue os Pontos
        alternativas: ["", "", "", ""], // Para Múltipla Escolha / VF
        qtdLinhas: 3,
        fotos: []
    };
    questoes.push(q);
    renderizar();
}

// ESTA FUNÇÃO É O SEGREDO: Ela altera a quantidade e mantém os dados
function alterarQuantidade(id, novaQtd) {
    const q = questoes.find(x => x.id === id);
    const qtd = parseInt(novaQtd) || 1;

    if (q.tipo === 'ligue') {
        while (q.itensEsq.length < qtd) { q.itensEsq.push(""); q.itensDir.push(""); }
        while (q.itensEsq.length > qtd) { q.itensEsq.pop(); q.itensDir.pop(); }
    } else {
        while (q.alternativas.length < qtd) { q.alternativas.push(""); }
        while (q.alternativas.length > qtd) { q.alternativas.pop(); }
    }
    renderizar();
}

function renderizar() {
    const lista = document.getElementById('editor');
    lista.innerHTML = "";

    questoes.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'card-questao';
        let htmlExtra = "";

        if (q.tipo === 'ligue') {
            htmlExtra = `
                <div class="controles-qtd">Quantidade de itens para ligar: 
                    <input type="number" min="1" value="${q.itensEsq.length}" onchange="alterarQuantidade(${q.id}, this.value)">
                </div>
                <div class="grid-duas-colunas">
                    <div><strong>Coluna A</strong><br>
                        ${q.itensEsq.map((v, i) => `<input type="text" value="${v}" placeholder="Item ${i+1}" oninput="questoes[${index}].itensEsq[${i}] = this.value">`).join('')}
                    </div>
                    <div><strong>Coluna B</strong><br>
                        ${q.itensDir.map((v, i) => `<input type="text" value="${v}" placeholder="Resposta ${i+1}" oninput="questoes[${index}].itensDir[${i}] = this.value">`).join('')}
                    </div>
                </div>`;
        } 
        else if (q.tipo === 'multipla' || q.tipo === 'vf') {
            htmlExtra = `
                <div class="controles-qtd">Quantidade de alternativas: 
                    <input type="number" min="1" value="${q.alternativas.length}" onchange="alterarQuantidade(${q.id}, this.value)">
                </div>
                ${q.alternativas.map((v, i) => `
                    <div style="display:flex; gap:5px; align-items:center;">
                        <span>${String.fromCharCode(65+i)})</span>
                        <input type="text" value="${v}" placeholder="Opção ${i+1}" oninput="questoes[${index}].alternativas[${i}] = this.value">
                    </div>`).join('')}`;
        }
        else if (q.tipo === 'dissertativa') {
            htmlExtra = `Número de linhas: <input type="number" value="${q.qtdLinhas}" oninput="questoes[${index}].qtdLinhas = this.value">`;
        }

        div.innerHTML = `
            <button class="remover" onclick="remover(${q.id})">🗑️</button>
            <small>Questão ${index + 1} - ${q.tipo.toUpperCase()}</small>
            <textarea placeholder="Digite o enunciado..." oninput="questoes[${index}].enunciado = this.value">${q.enunciado}</textarea>
            ${htmlExtra}
        `;
        lista.appendChild(div);
    });
}

function remover(id) {
    questoes = questoes.filter(q => q.id !== id);
    renderizar();
}

// Geração de PDF
function gerarPDF() {
    const escola = document.getElementById('input-escola').value || "NOME DA ESCOLA";
    document.getElementById('pdf-escola').innerText = escola.toUpperCase();
    const conteudo = document.getElementById('pdf-conteudo');
    conteudo.innerHTML = "";

    questoes.forEach((q, i) => {
        let html = `<div class="q-pdf"><strong>${i+1}. ${q.enunciado}</strong>`;

        if (q.tipo === 'ligue') {
            html += `<div class="ligue-pdf">
                <div class="col-pdf">${q.itensEsq.map(v => `<div class="item-ligue">${v} <span class="circulo"></span></div>`).join('')}</div>
                <div class="col-pdf" style="text-align:right;">${q.itensDir.map(v => `<div class="item-ligue" style="justify-content:flex-end;"><span class="circulo"></span> ${v}</div>`).join('')}</div>
            </div>`;
        } 
        else if (q.tipo === 'multipla' || q.tipo === 'vf') {
            html += `<div style="margin-top:10px;">
                ${q.alternativas.map((v, idx) => `<p>( ) ${String.fromCharCode(65+idx)}) ${v}</p>`).join('')}
            </div>`;
        }
        else if (q.tipo === 'dissertativa') {
            for(let l=0; l<q.qtdLinhas; l++) html += `<p style="border-bottom: 1px solid black; margin-top:20px;">&nbsp;</p>`;
        }

        html += `</div>`;
        conteudo.innerHTML += html;
    });

    const folha = document.getElementById('folha-a4');
    folha.style.display = 'block';
    
    html2pdf().set({
        margin: 0,
        filename: 'prova.pdf',
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
    }).from(folha).save().then(() => folha.style.display = 'none');
}
