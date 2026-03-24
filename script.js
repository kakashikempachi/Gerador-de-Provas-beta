let db = [];
let questaoAtivaId = null;

function addQuestao() {
    const tipo = document.getElementById('tipo-questao').value;
    const q = {
        id: Date.now(),
        tipo: tipo,
        enunciado: "",
        opcoes: (tipo === 'multipla' || tipo === 'vf') ? ["", "", "", ""] : [],
        ligue: { esq: ["", ""], dir: ["", ""] },
        fotos: [],
        valor: 3 // para linhas ou grade
    };
    db.push(q);
    render();
}

function render() {
    const container = document.getElementById('lista-questoes');
    container.innerHTML = "";

    db.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'card-questao';
        
        let interfaceExtra = "";

        // LÓGICA DE INTERFACE POR TIPO
        if (q.tipo === 'multipla' || q.tipo === 'vf') {
            interfaceExtra = `
                <div>Qtd de itens: <input type="number" value="${q.opcoes.length}" onchange="setQtd(${q.id}, this.value)"></div>
                ${q.opcoes.map((opt, i) => `
                    <div style="display:flex; gap:5px; margin-top:5px">
                        <span>${String.fromCharCode(65+i)})</span>
                        <input type="text" value="${opt}" oninput="db[${idx}].opcoes[${i}] = this.value" style="flex:1">
                    </div>
                `).join('')}`;
        } 
        else if (q.tipo === 'imagem') {
            interfaceExtra = `
                <div class="area-upload">
                    <button onclick="abrirBusca(${q.id})">🔍 Buscar Imagem</button>
                    <button onclick="document.getElementById('file-${q.id}').click()">📁 Galeria/Câmera</button>
                    <input type="file" id="file-${q.id}" style="display:none" onchange="handleFile(${q.id}, this)" multiple>
                    <div class="grid-fotos">
                        ${q.fotos.map((f, fi) => `
                            <div class="foto-card">
                                <img src="${f.src}">
                                <input type="text" placeholder="Legenda" value="${f.legenda}" oninput="db[${idx}].fotos[${fi}].legenda = this.value">
                                <button onclick="db[${idx}].fotos.splice(${fi},1); render()" style="color:red; border:none; font-size:10px; cursor:pointer">Remover</button>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        }
        else if (q.tipo === 'ligue') {
            interfaceExtra = `
                <div>Qtd de itens: <input type="number" value="${q.ligue.esq.length}" onchange="setQtdLigue(${q.id}, this.value)"></div>
                <div style="display:flex; gap:10px; margin-top:10px">
                    <div style="flex:1">${q.ligue.esq.map((v, i) => `<input type="text" value="${v}" oninput="db[${idx}].ligue.esq[${i}] = this.value" placeholder="Lado A">`).join('')}</div>
                    <div style="flex:1">${q.ligue.dir.map((v, i) => `<input type="text" value="${v}" oninput="db[${idx}].ligue.dir[${i}] = this.value" placeholder="Lado B">`).join('')}</div>
                </div>`;
        }
        else if (q.tipo === 'dissertativa' || q.tipo === 'rascunho') {
            interfaceExtra = `Linhas/Espaço: <input type="number" value="${q.valor}" oninput="db[${idx}].valor = this.value">`;
        }

        card.innerHTML = `
            <button class="remover" onclick="db.splice(${idx},1); render()">✖</button>
            <small>Questão ${idx + 1} - ${q.tipo.toUpperCase()}</small>
            <textarea placeholder="Digite o enunciado aqui..." oninput="db[${idx}].enunciado = this.value">${q.enunciado}</textarea>
            ${interfaceExtra}
        `;
        container.appendChild(card);
    });
}

// AJUSTES DINÂMICOS
function setQtd(id, val) {
    const q = db.find(x => x.id === id);
    const n = parseInt(val) || 1;
    while(q.opcoes.length < n) q.opcoes.push("");
    while(q.opcoes.length > n) q.opcoes.pop();
    render();
}

