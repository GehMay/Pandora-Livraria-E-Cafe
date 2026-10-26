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

// Chamadas do painel da equipe que criam/editam/removem dados. O servidor
// confere no header 'x-usuario-email' se quem está logado é funcionário/admin.
export async function enviarAdmin(url, metodo, emailUsuario, corpo) {
  const resposta = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', 'x-usuario-email': emailUsuario },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Algo deu errado. Tente de novo.');
  }
  return dados;
}
