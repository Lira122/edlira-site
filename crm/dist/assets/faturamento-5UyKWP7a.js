import{d as g,s as M,o as L,e as D,f as _,t as u,c as v,h as j,b as W,M as C}from"./index-DNz8MnN1.js";const F=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],I=Object.fromEntries(F.map(a=>[a.k,a]));let w=[],k=[],B=[],A=[],N=[],y="receita";async function x(){const a=document.getElementById("content");a.innerHTML='<div class="empty">Carregando...</div>',await G(),q(),V()}async function G(){const[a,c,l,i,t]=await Promise.all([g.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),M("despesas",{order:{column:"data",ascending:!1}}),M("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),M("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),M("clientes",{columns:"id,nome,empresa,status"})]);w=a.data||[],k=c.data||[],B=l.data||[],A=i.data||[],N=t.data||[]}function q(){const a=(n,p)=>`<button class="pj-tab${y===n?" on":""}" data-tab="${n}">${p}</button>`;let c="";y==="receita"&&(c='<button class="btn bp" id="btn-add">+ Receita</button>'),y==="despesas"&&(c='<button class="btn bp" id="btn-add">+ Despesa</button>'),y==="recorrentes"&&(c=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${a("receita","Receita")}${a("despesas","Despesas")}${a("recorrentes","Recorrentes")}${a("resumo","Resumo")}</div>
    ${c}
  `,document.querySelectorAll(".pj-tab").forEach(n=>n.addEventListener("click",()=>{y=n.dataset.tab,q(),V()}));const l=document.getElementById("btn-add");l&&(y==="receita"&&l.addEventListener("click",()=>T()),y==="despesas"&&l.addEventListener("click",()=>O()));const i=document.getElementById("btn-add-rec-receita"),t=document.getElementById("btn-add-rec-despesa");i&&i.addEventListener("click",()=>Y()),t&&t.addEventListener("click",()=>P())}function V(){return y==="despesas"?J():y==="recorrentes"?K():y==="resumo"?Q():U()}function U(){const a=document.getElementById("content"),c=new Date,l=c.getFullYear(),i=c.getMonth()+1,t=w.filter(e=>e.ano===l).reduce((e,d)=>e+Number(d.valor),0),n=[...new Set(w.filter(e=>e.ano===l).map(e=>e.mes))],p=n.length?t/n.length:0,s=w.reduce((e,d)=>!e||Number(d.valor)>Number(e.valor)?d:e,null),o=[];for(let e=11;e>=0;e--){const d=new Date(l,i-1-e,1),$=d.getMonth()+1,E=d.getFullYear(),m=w.filter(h=>h.mes===$&&h.ano===E).reduce((h,H)=>h+Number(H.valor),0);o.push({label:C[$-1],val:m,cur:e===0})}const r=Math.max(...o.map(e=>e.val),1),f=o.map(e=>{const d=Math.round(e.val/r*100);return`<div class="bg2">
      <div class="bv">${e.val>0?"R$"+W(e.val):""}</div>
      <div class="bar${e.cur?" cur":""}" style="height:${d}%"></div>
      <div class="bl">${e.label}</div>
    </div>`}).join(""),b=w.length?w.map(e=>`
        <tr>
          <td>${D[e.mes-1]}</td>
          <td class="tm">${e.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${v(e.valor)}</td>
          <td class="tm">${R(e.descricao||"—")}${e.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${j(e.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${e.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${e.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';a.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${l}</div><div class="sv ac">${v(t)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${v(p)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${s?v(s.valor):"—"}</div>
        <div class="ss">${s?D[s.mes-1]+" "+s.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${f}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${b}</tbody>
      </table>
    </div>`,a.querySelectorAll(".edit-fat").forEach(e=>e.addEventListener("click",()=>{const d=w.find($=>$.id===e.dataset.id);d&&T(d)})),a.querySelectorAll(".del-fat").forEach(e=>e.addEventListener("click",()=>X(e.dataset.id)))}function J(){const a=document.getElementById("content"),c=new Date,l=c.getFullYear(),i=c.getMonth()+1,t=`${l}-${String(i).padStart(2,"0")}`,n=k.filter(e=>(e.data||"").startsWith(t)),p=n.reduce((e,d)=>e+Number(d.valor),0),s=k.filter(e=>(e.data||"").startsWith(String(l))).reduce((e,d)=>e+Number(d.valor),0),o=_recorrentes.filter(e=>e.ativa).reduce((e,d)=>e+Number(d.valor),0),r={};for(const e of n)r[e.categoria||"outro"]=(r[e.categoria||"outro"]||0)+Number(e.valor);const f=Object.entries(r).sort(([,e],[,d])=>d-e).map(([e,d])=>{const $=I[e]||I.outro,E=p>0?Math.round(d/p*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${$.cor}"></span>
          <span class="desp-cat-name">${$.l}</span>
          <span class="desp-cat-pct">${E}%</span>
        </div>
        <div class="desp-cat-val">${v(d)}</div>
      </div>`}).join("")||'<div class="empty">Sem despesas neste mês.</div>',b=k.length?k.map(e=>{const d=I[e.categoria]||I.outro;return`<tr>
          <td class="tm">${j(e.data)}</td>
          <td class="tn">${R(e.descricao)}${e.recorrente_id?'<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>':""}</td>
          <td><span class="desp-cat-pill" style="background:${d.cor}22;color:${d.cor}">${d.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${v(e.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${e.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${e.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';a.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${D[i-1]}</div><div class="sv" style="color:var(--danger)">${v(p)}</div></div>
      <div class="sc"><div class="sl">Despesas ${l}</div><div class="sv">${v(s)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${v(o)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${D[i-1]} ${l}</div>
      <div class="desp-cat-grid">${f}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${b}</tbody>
      </table>
    </div>`,a.querySelectorAll(".edit-desp").forEach(e=>e.addEventListener("click",()=>{const d=k.find($=>$.id===e.dataset.id);d&&O(d)})),a.querySelectorAll(".del-desp").forEach(e=>e.addEventListener("click",()=>z(e.dataset.id)))}function K(){const a=document.getElementById("content"),c=A.filter(s=>s.ativa).reduce((s,o)=>s+Number(o.valor),0),l=B.filter(s=>s.ativa).reduce((s,o)=>s+Number(o.valor),0),i=c-l,t=(s,o)=>{const r=o==="receita"?"var(--accent)":"var(--danger)",f=o==="despesa"?I[s.categoria]||I.outro:null,b=o==="receita"&&s.cliente_id?N.find(d=>d.id===s.cliente_id):null,e=s.dia_util?`${s.dia_mes}º dia útil`:`Dia ${s.dia_mes}`;return`<div class="desp-rec-card ${s.ativa?"":"paused"}" data-rid="${s.id}" data-tipo="${o}">
      <div class="desp-rec-head">
        ${f?`<span class="desp-cat-pill" style="background:${f.cor}22;color:${f.cor}">${f.l}</span>`:b?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${R(b.empresa||b.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${s.id}" data-tipo="${o}" ${s.ativa?"checked":""}>
          <span>${s.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${R(s.descricao)}</div>
      <div class="desp-rec-val" style="color:${r}">${v(s.valor)}</div>
      <div class="desp-rec-meta">${e} de cada mês${s.ultima_geracao?" · Última: "+j(s.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${s.id}" data-tipo="${o}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${s.id}" data-tipo="${o}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${s.id}" data-tipo="${o}">Excluir</button>
      </div>
    </div>`},n=A.map(s=>t(s,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',p=B.map(s=>t(s,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';a.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${v(c)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${v(l)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${i>=0?"var(--ok)":"var(--danger)"}">${v(i)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${v(i*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${n}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${p}</div></div>
    </div>`,a.addEventListener("click",async s=>{const o=s.target.closest(".rec-edit"),r=s.target.closest(".rec-del"),f=s.target.closest(".rec-run"),b=s.target.closest(".desp-rec-active"),e=o||r||f||b;if(!e)return;const d=e.dataset.tipo,$=d==="receita"?A:B,E=d==="receita"?"receitas_recorrentes":"despesas_recorrentes",m=$.find(h=>h.id===e.dataset.rid);if(m)if(o)d==="receita"?Y(m):P(m);else if(r){if(!confirm(`Excluir "${m.descricao}"? (Lançamentos já gerados continuam)`))return;await g.from(E).delete().eq("id",m.id),u("Excluída"),x()}else f?(await Z(m,d),u(d==="receita"?"Receita lançada":"Despesa lançada"),x()):b&&(m.ativa=b.checked,await g.from(E).update({ativa:m.ativa,atualizado_em:new Date().toISOString()}).eq("id",m.id),x())})}function Q(){const a=document.getElementById("content"),c=new Date,l=c.getFullYear(),i=c.getMonth()+1,t=[];for(let r=11;r>=0;r--){const f=new Date(l,i-1-r,1),b=f.getMonth()+1,e=f.getFullYear(),d=`${e}-${String(b).padStart(2,"0")}`,$=w.filter(m=>m.mes===b&&m.ano===e).reduce((m,h)=>m+Number(h.valor),0),E=k.filter(m=>(m.data||"").startsWith(d)).reduce((m,h)=>m+Number(h.valor),0);t.push({label:C[b-1],rec:$,des:E,lucro:$-E,cur:r===0})}const n=Math.max(...t.flatMap(r=>[r.rec,r.des,Math.abs(r.lucro)]),1),p=t[t.length-1],s=t.slice().reverse().map(r=>`
    <tr>
      <td>${r.label}${r.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}</td>
      <td style="color:var(--accent);font-weight:500">${v(r.rec)}</td>
      <td style="color:var(--danger);font-weight:500">${v(r.des)}</td>
      <td style="font-weight:700;color:${r.lucro>=0?"var(--ok)":"var(--danger)"}">${v(r.lucro)}</td>
    </tr>`).join(""),o=t.map(r=>{const f=Math.round(r.rec/n*100),b=Math.round(r.des/n*100);return`<div class="resumo-bg">
      <div class="resumo-bars">
        <div class="resumo-bar rec" style="height:${f}%" title="Receita ${v(r.rec)}"></div>
        <div class="resumo-bar des" style="height:${b}%" title="Despesa ${v(r.des)}"></div>
      </div>
      <div class="bl">${r.label}</div>
    </div>`}).join("");a.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receita ${D[i-1]}</div><div class="sv" style="color:var(--accent)">${v(p.rec)}</div></div>
      <div class="sc"><div class="sl">Despesa ${D[i-1]}</div><div class="sv" style="color:var(--danger)">${v(p.des)}</div></div>
      <div class="sc"><div class="sl">Lucro ${D[i-1]}</div><div class="sv" style="color:${p.lucro>=0?"var(--ok)":"var(--danger)"}">${v(p.lucro)}</div></div>
      <div class="sc"><div class="sl">Margem</div><div class="sv">${p.rec>0?Math.round(p.lucro/p.rec*100)+"%":"—"}</div></div>
    </div>
    <div class="cw">
      <div class="ct">Receita vs Despesa — últimos 12 meses</div>
      <div class="bc">${o}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro</th></tr></thead>
        <tbody>${s}</tbody>
      </table>
    </div>`}function T(a={}){const c=!a.id,l=new Date;L(c?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${D.map((i,t)=>`<option value="${t+1}"${(a.mes||l.getMonth()+1)===t+1?" selected":""}>${i}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${a.ano||l.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${a.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${S(a.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",_),document.getElementById("m-save").addEventListener("click",async()=>{const i={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!i.valor)return u("Valor obrigatório","err");const{error:t}=a.id?await g.from("faturamento").update(i).eq("id",a.id):await g.from("faturamento").insert(i);if(t)return u("Erro: "+t.message,"err");_(),u("Salvo"),x()})}async function X(a){confirm("Remover?")&&(await g.from("faturamento").delete().eq("id",a),u("Removido"),x())}function O(a={}){const c=!a.id,l=new Date().toISOString().slice(0,10),i=F.map(t=>`<option value="${t.k}"${(a.categoria||"outro")===t.k?" selected":""}>${t.l}</option>`).join("");L(c?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${S(a.descricao||"")}" placeholder="Ex: Fatura Nubank, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${i}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${a.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data *</label>
      <input class="fi" type="date" id="d-data" value="${a.data||l}"></div>
  `,`
    ${c?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",_),c||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir?")&&(await z(a.id),_())}),document.getElementById("m-save").addEventListener("click",async()=>{const t={descricao:document.getElementById("d-desc").value.trim(),categoria:document.getElementById("d-cat").value,valor:parseFloat(document.getElementById("d-val").value)||0,data:document.getElementById("d-data").value};if(!t.descricao)return u("Descrição obrigatória","err");if(!t.valor)return u("Valor obrigatório","err");if(!t.data)return u("Data obrigatória","err");const{error:n}=a.id?await g.from("despesas").update(t).eq("id",a.id):await g.from("despesas").insert(t);if(n)return u("Erro: "+n.message,"err");_(),u("Salvo"),x()})}async function z(a){await g.from("despesas").delete().eq("id",a),u("Removida"),x()}function P(a={}){const c=!a.id,l=F.map(i=>`<option value="${i.k}"${(a.categoria||"outro")===i.k?" selected":""}>${i.l}</option>`).join("");L(c?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${S(a.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="r-cat">${l}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="r-val" type="number" step="0.01" value="${a.valor||""}"></div>
    </div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Dia *</label>
        <input class="fi" type="number" min="1" max="31" id="r-dia" value="${a.dia_mes||1}"></div>
      <div class="fg"><label class="fl">Tipo de dia</label>
        <select class="fsl" id="r-dia-util">
          <option value="false"${a.dia_util?"":" selected"}>Dia do calendário</option>
          <option value="true"${a.dia_util?" selected":""}>Dia útil (seg-sex)</option>
        </select></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A despesa é lançada automaticamente toda vez que você abre essa tela e chega o dia configurado.<br>Ex: "Dia 30" cai no último dia em fevereiro. "5º dia útil" pula sáb/dom.</div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",_),document.getElementById("m-save").addEventListener("click",async()=>{const i={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!i.descricao)return u("Descrição obrigatória","err");if(!i.valor)return u("Valor obrigatório","err");if(i.dia_mes<1||i.dia_mes>31)return u("Dia entre 1 e 31","err");const{error:t}=a.id?await g.from("despesas_recorrentes").update(i).eq("id",a.id):await g.from("despesas_recorrentes").insert({...i,ativa:!0});if(t)return u("Erro: "+t.message,"err");_(),u("Salvo"),x()})}function Y(a={}){const c=!a.id,i='<option value="">— sem cliente vinculado —</option>'+N.filter(t=>["proposta","ativo","em_pausa","fechado"].includes(t.status)||t.id===a.cliente_id).map(t=>`<option value="${t.id}"${a.cliente_id===t.id?" selected":""}>${S(t.empresa||t.nome)}</option>`).join("");L(c?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${S(a.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rr-cli">${i}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="rr-val" type="number" step="0.01" value="${a.valor||""}"></div>
    </div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Dia *</label>
        <input class="fi" type="number" min="1" max="31" id="rr-dia" value="${a.dia_mes||1}"></div>
      <div class="fg"><label class="fl">Tipo de dia</label>
        <select class="fsl" id="rr-dia-util">
          <option value="false"${a.dia_util?"":" selected"}>Dia do calendário</option>
          <option value="true"${a.dia_util?" selected":""}>Dia útil (seg-sex)</option>
        </select></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A receita entra automaticamente na aba Faturamento quando chegar o dia configurado.</div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",_),document.getElementById("m-save").addEventListener("click",async()=>{const t={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!t.descricao)return u("Descrição obrigatória","err");if(!t.valor)return u("Valor obrigatório","err");if(t.dia_mes<1||t.dia_mes>31)return u("Dia entre 1 e 31","err");const{error:n}=a.id?await g.from("receitas_recorrentes").update(t).eq("id",a.id):await g.from("receitas_recorrentes").insert({...t,ativa:!0});if(n)return u("Erro: "+n.message,"err");_(),u("Salvo"),x()})}async function Z(a,c){const l=new Date,i=l.toISOString().slice(0,10);c==="receita"?(await g.from("faturamento").insert({mes:l.getMonth()+1,ano:l.getFullYear(),valor:a.valor,descricao:a.descricao,cliente_id:a.cliente_id||null,recorrente_id:a.id}),await g.from("receitas_recorrentes").update({ultima_geracao:i}).eq("id",a.id)):(await g.from("despesas").insert({descricao:a.descricao,categoria:a.categoria,valor:a.valor,data:i,recorrente_id:a.id}),await g.from("despesas_recorrentes").update({ultima_geracao:i}).eq("id",a.id))}function R(a){return String(a??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c])}function S(a){return R(a)}export{x as render};
