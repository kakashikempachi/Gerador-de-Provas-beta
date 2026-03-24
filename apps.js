let questoes = [];

function adicionarQuestao(tipo) {
  questoes.push({
    id: Date.now(),
    tipo,
    enunciado: "",
    linhas: 5,
    colunasA: ["", ""],
    colunasB: ["", ""],
    imagem: null
  });
  render();
}

function render() {
  const container = document.getElementById("prova");
  container.innerHTML = "";

  questoes.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "questao";

    div.innerHTML = `
      <h3>Questão ${i + 1}</h3>

      <textarea placeholder="Enunciado"
        oninput="update(${q.id}, 'enunciado', this.value)">
        ${q.enunciado}
      </textarea>

      <input type="file" onchange="uploadImagem(${q.id}, event)">

      ${q.imagem ? `<img src="${q.imagem}">` : ""}

      ${renderTipo(q)}
    `;

    container.appendChild(div);
  });
}

function update(id, campo, valor) {
  const q = questoes.find(q => q.id === id);
  q[campo] = valor;
}

function uploadImagem(id, event) {
  const reader = new FileReader();
  reader.onload = e => {
    update(id, "imagem", e.target.result);
    render();
  };
  reader.readAsDataURL(event.target.files[0]);
}

function renderTipo(q) {
  switch(q.tipo) {

    case "multipla":
      return `
        ${["A","B","C","D"].map(l => `( ) ${l}<br>`).join("")}
      `;

    case "vf":
      return `( ) Verdadeiro <br> ( ) Falso`;

    case "dissertativa":
      return `
        Linhas: 
        <input type="number" value="${q.linhas}"
          onchange="update(${q.id}, 'linhas', this.value); render();">
        ${linhas(q.linhas)}
      `;

    case "curta":
      return `<div class="linha-curta"></div>`;

    case "lacuna":
      return `______________________________`;

    case "colunas":
      return `
        <div class="colunas">
          <div>
            ${q.colunasA.map((v,i)=>
              `<input placeholder="A${i+1}" 
                value="${v}"
                oninput="updateColuna(${q.id},'A',${i},this.value)">`
            ).join("")}
          </div>

          <div>
            ${q.colunasB.map((v,i)=>
              `<input placeholder="B${i+1}" 
                value="${v}"
                oninput="updateColuna(${q.id},'B',${i},this.value)">`
            ).join("")}
          </div>
        </div>
      `;

    case "ordenar":
      return `
        <p>( ) 1ª</p>
        <p>( ) 2ª</p>
        <p>( ) 3ª</p>
      `;

    case "circule":
      return `
        <p>○ Opção 1</p>
        <p>○ Opção 2</p>
      `;

    case "arme":
      return `<div class="conta"></div>`;

    default:
      return "";
  }
}

function linhas(qtd) {
  let html = "";
  for (let i = 0; i < qtd; i++) {
    html += `<div class="linha"></div>`;
  }
  return html;
}

function updateColuna(id, tipo, index, valor) {
  const q = questoes.find(q => q.id === id);
  if (tipo === "A") q.colunasA[index] = valor;
  else q.colunasB[index] = valor;
}