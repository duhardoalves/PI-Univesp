
async function loadWorkload() {

  try {

    const response = await fetch('http://localhost:3000/analyst');

    const data = await response.json();

    const filter = document.getElementById('statusFilter').value;

    if (!filter) {

  const resultado =
    document.getElementById('resultado');

  resultado.innerHTML = '';

  if (chart) {

    chart.destroy();

  }

  return;

}

    let filteredData = data;

    if (filter !== 'ALL') {

      filteredData = data.filter((analyst) => {
        return analyst.status === filter;
  });

}

    console.log(data);

    const resultado = document.getElementById('resultado');

    resultado.innerHTML = '';

    filteredData.forEach((analyst) => {

      resultado.innerHTML += `
        <div class="card">
          <h3>${analyst.name}</h3>
          <p>
            Status:
            ${
              analyst.status === 'ACTIVE'
                ? 'Ativo'
                : 'Inativo'
            }
          </p>
        </div>
     `;

    });

    createChart(filteredData);

  } catch (error) {

    console.log('ERRO:', error);

  }

}
 
function createChart(data) {

  const ctx = document.getElementById('workloadChart');

  const labels = data.map((analyst) => analyst.name);

  const values = data.map((analyst) => analyst.total_processes || 0);

  new Chart(ctx, {
    type: 'bar',

    data: {
      labels: labels,

      datasets: [{
        label: 'Quantidade de Processos por Analista',
        data: values
      }]
    }
  });

}

async function criarAnalista() {

  const nome = document.getElementById('nomeAnalista').value;

  if (!nome) {

    alert('Digite o nome do analista');

    return;
  }

  try {

    const response = await fetch('http://localhost:3000/analyst', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        name: nome
      })

    });

    const data = await response.json();

    alert(data.message || data.error);

  
    document.getElementById('nomeAnalista').value = '';

    loadWorkload();

    listarAnalistas();

  } catch (error) {

    console.log('ERRO AO CRIAR ANALISTA:', error);

  }

}

// Traduzir status para português
function traduzirStatusProcesso(status) {

  const traducoes = {

    OPEN: 'ABERTO',

    IN_PROGRESS: 'EM ANDAMENTO',

    DONE: 'FINALIZADO'

  };

  return traducoes[status] || status;

}

function traduzirStatusAnalista(status) {

  const traducoes = {

    ACTIVE: 'ATIVO',

    INACTIVE: 'INATIVO'

  };

  return traducoes[status] || status;

}

async function listarAnalistas() {

  try {

    const response = await fetch('http://localhost:3000/analyst');

    const data = await response.json();

    const lista = document.getElementById('listaAnalistas');

    lista.innerHTML = '';

    data.forEach((analyst) => {

      lista.innerHTML += `
        <div class="card">

          <h3>${analyst.name}</h3>

          <p>Status: ${traduzirStatusAnalista(analyst.status)}</p>

          <p>
            Inatividade:
            ${analyst.inactive_days} dias
          </p>

          <button onclick="alterarStatusAnalista(${analyst.id}, '${analyst.status}')">

            ${analyst.status === 'ACTIVE'
              ? 'Inativar'
              : 'Ativar'}

          </button>

          ${analyst.status === 'INACTIVE'
            ? `
              <button
                class="btn-delete"
                onclick="excluirAnalista(${analyst.id})"
              >
                Excluir
              </button>
            `
            : ''
          }

          <button onclick="editarAnalista(${analyst.id}, '${analyst.name}')">
            Editar
          </button>
        </div>
      `;

    });

  } catch (error) {

    console.log('ERRO AO LISTAR ANALISTAS:', error);

  } 
}

async function alterarStatus(id, statusAtual) {

  const novoStatus =
    statusAtual === 'ACTIVE'
      ? 'INACTIVE'
      : 'ACTIVE';

  try {

    await fetch(`http://localhost:3000/analyst/${id}/status`, {

      method: 'PATCH',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        status: novoStatus
      })

    });

    listarAnalistas();

    loadWorkload();

  } catch (error) {

    console.log('ERRO AO ALTERAR STATUS:', error);

  }

}

listarAnalistas();

async function criarProcesso() {

  const prefix =
    document.getElementById('prefix').value;

  const numeroProcesso =
    document.getElementById('numeroProcesso').value;

  const anoProcesso =
    document.getElementById('anoProcesso').value; 

  if (!numeroProcesso) {

    alert('Digite o número do processo');

    return;
  }

  try {

    const response = await fetch('http://localhost:3000/process', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({

        prefix,

        process_number: numeroProcesso,

        process_year: anoProcesso

      })

    });

    const data = await response.json();

    alert(data.message || data.error);

    document.getElementById('numeroProcesso').value = '';

    listarProcessos();

    loadWorkload();

  } catch (error) {

    console.log('ERRO AO CRIAR PROCESSO:', error);

  }

}

