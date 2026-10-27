import { useState } from 'react';
import { enviarParaApi } from '../api.js';

const NOTAS = [1, 2, 3, 4, 5];

export default function FormularioFeedback({ usuario = null }) {
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    nota: 0,
    mensagem: '',
    site: '' // campo isca, fica escondido do visitante
  });
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setMensagem(null);
    setEnviando(true);
    try {
      await enviarParaApi('/api/feedback', {
        ...form,
        nota: form.nota || undefined
      });
      setMensagem({ texto: 'Obrigado pelo feedback! Ele foi enviado com sucesso. 💛', tipo: 'ok' });
      setForm({ nome: usuario?.nome || '', email: usuario?.email || '', nota: 0, mensagem: '', site: '' });
    } catch (erro) {
      setMensagem({ texto: erro.message, tipo: 'erro' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={enviar} style={{ maxWidth: '520px', margin: '0 auto' }}>
      <h3>Deixe seu feedback</h3>
      <p style={{ marginTop: '-0.5rem', marginBottom: '1.25rem', color: 'var(--texto-sutil)' }}>
        Conte o que achou do site, o que funcionou bem e o que pode melhorar. Sua opinião é muito bem-vinda!
      </p>

      {/* Campo isca: invisível pra visitantes, mas bots costumam preenchê-lo. */}
      <input
        type="text"
        name="site"
        value={form.site}
        onChange={(e) => setForm({ ...form, site: e.target.value })}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
      />

      <div className="form-grupo">
        <label htmlFor="feedback-nome">Nome (opcional)</label>
        <input
          id="feedback-nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          placeholder="Como podemos te chamar?"
        />
      </div>

      <div className="form-grupo">
        <label htmlFor="feedback-email">E-mail (opcional)</label>
        <input
          id="feedback-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Só se quiser que a gente responda"
        />
      </div>

      <div className="form-grupo">
        <label>Nota (opcional)</label>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {NOTAS.map((valor) => (
            <button
              key={valor}
              type="button"
              className="btn-icone"
              aria-pressed={form.nota === valor}
              aria-label={`Nota ${valor} de 5`}
              onClick={() => setForm({ ...form, nota: form.nota === valor ? 0 : valor })}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {form.nota >= valor ? 'star' : 'star_outline'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-grupo">
        <label htmlFor="feedback-mensagem">Mensagem</label>
        <textarea
          id="feedback-mensagem"
          value={form.mensagem}
          onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
          placeholder="O que você achou da Pandora Livraria & Café?"
          maxLength={2000}
          required
        />
      </div>

      {mensagem && <p className={`form-mensagem form-mensagem-${mensagem.tipo}`}>{mensagem.texto}</p>}

      <button type="submit" className="btn-submit" disabled={enviando}>
        <span className="material-symbols-outlined" aria-hidden="true">send</span>
        {enviando ? 'Enviando...' : 'Enviar feedback'}
      </button>
    </form>
  );
}
