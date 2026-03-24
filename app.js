window.questoes = [];

window.adicionarQuestao = function(tipo) {
  window.questoes.push({
    id: Date.now(),
    tipo,
    enunciado: "",
    linhas: 5,
    imagem: null
  });

  render();
};

function render() {
  const container = document.getElementById("prova");
  container.innerHTML = "";

  window.questoes.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "questao";

    div.innerHTML = `
      <h3>Questão ${i + 1}</h3>

      <textarea oninput="update(${q.id}, this.value)">
        ${q.enunciado}
      </textarea>

      <input type="file" onchange="img(${q.id}, event)">

      ${q.imagem ? `<img src="${q.imagem}">` : ""}

      ${tipo(q)}
    `;

    container.appendChild(div);
  });
}

window.update = function(id, val) {
  const q = window.questoes.find(q => q.id === id);
  q.enunciado = val;
};

window.img = function(id, e) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const q = window.questoes.find(q => q.id === id);
    q.imagem = ev.target.result;
    render();
  };
  reader.readAsDataURL(e.target.files[0]);
};

function tipo(q) {
  switch(q.tipo) {
    case "multipla":
      return `( ) A<br>( ) B<br>( ) C<br>( ) D`;
    case "vf":
      return `( ) Verdadeiro<br>( ) Falso`;
    case "dissertativa":
      return gerarLinhas(5);
    case "curta":
      return `<div class="linha-curta"></div>`;
    case "lacuna":
      return `_____________________`;
    case "ordenar":
      return `( ) 1ª<br>( ) 2ª<br>( ) 3ª`;
    case "circule":
      return `○ Opção 1<br>○ Opção 2`;
    case "arme":
      return `<div class="linha"></div><div class="linha"></div>`;
    default:
      return "";
  }
}

function gerarLinhas(n) {
  let html = "";
  for (let i = 0; i < n; i++) {
    html += `<div class="linha"></div>`;
  }
  return html;
}