function setQtdLigue(id, val) {
    const q = db.find(x => x.id === id);
    const n = parseInt(val) || 1;
    while(q.ligue.esq.length < n) { q.ligue.esq.push(""); q.ligue.dir.push(""); }
    while(q.ligue.esq.length > n) { q.ligue.esq.pop(); q.ligue.dir.pop(); }
    render();
}

// LÓGICA DE IMAGEM (UPLOAD E BUSCA)
function handleFile(id, input) {
    const q = db.find(x => x.id === id);
    Array.from(input.files).forEach(f => {
        const r = new FileReader();
        r.onload = (e) => { q.fotos.push({src: e.target.result, legenda: ""}); render(); };
        r.readAsDataURL(f);
    });
}

function abrirBusca(id) { questaoAtivaId = id; document.getElementById('modal-busca').style.display = 'flex'; }
function fecharModal() { document.getElementById('modal-busca').style.display = 'none'; }

async function executarBusca() {
    const termo = document.getElementById('busca-input').value;
    const resDiv = document.getElementById('busca-resultados');
    resDiv.innerHTML = "Carregando...";
    
    // API Educativa Gratuita (Pixabay)
    const url = `https://pixabay.com/api/?key=15335541-11d51f786847d86f780838634&q=${encodeURIComponent(termo)}&image_type=photo&per_page=12`;
    
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        resDiv.innerHTML = "";
        data.hits.forEach(img => {
            const el = document.createElement('img');
            el.src = img.webformatURL;
            el.onclick = () => indexarImagem(img.webformatURL);
            resDiv.appendChild(el);
        });
    } catch(e) { resDiv.innerHTML = "Erro na busca."; }
}

function indexarImagem(url) {
    const q = db.find(x => x.id === questaoAtivaId);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        q.fotos.push({ src: canvas.toDataURL('image/png'), legenda: "" });
        render(); fecharModal();
    };
    img.src = url;
}

// PDF GENERATOR
function gerarPDF() {
    document.getElementById('pdf-titulo').innerText = document.getElementById('escola-nome').value.toUpperCase() || "PROVA ESCOLAR";
    const corpo = document.getElementById('pdf-corpo');
    corpo.innerHTML = "";

    db.forEach((q, i) => {
        let html = `<div class="q-bloco"><strong>${i+1}. ${q.enunciado}</strong>`;
        
        if (q.fotos.length > 0) {
            html += `<div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px">
                ${q.fotos.map(f => `<div style="width:30%; text-align:center"><img src="${f.src}" style="width:100%; border:1px solid #000"><div>${f.legenda}</div></div>`).join('')}
            </div>`;
        }

        if (q.tipo === 'multipla' || q.tipo === 'vf') {
            html += q.opcoes.map((o, idx) => `<p>( ) ${String.fromCharCode(65+idx)}) ${o}</p>`).join('');
        } else if (q.tipo === 'ligue') {
            html += `<div style="display:flex; justify-content:space-between; margin-top:15px">
                <div>${q.ligue.esq.map(v => `<p>( ) ${v}</p>`).join('')}</div>
                <div style="text-align:right">${q.ligue.dir.map(v => `<p>${v} ( )</p>`).join('')}</div>
            </div>`;
        } else if (q.tipo === 'dissertativa') {
            for(let l=0; l<q.valor; l++) html += `<p style="border-bottom:1px solid #000; margin-top:20px">&nbsp;</p>`;
        } else if (q.tipo === 'rascunho') {
            html += `<div style="height:${q.valor*10}mm; border:1px solid #ccc; background-image:radial-gradient(#ddd 1px, transparent 1px); background-size:8mm 8mm; margin-top:10px"></div>`;
        }

        html += `</div>`;
        corpo.innerHTML += html;
    });

    const sheet = document.getElementById('folha-a4');
    sheet.style.display = 'block';
    html2pdf().set({ margin:0, filename:'prova.pdf', jsPDF:{unit:'mm', format:'a4'}, pagebreak:{mode:'avoid-all'}})
              .from(sheet).save().then(() => sheet.style.display = 'none');
}
