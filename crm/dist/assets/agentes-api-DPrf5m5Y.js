import{d as m,t as d,s as E,o as g,f as p,h as $}from"./index-BAT77oFl.js";const b="https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/agent-api",A=[{k:"read:all",l:"Ler tudo (recomendado)",grupo:"leitura"},{k:"read:pesquisa",l:"Ler pesquisas",grupo:"leitura"},{k:"read:cliente",l:"Ler clientes",grupo:"leitura"},{k:"read:dashboard",l:"Ler dashboard/KPIs",grupo:"leitura"},{k:"write:pesquisa",l:"Criar/editar pesquisas",grupo:"escrita"},{k:"notify:lira",l:"Enviar msg WhatsApp pro Lira",grupo:"notificação"}];let l=[],u=[],h=!1;async function v(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando…</div>',S(),await L(),_(),w()}async function L(){const[e,t]=await Promise.all([E("agent_tokens",{order:{column:"criado_em",ascending:!1}}),m.from("agent_logs").select("*").order("criado_em",{ascending:!1}).limit(50)]);l=e.data||[],u=t&&!t.error?t.data||[]:[]}function _(){document.getElementById("tbacts").innerHTML=`
    <button class="btn bg bsm" id="ap-docs">📖 Docs pro Hermes</button>
    <button class="btn bp" id="ap-add">+ Novo agente</button>
  `,document.getElementById("ap-add").addEventListener("click",()=>f()),document.getElementById("ap-docs").addEventListener("click",()=>I())}function w(){var s;const e=document.getElementById("content"),t=l.length?l.map(a=>z(a)).join(""):`<div class="empty" style="padding:60px 20px">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhum agente cadastrado</div>
        <div style="font-size:12px;margin-bottom:18px">Crie um token pro Hermes começar a agir no CRM automaticamente.</div>
        <button class="btn bp" id="ap-first">+ Criar primeiro agente</button>
      </div>`,n=u.length?u.map(a=>{const o=l.find(i=>i.id===a.token_id),r=a.status>=400?"var(--danger)":a.status>=200&&a.status<300?"var(--ok)":"var(--text-3)";return`<tr>
          <td class="tm" style="font-size:11px">${new Date(a.criado_em).toLocaleString("pt-BR")}</td>
          <td class="tn">${o?c(o.nome):'<span style="color:var(--text-3)">Sem auth</span>'}</td>
          <td><code style="font-size:11px">${a.metodo} ${c(a.endpoint)}</code></td>
          <td style="color:${r};font-weight:600">${a.status||"—"}</td>
          <td class="tm" style="font-size:11px">${a.erro?c(a.erro.slice(0,80)):""}</td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Nenhuma chamada registrada ainda.</div></td></tr>';e.innerHTML=`
    <div style="background:rgba(74,158,255,.06);border:1px solid rgba(74,158,255,.18);padding:14px 18px;border-radius:var(--r);margin-bottom:22px;display:flex;align-items:flex-start;gap:12px">
      <div style="font-size:22px">🤖</div>
      <div style="flex:1">
        <div style="font-weight:600;margin-bottom:4px">Eleva Agent API</div>
        <div style="font-size:12.5px;color:var(--text-2);line-height:1.55">
          Endpoint: <code>${b}</code><br>
          Cada agente autônomo recebe um bearer token único. O token só aparece <b>UMA vez</b> na criação — guarde num lugar seguro. Se perder, revoga e gera outro.
        </div>
      </div>
    </div>

    <div class="ct" style="margin-bottom:12px">Agentes cadastrados</div>
    <div class="ap-grid" style="margin-bottom:32px">${t}</div>

    <div class="tw">
      <div class="th"><h3>Últimas 50 chamadas</h3></div>
      <table>
        <thead><tr><th>Quando</th><th>Agente</th><th>Endpoint</th><th>Status</th><th>Erro</th></tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>`,(s=document.getElementById("ap-first"))==null||s.addEventListener("click",()=>f())}function z(e){const t=e.ativo,n=e.permissoes||[];return`<div class="ap-card ${t?"":"inativo"}" data-tid="${e.id}">
    <div class="ap-card-head">
      <div>
        <div class="ap-card-name">${c(e.nome)}</div>
        <div class="ap-card-prefix"><code>${c(e.token_prefix)}…</code></div>
      </div>
      <label class="pj-rot-toggle">
        <input type="checkbox" class="ap-toggle" data-tid="${e.id}" ${t?"checked":""}>
        <span>${t?"Ativo":"Revogado"}</span>
      </label>
    </div>
    <div class="ap-card-perms">
      ${n.map(s=>`<span class="pj-sub-chip">${c(s)}</span>`).join("")}
    </div>
    <div class="ap-card-meta">
      ${e.ultimo_uso?`Último uso: ${$(e.ultimo_uso)} · ${e.total_chamadas||0} chamadas`:"Nunca usado"}
    </div>
    <div class="ap-card-acts">
      <button class="btn bg bsm ap-edit" data-tid="${e.id}">Editar</button>
      <button class="btn bd bsm ap-del"  data-tid="${e.id}">Revogar</button>
    </div>
  </div>`}function f(e={}){const t=!e.id,n=e.permissoes||["read:all","write:pesquisa","notify:lira"],s={};for(const o of A)(s[o.grupo]=s[o.grupo]||[]).push(o);const a=Object.entries(s).map(([o,r])=>`
    <div style="margin-bottom:8px">
      <div style="font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">${o}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${r.map(i=>`<label class="pj-dia-chip ${n.includes(i.k)?"on":""}" data-perm="${i.k}">
          <input type="checkbox" ${n.includes(i.k)?"checked":""} style="display:none">${i.l}
        </label>`).join("")}
      </div>
    </div>`).join("");g(t?"Novo agente":"Editar agente",`
    <div class="fg" style="margin-bottom:14px"><label class="fl">Nome do agente *</label>
      <input class="fi" id="ap-nome" value="${P(e.nome||"")}" placeholder="Ex: Hermes, Sofia-2, GPT-Pesquisador"></div>
    <div class="fg">
      <label class="fl">Permissões</label>
      <div id="ap-perms">${a}</div>
    </div>
    <div style="margin-top:12px;font-size:11px;color:var(--text-3);line-height:1.5">
      ${t?"⚠️ Ao criar, o token completo será exibido UMA vez. Copie e guarde no seu Hermes/servidor imediatamente.":""}
    </div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">${t?"Gerar token":"Salvar"}</button>
  `),document.getElementById("ap-perms").addEventListener("click",o=>{const r=o.target.closest(".pj-dia-chip");r&&(o.preventDefault(),r.classList.toggle("on"),r.querySelector("input").checked=r.classList.contains("on"))}),document.getElementById("m-cancel").addEventListener("click",p),document.getElementById("m-save").addEventListener("click",async()=>{const o=document.getElementById("ap-nome").value.trim();if(!o)return d("Nome é obrigatório","err");const r=[...document.querySelectorAll("#ap-perms .pj-dia-chip.on")].map(i=>i.dataset.perm);if(!r.length)return d("Selecione ao menos 1 permissão","err");if(t){const i="agt_"+T(48),x=i.slice(0,8),k=await q(i),{error:y}=await m.from("agent_tokens").insert({nome:o,token_prefix:x,token_hash:k,permissoes:r,ativo:!0});if(y)return d("Erro: "+y.message,"err");p(),B(o,i)}else{const{error:i}=await m.from("agent_tokens").update({nome:o,permissoes:r}).eq("id",e.id);if(i)return d("Erro: "+i.message,"err");p(),d("Agente atualizado"),v()}})}function B(e,t){g(`Token de ${c(e)}`,`
    <div style="background:rgba(255,92,92,.08);border:1px solid rgba(255,92,92,.25);padding:12px 14px;border-radius:var(--rs);margin-bottom:14px;font-size:12.5px;line-height:1.55">
      ⚠️ <b>Este token só aparece UMA vez.</b> Copie agora e guarde no seu agente. Se perder, você precisará revogar e gerar outro.
    </div>
    <div class="fg" style="margin-bottom:14px">
      <label class="fl">Token completo</label>
      <div style="display:flex;gap:6px">
        <input class="fi" id="ap-newtok" value="${t}" readonly style="font-family:ui-monospace,monospace;font-size:12px">
        <button class="btn bp bsm" id="ap-copy">Copiar</button>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text-2);line-height:1.6">
      <b>Como usar no Hermes:</b><br>
      <code style="display:block;background:var(--bg-input);padding:10px;border-radius:6px;margin-top:6px;font-size:11px;word-break:break-all">
