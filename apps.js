let questoes = [];

function adicionarQuestao(tipo) {
  const questao = {
    id: Date.now(),
    tipo: tipo,
    enunciado: "",
    linhas: 5,
    imagem: null
  };

  questoes.push(questao);
  render();
}

function render() {
  const container = document.getElementById("prova");
  container.innerHTML = "";

  questoes.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "questao";

    let html = `
      <h3>Questão ${index + 1}</h3>
      <textarea placeholder="Digite o enunciado" 
        oninput="atualizarEnunciado(${q.id}, this.value)">
        ${q.enunciado}
      </textarea>

      <input type="file" onchange="uploadImagem(${q.id}, event)">
    `;

    if (q.imagem) {
      html += `<img src="${q.imagem}">`;
    }

    html += gerarTipo(q);

    div.innerHTML = html;
    container.appendChild(div);
  });
}

function atualizarEnunciado(id, valor) {
  const q = questoes.find(q => q.id === id);
  q.enunciado = valor;
}

function uploadImagem(id, event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const q = questoes.find(q => q.id === id);
    q.imagem = e.target.result;
    render();
  };

  reader.readAsDataURL(file);
}

function gerarTipo(q) {
  switch(q.tipo) {

    case "multipla":
      return `
        <div>
          ( ) A <br>
          ( ) B <br>
          ( ) C <br>
          ( ) D
        </div>
      `;

    case "dissertativa":
      return `
        <label>Linhas:</label>
        <input type="number" value="${q.linhas}" 
          onchange="alterarLinhas(${q.id}, this.value)">
        <div class="linhas">
          ${gerarLinhas(q.linhas)}
        </div>
      `;

    case "vf":
      return `
        <div>
          ( ) Verdadeiro <br>
          ( ) Falso
        </div>
      `;

    case "lacuna":
      return `
        <div>
          ____________________________
        </div>
      `;

    default:
      return "";
  }
}

function gerarLinhas(qtd) {
  let linhas = "";
  for (let i = 0; i < qtd; i++) {
    linhas += "<div></div>";
  }
  return linhas;
}

function alterarLinhas(id, valor) {
  const q = questoes.find(q => q.id === id);
  q.linhas = valor;
  render();
}