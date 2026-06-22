import{d as h,s as F,o as C,e as R,f as P,t as f,c as n,h as z,b as oe,M as K}from"./index-BSEnhVp6.js";const V=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],M=Object.fromEntries(V.map(e=>[e.k,e]));let x=[],D=[],I=[],B=[],O=[],E="receita",W=!1,G=new Date().getMonth()+1,U=new Date().getFullYear();async function _(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',le(),await ne(),Q(),X()}function le(){W||(W=!0,document.getElementById("content").addEventListener("click",async e=>{if(E!=="recorrentes")return;const l=e.target.closest(".rec-edit"),r=e.target.closest(".rec-del"),s=e.target.closest(".rec-run"),a=e.target.closest(".desp-rec-active"),u=l||r||s||a;if(!u)return;const b=u.dataset.tipo,c=b==="receita"?B:I,d=b==="receita"?"receitas_recorrentes":"despesas_recorrentes",v=c.find(m=>m.id===u.dataset.rid);if(v)try{if(l)b==="receita"?re(v):se(v);else if(r){if(!confirm(`Excluir "${v.descricao}"? (Lançamentos já gerados continuam)`))return;const{error:m}=await h.from(d).delete().eq("id",v.id);if(m)throw m;f("Excluída"),_()}else if(s)await be(v,b),f(b==="receita"?"Receita lançada":"Despesa lançada"),_();else if(a){v.ativa=a.checked;const{error:m}=await h.from(d).update({ativa:v.ativa,atualizado_em:new Date().toISOString()}).eq("id",v.id);if(m)throw m;_()}}catch(m){console.error("[recorrentes]",m),f("Erro: "+(m.message||m),"err")}}))}async function ne(){const[e,l,r,s,a]=await Promise.all([h.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),F("despesas",{order:{column:"data",ascending:!1}}),F("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),F("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),F("clientes",{columns:"id,nome,empresa,status"})]);x=e.data||[],D=l.data||[],I=r.data||[],B=s.data||[],O=a.data||[]}function Q(){const e=(u,b)=>`<button class="pj-tab${E===u?" on":""}" data-tab="${u}">${b}</button>`;let l="";E==="receita"&&(l='<button class="btn bp" id="btn-add">+ Receita</button>'),E==="despesas"&&(l='<button class="btn bp" id="btn-add">+ Despesa</button>'),E==="recorrentes"&&(l=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${l}
  `,document.querySelectorAll(".pj-tab").forEach(u=>u.addEventListener("click",()=>{E=u.dataset.tab,Q(),X()}));const r=document.getElementById("btn-add");r&&(E==="receita"&&r.addEventListener("click",()=>ee()),E==="despesas"&&r.addEventListener("click",()=>te()));const s=document.getElementById("btn-add-rec-receita"),a=document.getElementById("btn-add-rec-despesa");s&&s.addEventListener("click",()=>re()),a&&a.addEventListener("click",()=>se())}function X(){return E==="despesas"?ue():E==="recorrentes"?me():E==="resumo"?Z():ve()}function ve(){const e=document.getElementById("content"),l=new Date,r=l.getFullYear(),s=l.getMonth()+1,a=x.filter(o=>o.ano===r).reduce((o,i)=>o+Number(i.valor),0),u=[...new Set(x.filter(o=>o.ano===r).map(o=>o.mes))],b=u.length?a/u.length:0,c=x.reduce((o,i)=>!o||Number(i.valor)>Number(o.valor)?i:o,null),d=[];for(let o=11;o>=0;o--){const i=new Date(r,s-1-o,1),g=i.getMonth()+1,k=i.getFullYear(),S=x.filter(j=>j.mes===g&&j.ano===k).reduce((j,q)=>j+Number(q.valor),0);d.push({label:K[g-1],val:S,cur:o===0})}const v=Math.max(...d.map(o=>o.val),1),m=d.map(o=>{const i=Math.round(o.val/v*100);return`<div class="bg2">
      <div class="bv">${o.val>0?"R$"+oe(o.val):""}</div>
      <div class="bar${o.cur?" cur":""}" style="height:${i}%"></div>
      <div class="bl">${o.label}</div>
    </div>`}).join(""),$=x.length?x.map(o=>`
        <tr>
          <td>${R[o.mes-1]}</td>
          <td class="tm">${o.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${n(o.valor)}</td>
          <td class="tm">${A(o.descricao||"—")}${o.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${z(o.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${o.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${o.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${r}</div><div class="sv ac">${n(a)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${n(b)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${c?n(c.valor):"—"}</div>
        <div class="ss">${c?R[c.mes-1]+" "+c.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${m}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${$}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(o=>o.addEventListener("click",()=>{const i=x.find(g=>g.id===o.dataset.id);i&&ee(i)})),e.querySelectorAll(".del-fat").forEach(o=>o.addEventListener("click",()=>pe(o.dataset.id)))}function ue(){const e=document.getElementById("content"),l=new Date,r=l.getFullYear(),s=l.getMonth()+1,a=`${r}-${String(s).padStart(2,"0")}`,u=D.filter(i=>(i.data||"").startsWith(a)),b=D.filter(i=>(i.data||"").startsWith(String(r))),c=u.reduce((i,g)=>i+Number(g.valor),0),d=b.reduce((i,g)=>i+Number(g.valor),0),v=I.filter(i=>i.ativa).reduce((i,g)=>i+Number(g.valor),0),m={};for(const i of b)m[i.categoria||"outro"]=(m[i.categoria||"outro"]||0)+Number(i.valor);const $=Object.entries(m).sort(([,i],[,g])=>g-i).map(([i,g])=>{const k=M[i]||M.outro,S=d>0?Math.round(g/d*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${k.cor}"></span>
          <span class="desp-cat-name">${k.l}</span>
          <span class="desp-cat-pct">${S}%</span>
        </div>
        <div class="desp-cat-val">${n(g)}</div>
      </div>`}).join("")||`<div class="empty">Sem despesas em ${r}.</div>`,o=D.length?D.map(i=>{const g=M[i.categoria]||M.outro;return`<tr>
          <td class="tm">${z(i.data)}</td>
          <td class="tn">${A(i.descricao)}${i.recorrente_id?'<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>':""}</td>
          <td><span class="desp-cat-pill" style="background:${g.cor}22;color:${g.cor}">${g.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${n(i.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${i.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${i.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${R[s-1]}</div><div class="sv" style="color:var(--danger)">${n(c)}</div></div>
      <div class="sc"><div class="sl">Despesas ${r}</div><div class="sv">${n(d)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${n(v)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${r}</div>
      <div class="desp-cat-grid">${$}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${o}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(i=>i.addEventListener("click",()=>{const g=D.find(k=>k.id===i.dataset.id);g&&te(g)})),e.querySelectorAll(".del-desp").forEach(i=>i.addEventListener("click",()=>ae(i.dataset.id)))}function me(){const e=document.getElementById("content"),l=B.filter(c=>c.ativa).reduce((c,d)=>c+Number(d.valor),0),r=I.filter(c=>c.ativa).reduce((c,d)=>c+Number(d.valor),0),s=l-r,a=(c,d)=>{const v=d==="receita"?"var(--accent)":"var(--danger)",m=d==="despesa"?M[c.categoria]||M.outro:null,$=d==="receita"&&c.cliente_id?O.find(i=>i.id===c.cliente_id):null,o=c.dia_util?`${c.dia_mes}º dia útil`:`Dia ${c.dia_mes}`;return`<div class="desp-rec-card ${c.ativa?"":"paused"}" data-rid="${c.id}" data-tipo="${d}">
      <div class="desp-rec-head">
        ${m?`<span class="desp-cat-pill" style="background:${m.cor}22;color:${m.cor}">${m.l}</span>`:$?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${A($.empresa||$.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${c.id}" data-tipo="${d}" ${c.ativa?"checked":""}>
          <span>${c.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${A(c.descricao)}</div>
      <div class="desp-rec-val" style="color:${v}">${n(c.valor)}</div>
      <div class="desp-rec-meta">${o} de cada mês${c.ultima_geracao?" · Última: "+z(c.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${c.id}" data-tipo="${d}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${c.id}" data-tipo="${d}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${c.id}" data-tipo="${d}">Excluir</button>
      </div>
    </div>`},u=B.map(c=>a(c,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',b=I.map(c=>a(c,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${n(l)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${n(r)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${s>=0?"var(--ok)":"var(--danger)"}">${n(s)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${n(s*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${u}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${b}</div></div>
    </div>`}function T(e,l){const r=new Date,s=l<r.getFullYear()||l===r.getFullYear()&&e<r.getMonth()+1,a=`${l}-${String(e).padStart(2,"0")}`,u=x.filter(v=>v.mes===e&&v.ano===l).reduce((v,m)=>v+Number(m.valor),0),b=D.filter(v=>(v.data||"").startsWith(a)).reduce((v,m)=>v+Number(m.valor),0);let c=0,d=0;if(!s){for(const v of B){if(!v.ativa)continue;x.some($=>$.recorrente_id===v.id&&$.mes===e&&$.ano===l)||(c+=Number(v.valor))}for(const v of I){if(!v.ativa)continue;D.some($=>$.recorrente_id===v.id&&($.data||"").startsWith(a))||(d+=Number(v.valor))}}return{recReal:u,recPend:c,recProj:u+c,desReal:b,desPend:d,desProj:b+d,lucroProj:u+c-(b+d),isPast:s}}function Z(){const e=document.getElementById("content"),l=new Date,r=U,s=G,a=l.getMonth()+1,u=l.getFullYear(),b=[];for(let t=1;t<=12;t++){const p=T(t,r);b.push({label:K[t-1],mes:t,...p,cur:t===s,hoje:t===a&&r===u})}const c=Math.max(...b.flatMap(t=>[t.recProj,t.desProj]),1),d=b[s-1];s<12||s===12&&T(1,r+1);const v=b.reduce((t,p)=>t+p.recReal,0),m=b.reduce((t,p)=>t+p.desReal,0),$=v-m,o=b.reduce((t,p)=>t+p.recProj,0),i=b.reduce((t,p)=>t+p.desProj,0),g=o-i,k=b.slice().reverse().map(t=>{const p=t.recPend>0?`<b>${n(t.recProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${n(t.recReal)} recebido · ${n(t.recPend)} a receber</div>`:n(t.recReal),y=t.desPend>0?`<b>${n(t.desProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${n(t.desReal)} pago · ${n(t.desPend)} a pagar</div>`:n(t.desReal);return`<tr>
      <td>${t.label}${t.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}${t.isPast?"":' <span style="font-size:10px;color:var(--text-3)">prev</span>'}</td>
      <td style="color:var(--accent)">${p}</td>
      <td style="color:var(--danger)">${y}</td>
      <td style="font-weight:700;color:${t.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(t.lucroProj)}</td>
    </tr>`}).join(""),S=b.map(t=>{const p=Math.round(t.recProj/c*100),y=Math.round(t.desProj/c*100);return`<div class="resumo-bg${t.cur?" cur":""}">
      <div class="resumo-bars">
        <div class="resumo-bar rec${t.isPast?"":" proj"}" style="height:${p}%" title="Receita ${n(t.recProj)}"></div>
        <div class="resumo-bar des${t.isPast?"":" proj"}" style="height:${y}%" title="Despesa ${n(t.desProj)}"></div>
      </div>
      <div class="bl">${t.label}</div>
    </div>`}).join(""),j=[];for(let t=0;t<6;t++){const p=s-1+t;if(p<12){const y=b[p];j.push(J(y))}else{const y=Math.floor(p/12),w=p%12+1,Y=r+y,ce=T(w,Y),de={mes:w,...ce,cur:w===a&&Y===u};j.push(J(de))}}const q=s===a&&r===u,ie=`
    <div class="resumo-picker">
      <button class="btn bg bsm" id="rsm-prev" title="Mês anterior">◀</button>
      <select class="fsl" id="rsm-mes">${R.map((t,p)=>`<option value="${p+1}"${p+1===s?" selected":""}>${t}</option>`).join("")}</select>
      <input class="fi" type="number" id="rsm-ano" value="${r}" style="width:90px;text-align:center;padding:6px 9px">
      <button class="btn bg bsm" id="rsm-next" title="Próximo mês">▶</button>
      ${q?"":'<button class="btn bg bsm" id="rsm-hoje">Voltar pra hoje</button>'}
    </div>`;e.innerHTML=`
    ${ie}

    <!-- Destaque: mês em foco (o selecionado no picker) -->
    <div class="cw" style="margin-bottom:18px;border:1px solid rgba(193,255,42,.2)">
      <div class="ct" style="color:var(--accent)">${d.isPast?"Realizado":"Projeção"} — ${R[d.mes-1]} ${r}${d.hoje?" · atual":""}</div>
      <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:0;margin-top:12px">
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Receita ${d.isPast?"realizada":"prevista"}</div>
          <div class="sv" style="color:var(--accent)">${n(d.recProj)}</div>
          ${d.recPend>0?`<div class="ss">${n(d.recReal)} recebido · ${n(d.recPend)} a receber</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Despesa ${d.isPast?"paga":"prevista"}</div>
          <div class="sv" style="color:var(--danger)">${n(d.desProj)}</div>
          ${d.desPend>0?`<div class="ss">${n(d.desReal)} pago · ${n(d.desPend)} a pagar</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Lucro ${d.isPast?"realizado":"projetado"}</div>
          <div class="sv" style="color:${d.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(d.lucroProj)}</div>
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Margem</div>
          <div class="sv">${d.recProj>0?Math.round(d.lucroProj/d.recProj*100)+"%":"—"}</div>
        </div>
      </div>
    </div>

    <!-- Fluxo dos próximos 6 meses a partir do selecionado -->
    <div class="ct" style="margin-bottom:8px">Próximos meses — lucro projetado</div>
    <div class="sg" style="grid-template-columns:repeat(${j.length},1fr);margin-bottom:22px">${j.join("")}</div>

    <!-- Ano corrente -->
    <div class="sg" style="grid-template-columns:repeat(3,1fr)">
      <div class="sc"><div class="sl">Realizado em ${r}</div>
        <div class="sv" style="color:${$>=0?"var(--ok)":"var(--danger)"}">${n($)}</div>
        <div class="ss">${n(v)} − ${n(m)}</div>
      </div>
      <div class="sc"><div class="sl">Projeção ${r} (com recorrentes)</div>
        <div class="sv" style="color:${g>=0?"var(--ok)":"var(--danger)"}">${n(g)}</div>
        <div class="ss">${n(o)} − ${n(i)}</div>
      </div>
      <div class="sc"><div class="sl">Recorrentes ativas</div>
        <div class="sv">${n(B.filter(t=>t.ativa).reduce((t,p)=>t+Number(p.valor),0)-I.filter(t=>t.ativa).reduce((t,p)=>t+Number(p.valor),0))}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div>
      </div>
    </div>

    <div class="cw">
      <div class="ct">Receita vs Despesa — ${r} (projetado)</div>
      <div class="bc">${S}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center;flex-wrap:wrap">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
        <span style="opacity:.6">Barras com listras = projeção (ainda não realizada)</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal — ${r}</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro proj.</th></tr></thead>
        <tbody>${k}</tbody>
      </table>
    </div>`;const L=(t,p)=>{let y=t,w=p;y<1&&(y=12,w--),y>12&&(y=1,w++),!(w<2020||w>2099)&&(G=y,U=w,Z())};document.getElementById("rsm-prev").addEventListener("click",()=>L(s-1,r)),document.getElementById("rsm-next").addEventListener("click",()=>L(s+1,r)),document.getElementById("rsm-mes").addEventListener("change",t=>L(parseInt(t.target.value),r)),document.getElementById("rsm-ano").addEventListener("change",t=>{const p=parseInt(t.target.value);p>=2020&&p<=2099&&L(s,p)});const H=document.getElementById("rsm-hoje");H&&H.addEventListener("click",()=>L(a,u))}function J(e,l){return`<div class="sc" style="${e.cur?"border-color:rgba(197,248,42,.3)":""}">
    <div class="sl">${R[e.mes-1]}${e.cur?" · atual":""}</div>
    <div class="sv" style="color:${e.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(e.lucroProj)}</div>
    <div class="ss">${n(e.recProj)} − ${n(e.desProj)}</div>
  </div>`}function ee(e={}){const l=!e.id,r=new Date;C(l?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${R.map((s,a)=>`<option value="${a+1}"${(e.mes||r.getMonth()+1)===a+1?" selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||r.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${N(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",P),document.getElementById("m-save").addEventListener("click",async()=>{const s={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!s.valor)return f("Valor obrigatório","err");const{error:a}=e.id?await h.from("faturamento").update(s).eq("id",e.id):await h.from("faturamento").insert(s);if(a)return f("Erro: "+a.message,"err");P(),f("Salvo"),_()})}async function pe(e){confirm("Remover?")&&(await h.from("faturamento").delete().eq("id",e),f("Removido"),_())}function te(e={}){const l=!e.id,r=new Date().toISOString().slice(0,10),s=V.map(a=>`<option value="${a.k}"${(e.categoria||"outro")===a.k?" selected":""}>${a.l}</option>`).join("");C(l?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${N(e.descricao||"")}" placeholder="Ex: Fatura Nubank, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${s}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data *</label>
      <input class="fi" type="date" id="d-data" value="${e.data||r}"></div>
  `,`
    ${l?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",P),l||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir?")&&(await ae(e.id),P())}),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("d-desc").value.trim(),categoria:document.getElementById("d-cat").value,valor:parseFloat(document.getElementById("d-val").value)||0,data:document.getElementById("d-data").value};if(!a.descricao)return f("Descrição obrigatória","err");if(!a.valor)return f("Valor obrigatório","err");if(!a.data)return f("Data obrigatória","err");const{error:u}=e.id?await h.from("despesas").update(a).eq("id",e.id):await h.from("despesas").insert(a);if(u)return f("Erro: "+u.message,"err");P(),f("Salvo"),_()})}async function ae(e){await h.from("despesas").delete().eq("id",e),f("Removida"),_()}function se(e={}){const l=!e.id,r=V.map(s=>`<option value="${s.k}"${(e.categoria||"outro")===s.k?" selected":""}>${s.l}</option>`).join("");C(l?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${N(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="r-cat">${r}</select></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",P),document.getElementById("m-save").addEventListener("click",async()=>{const s={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!s.descricao)return f("Descrição obrigatória","err");if(!s.valor)return f("Valor obrigatório","err");if(s.dia_mes<1||s.dia_mes>31)return f("Dia entre 1 e 31","err");const{error:a}=e.id?await h.from("despesas_recorrentes").update(s).eq("id",e.id):await h.from("despesas_recorrentes").insert({...s,ativa:!0});if(a)return f("Erro: "+a.message,"err");P(),f("Salvo"),_()})}function re(e={}){const l=!e.id,s='<option value="">— sem cliente vinculado —</option>'+O.filter(a=>["proposta","ativo","em_pausa","fechado"].includes(a.status)||a.id===e.cliente_id).map(a=>`<option value="${a.id}"${e.cliente_id===a.id?" selected":""}>${N(a.empresa||a.nome)}</option>`).join("");C(l?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${N(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rr-cli">${s}</select></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",P),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!a.descricao)return f("Descrição obrigatória","err");if(!a.valor)return f("Valor obrigatório","err");if(a.dia_mes<1||a.dia_mes>31)return f("Dia entre 1 e 31","err");const{error:u}=e.id?await h.from("receitas_recorrentes").update(a).eq("id",e.id):await h.from("receitas_recorrentes").insert({...a,ativa:!0});if(u)return f("Erro: "+u.message,"err");P(),f("Salvo"),_()})}async function be(e,l){const r=new Date,s=r.toISOString().slice(0,10);l==="receita"?(await h.from("faturamento").insert({mes:r.getMonth()+1,ano:r.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await h.from("receitas_recorrentes").update({ultima_geracao:s}).eq("id",e.id)):(await h.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:s,recorrente_id:e.id}),await h.from("despesas_recorrentes").update({ultima_geracao:s}).eq("id",e.id))}function A(e){return String(e??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l])}function N(e){return A(e)}export{_ as render};
