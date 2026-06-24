import{d as p,t as u,e as S,c as g,h as D,o as B,f as y}from"./index-Dta-29re.js";let m=[],E=[],v=new Date().getMonth()+1,x=new Date().getFullYear();const I=["#4A9EFF","#F5A623","#EC4899","#34D399","#A78BFA","#FF6B35","#06B6D4","#C5F82A"],L=["⛽","🚗","🏠","🛒","🍔","💊","🎬","📱","✈️","🎁","🏥","💼","🐾","🎓","🆘","💰"];async function k(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando…</div>',await q(),e.innerHTML=C(),z(e)}async function q(){const[e,t]=await Promise.all([p.from("caixinhas").select("*").eq("ativa",!0).order("ordem"),p.from("caixinhas_mov").select("*").order("data",{ascending:!1})]);e.error&&u("caixinhas: "+e.error.message,"err"),t.error&&u("caixinhas_mov: "+t.error.message,"err"),m=e.data||[],E=t.data||[]}function w(e,t,s){const i=`${s}-${String(t).padStart(2,"0")}`,a=E.filter(d=>d.caixinha_id===e.id&&(d.data||"").startsWith(i)).reduce((d,b)=>d+Number(b.valor||0),0);if(e.tipo==="gasto")return{alocado:Number(e.valor_mensal),usado:a,saldo:Number(e.valor_mensal)-a,tipo:"gasto"};const c=new Date(e.criado_em||new Date),l=new Date(s,t-1,1);let r=(l.getFullYear()-c.getFullYear())*12+(l.getMonth()-c.getMonth())+1;r<1&&(r=1);const o=Number(e.valor_mensal)*r,n=E.filter(d=>d.caixinha_id===e.id).reduce((d,b)=>d+Number(b.valor||0),0);return{alocado:o,usado:n,saldo:o-n,tipo:"reserva",meses:r}}function j(){return m.reduce((e,t)=>e+Number(t.valor_mensal||0),0)}function C(){const e=j(),t=m.reduce((c,l)=>c+w(l,v,x).usado,0),s=m.reduce((c,l)=>{const r=w(l,v,x);return c+(l.tipo==="gasto",r.saldo)},0),i=v===new Date().getMonth()+1&&x===new Date().getFullYear();return`
  <div class="cx">
    ${`
    <div class="cx-picker">
      <button class="btn bg bsm" id="cx-prev">◀</button>
      <select class="fsl" id="cx-mes">${S.map((c,l)=>`<option value="${l+1}"${l+1===v?" selected":""}>${c}</option>`).join("")}</select>
      <input class="fi" type="number" id="cx-ano" value="${x}" style="width:90px;text-align:center;padding:6px 9px">
      <button class="btn bg bsm" id="cx-next">▶</button>
      ${i?"":'<button class="btn bg bsm" id="cx-hoje">Voltar pra hoje</button>'}
    </div>`}

    <!-- Resumo do mês -->
    <div class="cx-resumo">
      <div class="cx-resumo-card">
        <div class="cx-resumo-lbl">Alocado / mês</div>
        <div class="cx-resumo-val">${g(e)}</div>
        <div class="cx-resumo-sub">${m.length} caixinha${m.length===1?"":"s"} ativa${m.length===1?"":"s"}</div>
      </div>
      <div class="cx-resumo-card">
        <div class="cx-resumo-lbl">Usado neste mês</div>
        <div class="cx-resumo-val" style="color:var(--danger)">${g(t)}</div>
        <div class="cx-resumo-sub">${e>0?Math.round(t/e*100):0}% do alocado</div>
      </div>
      <div class="cx-resumo-card">
        <div class="cx-resumo-lbl">Disponível agora</div>
        <div class="cx-resumo-val" style="color:${s>=0?"#34D399":"var(--danger)"}">${g(s)}</div>
        <div class="cx-resumo-sub">soma de todas as caixinhas</div>
      </div>
    </div>

    <!-- Grid de caixinhas -->
    <div class="cx-grid">
      ${m.map(R).join("")}
      <div class="cx-card cx-card-add" id="cx-add">
        <div class="cx-add-icon">＋</div>
        <div class="cx-add-lbl">Nova caixinha</div>
        <div class="cx-add-sub">Gasolina, mercado, emergência…</div>
      </div>
    </div>

    <!-- Histórico do mês -->
    <div class="cx-block">
      <div class="cx-block-head">
        <h3>Movimentações de ${S[v-1]}/${x}</h3>
        <button class="btn bp bsm" id="cx-add-mov">+ Registrar gasto</button>
      </div>
      ${H()}
    </div>
  </div>`}function R(e){const t=w(e,v,x),s=t.alocado>0?Math.min(100,t.usado/t.alocado*100):0,i=s>=100?"over":s>=80?"warn":"ok",a=e.cor||"#4A9EFF";return`
  <div class="cx-card ${i}" style="--cx-color:${a}" data-cxid="${e.id}">
    <div class="cx-top">
      <div class="cx-ico" style="background:${N(a,.14)};color:${a}">${e.icone||"💰"}</div>
      <div class="cx-name-box">
        <div class="cx-name">${f(e.nome)}</div>
        <div class="cx-type">${e.tipo==="reserva"?"reserva acumulada":"gasto mensal"}</div>
      </div>
      <button class="cx-menu" data-cx-edit="${e.id}">⋯</button>
    </div>

    <div class="cx-saldo">
      <div class="cx-saldo-val" style="color:${t.saldo>=0?"var(--text)":"var(--danger)"}">${g(t.saldo)}</div>
      <div class="cx-saldo-lbl">disponível</div>
    </div>

    <div class="cx-bar">
      <div class="cx-bar-fill" style="width:${s.toFixed(1)}%;background:${s>=100?"var(--danger)":a}"></div>
    </div>
    <div class="cx-bar-info">
      <span>${g(t.usado)} usado</span>
      <span>${g(t.alocado)} ${e.tipo==="reserva"?`(${t.meses}m)`:"/ mês"}</span>
    </div>

    <div class="cx-acts">
      <button class="btn bp bsm" data-cx-mov="${e.id}">− Gasto</button>
      <button class="btn bg bsm" data-cx-ext="${e.id}">Histórico</button>
    </div>
  </div>`}function H(){const e=`${x}-${String(v).padStart(2,"0")}`,t=E.filter(s=>(s.data||"").startsWith(e));return t.length?`
  <div class="cx-mov-list">
    ${t.map(s=>{const i=m.find(l=>l.id===s.caixinha_id),a=(i==null?void 0:i.cor)||"#4A9EFF",c=Number(s.valor)<0;return`
      <div class="cx-mov-row">
        <div class="cx-mov-data">${D(s.data)}</div>
        <div class="cx-mov-cx">
          ${i?`<span class="cx-mov-tag" style="background:${N(a,.15)};color:${a}">${i.icone||"💰"} ${f(i.nome)}</span>`:'<span class="cx-mov-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">caixinha excluída</span>'}
        </div>
        <div class="cx-mov-desc">${f(s.descricao||"—")}</div>
        <div class="cx-mov-val" style="color:${c?"#34D399":"var(--danger)"}">${c?"+":"−"}${g(Math.abs(Number(s.valor)))}</div>
        <button class="cx-mov-del" data-mov-del="${s.id}" title="Excluir">×</button>
      </div>`}).join("")}
  </div>`:'<div class="empty" style="padding:30px;text-align:center;color:var(--text-3)">Nenhuma movimentação neste mês.</div>'}function z(e){var t,s,i,a,c,l,r;(t=e.querySelector("#cx-prev"))==null||t.addEventListener("click",()=>$(v===1?12:v-1,v===1?x-1:x)),(s=e.querySelector("#cx-next"))==null||s.addEventListener("click",()=>$(v===12?1:v+1,v===12?x+1:x)),(i=e.querySelector("#cx-mes"))==null||i.addEventListener("change",o=>$(parseInt(o.target.value),x)),(a=e.querySelector("#cx-ano"))==null||a.addEventListener("change",o=>{const n=parseInt(o.target.value);n>=2020&&n<=2099&&$(v,n)}),(c=e.querySelector("#cx-hoje"))==null||c.addEventListener("click",()=>{const o=new Date;$(o.getMonth()+1,o.getFullYear())}),(l=e.querySelector("#cx-add"))==null||l.addEventListener("click",()=>F()),(r=e.querySelector("#cx-add-mov"))==null||r.addEventListener("click",()=>_()),e.addEventListener("click",async o=>{const n=o.target.closest("[data-cx-mov]"),d=o.target.closest("[data-cx-edit]"),b=o.target.closest("[data-cx-ext]"),M=o.target.closest("[data-mov-del]");if(n)return _({caixinhaId:n.dataset.cxMov});if(d){const h=m.find(A=>A.id===d.dataset.cxEdit);return h&&F(h)}if(b)return G(b.dataset.cxExt);if(M){if(!confirm("Excluir essa movimentação?"))return;const{error:h}=await p.from("caixinhas_mov").delete().eq("id",M.dataset.movDel);if(h)return u("Erro: "+h.message,"err");u("Removida"),k()}})}function $(e,t){v=e,x=t,k()}function F(e={}){var r;const t=!e.id,s=e.icone||L[0],i=e.cor||I[m.length%I.length],a=e.tipo||"gasto",c=L.map(o=>`<button type="button" class="lib-ico-pick${o===s?" on":""}" data-ico="${o}">${o}</button>`).join(""),l=I.map(o=>`<button type="button" class="lib-cor-pick${o===i?" on":""}" style="background:${o}" data-cor="${o}"></button>`).join("");B(t?"Nova caixinha":"Editar caixinha",`
    <div class="fg"><label class="fl">Nome</label>
      <input class="fi" type="text" id="cx-nome" placeholder="Ex: Gasolina, Mercado, Emergência…" value="${f(e.nome||"")}">
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Tipo</label>
        <select class="fsl" id="cx-tipo">
          <option value="gasto"${a==="gasto"?" selected":""}>Gasto mensal (zera no mês seguinte)</option>
          <option value="reserva"${a==="reserva"?" selected":""}>Reserva (acumula sempre)</option>
        </select>
      </div>
      <div class="fg"><label class="fl">Valor mensal (R$)</label>
        <input class="fi" type="number" id="cx-val" step="10" placeholder="500" value="${e.valor_mensal||""}">
      </div>
    </div>
    <div class="fg"><label class="fl">Ícone</label>
      <div class="lib-ico-row" id="cx-icones">${c}</div>
      <input type="hidden" id="cx-ico" value="${s}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="cx-cores">${l}</div>
      <input type="hidden" id="cx-cor" value="${i}">
    </div>
  `,`
    ${t?"":'<button class="btn bd bsm" id="cx-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="cx-cancel">Cancelar</button>
    <button class="btn bp" id="cx-save">Salvar</button>
  `),document.getElementById("cx-icones").addEventListener("click",o=>{const n=o.target.closest(".lib-ico-pick");n&&(document.querySelectorAll("#cx-icones .lib-ico-pick").forEach(d=>d.classList.remove("on")),n.classList.add("on"),document.getElementById("cx-ico").value=n.dataset.ico)}),document.getElementById("cx-cores").addEventListener("click",o=>{const n=o.target.closest(".lib-cor-pick");n&&(document.querySelectorAll("#cx-cores .lib-cor-pick").forEach(d=>d.classList.remove("on")),n.classList.add("on"),document.getElementById("cx-cor").value=n.dataset.cor)}),document.getElementById("cx-cancel").addEventListener("click",y),(r=document.getElementById("cx-del"))==null||r.addEventListener("click",async()=>{if(!confirm(`Excluir "${e.nome}"? Movimentações dessa caixinha também serão removidas.`))return;const{error:o}=await p.from("caixinhas").delete().eq("id",e.id);if(o)return u("Erro: "+o.message,"err");y(),u("Caixinha excluída"),k()}),document.getElementById("cx-save").addEventListener("click",async()=>{const o=document.getElementById("cx-nome").value.trim(),n=parseFloat(document.getElementById("cx-val").value)||0;if(!o)return u("Nome obrigatório","err");if(n<=0)return u("Valor mensal inválido","err");const d={nome:o,valor_mensal:n,tipo:document.getElementById("cx-tipo").value,icone:document.getElementById("cx-ico").value,cor:document.getElementById("cx-cor").value,atualizado_em:new Date().toISOString()},{error:b}=e.id?await p.from("caixinhas").update(d).eq("id",e.id):await p.from("caixinhas").insert(d);if(b)return u("Erro: "+b.message,"err");y(),u(e.id?"Caixinha atualizada":"Caixinha criada 💰"),k()})}function _({caixinhaId:e=null}={}){var i;const t=new Date().toISOString().slice(0,10),s=e||((i=m[0])==null?void 0:i.id)||"";B("Registrar gasto",`
    <div class="fg"><label class="fl">Qual caixinha?</label>
      <select class="fsl" id="mv-cx">
        ${m.map(a=>`<option value="${a.id}"${a.id===s?" selected":""}>${a.icone||"💰"} ${f(a.nome)} (${g(w(a,v,x).saldo)} disp.)</option>`).join("")}
      </select>
    </div>
    <div class="fg"><label class="fl">Valor gasto (R$)</label>
      <input class="fi" type="number" id="mv-val" placeholder="0,00" step="0.01">
    </div>
    <div class="fg"><label class="fl">Data</label>
      <input class="fi" type="date" id="mv-data" value="${t}">
    </div>
    <div class="fg"><label class="fl">Descrição (opcional)</label>
      <input class="fi" type="text" id="mv-desc" placeholder="Ex: Posto Ipiranga · Av Brasil">
    </div>
  `,`
    <button class="btn bg" id="mv-cancel">Cancelar</button>
    <button class="btn bp" id="mv-save">Registrar</button>
  `),document.getElementById("mv-cancel").addEventListener("click",y),document.getElementById("mv-save").addEventListener("click",async()=>{const a=parseFloat(document.getElementById("mv-val").value)||0;if(a<=0)return u("Valor inválido","err");const c=document.getElementById("mv-cx").value;if(!c)return u("Escolha uma caixinha","err");const l={caixinha_id:c,valor:a,data:document.getElementById("mv-data").value||t,descricao:document.getElementById("mv-desc").value.trim()||null},{error:r}=await p.from("caixinhas_mov").insert(l);if(r)return u("Erro: "+r.message,"err");y(),u("Gasto registrado"),k()})}function G(e){const t=m.find(a=>a.id===e);if(!t)return;const s=E.filter(a=>a.caixinha_id===e).slice(0,50),i=s.length?s.map(a=>`<tr>
        <td style="color:var(--text-3);font-family:var(--ff-mono)">${D(a.data)}</td>
        <td>${f(a.descricao||"—")}</td>
        <td style="text-align:right;font-weight:600;color:${Number(a.valor)<0?"#34D399":"var(--danger)"}">${Number(a.valor)<0?"+":"−"}${g(Math.abs(Number(a.valor)))}</td>
      </tr>`).join(""):'<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-3)">Nenhuma movimentação ainda</td></tr>';B(`${t.icone||"💰"} ${t.nome}`,`
    <div class="lib-hint" style="margin-bottom:14px">Últimas 50 movimentações</div>
    <table style="width:100%;font-size:13px">
      <thead style="border-bottom:1px solid var(--line)"><tr>
        <th style="text-align:left;padding:6px 4px;font-weight:500;color:var(--text-3);font-size:11px">Data</th>
        <th style="text-align:left;padding:6px 4px;font-weight:500;color:var(--text-3);font-size:11px">Descrição</th>
        <th style="text-align:right;padding:6px 4px;font-weight:500;color:var(--text-3);font-size:11px">Valor</th>
      </tr></thead>
      <tbody>${i}</tbody>
    </table>
  `,`<button class="btn bg" onclick="document.getElementById('ov').classList.add('h')">Fechar</button>`)}function f(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function N(e,t){const s=e.replace("#",""),i=parseInt(s.slice(0,2),16),a=parseInt(s.slice(2,4),16),c=parseInt(s.slice(4,6),16);return`rgba(${i},${a},${c},${t})`}export{k as render};
