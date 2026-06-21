import{d as y,s as A,o as L,e as I,f as w,t as b,c as o,h as N,b as U,M as T}from"./index-GkEKvS_c.js";const F=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],P=Object.fromEntries(F.map(e=>[e.k,e]));let x=[],D=[],R=[],S=[],C=[],E="receita",q=!1;async function j(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',J(),await K(),z(),V()}function J(){q||(q=!0,document.getElementById("content").addEventListener("click",async e=>{if(E!=="recorrentes")return;const l=e.target.closest(".rec-edit"),d=e.target.closest(".rec-del"),i=e.target.closest(".rec-run"),a=e.target.closest(".desp-rec-active"),m=l||d||i||a;if(!m)return;const f=m.dataset.tipo,s=f==="receita"?S:R,v=f==="receita"?"receitas_recorrentes":"despesas_recorrentes",n=s.find(u=>u.id===m.dataset.rid);if(n)try{if(l)f==="receita"?G(n):W(n);else if(d){if(!confirm(`Excluir "${n.descricao}"? (Lançamentos já gerados continuam)`))return;const{error:u}=await y.from(v).delete().eq("id",n.id);if(u)throw u;b("Excluída"),j()}else if(i)await se(n,f),b(f==="receita"?"Receita lançada":"Despesa lançada"),j();else if(a){n.ativa=a.checked;const{error:u}=await y.from(v).update({ativa:n.ativa,atualizado_em:new Date().toISOString()}).eq("id",n.id);if(u)throw u;j()}}catch(u){console.error("[recorrentes]",u),b("Erro: "+(u.message||u),"err")}}))}async function K(){const[e,l,d,i,a]=await Promise.all([y.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),A("despesas",{order:{column:"data",ascending:!1}}),A("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),A("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),A("clientes",{columns:"id,nome,empresa,status"})]);x=e.data||[],D=l.data||[],R=d.data||[],S=i.data||[],C=a.data||[]}function z(){const e=(m,f)=>`<button class="pj-tab${E===m?" on":""}" data-tab="${m}">${f}</button>`;let l="";E==="receita"&&(l='<button class="btn bp" id="btn-add">+ Receita</button>'),E==="despesas"&&(l='<button class="btn bp" id="btn-add">+ Despesa</button>'),E==="recorrentes"&&(l=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${l}
  `,document.querySelectorAll(".pj-tab").forEach(m=>m.addEventListener("click",()=>{E=m.dataset.tab,z(),V()}));const d=document.getElementById("btn-add");d&&(E==="receita"&&d.addEventListener("click",()=>O()),E==="despesas"&&d.addEventListener("click",()=>Y()));const i=document.getElementById("btn-add-rec-receita"),a=document.getElementById("btn-add-rec-despesa");i&&i.addEventListener("click",()=>G()),a&&a.addEventListener("click",()=>W())}function V(){return E==="despesas"?X():E==="recorrentes"?Z():E==="resumo"?ae():Q()}function Q(){const e=document.getElementById("content"),l=new Date,d=l.getFullYear(),i=l.getMonth()+1,a=x.filter(c=>c.ano===d).reduce((c,r)=>c+Number(r.valor),0),m=[...new Set(x.filter(c=>c.ano===d).map(c=>c.mes))],f=m.length?a/m.length:0,s=x.reduce((c,r)=>!c||Number(r.valor)>Number(c.valor)?r:c,null),v=[];for(let c=11;c>=0;c--){const r=new Date(d,i-1-c,1),p=r.getMonth()+1,_=r.getFullYear(),k=x.filter(t=>t.mes===p&&t.ano===_).reduce((t,g)=>t+Number(g.valor),0);v.push({label:T[p-1],val:k,cur:c===0})}const n=Math.max(...v.map(c=>c.val),1),u=v.map(c=>{const r=Math.round(c.val/n*100);return`<div class="bg2">
      <div class="bv">${c.val>0?"R$"+U(c.val):""}</div>
      <div class="bar${c.cur?" cur":""}" style="height:${r}%"></div>
      <div class="bl">${c.label}</div>
    </div>`}).join(""),$=x.length?x.map(c=>`
        <tr>
          <td>${I[c.mes-1]}</td>
          <td class="tm">${c.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${o(c.valor)}</td>
          <td class="tm">${B(c.descricao||"—")}${c.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${N(c.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${c.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${c.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${d}</div><div class="sv ac">${o(a)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${o(f)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${s?o(s.valor):"—"}</div>
        <div class="ss">${s?I[s.mes-1]+" "+s.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${u}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${$}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(c=>c.addEventListener("click",()=>{const r=x.find(p=>p.id===c.dataset.id);r&&O(r)})),e.querySelectorAll(".del-fat").forEach(c=>c.addEventListener("click",()=>te(c.dataset.id)))}function X(){const e=document.getElementById("content"),l=new Date,d=l.getFullYear(),i=l.getMonth()+1,a=`${d}-${String(i).padStart(2,"0")}`,m=D.filter(r=>(r.data||"").startsWith(a)),f=D.filter(r=>(r.data||"").startsWith(String(d))),s=m.reduce((r,p)=>r+Number(p.valor),0),v=f.reduce((r,p)=>r+Number(p.valor),0),n=R.filter(r=>r.ativa).reduce((r,p)=>r+Number(p.valor),0),u={};for(const r of f)u[r.categoria||"outro"]=(u[r.categoria||"outro"]||0)+Number(r.valor);const $=Object.entries(u).sort(([,r],[,p])=>p-r).map(([r,p])=>{const _=P[r]||P.outro,k=v>0?Math.round(p/v*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${_.cor}"></span>
          <span class="desp-cat-name">${_.l}</span>
          <span class="desp-cat-pct">${k}%</span>
        </div>
        <div class="desp-cat-val">${o(p)}</div>
      </div>`}).join("")||`<div class="empty">Sem despesas em ${d}.</div>`,c=D.length?D.map(r=>{const p=P[r.categoria]||P.outro;return`<tr>
          <td class="tm">${N(r.data)}</td>
          <td class="tn">${B(r.descricao)}${r.recorrente_id?'<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>':""}</td>
          <td><span class="desp-cat-pill" style="background:${p.cor}22;color:${p.cor}">${p.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${o(r.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${r.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${r.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${I[i-1]}</div><div class="sv" style="color:var(--danger)">${o(s)}</div></div>
      <div class="sc"><div class="sl">Despesas ${d}</div><div class="sv">${o(v)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${o(n)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${d}</div>
      <div class="desp-cat-grid">${$}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${c}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(r=>r.addEventListener("click",()=>{const p=D.find(_=>_.id===r.dataset.id);p&&Y(p)})),e.querySelectorAll(".del-desp").forEach(r=>r.addEventListener("click",()=>H(r.dataset.id)))}function Z(){const e=document.getElementById("content"),l=S.filter(s=>s.ativa).reduce((s,v)=>s+Number(v.valor),0),d=R.filter(s=>s.ativa).reduce((s,v)=>s+Number(v.valor),0),i=l-d,a=(s,v)=>{const n=v==="receita"?"var(--accent)":"var(--danger)",u=v==="despesa"?P[s.categoria]||P.outro:null,$=v==="receita"&&s.cliente_id?C.find(r=>r.id===s.cliente_id):null,c=s.dia_util?`${s.dia_mes}º dia útil`:`Dia ${s.dia_mes}`;return`<div class="desp-rec-card ${s.ativa?"":"paused"}" data-rid="${s.id}" data-tipo="${v}">
      <div class="desp-rec-head">
        ${u?`<span class="desp-cat-pill" style="background:${u.cor}22;color:${u.cor}">${u.l}</span>`:$?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${B($.empresa||$.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${s.id}" data-tipo="${v}" ${s.ativa?"checked":""}>
          <span>${s.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${B(s.descricao)}</div>
      <div class="desp-rec-val" style="color:${n}">${o(s.valor)}</div>
      <div class="desp-rec-meta">${c} de cada mês${s.ultima_geracao?" · Última: "+N(s.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${s.id}" data-tipo="${v}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${s.id}" data-tipo="${v}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${s.id}" data-tipo="${v}">Excluir</button>
      </div>
    </div>`},m=S.map(s=>a(s,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',f=R.map(s=>a(s,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${o(l)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${o(d)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${i>=0?"var(--ok)":"var(--danger)"}">${o(i)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${o(i*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${m}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${f}</div></div>
    </div>`}function ee(e,l){const d=new Date,i=l<d.getFullYear()||l===d.getFullYear()&&e<d.getMonth()+1,a=`${l}-${String(e).padStart(2,"0")}`,m=x.filter(n=>n.mes===e&&n.ano===l).reduce((n,u)=>n+Number(u.valor),0),f=D.filter(n=>(n.data||"").startsWith(a)).reduce((n,u)=>n+Number(u.valor),0);let s=0,v=0;if(!i){for(const n of S){if(!n.ativa)continue;x.some($=>$.recorrente_id===n.id&&$.mes===e&&$.ano===l)||(s+=Number(n.valor))}for(const n of R){if(!n.ativa)continue;D.some($=>$.recorrente_id===n.id&&($.data||"").startsWith(a))||(v+=Number(n.valor))}}return{recReal:m,recPend:s,recProj:m+s,desReal:f,desPend:v,desProj:f+v,lucroProj:m+s-(f+v),isPast:i}}function ae(){const e=document.getElementById("content"),l=new Date,d=l.getFullYear(),i=l.getMonth()+1,a=[];for(let t=1;t<=12;t++){const g=ee(t,d);a.push({label:T[t-1],mes:t,...g,cur:t===i})}const m=Math.max(...a.flatMap(t=>[t.recProj,t.desProj]),1),f=i,s=f<=11?a[f]:null,v=a.reduce((t,g)=>t+g.recReal,0),n=a.reduce((t,g)=>t+g.desReal,0),u=v-n,$=a.reduce((t,g)=>t+g.recProj,0),c=a.reduce((t,g)=>t+g.desProj,0),r=$-c,p=a.slice().reverse().map(t=>{const g=t.recPend>0?`<b>${o(t.recProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${o(t.recReal)} recebido · ${o(t.recPend)} a receber</div>`:o(t.recReal),h=t.desPend>0?`<b>${o(t.desProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${o(t.desReal)} pago · ${o(t.desPend)} a pagar</div>`:o(t.desReal);return`<tr>
      <td>${t.label}${t.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}${t.isPast?"":' <span style="font-size:10px;color:var(--text-3)">prev</span>'}</td>
      <td style="color:var(--accent)">${g}</td>
      <td style="color:var(--danger)">${h}</td>
      <td style="font-weight:700;color:${t.lucroProj>=0?"var(--ok)":"var(--danger)"}">${o(t.lucroProj)}</td>
    </tr>`}).join(""),_=a.map(t=>{const g=Math.round(t.recProj/m*100),h=Math.round(t.desProj/m*100);return`<div class="resumo-bg${t.cur?" cur":""}">
      <div class="resumo-bars">
        <div class="resumo-bar rec${t.isPast?"":" proj"}" style="height:${g}%" title="Receita ${o(t.recProj)}"></div>
        <div class="resumo-bar des${t.isPast?"":" proj"}" style="height:${h}%" title="Despesa ${o(t.desProj)}"></div>
      </div>
      <div class="bl">${t.label}</div>
    </div>`}).join(""),k=[];for(let t=0;t<6;t++){const g=i-1+t;if(g>=12)break;const h=a[g];k.push(`
      <div class="sc" style="${h.cur?"border-color:rgba(197,248,42,.3)":""}">
        <div class="sl">${I[h.mes-1]} ${h.cur?"· atual":""}</div>
        <div class="sv" style="color:${h.lucroProj>=0?"var(--ok)":"var(--danger)"}">${o(h.lucroProj)}</div>
        <div class="ss">${o(h.recProj)} − ${o(h.desProj)}</div>
      </div>`)}e.innerHTML=`
    <!-- Destaque: próximo mês (o que o usuário quer planejar) -->
    ${s?`
      <div class="cw" style="margin-bottom:18px;border:1px solid rgba(193,255,42,.2)">
        <div class="ct" style="color:var(--accent)">Projeção — ${I[s.mes-1]} ${d}</div>
        <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:0;margin-top:12px">
          <div class="sc" style="background:var(--bg-alt)">
            <div class="sl">Receita prevista</div>
            <div class="sv" style="color:var(--accent)">${o(s.recProj)}</div>
          </div>
          <div class="sc" style="background:var(--bg-alt)">
            <div class="sl">Despesa prevista</div>
            <div class="sv" style="color:var(--danger)">${o(s.desProj)}</div>
          </div>
          <div class="sc" style="background:var(--bg-alt)">
            <div class="sl">Lucro projetado</div>
            <div class="sv" style="color:${s.lucroProj>=0?"var(--ok)":"var(--danger)"}">${o(s.lucroProj)}</div>
          </div>
          <div class="sc" style="background:var(--bg-alt)">
            <div class="sl">Margem</div>
            <div class="sv">${s.recProj>0?Math.round(s.lucroProj/s.recProj*100)+"%":"—"}</div>
          </div>
        </div>
      </div>`:""}

    <!-- Fluxo dos próximos 6 meses -->
    <div class="ct" style="margin-bottom:8px">Próximos meses — lucro projetado</div>
    <div class="sg" style="grid-template-columns:repeat(${k.length},1fr);margin-bottom:22px">${k.join("")}</div>

    <!-- Ano corrente -->
    <div class="sg" style="grid-template-columns:repeat(3,1fr)">
      <div class="sc"><div class="sl">Realizado em ${d}</div>
        <div class="sv" style="color:${u>=0?"var(--ok)":"var(--danger)"}">${o(u)}</div>
        <div class="ss">${o(v)} − ${o(n)}</div>
      </div>
      <div class="sc"><div class="sl">Projeção ${d} (com recorrentes)</div>
        <div class="sv" style="color:${r>=0?"var(--ok)":"var(--danger)"}">${o(r)}</div>
        <div class="ss">${o($)} − ${o(c)}</div>
      </div>
      <div class="sc"><div class="sl">Recorrentes ativas</div>
        <div class="sv">${o(S.filter(t=>t.ativa).reduce((t,g)=>t+Number(g.valor),0)-R.filter(t=>t.ativa).reduce((t,g)=>t+Number(g.valor),0))}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div>
      </div>
    </div>

    <div class="cw">
      <div class="ct">Receita vs Despesa — ${d} (projetado)</div>
      <div class="bc">${_}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center;flex-wrap:wrap">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
        <span style="opacity:.6">Barras com listras = projeção (ainda não realizada)</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal — ${d}</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro proj.</th></tr></thead>
        <tbody>${p}</tbody>
      </table>
    </div>`}function O(e={}){const l=!e.id,d=new Date;L(l?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${I.map((i,a)=>`<option value="${a+1}"${(e.mes||d.getMonth()+1)===a+1?" selected":""}>${i}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||d.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${M(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",w),document.getElementById("m-save").addEventListener("click",async()=>{const i={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!i.valor)return b("Valor obrigatório","err");const{error:a}=e.id?await y.from("faturamento").update(i).eq("id",e.id):await y.from("faturamento").insert(i);if(a)return b("Erro: "+a.message,"err");w(),b("Salvo"),j()})}async function te(e){confirm("Remover?")&&(await y.from("faturamento").delete().eq("id",e),b("Removido"),j())}function Y(e={}){const l=!e.id,d=new Date().toISOString().slice(0,10),i=F.map(a=>`<option value="${a.k}"${(e.categoria||"outro")===a.k?" selected":""}>${a.l}</option>`).join("");L(l?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${M(e.descricao||"")}" placeholder="Ex: Fatura Nubank, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${i}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data *</label>
      <input class="fi" type="date" id="d-data" value="${e.data||d}"></div>
  `,`
    ${l?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",w),l||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir?")&&(await H(e.id),w())}),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("d-desc").value.trim(),categoria:document.getElementById("d-cat").value,valor:parseFloat(document.getElementById("d-val").value)||0,data:document.getElementById("d-data").value};if(!a.descricao)return b("Descrição obrigatória","err");if(!a.valor)return b("Valor obrigatório","err");if(!a.data)return b("Data obrigatória","err");const{error:m}=e.id?await y.from("despesas").update(a).eq("id",e.id):await y.from("despesas").insert(a);if(m)return b("Erro: "+m.message,"err");w(),b("Salvo"),j()})}async function H(e){await y.from("despesas").delete().eq("id",e),b("Removida"),j()}function W(e={}){const l=!e.id,d=F.map(i=>`<option value="${i.k}"${(e.categoria||"outro")===i.k?" selected":""}>${i.l}</option>`).join("");L(l?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${M(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="r-cat">${d}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="r-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Dia *</label>
        <input class="fi" type="number" min="1" max="31" id="r-dia" value="${e.dia_mes||1}"></div>
      <div class="fg"><label class="fl">Tipo de dia</label>
        <select class="fsl" id="r-dia-util">
          <option value="false"${e.dia_util?"":" selected"}>Dia do calendário</option>
          <option value="true"${e.dia_util?" selected":""}>Dia útil (seg-sex)</option>
        </select></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A despesa é lançada automaticamente toda vez que você abre essa tela e chega o dia configurado.<br>Ex: "Dia 30" cai no último dia em fevereiro. "5º dia útil" pula sáb/dom.</div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",w),document.getElementById("m-save").addEventListener("click",async()=>{const i={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!i.descricao)return b("Descrição obrigatória","err");if(!i.valor)return b("Valor obrigatório","err");if(i.dia_mes<1||i.dia_mes>31)return b("Dia entre 1 e 31","err");const{error:a}=e.id?await y.from("despesas_recorrentes").update(i).eq("id",e.id):await y.from("despesas_recorrentes").insert({...i,ativa:!0});if(a)return b("Erro: "+a.message,"err");w(),b("Salvo"),j()})}function G(e={}){const l=!e.id,i='<option value="">— sem cliente vinculado —</option>'+C.filter(a=>["proposta","ativo","em_pausa","fechado"].includes(a.status)||a.id===e.cliente_id).map(a=>`<option value="${a.id}"${e.cliente_id===a.id?" selected":""}>${M(a.empresa||a.nome)}</option>`).join("");L(l?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${M(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rr-cli">${i}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="rr-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Dia *</label>
        <input class="fi" type="number" min="1" max="31" id="rr-dia" value="${e.dia_mes||1}"></div>
      <div class="fg"><label class="fl">Tipo de dia</label>
        <select class="fsl" id="rr-dia-util">
          <option value="false"${e.dia_util?"":" selected"}>Dia do calendário</option>
          <option value="true"${e.dia_util?" selected":""}>Dia útil (seg-sex)</option>
        </select></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A receita entra automaticamente na aba Faturamento quando chegar o dia configurado.</div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",w),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!a.descricao)return b("Descrição obrigatória","err");if(!a.valor)return b("Valor obrigatório","err");if(a.dia_mes<1||a.dia_mes>31)return b("Dia entre 1 e 31","err");const{error:m}=e.id?await y.from("receitas_recorrentes").update(a).eq("id",e.id):await y.from("receitas_recorrentes").insert({...a,ativa:!0});if(m)return b("Erro: "+m.message,"err");w(),b("Salvo"),j()})}async function se(e,l){const d=new Date,i=d.toISOString().slice(0,10);l==="receita"?(await y.from("faturamento").insert({mes:d.getMonth()+1,ano:d.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await y.from("receitas_recorrentes").update({ultima_geracao:i}).eq("id",e.id)):(await y.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:i,recorrente_id:e.id}),await y.from("despesas_recorrentes").update({ultima_geracao:i}).eq("id",e.id))}function B(e){return String(e??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l])}function M(e){return B(e)}export{j as render};
