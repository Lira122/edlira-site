// Stub — a view Conteudo ainda nao foi implementada.
export async function render() {
  const c = document.getElementById('content')
  c.innerHTML = `
    <div style="max-width:520px;margin:80px auto;padding:36px 32px;background:var(--bg-card);border:1px solid var(--line);border-radius:14px;text-align:center">
      <div style="font-size:48px;margin-bottom:14px">📝</div>
      <h2 style="font-size:18px;font-weight:600;margin-bottom:8px">Conteudo</h2>
      <p style="font-size:13px;color:var(--text-3);line-height:1.6;margin-bottom:20px">
        Essa aba ta reservada mas ainda nao foi construida.
        Se voce quer usar pra planejar posts do Instagram, TikTok,
        blog, ou calendario editorial dos clientes, me fala o
        que voce quer que ela faca e eu implemento.
      </p>
      <div style="font-size:11px;color:var(--text-3)">
        crm/src/views/conteudo.js
      </div>
    </div>`
}
