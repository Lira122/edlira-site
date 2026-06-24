import{d as y,s as q,o as z,e as S,f as j,t as f,c as n,h as O,b as ve,M as Z}from"./index-Dta-29re.js";const H=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],A=Object.fromEntries(H.map(e=>[e.k,e]));let P=[],M=[],B=[],L=[],Y=[],ee=[],W=[],I="receita",G=!1,J=new Date().getMonth()+1,K=new Date().getFullYear();async function _(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',ue(),await pe(),ae(),te()}function ue(){G||(G=!0,document.getElementById("content").addEventListener("click",async e=>{if(I!=="recorrentes")return;const l=e.target.closest(".rec-edit"),r=e.target.closest(".rec-del"),o=e.target.closest(".rec-run"),c=e.target.closest(".desp-rec-active"),v=l||r||o||c;if(!v)return;const u=v.dataset.tipo,i=u==="receita"?L:B,t=u==="receita"?"receitas_recorrentes":"despesas_recorrentes",m=i.find(g=>g.id===v.dataset.rid);if(m)try{if(l)u==="receita"?de(m):ce(m);else if(r){if(!confirm(`Excluir "${m.descricao}"? (Lançamentos já gerados continuam)`))return;const{error:g}=await y.from(t).delete().eq("id",m.id);if(g)throw g;f("Excluída"),_()}else if(o)await $e(m,u),f(u==="receita"?"Receita lançada":"Despesa lançada"),_();else if(c){m.ativa=c.checked;const{error:g}=await y.from(t).update({ativa:m.ativa,atualizado_em:new Date().toISOString()}).eq("id",m.id);if(g)throw g;_()}}catch(g){console.error("[recorrentes]",g),f("Erro: "+(g.message||g),"err")}}))}async function pe(){const[e,l,r,o,c,v,u]=await Promise.all([y.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),q("despesas",{order:{column:"data",ascending:!1}}),q("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),q("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),y.from("aportes_fin").select("data,valor").order("data",{ascending:!1}),y.from("caixinhas_mov").select("data,valor").order("data",{ascending:!1}),q("clientes",{columns:"id,nome,empresa,status"})]);P=e.data||[],M=l.data||[],B=r.data||[],L=o.data||[],Y=c&&!c.error?c.data||[]:[],ee=v&&!v.error?v.data||[]:[],W=u.data||[]}function ae(){const e=(v,u)=>`<button class="pj-tab${I===v?" on":""}" data-tab="${v}">${u}</button>`;let l="";I==="receita"&&(l='<button class="btn bp" id="btn-add">+ Receita</button>'),I==="despesas"&&(l='<button class="btn bp" id="btn-add">+ Despesa</button>'),I==="recorrentes"&&(l=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${l}
  `,document.querySelectorAll(".pj-tab").forEach(v=>v.addEventListener("click",()=>{I=v.dataset.tab,ae(),te()}));const r=document.getElementById("btn-add");r&&(I==="receita"&&r.addEventListener("click",()=>re()),I==="despesas"&&r.addEventListener("click",()=>ie()));const o=document.getElementById("btn-add-rec-receita"),c=document.getElementById("btn-add-rec-despesa");o&&o.addEventListener("click",()=>de()),c&&c.addEventListener("click",()=>ce())}function te(){return I==="despesas"?ge():I==="recorrentes"?be():I==="resumo"?se():me()}function me(){const e=document.getElementById("content"),l=new Date,r=l.getFullYear(),o=l.getMonth()+1,c=P.filter(d=>d.ano===r).reduce((d,a)=>d+Number(a.valor),0),v=[...new Set(P.filter(d=>d.ano===r).map(d=>d.mes))],u=v.length?c/v.length:0,i=P.reduce((d,a)=>!d||Number(a.valor)>Number(d.valor)?a:d,null),t=[];for(let d=11;d>=0;d--){const a=new Date(r,o-1-d,1),p=a.getMonth()+1,$=a.getFullYear(),k=P.filter(w=>w.mes===p&&w.ano===$).reduce((w,x)=>w+Number(x.valor),0);t.push({label:Z[p-1],val:k,cur:d===0})}const m=Math.max(...t.map(d=>d.val),1),g=t.map(d=>{const a=Math.round(d.val/m*100);return`<div class="bg2">
      <div class="bv">${d.val>0?"R$"+ve(d.val):""}</div>
      <div class="bar${d.cur?" cur":""}" style="height:${a}%"></div>
      <div class="bl">${d.label}</div>
    </div>`}).join(""),h=P.length?P.map(d=>`
        <tr>
          <td>${S[d.mes-1]}</td>
          <td class="tm">${d.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${n(d.valor)}</td>
          <td class="tm">${N(d.descricao||"—")}${d.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${O(d.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${d.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${d.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${r}</div><div class="sv ac">${n(c)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${n(u)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${i?n(i.valor):"—"}</div>
        <div class="ss">${i?S[i.mes-1]+" "+i.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${g}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${h}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(d=>d.addEventListener("click",()=>{const a=P.find(p=>p.id===d.dataset.id);a&&re(a)})),e.querySelectorAll(".del-fat").forEach(d=>d.addEventListener("click",()=>fe(d.dataset.id)))}function ge(){const e=document.getElementById("content"),l=new Date,r=l.getFullYear(),o=l.getMonth()+1,c=`${r}-${String(o).padStart(2,"0")}`,v=M.filter(a=>(a.data||"").startsWith(c)),u=M.filter(a=>(a.data||"").startsWith(String(r))),i=v.reduce((a,p)=>a+Number(p.valor),0),t=u.reduce((a,p)=>a+Number(p.valor),0),m=B.filter(a=>a.ativa).reduce((a,p)=>a+Number(p.valor),0),g={};for(const a of u)g[a.categoria||"outro"]=(g[a.categoria||"outro"]||0)+Number(a.valor);const h=Object.entries(g).sort(([,a],[,p])=>p-a).map(([a,p])=>{const $=A[a]||A.outro,k=t>0?Math.round(p/t*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${$.cor}"></span>
          <span class="desp-cat-name">${$.l}</span>
          <span class="desp-cat-pct">${k}%</span>
        </div>
        <div class="desp-cat-val">${n(p)}</div>
      </div>`}).join("")||`<div class="empty">Sem despesas em ${r}.</div>`,d=M.length?M.map(a=>{const p=A[a.categoria]||A.outro,$=[];return a.recorrente_id&&$.push('<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>'),a.parcelamento_id&&$.push(`<span class="desp-parc-tag" title="Parcelado">${a.parcela_num}/${a.parcelas_total}</span>`),`<tr>
          <td class="tm">${O(a.data)}</td>
          <td class="tn">${N(a.descricao)}${$.join("")}</td>
          <td><span class="desp-cat-pill" style="background:${p.cor}22;color:${p.cor}">${p.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${n(a.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${a.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${a.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${S[o-1]}</div><div class="sv" style="color:var(--danger)">${n(i)}</div></div>
      <div class="sc"><div class="sl">Despesas ${r}</div><div class="sv">${n(t)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${n(m)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${r}</div>
      <div class="desp-cat-grid">${h}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${d}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(a=>a.addEventListener("click",()=>{const p=M.find($=>$.id===a.dataset.id);p&&ie(p)})),e.querySelectorAll(".del-desp").forEach(a=>a.addEventListener("click",()=>oe(a.dataset.id)))}function be(){const e=document.getElementById("content"),l=L.filter(i=>i.ativa).reduce((i,t)=>i+Number(t.valor),0),r=B.filter(i=>i.ativa).reduce((i,t)=>i+Number(t.valor),0),o=l-r,c=(i,t)=>{const m=t==="receita"?"var(--accent)":"var(--danger)",g=t==="despesa"?A[i.categoria]||A.outro:null,h=t==="receita"&&i.cliente_id?W.find(a=>a.id===i.cliente_id):null,d=i.dia_util?`${i.dia_mes}º dia útil`:`Dia ${i.dia_mes}`;return`<div class="desp-rec-card ${i.ativa?"":"paused"}" data-rid="${i.id}" data-tipo="${t}">
      <div class="desp-rec-head">
        ${g?`<span class="desp-cat-pill" style="background:${g.cor}22;color:${g.cor}">${g.l}</span>`:h?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${N(h.empresa||h.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${i.id}" data-tipo="${t}" ${i.ativa?"checked":""}>
          <span>${i.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${N(i.descricao)}</div>
      <div class="desp-rec-val" style="color:${m}">${n(i.valor)}</div>
      <div class="desp-rec-meta">${d} de cada mês${i.ultima_geracao?" · Última: "+O(i.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${i.id}" data-tipo="${t}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${i.id}" data-tipo="${t}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${i.id}" data-tipo="${t}">Excluir</button>
      </div>
    </div>`},v=L.map(i=>c(i,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',u=B.map(i=>c(i,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${n(l)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${n(r)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${o>=0?"var(--ok)":"var(--danger)"}">${n(o)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${n(o*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${v}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${u}</div></div>
    </div>`}function V(e,l){const r=new Date,o=l<r.getFullYear()||l===r.getFullYear()&&e<r.getMonth()+1,c=`${l}-${String(e).padStart(2,"0")}`,v=P.filter(a=>a.mes===e&&a.ano===l).reduce((a,p)=>a+Number(p.valor),0),u=M.filter(a=>(a.data||"").startsWith(c)).reduce((a,p)=>a+Number(p.valor),0);let i=0,t=0;if(!o){for(const a of L){if(!a.ativa)continue;P.some($=>$.recorrente_id===a.id&&$.mes===e&&$.ano===l)||(i+=Number(a.valor))}for(const a of B){if(!a.ativa)continue;M.some($=>$.recorrente_id===a.id&&($.data||"").startsWith(c))||(t+=Number(a.valor))}}const m=Y.filter(a=>(a.data||"").startsWith(c)).reduce((a,p)=>a+Number(p.valor||0),0),g=ee.filter(a=>(a.data||"").startsWith(c)).reduce((a,p)=>a+Number(p.valor||0),0),h=v+i-(u+t),d=h-m-g;return{recReal:v,recPend:i,recProj:v+i,desReal:u,desPend:t,desProj:u+t,lucroProj:h,aportes:m,cxsUsado:g,sobra:d,isPast:o}}function se(){const e=document.getElementById("content"),l=new Date,r=K,o=J,c=l.getMonth()+1,v=l.getFullYear(),u=[];for(let s=1;s<=12;s++){const b=V(s,r);u.push({label:Z[s-1],mes:s,...b,cur:s===o,hoje:s===c&&r===v})}const i=Math.max(...u.flatMap(s=>[s.recProj,s.desProj]),1),t=u[o-1];o<12||o===12&&V(1,r+1);const m=u.reduce((s,b)=>s+b.recReal,0),g=u.reduce((s,b)=>s+b.desReal,0),h=m-g,d=u.reduce((s,b)=>s+b.recProj,0),a=u.reduce((s,b)=>s+b.desProj,0),p=d-a,$=u.slice().reverse().map(s=>{const b=s.recPend>0?`<b>${n(s.recProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${n(s.recReal)} recebido · ${n(s.recPend)} a receber</div>`:n(s.recReal),E=s.desPend>0?`<b>${n(s.desProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${n(s.desReal)} pago · ${n(s.desPend)} a pagar</div>`:n(s.desReal);return`<tr>
      <td>${s.label}${s.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}${s.isPast?"":' <span style="font-size:10px;color:var(--text-3)">prev</span>'}</td>
      <td style="color:var(--accent)">${b}</td>
      <td style="color:var(--danger)">${E}</td>
      <td style="font-weight:700;color:${s.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(s.lucroProj)}</td>
    </tr>`}).join(""),k=u.map(s=>{const b=Math.round(s.recProj/i*100),E=Math.round(s.desProj/i*100);return`<div class="resumo-bg${s.cur?" cur":""}">
      <div class="resumo-bars">
        <div class="resumo-bar rec${s.isPast?"":" proj"}" style="height:${b}%" title="Receita ${n(s.recProj)}"></div>
        <div class="resumo-bar des${s.isPast?"":" proj"}" style="height:${E}%" title="Despesa ${n(s.desProj)}"></div>
      </div>
      <div class="bl">${s.label}</div>
    </div>`}).join(""),w=[];for(let s=0;s<6;s++){const b=o-1+s;if(b<12){const E=u[b];w.push(Q(E))}else{const E=Math.floor(b/12),D=b%12+1,U=r+E,le=V(D,U),ne={mes:D,...le,cur:D===c&&U===v};w.push(Q(ne))}}const x=o===c&&r===v,T=`
    <div class="resumo-picker">
      <button class="btn bg bsm" id="rsm-prev" title="Mês anterior">◀</button>
      <select class="fsl" id="rsm-mes">${S.map((s,b)=>`<option value="${b+1}"${b+1===o?" selected":""}>${s}</option>`).join("")}</select>
      <input class="fi" type="number" id="rsm-ano" value="${r}" style="width:90px;text-align:center;padding:6px 9px">
      <button class="btn bg bsm" id="rsm-next" title="Próximo mês">▶</button>
      ${x?"":'<button class="btn bg bsm" id="rsm-hoje">Voltar pra hoje</button>'}
    </div>`;e.innerHTML=`
    ${T}

    <!-- Destaque: mês em foco (o selecionado no picker) -->
    <div class="cw" style="margin-bottom:18px;border:1px solid rgba(193,255,42,.2)">
      <div class="ct" style="color:var(--accent)">${t.isPast?"Realizado":"Projeção"} — ${S[t.mes-1]} ${r}${t.hoje?" · atual":""}</div>
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:0;margin-top:12px">
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Receita ${t.isPast?"realizada":"prevista"}</div>
          <div class="sv" style="color:var(--accent)">${n(t.recProj)}</div>
          ${t.recPend>0?`<div class="ss">${n(t.recReal)} recebido · ${n(t.recPend)} a receber</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Despesa ${t.isPast?"paga":"prevista"}</div>
          <div class="sv" style="color:var(--danger)">${n(t.desProj)}</div>
          ${t.desPend>0?`<div class="ss">${n(t.desReal)} pago · ${n(t.desPend)} a pagar</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Lucro bruto</div>
          <div class="sv" style="color:${t.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(t.lucroProj)}</div>
          <div class="ss">Margem ${t.recProj>0?Math.round(t.lucroProj/t.recProj*100)+"%":"—"}</div>
        </div>
      </div>

      <!-- Linha 2: alocações que abatem do lucro -->
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin:10px 0 0">
        <div class="sc" style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15)">
          <div class="sl">Investido (Liberdade)</div>
          <div class="sv" style="color:#A78BFA">${n(t.aportes)}</div>
          <div class="ss">${t.aportes>0?`${X(t.mes,r)} aporte${X(t.mes,r)===1?"":"s"}`:"sem aporte"}</div>
        </div>
        <div class="sc" style="background:rgba(74,158,255,.06);border:1px solid rgba(74,158,255,.15)">
          <div class="sl">Gasto em Caixinhas</div>
          <div class="sv" style="color:#4A9EFF">${n(t.cxsUsado)}</div>
          <div class="ss">${t.cxsUsado>0?"gasolina, mercado, etc.":"sem movimentação"}</div>
        </div>
        <div class="sc" style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.18)">
          <div class="sl">Sobrou pra você</div>
          <div class="sv" style="color:${t.sobra>=0?"#34D399":"var(--danger)"}">${n(t.sobra)}</div>
          <div class="ss">${t.lucroProj>0?`${Math.round((t.aportes+t.cxsUsado)/t.lucroProj*100)}% do lucro alocado`:"lucro insuficiente"}</div>
        </div>
      </div>
    </div>

    <!-- Fluxo dos próximos 6 meses a partir do selecionado -->
    <div class="ct" style="margin-bottom:8px">Próximos meses — lucro projetado</div>
    <div class="sg" style="grid-template-columns:repeat(${w.length},1fr);margin-bottom:22px">${w.join("")}</div>

    <!-- Ano corrente -->
    <div class="sg" style="grid-template-columns:repeat(3,1fr)">
      <div class="sc"><div class="sl">Realizado em ${r}</div>
        <div class="sv" style="color:${h>=0?"var(--ok)":"var(--danger)"}">${n(h)}</div>
        <div class="ss">${n(m)} − ${n(g)}</div>
      </div>
      <div class="sc"><div class="sl">Projeção ${r} (com recorrentes)</div>
        <div class="sv" style="color:${p>=0?"var(--ok)":"var(--danger)"}">${n(p)}</div>
        <div class="ss">${n(d)} − ${n(a)}</div>
      </div>
      <div class="sc"><div class="sl">Recorrentes ativas</div>
        <div class="sv">${n(L.filter(s=>s.ativa).reduce((s,b)=>s+Number(b.valor),0)-B.filter(s=>s.ativa).reduce((s,b)=>s+Number(b.valor),0))}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div>
      </div>
    </div>

    <div class="cw">
      <div class="ct">Receita vs Despesa — ${r} (projetado)</div>
      <div class="bc">${k}</div>
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
        <tbody>${$}</tbody>
      </table>
    </div>`;const R=(s,b)=>{let E=s,D=b;E<1&&(E=12,D--),E>12&&(E=1,D++),!(D<2020||D>2099)&&(J=E,K=D,se())};document.getElementById("rsm-prev").addEventListener("click",()=>R(o-1,r)),document.getElementById("rsm-next").addEventListener("click",()=>R(o+1,r)),document.getElementById("rsm-mes").addEventListener("change",s=>R(parseInt(s.target.value),r)),document.getElementById("rsm-ano").addEventListener("change",s=>{const b=parseInt(s.target.value);b>=2020&&b<=2099&&R(o,b)});const F=document.getElementById("rsm-hoje");F&&F.addEventListener("click",()=>R(c,v))}function Q(e,l){const r=e.aportes>0;return`<div class="sc" style="${e.cur?"border-color:rgba(197,248,42,.3)":""}">
    <div class="sl">${S[e.mes-1]}${e.cur?" · atual":""}</div>
    <div class="sv" style="color:${e.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(e.lucroProj)}</div>
    <div class="ss">${n(e.recProj)} − ${n(e.desProj)}</div>
    ${r?`<div class="ss" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--line)">
      <span style="color:#A78BFA">−${n(e.aportes)}</span> aporte
      <div style="color:${e.sobra>=0?"#34D399":"var(--danger)"};font-weight:600;margin-top:2px">${n(e.sobra)} sobra</div>
    </div>`:""}
  </div>`}function X(e,l){const r=`${l}-${String(e).padStart(2,"0")}`;return Y.filter(o=>(o.data||"").startsWith(r)).length}function re(e={}){const l=!e.id,r=new Date;z(l?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${S.map((o,c)=>`<option value="${c+1}"${(e.mes||r.getMonth()+1)===c+1?" selected":""}>${o}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||r.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${C(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const o={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!o.valor)return f("Valor obrigatório","err");const{error:c}=e.id?await y.from("faturamento").update(o).eq("id",e.id):await y.from("faturamento").insert(o);if(c)return f("Erro: "+c.message,"err");j(),f("Salvo"),_()})}async function fe(e){confirm("Remover?")&&(await y.from("faturamento").delete().eq("id",e),f("Removido"),_())}function ie(e={}){const l=!e.id,r=new Date().toISOString().slice(0,10),o=H.map(v=>`<option value="${v.k}"${(e.categoria||"outro")===v.k?" selected":""}>${v.l}</option>`).join(""),c=!!e.parcelamento_id;if(z(l?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${C(e.descricao||"")}" placeholder="Ex: Fatura Nubank, TV Samsung, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${o}</select></div>
      <div class="fg"><label class="fl">Valor ${l?"TOTAL":""} (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data ${l?"da 1ª parcela":""} *</label>
      <input class="fi" type="date" id="d-data" value="${e.data||r}"></div>

    ${l?`
    <div class="fg" style="margin-top:11px">
      <label class="fl">Parcelas</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="fi" type="number" min="1" max="36" id="d-parc" value="1" style="width:90px">
        <span style="font-size:12px;color:var(--text-3)" id="d-parc-preview">à vista</span>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:4px">Ex: TV em 10x — gera 10 lançamentos mensais a partir da data acima.</div>
    </div>
    `:c?`
    <div style="margin-top:11px;padding:10px 12px;background:rgba(193,255,42,.06);border:1px solid rgba(193,255,42,.15);border-radius:6px;font-size:12px;color:var(--text-2)">
      ↻ Parcela ${e.parcela_num}/${e.parcelas_total} de um parcelamento. Editar aqui afeta só esta parcela.
    </div>
    `:""}
  `,`
    ${l?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    ${c?'<button class="btn bd" id="d-del-grupo">Excluir TODAS as parcelas</button>':""}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),l){const v=document.getElementById("d-parc"),u=document.getElementById("d-val"),i=document.getElementById("d-parc-preview"),t=()=>{const m=parseInt(v.value)||1,g=parseFloat(u.value)||0;m<=1?i.textContent="à vista":g>0?i.textContent=`${m}x de R$ ${(g/m).toFixed(2).replace(".",",")}`:i.textContent=`${m}x`};v.addEventListener("input",t),u.addEventListener("input",t)}document.getElementById("m-cancel").addEventListener("click",j),l||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir essa despesa?")&&(await oe(e.id),j())}),c&&document.getElementById("d-del-grupo").addEventListener("click",async()=>{confirm(`Excluir TODAS as ${e.parcelas_total} parcelas desse parcelamento?`)&&(await y.from("despesas").delete().eq("parcelamento_id",e.parcelamento_id),f("Parcelamento excluído"),j(),_())}),document.getElementById("m-save").addEventListener("click",async()=>{const v=document.getElementById("d-desc").value.trim(),u=document.getElementById("d-cat").value,i=parseFloat(document.getElementById("d-val").value)||0,t=document.getElementById("d-data").value;if(!v)return f("Descrição obrigatória","err");if(!i)return f("Valor obrigatório","err");if(!t)return f("Data obrigatória","err");if(e.id){const{error:x}=await y.from("despesas").update({descricao:v,categoria:u,valor:i,data:t}).eq("id",e.id);if(x)return f("Erro: "+x.message,"err");j(),f("Salvo"),_();return}const m=Math.max(1,Math.min(36,parseInt(document.getElementById("d-parc").value)||1));if(m===1){const{error:x}=await y.from("despesas").insert({descricao:v,categoria:u,valor:i,data:t});if(x)return f("Erro: "+x.message,"err");j(),f("Despesa adicionada"),_();return}const g=crypto.randomUUID(),h=Math.round(i/m*100)/100,d=Math.round((i-h*m)*100)/100,[a,p,$]=t.split("-").map(Number),k=[];for(let x=0;x<m;x++){const T=p-1+x,R=a+Math.floor(T/12),F=T%12+1,s=new Date(R,F,0).getDate(),b=Math.min($,s),E=`${R}-${String(F).padStart(2,"0")}-${String(b).padStart(2,"0")}`,D=x===m-1?h+d:h;k.push({descricao:`${v} (${x+1}/${m})`,categoria:u,valor:D,data:E,parcelamento_id:g,parcela_num:x+1,parcelas_total:m})}const{error:w}=await y.from("despesas").insert(k);if(w)return f("Erro: "+w.message,"err");j(),f(`${m} parcelas criadas`),_()})}async function oe(e){await y.from("despesas").delete().eq("id",e),f("Removida"),_()}function ce(e={}){const l=!e.id,r=H.map(o=>`<option value="${o.k}"${(e.categoria||"outro")===o.k?" selected":""}>${o.l}</option>`).join("");z(l?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${C(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const o={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!o.descricao)return f("Descrição obrigatória","err");if(!o.valor)return f("Valor obrigatório","err");if(o.dia_mes<1||o.dia_mes>31)return f("Dia entre 1 e 31","err");const{error:c}=e.id?await y.from("despesas_recorrentes").update(o).eq("id",e.id):await y.from("despesas_recorrentes").insert({...o,ativa:!0});if(c)return f("Erro: "+c.message,"err");j(),f("Salvo"),_()})}function de(e={}){const l=!e.id,o='<option value="">— sem cliente vinculado —</option>'+W.filter(c=>["proposta","ativo","em_pausa","fechado"].includes(c.status)||c.id===e.cliente_id).map(c=>`<option value="${c.id}"${e.cliente_id===c.id?" selected":""}>${C(c.empresa||c.nome)}</option>`).join("");z(l?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${C(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rr-cli">${o}</select></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const c={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!c.descricao)return f("Descrição obrigatória","err");if(!c.valor)return f("Valor obrigatório","err");if(c.dia_mes<1||c.dia_mes>31)return f("Dia entre 1 e 31","err");const{error:v}=e.id?await y.from("receitas_recorrentes").update(c).eq("id",e.id):await y.from("receitas_recorrentes").insert({...c,ativa:!0});if(v)return f("Erro: "+v.message,"err");j(),f("Salvo"),_()})}async function $e(e,l){const r=new Date,o=r.toISOString().slice(0,10);l==="receita"?(await y.from("faturamento").insert({mes:r.getMonth()+1,ano:r.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await y.from("receitas_recorrentes").update({ultima_geracao:o}).eq("id",e.id)):(await y.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:o,recorrente_id:e.id}),await y.from("despesas_recorrentes").update({ultima_geracao:o}).eq("id",e.id))}function N(e){return String(e??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l])}function C(e){return N(e)}export{_ as render};
