let questoes = [];
let questaoAlvoImagens = null;

// Função de busca (Usa Pixabay API - Grátis e Educativa)
async function buscarImagensAPI() {
    const termo = document.getElementById('termo-busca').value;
    const resultadosDiv = document.getElementById('resultados');
    const API_KEY = '15335541-11d51f786847d86f780838634'; // Chave pública exemplo
    
    resultadosDiv.innerHTML = "Buscando...";
    
    try {
        const response = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(termo)}&image_type=photo&per_page=12&lang=pt`);
        const data = await response.json();
        
        resultadosDiv.innerHTML = "";
        data.hits.forEach(img => {
            const el = document.createElement('img');
            el.src = img.webformatURL;
            el.onclick = () => selecionarImagemBusca(img.webformatURL);
            resultadosDiv.appendChild(el);
        });
    } catch (e) {
        resultadosDiv.innerHTML = "Erro ao buscar. Tente novamente.";
    }
}

function selecionarImagemBusca(url) {
    const q = questoes.find(x => x.id === questaoAlvoImagens);
    // Converte para Base64 para garantir que a imagem seja indexada no PDF (não apenas o link)
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width; canvas.height = this.height;
        canvas.getContext('2d').drawImage(this, 0, 0);
        q.fotos.push({ src: canvas.toDataURL('image/png'), legenda: "" });
        renderizar();
        fecharModal();
    };
    img.src = url;
}

function abrirModal(id) {
    questaoAlvoImagens = id;
    document.getElementById('modal-busca').style.display = 'flex';
}

function fecharModal() { document.getElementById('modal-busca').style.display = 'none'; }

function subirArquivo(id, input) {
    const q = questoes.find(x => x.id === id);
    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            q.fotos.push({ src: e.target.result, legenda: "" });
            renderizar();
        };
        reader.readAsDataURL(file);
    });
}

function adicionarQuestao() {
    const tipo = document.getElementById('select-tipo').value;
    const q = {
        id: Date.now(),
        tipo: tipo,
        enunciado: "",
        alternativas: ["", "", "", ""],
        itensEsq: ["", ""], itensDir: ["", ""],
        qtdLinhas: 3,
        fotos: []
    };
    questoes.push(q);
    renderizar();
}

function renderizar() {
    const lista = document.getElementById('editor');
    lista.innerHTML = "";

    questoes.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'card-questao';
        
        let extra = "";
        if (q.tipo === 'imagem') {
            extra = `
                <div class="area-imagens">
                    <strong>Gerenciar Imagens:</strong><br>
                    <button onclick="abrirModal(${q.id})">🔍 Buscar no Banco de Imagens</button>
                    <input type="file" multiple accept="image/*" onchange="subirArquivo(${q.id}, this)" id="file-${q.id}" style="display:none">
                    <button onclick="document.getElementById('file-${q.id}').click()">📁 Galeria/Camera</button>
                    
                    <div class="grid-fotos-editor">
                        ${q.fotos.map((f, i) => `
                            <div class="foto-item">
                                <img src="${f.src}">
                                <input type="text" placeholder="Legenda" value="${f.legenda}" oninput="questoes[${idx}].fotos[${i}].legenda = this.value">
                                <button onclick="questoes[${idx}].fotos.splice(${i},1); renderizar()" style="color:red; border:none; background:none; cursor:pointer">Remover</button>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        } else if (q.tipo === 'multipla') {
            extra = `<div style="margin-top:10px;">Qtd: <input type="number" value="${q.alternativas.length}" onchange="alterarQtd(${q.id}, this.value)">
                ${q.alternativas.map((v, i) => `<input type="text" value="${v}" placeholder="Opção ${i+1}" oninput="questoes[${idx}].alternativas[${i}] = this.value">`).join('')}</div>`;
        }

        div.innerHTML = `
            <button class="remover" onclick="questoes.splice(${idx},1); renderizar()">🗑️</button>
            <strong>Questão ${idx+1}</strong>
            <textarea placeholder="Enunciado..." oninput="questoes[${idx}].enunciado = this.value">${q.enunciado}</textarea>
            ${extra}`;
        lista.appendChild(div);
    });
}

function alterarQtd(id, val) {
    const q = questoes.find(x => x.id === id);
    const n = parseInt(val);
    while(q.alternativas.length < n) q.alternativas.push("");
    while(q.alternativas.length > n) q.alternativas.pop();
    renderizar();
}

function gerarPDF() {
    document.getElementById('pdf-escola').innerText = document.getElementById('input-escola').value.toUpperCase();
    const corpo = document.getElementById('pdf-conteudo');
    corpo.innerHTML = "";

    questoes.forEach((q, i) => {
        let html = `<div class="q-pdf"><strong>${i+1}. ${q.enunciado}</strong>`;
        
        if (q.fotos.length > 0) {
            html += `<div class="galeria-pdf">${q.fotos.map(f => `
                <div class="figura-pdf"><img src="${f.src}"><div>${f.legenda}</div></div>`).join('')}</div>`;
        }
        
        if (q.tipo === 'multipla') {
            html += q.alternativas.map((v, idx) => `<p>( ) ${String.fromCharCode(65+idx)}) ${v}</p>`).join('');
        }
        
        html += `</div>`;
        corpo.innerHTML += html;
    });

    const folha = document.getElementById('folha-a4');
    folha.style.display = 'block';
    html2pdf().set({ margin: 0, filename: 'prova.pdf', jsPDF: { unit: 'mm', format: 'a4' }, pagebreak: { mode: 'avoid-all' }})
              .from(folha).save().then(() => folha.style.display = 'none');
}
