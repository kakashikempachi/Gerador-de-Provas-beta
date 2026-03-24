let db = [];
let idAtualImagens = null;

// Garante que o botão funcione assim que o site abrir
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-trigger');
    if(btn) {
        btn.addEventListener('click', () => {
            const tipo = document.getElementById('tipo-questao').value;
            addQuestao(tipo);
        });
    }
});

function addQuestao(tipo) {
    const novaQ = {
        id: Date.now(),
        tipo: tipo,
        enunciado: "",
        opcoes: (tipo === 'multipla') ? ["", "", "", ""] : [],
        fotos: [],
        ligueEsq: ["", ""],
        ligueDir: ["", ""],
        linhas: 3
    };
    db.push(novaQ);
    renderizar();
}

function renderizar() {
    const lista = document.getElementById('lista-questoes');
    lista.innerHTML = "";

    db.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'card-questao';
        
        let htmlExtra = "";
        
        if (q.tipo === 'multipla') {
            htmlExtra = `
                <div style="margin-top:10px">
                    ${q.opcoes.map((opt, i) => `
                        <div style="display:flex; margin-bottom:5px">
                            <span style="margin-right:5px">${String.fromCharCode(65+i)})</span>
                            <input type="text" value="${opt}" oninput="db[${idx}].opcoes[${i}] = this.value" style="width:100%">
                        </div>
                    `).join('')}
                    <button onclick="ajustarQtd(${q.id}, ${q.opcoes.length + 1})">＋ Opção</button>
                    <button onclick="ajustarQtd(${q.id}, ${q.opcoes.length - 1})">－ Opção</button>
                </div>`;
        } 
        else if (q.tipo === 'imagem') {
            htmlExtra = `
                <div style="background:#f8fafc; padding:10px; border-radius:8px; margin-top:10px; text-align:center">
                    <button onclick="abrirBusca(${q.id})">🔍 Buscar Imagem</button>
                    <input type="file" id="f-${q.id}" style="display:none" onchange="uploadLocal(${q.id}, this)">
                    <button onclick="document.getElementById('f-${q.id}').click()">📁 Galeria</button>
                    <div style="display:flex; gap:10px; margin-top:10px; overflow-x:auto">
                        ${q.fotos.map((f, fi) => `<img src="${f}" width="80" style="border:1px solid #ddd">`).join('')}
                    </div>
                </div>`;
        }
        else if (q.tipo === 'ligue') {
            htmlExtra = `<p style="font-size:12px">Edite os itens nas duas colunas abaixo.</p>
                <div style="display:flex; gap:5px">
                    <div style="flex:1">${q.ligueEsq.map((v,i) => `<input type="text" value="${v}" oninput="db[${idx}].ligueEsq[${i}]=this.value" placeholder="Esquerda">`).join('')}</div>
                    <div style="flex:1">${q.ligueDir.map((v,i) => `<input type="text" value="${v}" oninput="db[${idx}].ligueDir[${i}]=this.value" placeholder="Direita">`).join('')}</div>
                </div>`;
        }

        div.innerHTML = `
            <button class="remover" onclick="db.splice(${idx},1); renderizar()">✖</button>
            <strong>${idx + 1}. Tipo: ${q.tipo.toUpperCase()}</strong>
            <textarea oninput="db[${idx}].enunciado = this.value" placeholder="Digite a pergunta...">${q.enunciado}</textarea>
            ${htmlExtra}
        `;
        lista.appendChild(div);
    });
}

// Funções de Imagem
function abrirBusca(id) { idAtualImagens = id; document.getElementById('modal-busca').style.display = 'flex'; }
function fecharModal() { document.getElementById('modal-busca').style.display = 'none'; }

async function buscarPixabay() {
    const termo = document.getElementById('input-busca').value;
    const resDiv = document.getElementById('resultados');
    resDiv.innerHTML = "Buscando...";
    const key = '15335541-11d51f786847d86f780838634';
    const resp = await fetch(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(termo)}&image_type=photo&per_page=10`);
    const data = await resp.json();
    resDiv.innerHTML = "";
    data.hits.forEach(img => {
        const i = document.createElement('img');
        i.src = img.webformatURL;
        i.onclick = () => indexar(img.webformatURL);
        resDiv.appendChild(i);
    });
}

function indexar(url) {
    const q = db.find(x => x.id === idAtualImagens);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        q.fotos.push(canvas.toDataURL('image/png'));
        renderizar(); fecharModal();
    };
    img.src = url;
}

function uploadLocal(id, input) {
    const q = db.find(x => x.id === id);
    const reader = new FileReader();
    reader.onload = (e) => { q.fotos.push(e.target.result); renderizar(); };
    reader.readAsDataURL(input.files[0]);
}

function ajustarQtd(id, n) {
    const q = db.find(x => x.id === id);
    if(n < 1) return;
    while(q.opcoes.length < n) q.opcoes.push("");
    while(q.opcoes.length > n) q.opcoes.pop();
    renderizar();
}

// PDF
function gerarPDF() {
    const escola = document.getElementById('escola-nome').value.toUpperCase() || "PROVA";
    const conteudo = document.getElementById('pdf-conteudo');
    conteudo.innerHTML = `<center><h2>${escola}</h2></center><hr>`;

    db.forEach((q, i) => {
        let html = `<div style="margin-bottom:20px"><strong>${i+1}. ${q.enunciado}</strong><br>`;
        if(q.fotos.length > 0) {
            html += `<div style="display:flex; gap:10px; margin:10px 0">
                ${q.fotos.map(f => `<img src="${f}" style="width:120px; border:1px solid #000">`).join('')}
            </div>`;
        }
        if(q.tipo === 'multipla') {
            html += q.opcoes.map((o, idx) => `<p>( ) ${String.fromCharCode(65+idx)}) ${o}</p>`).join('');
        }
        html += `</div>`;
        conteudo.innerHTML += html;
    });

    const folha = document.getElementById('folha-a4');
    folha.style.display = 'block';
    html2pdf().from(folha).save().then(() => folha.style.display = 'none');
}
