let itens = [];

const formulario = document.getElementById("formId");

const input = document.getElementById("nomeDoProduto");
const inputPesquisa = document.getElementById("pesquisa");

const selectCategoria = document.getElementById("categoria");
const selectConservacao = document.getElementById("qualidade");
const selectDisponibilidade = document.getElementById("disponibilidade");

const texterrea = document.getElementById("descreverProduto");

const btnCarregar = document.getElementById("btnCarregarExemplos");
const btnApagarTudo = document.getElementById("btnApagarTudo");

const spanItens = document.getElementById("totalItens");
const spanDisponiveis = document.getElementById("totalDisponiveis");
const spanReservados = document.getElementById("totalReservados");
const spanDoados = document.getElementById("totalDoados");

const mensagem = document.getElementById("mensagem");
const listVazia = document.getElementById("listaVazia");
const listaItens = document.getElementById("listaItens");

formulario.addEventListener("submit", function (event) {
  event.preventDefault();

  const nome = input.value.trim();
  const categoria = selectCategoria.value;
  const conservacao = selectConservacao.value;
  const disponibilidade = selectDisponibilidade.value;
  const descricao = texterrea.value.trim();

  if (nome === "") {
    mostrarMensagem("Digite o nome do item", "erro");
    input.focus();
    return;
  }

  if (categoria === "") {
    mostrarMensagem("Selecione uma categoria", "erro");
    selectCategoria.focus();
    return;
  }

  if (conservacao === "") {
    mostrarMensagem("Selecione o estado de conservação", "erro");
    selectConservacao.focus();
    return;
  }

  if (disponibilidade === "") {
    mostrarMensagem("Selecione se o item é para troca, doação ou venda", "erro");
    selectDisponibilidade.focus();
    return;
  }

  if (descricao.length > 180) {
    mostrarMensagem("A descrição deve ter no máximo 180 caracteres", "erro");
    texterrea.focus();
    return;
  }

  const duplicado = itens.some(function (item) {
    return (
      item.nome.toLowerCase() === nome.toLowerCase() &&
      item.categoria.toLowerCase() === categoria.toLowerCase() &&
      item.disponibilidade.toLowerCase() === disponibilidade.toLowerCase() &&
      item.descricao.toLowerCase() === descricao.toLowerCase()
    );
  });

  if (duplicado) {
    mostrarMensagem("Já existe esse item cadastrado", "erro");
    return;
  }

  const itemNovo = {
    id: Date.now(),
    nome: nome,
    categoria: categoria,
    conservacao: conservacao,
    disponibilidade: disponibilidade,
    descricao: descricao,
    situacao: "disponível"
  };

  itens.push(itemNovo);

  salvarItens();
  renderizarItens();

  formulario.reset();

  mostrarMensagem("O item foi cadastrado com sucesso", "sucesso");
});

function renderizarItens() {
  listaItens.innerHTML = "";

  if (itens.length === 0) {
    listVazia.textContent = "Nenhum item foi encontrado";
    listVazia.style.display = "block";
  } else {
    listVazia.style.display = "none";

    itens.forEach(function (item) {
      const card = document.createElement("div");

      card.classList.add("card");
      card.dataset.id = item.id;

      if (item.situacao === "reservado") {
        card.classList.add("reservado");
      }

      card.innerHTML = `
        <h3>${item.nome}</h3>

        <p>
          <strong>Categoria:</strong>
          ${item.categoria}
        </p>

        <p>
          <strong>Conservação:</strong>
          ${item.conservacao || "Não informado"}
        </p>

        <p>
          <strong>Tipo:</strong>
          ${item.disponibilidade}
        </p>

        <p>
          <strong>Descrição:</strong>
          ${item.descricao || "Sem descrição"}
        </p>

        <p>
          <strong>Situação:</strong>
          ${item.situacao}
        </p>

        <div class="acoes">
          <button
            class="btnReservar"
            data-acao="reservar"
            data-id="${item.id}">
            ${item.situacao === "disponível" ? "Reservar" : "Disponibilizar"}
          </button>

          <button
            class="btnExcluir"
            data-acao="excluir"
            data-id="${item.id}">
            Excluir
          </button>
        </div>
      `;

      listaItens.appendChild(card);
    });
  }

  atualizarResumo();
}

