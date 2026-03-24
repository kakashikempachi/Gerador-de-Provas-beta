// GARANTE QUE FUNÇÕES FIQUEM GLOBAIS
window.questoes = [];

window.adicionarQuestao = function(tipo) {
  window.questoes.push({
    id: Date.now(),
    tipo,
    enunciado: "",
    linhas: 5,
    colunasA: ["", ""],
    colunasB: ["", ""],
    imagem: null
  });

  render();
};

function render() {
  const container = document.getElementById("prova");
  if (!container) return;

  container.innerHTML = "";

  window.questoes.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "questao";

    div.innerHTML = `
      <h3>Questão ${i + 1}</h3>

      <textarea placeholder="Digite o enunciado"
        oninput="updateCampo(${q.id}, 'enunciado', this.value)">
        ${q.enunciado}
      </textarea>

      <input type="file" onchange="uploadImagem(${q.id}, event)">

      ${q.imagem ? `<img src="${q.imagem}">` : ""}

      ${renderTipo(q)}
    `;

    container.appendChild(div);
  });
}

window.updateCampo = function(id, campo, valor) {
  const q = window.questoes.find(q => q.id === id);
  if (q) q[campo] = valor;
};

window.uploadImagem = function(id, event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    const q = window.questoes.find(q => q.id === id);
    if (q) {
      q.imagem = e.target.result;
      render();
    }
  };

  reader.readAsDataURL(file);
};

function renderTipo(q) {
  switch(q.tipo) {

    case "multipla":
      return `
        <div>
          ( ) A<br>
          ( ) B<br>
          ( ) C<br>
          ( ) D
        </div>
      `;

    case "vf":
      return `
        <div>
          ( ) Verdadeiro<br>
          ( ) Falso
        </div>
      `;

    case "dissertativa":
      return `
        Linhas:
        <input type="number" value="${q.linhas}"
          onchange="alterarLinhas(${q.id}, this.value)">
        ${gerarLinhas(q.linhas)}
      `;

    case "curta":
      return `<div class="linha-curta"></div>`;

    case "lacuna":
      return `<div>__________________________</div>`;

    case "colunas":
      return `
        <div class="colunas">
          <div>
            ${q.colunasA.map((v,i)=>`
              <input placeholder="A${i+1}" value="${v}"
              oninput="updateColuna(${q.id}, 'A', ${i}, this.value)">
            `).join("")}
          </div>

          <div>
            ${q.colunasB.map((v,i)=>`
              <input placeholder="B${i+1}" value="${v}"
              oninput="updateColuna(${q.id}, 'B', ${i}, this.value)">
            `).join("")}
          </div>
        </div>
      `;

    case "ordenar":
      return `
        ( ) 1ª<br>
        ( ) 2ª<br>
        ( ) 3ª
      `;

    case "circule":
      return `
        ○ Opção 1<br>
        ○ Opção 2
      `;

    case "arme":
      return `<div class="conta"></div>`;

    default:
      return "";
  }
}

function gerarLinhas(qtd) {
  let html = "";
  for (let i = 0; i < qtd; i++) {
    html += `<div class="linha"></div>`;
  }
  return html;
}

window.alterarLinhas = function(id, valor) {
  const q = window.questoes.find(q => q.id === id);
  if (q) {
    q.linhas = parseInt(valor);
    render();
  }
};

window.updateColuna = function(id, tipo, index, valor) {
  const q = window.questoes.find(q => q.id === id);
  if (!q) return;

  if (tipo === "A") q.colunasA[index] = valor;
  else q.colunasB[index] = valor;
};
