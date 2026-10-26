// Chamada genérica de cadastro/login.
export async function enviarParaApi(rota, dados) {
  const resposta = await fetch(rota, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(corpo.erro || 'Algo deu errado. Tente de novo.');
  }
  return corpo;
}

// Chamadas autenticadas (painel da equipe, empréstimos do cliente). O servidor
// confere o token assinado (emitido no login) no header 'Authorization'.
export async function enviarAdmin(url, metodo, token, corpo) {
  const resposta = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Algo deu errado. Tente de novo.');
  }
  return dados;
}