async function excluirAnalista(id) {

  const confirmar = confirm(
    'Deseja realmente excluir este analista?'
  );

  if (!confirmar) {
    return;
  }

  try {

    const response = await fetch(
      `http://localhost:3000/analyst/${id}`,
      {
        method: 'DELETE'
      }
    );

    const data = await response.json();

    alert(data.message || data.error);

    listarAnalistas();

    loadWorkload();

  } catch (error) {

    console.log('ERRO AO EXCLUIR ANALISTA:', error);

  }

}

async function listarProcessos() {

  try {

    const response = await fetch(
      'http://localhost:3000/process'
    );

    const processos = await response.json();

    const lista = document.getElementById(
      'listaProcessos'
    );

    lista.innerHTML = '';

    processos.forEach((processo) => {

      lista.innerHTML += `
        <div class="card">

          <h3>
            ${processo.prefix}
            ${processo.process_number}/${processo.process_year}
          </h3>

          <p>
            Status:
            ${traduzirStatusProcesso(processo.status)}
          </p>

          <p>
            Analista:
            ${processo.analyst_name || 'Não atribuído'}
          </p>

          <button
            onclick="alterarStatusProcesso(${processo.id})"
          >
            Alterar Status
          </button>

          <button

            class="btn-excluir"

            onclick="excluirProcesso(
              ${processo.id},
              '${processo.status}'
            )"

          >

            Excluir

          </button>

        </div>
      `;

    });

  } catch (error) {

    console.log(
      'ERRO AO LISTAR PROCESSOS:',
      error
    );

  }

}

async function excluirProcesso(id, status) {

  if (status !== 'DONE') {

    alert(
      'Somente processos FINALIZADOS podem ser excluídos.'
    );

    return;

  }

  const confirmar = confirm(
    'Deseja realmente excluir este processo?'
  );

  if (!confirmar) {
    return;
  }

  try {

    const response = await fetch(

      `http://localhost:3000/process/${id}`,

      {
        method: 'DELETE'
      }

    );

    const data = await response.json();

    alert(data.message || data.error);

    listarProcessos();

    loadWorkload();

  } catch (error) {

    console.log(
      'ERRO AO EXCLUIR PROCESSO:',
      error
    );

  }

}

loadWorkload();

listarAnalistas();

listarProcessos();

// Opção editar analista
async function editarAnalista(id, nomeAtual) {

  const novoNome = prompt(
    'Digite o novo nome do analista:',
    nomeAtual
  );

  if (!novoNome) {
    return;
  }

  try {

    const response = await fetch(
      `http://localhost:3000/analyst/${id}`,
      {

        method: 'PUT',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          name: novoNome
        })

      }
    );

    const data = await response.json();

    alert(data.message || data.error);

    listarAnalistas();

    loadWorkload();

  } catch (error) {

    console.log(
      'ERRO AO EDITAR ANALISTA:',
      error
    );

  }

}

async function alterarStatusProcesso(id) {

  const opcao = prompt(

`Escolha o novo status:

1 - ABERTO
2 - EM ANDAMENTO
3 - FINALIZADO`

  );

  let status = '';

  if (opcao === '1') {

    status = 'OPEN';

  } else if (opcao === '2') {

    status = 'IN_PROGRESS';

  } else if (opcao === '3') {

    status = 'DONE';

  } else {

    alert('Opção inválida');

    return;

  }

  try {

    const response = await fetch(

      `http://localhost:3000/process/${id}/status`,

      {

        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          status
        })

      }

    );

    const data = await response.json();

    alert(data.message || data.error);

    listarProcessos();

    loadWorkload();

  } catch (error) {

    console.log(
      'ERRO STATUS:',
      error
    );

  }

}

async function alterarStatusAnalista(id) {

  const opcao = prompt(

`Escolha o novo status:

1 - ATIVO
2 - INATIVO`

  );

  let status = '';

  if (opcao === '1') {

    status = 'ACTIVE';

  } else if (opcao === '2') {

    status = 'INACTIVE';

  } else {

    alert('Opção inválida');

    return;

  }

  try {

    const response = await fetch(

      `http://localhost:3000/analyst/${id}/status`,

      {

        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          status
        })

      }

    );

    const data = await response.json();

    alert(data.message || data.error);

    listarAnalistas();

    loadWorkload();

  } catch (error) {

    console.log(
      'ERRO STATUS ANALISTA:',
      error
    );

  }

}