curl -X POST ${b}/pesquisa \\<br>
&nbsp;&nbsp;-H "Authorization: Bearer ${t}" \\<br>
&nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
&nbsp;&nbsp;-d '{"titulo":"...","resumo":"..."}'
      </code>
    </div>
  `,'<button class="btn bp" id="m-close">Guardei o token</button>'),document.getElementById("ap-copy").addEventListener("click",()=>{navigator.clipboard.writeText(t).then(()=>d("Copiado!"))}),document.getElementById("m-close").addEventListener("click",()=>{p(),v()})}function I(){g("Docs — Eleva Agent API",`
    <div style="font-size:12.5px;line-height:1.65;color:var(--text-2)">
      <b>Base URL:</b><br>
      <code style="background:var(--bg-input);padding:2px 6px;border-radius:4px">${b}</code><br><br>
      <b>Autenticação:</b> header <code>Authorization: Bearer &lt;seu-token&gt;</code><br><br>
      <b>Endpoints principais:</b>
      <ul style="margin-left:18px;margin-top:8px">
        <li><code>POST /pesquisa</code> — cria pesquisa. Body: <code>{titulo, categoria, resumo, fonte_url, prioridade, cliente_id, tags, acao_proposta}</code></li>
        <li><code>GET /pesquisas?status=nova</code> — lista até 100</li>
        <li><code>PATCH /pesquisa/:id</code> — atualiza status/prioridade</li>
        <li><code>GET /clientes?status=ativo</code> — lista clientes</li>
        <li><code>GET /dashboard</code> — KPIs do dia (clientes ativos, pesquisas novas, tarefas abertas, receita do mês)</li>
        <li><code>POST /notificar-lira</code> — manda msg via WhatsApp pro Lira. Body: <code>{texto}</code></li>
      </ul><br>
      Docs completa: <b>D:\\lpedlira\\docs\\HERMES_API.md</b>
    </div>
  `,'<button class="btn bp" id="m-close">Fechar</button>'),document.getElementById("m-close").addEventListener("click",p)}function S(){h||(h=!0,document.getElementById("content").addEventListener("click",async e=>{if(document.body.dataset.view!=="agentes_api")return;const t=e.target.closest(".ap-edit"),n=e.target.closest(".ap-del"),s=e.target.closest(".ap-toggle");if(t){const a=l.find(o=>o.id===t.dataset.tid);a&&f(a)}else if(n){const a=l.find(o=>o.id===n.dataset.tid);a&&confirm(`Revogar token "${a.nome}"? O agente para de funcionar imediatamente.`)&&(await m.from("agent_tokens").update({ativo:!1}).eq("id",a.id),d("Revogado"),v())}else if(s){const a=l.find(o=>o.id===s.dataset.tid);a&&(await m.from("agent_tokens").update({ativo:s.checked}).eq("id",a.id),d(s.checked?"Reativado":"Revogado"))}}))}async function q(e){const t=new TextEncoder().encode(e),n=await crypto.subtle.digest("SHA-256",t);return[...new Uint8Array(n)].map(s=>s.toString(16).padStart(2,"0")).join("")}function T(e){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=new Uint8Array(e);return crypto.getRandomValues(n),[...n].map(s=>t[s%62]).join("")}function c(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function P(e){return c(e)}export{v as render};