listaItens.addEventListener("click", function (evento) {
  const botao = evento.target.closest("button");

  if (!botao) {
    return;
  }

  const id = Number(botao.dataset.id);
  const acao = botao.dataset.acao;

  if (acao === "reservar") {
    alterarSituacao(id);
  }

  if (acao === "excluir") {
    excluirItem(id);
  }
});

function alterarSituacao(id) {
  const item = itens.find(function (item) {
    return item.id === id;
  });

  if (!item) {
    return;
  }

  if (item.situacao === "disponível") {
    item.situacao = "reservado";
    mostrarMensagem("Item reservado", "sucesso");
  } else {
    item.situacao = "disponível";
    mostrarMensagem("Item disponibilizado novamente", "sucesso");
  }

  salvarItens();
  renderizarItens();
}

function excluirItem(id) {
  const item = itens.find(function (item) {
    return item.id === id;
  });

  if (!item) {
    return;
  }

  const confirmar = confirm(`Deseja realmente excluir ${item.nome}?`);

  if (!confirmar) {
    return;
  }

  itens = itens.filter(function (item) {
    return item.id !== id;
  });

  salvarItens();
  renderizarItens();

  mostrarMensagem("O item foi excluído com sucesso", "sucesso");
}

function atualizarResumo() {
  const total = itens.length;

  const disponiveis = itens.filter(function (item) {
    return item.situacao === "disponível";
  }).length;

  const reservados = itens.filter(function (item) {
    return item.situacao === "reservado";
  }).length;

  const doados = itens.filter(function (item) {
    return item.disponibilidade.toLowerCase() === "doação";
  }).length;

  spanItens.textContent = total;
  spanDisponiveis.textContent = disponiveis;
  spanReservados.textContent = reservados;
  spanDoados.textContent = doados;
}

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo;
  mensagem.style.display = "block";

  setTimeout(function () {
    mensagem.style.display = "none";
  }, 3000);
}

function salvarItens() {
  localStorage.setItem(
    "itensDaFeiraDigital",
    JSON.stringify(itens)
  );
}

function carregarItens() {
  const dadosSalvos = localStorage.getItem("itensDaFeiraDigital");

  if (dadosSalvos) {
    try {
      itens = JSON.parse(dadosSalvos);
    } catch (erro) {
      itens = [];
    }
  }

  renderizarItens();
}

btnApagarTudo.addEventListener("click", function () {
  if (itens.length === 0) {
    mostrarMensagem("Não existem itens para excluir", "erro");
    return;
  }

  const confirmar = confirm("Deseja mesmo apagar todos os itens?");

  if (!confirmar) {
    return;
  }

  itens = [];

  salvarItens();
  renderizarItens();

  mostrarMensagem(
    "Todos os seus itens foram excluídos",
    "sucesso"
  );
});

btnCarregar.addEventListener("click", function () {
  const exemplos = [
    {
      id: Date.now(),
      nome: "Air Max 95",
      categoria: "Vestuários",
      conservacao: "Bom estado",
      disponibilidade: "venda",
      descricao: "Air Max usado, mas em ótimo estado",
      situacao: "disponível"
    },
    {
      id: Date.now() + 1,
      nome: "Calça baggy preta",
      categoria: "Vestuários",
      conservacao: "Bom estado",
      disponibilidade: "troca",
      descricao: "Calça baggy preta tamanho 38",
      situacao: "disponível"
    }
  ];

  exemplos.forEach(function (exemplo) {
    const duplicado = itens.some(function (item) {
      return item.nome.toLowerCase() === exemplo.nome.toLowerCase();
    });

    if (!duplicado) {
      itens.push(exemplo);
    }
  });

  salvarItens();
  renderizarItens();

  mostrarMensagem("Exemplos carregados", "sucesso");
});

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") {
    if (inputPesquisa) {
      inputPesquisa.value = "";
    }

    mostrarMensagem("Pesquisa limpa", "sucesso");
  }
});

carregarItens();