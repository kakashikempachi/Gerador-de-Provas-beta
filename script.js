let questoes = [];
let idQuestaoFoto = null;

function criarQuestao() {
    const tipo = document.getElementById('tipo-selecionado').value;
    const novaQ = {
        id: Date.now(),
        tipo: tipo,
        enunciado: "",
        opcoes: (tipo === 'multipla' || tipo === 'vf') ? ["", "", "", ""] : [],
        fotos: [],
        colEsq: (tipo === 'ligue') ? ["", ""] : [],
        colDir: (tipo === 'ligue') ? ["", ""] : [],
        qtd: (tipo === 'dissertativa') ? 3 : 4
    };
    questoes.push(novaQ);
    renderizarTela();
}

function renderizarTela() {
    const lista = document.getElementById('lista-questoes');
    lista.innerHTML = "";

    questoes.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'card-questao';
        
        let camposExtras = "";

        // SWITCH CASE PARA MOSTRAR OS CAMPOS CORRETOS
        switch(q.tipo) {
            case 'multipla':
            case 'vf':
                camposExtras = `
                    <div style="font-size:12px; color:#666">Itens: <input type="number" value="${q.opcoes.length}" onchange="mudarQtd(${q.id}, this.value)" style="width:50px"></div>
                    ${q.opcoes.map((opt, i) => `
                        <div style="display:flex; gap:5px; align-items:center">
                            <span>${q.tipo === 'multipla' ? String.fromCharCode(65+i)+')' : '( )'}</span>
                            <input type="text" value="${opt}" oninput="questoes[${idx}].opcoes[${i}] = this.value" placeholder="Opção ${i+1}">
                        </div>
                    `).join('')}`;
                break;

            case 'imagem':
                camposExtras = `
                    <div class="area-foto">
                        <button onclick="abrirModal(${q.id})" style="font-size:12px">🔍 Busca Online</button>
                        <input type="file" id="file-${q.id}" style="display:none" onchange="uploadLocal(${q.id}, this)" accept="image/*">
                        <button onclick="document.getElementById('file-${q.id}').click()" style="font-size:12px">📁 Galeria/Foto</button>
                        <div class="img-preview">
                            ${q.fotos.map(f => `<img src="${f}">`).join('')}
                        </div>
                    </div>`;
                break;

            case 'ligue':
                camposExtras = `
                    <div style="font-size:12px">Qtd de pares: <input type="number" value="${q.colEsq.length}" onchange="mudarQtdLigue(${q.id}, this.value)" style="width:40px"></div>
                    <div class="grid-ligue">
                        <div>${q.colEsq.map((v, i) => `<input type="text" value="${v}" oninput="questoes[${idx}].colEsq[${i}] = this.value" placeholder="Lado A">`).join('')}</div>
                        <div>${q.colDir.map((v, i) => `<input type="text" value="${v}" oninput="questoes[${idx}].colDir[${i}] = this.value" placeholder="Lado B">`).join('')}</div>
                    </div>`;
                break;

            case 'dissertativa':
                camposExtras = `Qtd de linhas: <input type="number" value="${q.qtd}" oninput="questoes[${idx}].qtd = this.value" style="width:60px">`;
                break;
        }

        card.innerHTML = `
            <button class="btn-remover" onclick="questoes.splice(${idx},1); renderizarTela()">✖</button>
            <small>Questão ${idx+1} - ${q.tipo.toUpperCase()}</small>
            <textarea placeholder="Digite o enunciado aqui..." oninput="questoes[${idx}].enunciado = this.value">${q.enunciado}</textarea>
            ${camposExtras}
        `;
        lista.appendChild(card);
    });
}

// LÓGICA DE QUANTIDADES
function mudarQtd(id, val) {
    const q = questoes.find(x => x.id === id);
    const n = parseInt(val);
    while(q.opcoes.length < n) q.opcoes.push("");
    while(q.opcoes.length > n) q.opcoes.pop();
    renderizarTela();
}

function mudarQtdLigue(id, val) {
    const q = questoes.find(x => x.id === id);
    const n = parseInt(val);
    while(q.colEsq.length < n) { q.colEsq.push(""); q.colDir.push(""); }
    while(q.colEsq.length > n) { q.colEsq.pop(); q.colDir.pop(); }
    renderizarTela();
}

// LÓGICA DE IMAGEM
function abrirModal(id) { idQuestaoFoto = id; document.getElementById('modal-busca').style.display = 'flex'; }
function fecharModal() { document.getElementById('modal-busca').style.display = 'none'; }

async function buscarImagens() {
    const termo = document.getElementById('termo-busca').value;
    const resDiv = document.getElementById('resultados-busca');
    resDiv.innerHTML = "Buscando...";
    const API_KEY = '15335541-11d51f786847d86f780838634';
    const resp = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(termo)}&image_type=photo`);
    const data = await resp.json();
    resDiv.innerHTML = "";
    data.hits.forEach(img => {
        const el = document.createElement('img');
        el.src = img.webformatURL;
        el.style.width = "100%";
        el.onclick = () => indexarImagem(img.webformatURL);
        resDiv.appendChild(el);
    });
}

function indexarImagem(url) {
    const q = questoes.find(x => x.id === idQuestaoFoto);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        q.fotos.push(canvas.toDataURL('image/png'));
        renderizarTela(); fecharModal();
    };
    img.src = url;
}

function uploadLocal(id, input) {
    const q = questoes.find(x => x.id === id);
    const reader = new FileReader();
    reader.onload = (e) => { q.fotos.push(e.target.result); renderizarTela(); };
    reader.readAsDataURL(input.files[0]);
}

// PDF
function gerarPDF() {
    const escola = document.getElementById('nome-escola').value.toUpperCase() || "PROVA";
    const corpo = document.getElementById('pdf-corpo');
    corpo.innerHTML = `<center><h2>${escola}</h2></center><hr>`;

    questoes.forEach((q, i) => {
        let h = `<div style="margin-bottom:25px"><strong>${i+1}. ${q.enunciado}</strong><br>`;
        
        if(q.fotos.length > 0) h += `<div style="display:flex; gap:10px; margin:10px 0">${q.fotos.map(f => `<img src="${f}" style="width:120px">`).join('')}</div>`;
        
        if(q.tipo === 'multipla' || q.tipo === 'vf') h += q.opcoes.map((o, idx) => `<p>( ) ${q.tipo === 'multipla' ? String.fromCharCode(65+idx)+')' : ''} ${o}</p>`).join('');
        
        if(q.tipo === 'ligue') {
            h += `<div style="display:flex; justify-content:space-between; margin-top:10px">
                <div>${q.colEsq.map(v => `<p>( ) ${v}</p>`).join('')}</div>
                <div>${q.colDir.map(v => `<p>${v} ( )</p>`).join('')}</div>
            </div>`;
        }
        
        if(q.tipo === 'dissertativa') {
            for(let l=0; l<q.qtd; l++) h += `<div style="border-bottom:1px solid #000; height:25px; margin-top:5px"></div>`;
        }

        corpo.innerHTML += h + `</div>`;
    });

    const folha = document.getElementById('pdf-folha');
    folha.style.display = 'block';
    html2pdf().from(folha).set({ margin: 10, filename: 'prova.pdf' }).save().then(() => folha.style.display = 'none');
}