// Relatório dos processos
function relatorioProcessos() {

  const resultado =
    document.getElementById(
      'resultadoRelatorio'
    );

  resultado.innerHTML = `

  <table border="1" width="100%">

    <thead>

      <tr>

        <th>Processo</th>

        <th>Status</th>

        <th>Analista</th>

      </tr>

    </thead>

    <tbody id="tabelaRelatorio">

    </tbody>

  </table>

`;

fetch('http://localhost:3000/process')

  .then(response => response.json())

  .then(data => {

    const tabela =
      document.getElementById(
        'tabelaRelatorio'
      );

    data.forEach((processo) => {

      tabela.innerHTML += `

        <tr>

          <td>

            ${processo.prefix}
            ${processo.process_number}/${processo.process_year}

          </td>

          <td>

            ${traduzirStatusProcesso(
              processo.status
            )}

          </td>

          <td>

            ${processo.analyst_name}

          </td>

        </tr>

      `;

    });

  })

    .catch(error => {

      console.log(
        'ERRO RELATÓRIO:',
        error
      );

    });

}

// Relatório dos analistas
function relatorioAnalistas() {

  const resultado =
    document.getElementById(
      'resultadoRelatorio'
    );

  resultado.innerHTML = `

    <table border="1" width="100%">

      <thead>

        <tr>

          <th>Analista</th>

          <th>Processo</th>

          <th>Status</th>

        </tr>

      </thead>

      <tbody id="tabelaAnalistas">

      </tbody>

    </table>

  `;

  fetch('http://localhost:3000/process')

    .then(response => response.json())

    .then(data => {

      const tabela =
        document.getElementById(
          'tabelaAnalistas'
        );

      data.forEach((processo) => {

        tabela.innerHTML += `

          <tr>

            <td>
              ${processo.analyst_name}
            </td>

            <td>

              ${processo.prefix}
              ${processo.process_number}/${processo.process_year}

            </td>

            <td>

              ${traduzirStatusProcesso(
                processo.status
              )}

            </td>

          </tr>

        `;

      });

    })

    .catch(error => {

      console.log(
        'ERRO RELATÓRIO ANALISTAS:',
        error
      );

    });

}

// Relatório de cargas
function relatorioCarga() {

  const resultado =
    document.getElementById(
      'resultadoRelatorio'
    );

  resultado.innerHTML = `

    <table border="1" width="100%">

      <thead>

        <tr>

          <th>Analista</th>

          <th>Total de Processos</th>

        </tr>

      </thead>

      <tbody id="tabelaCarga">

      </tbody>

    </table>

  `;

  fetch('http://localhost:3000/process/workload')

    .then(response => response.json())

    .then(data => {

      const tabela =
        document.getElementById(
          'tabelaCarga'
        );

      data.workload.forEach((analyst) => {

        tabela.innerHTML += `

          <tr>

            <td>

              ${analyst.name}

            </td>

            <td>

              ${analyst.total_processes}

            </td>

          </tr>

        `;

      });

    })

    .catch(error => {

      console.log(
        'ERRO RELATÓRIO CARGA:',
        error
      );

    });

}

// Relatório de histórico
function relatorioHistorico() {

  const resultado =
    document.getElementById(
      'resultadoRelatorio'
    );

  resultado.innerHTML = `

    <table border="1" width="100%">

      <thead>

        <tr>

          <th>Processo</th>

          <th>Analista</th>

          <th>Distribuído em</th>

        </tr>

      </thead>

      <tbody id="tabelaHistorico">

      </tbody>

    </table>

  `;

  fetch('http://localhost:3000/process')

    .then(response => response.json())

    .then(data => {

      const tabela =
        document.getElementById(
          'tabelaHistorico'
        );

      data.forEach((processo) => {

        const dataFormatada =
          new Date(
            processo.assigned_at
          ).toLocaleString('pt-BR');

        tabela.innerHTML += `

          <tr>

            <td>

              ${processo.prefix}
              ${processo.process_number}/${processo.process_year}

            </td>

            <td>

              ${processo.analyst_name}

            </td>

            <td>

              ${dataFormatada}

            </td>

          </tr>

        `;

      });

    })

    .catch(error => {

      console.log(
        'ERRO RELATÓRIO HISTÓRICO:',
        error
      );

    });

}








