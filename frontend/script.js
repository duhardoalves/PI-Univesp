async function loadWorkload() {

  try {

    const response = await fetch('http://localhost:3000/analyst');

    const data = await response.json();

    const filter = document.getElementById('statusFilter').value;

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
          <p>Status: ${analyst.status}</p>
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

          <p>Status: ${analyst.status}</p>

          <button onclick="alterarStatus(${analyst.id}, '${analyst.status}')">

            ${analyst.status === 'ACTIVE'
              ? 'Inativar'
              : 'Ativar'}

          </button>

          ${analyst.status === 'INACTIVE'
            ? `
              <button onclick="excluirAnalista(${analyst.id})">
                Excluir
              </button>
            `
            : ''
          }

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

  const numeroProcesso =
    document.getElementById('numeroProcesso').value;

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
        process_number: numeroProcesso
      })

    });

    const data = await response.json();

    alert(data.message || data.error);

    document.getElementById('numeroProcesso').value = '';

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

          <h3>${processo.process_number}</h3>

          <p>Status: ${processo.status}</p>

          <p>
            Analista:
            ${processo.analyst_name || 'Não atribuído'}
          </p>

          <button onclick="excluirProcesso(${processo.id})">
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

async function excluirProcesso(id) {

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

    // 🔥 Atualizar automaticamente
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






