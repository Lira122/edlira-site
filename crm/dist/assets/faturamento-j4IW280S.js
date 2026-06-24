import{d as x,s as q,o as z,e as B,f as D,t as $,c as n,h as H,b as ue,M as ee}from"./index-BWeNDSVY.js";const Y=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],F=Object.fromEntries(Y.map(e=>[e.k,e]));let M=[],R=[],A=[],N=[],W=[],O=[],ae=[],U=[],k="receita",J=!1,K=new Date().getMonth()+1,Q=new Date().getFullYear();async function I(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',me(),await pe(),te(),se()}function me(){J||(J=!0,document.getElementById("content").addEventListener("click",async e=>{if(k!=="recorrentes")return;const l=e.target.closest(".rec-edit"),r=e.target.closest(".rec-del"),o=e.target.closest(".rec-run"),c=e.target.closest(".desp-rec-active"),v=l||r||o||c;if(!v)return;const u=v.dataset.tipo,s=u==="receita"?N:A,a=u==="receita"?"receitas_recorrentes":"despesas_recorrentes",p=s.find(b=>b.id===v.dataset.rid);if(p)try{if(l)u==="receita"?le(p):de(p);else if(r){if(!confirm(`Excluir "${p.descricao}"? (Lançamentos já gerados continuam)`))return;const{error:b}=await x.from(a).delete().eq("id",p.id);if(b)throw b;$("Excluída"),I()}else if(o)await he(p,u),$(u==="receita"?"Receita lançada":"Despesa lançada"),I();else if(c){p.ativa=c.checked;const{error:b}=await x.from(a).update({ativa:p.ativa,atualizado_em:new Date().toISOString()}).eq("id",p.id);if(b)throw b;I()}}catch(b){console.error("[recorrentes]",b),$("Erro: "+(b.message||b),"err")}}))}async function pe(){const[e,l,r,o,c,v,u,s]=await Promise.all([x.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),q("despesas",{order:{column:"data",ascending:!1}}),q("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),q("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),x.from("aportes_fin").select("data,valor").order("data",{ascending:!1}),x.from("caixinhas_mov").select("data,valor,caixinha_id").order("data",{ascending:!1}),x.from("caixinhas").select("id,valor_mensal,ativa,criado_em").eq("ativa",!0),q("clientes",{columns:"id,nome,empresa,status"})]);M=e.data||[],R=l.data||[],A=r.data||[],N=o.data||[],W=c&&!c.error?c.data||[]:[],O=v&&!v.error?v.data||[]:[],ae=u&&!u.error?u.data||[]:[],U=s.data||[]}function te(){const e=(v,u)=>`<button class="pj-tab${k===v?" on":""}" data-tab="${v}">${u}</button>`;let l="";k==="receita"&&(l='<button class="btn bp" id="btn-add">+ Receita</button>'),k==="despesas"&&(l='<button class="btn bp" id="btn-add">+ Despesa</button>'),k==="recorrentes"&&(l=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${l}
  `,document.querySelectorAll(".pj-tab").forEach(v=>v.addEventListener("click",()=>{k=v.dataset.tab,te(),se()}));const r=document.getElementById("btn-add");r&&(k==="receita"&&r.addEventListener("click",()=>ie()),k==="despesas"&&r.addEventListener("click",()=>oe()));const o=document.getElementById("btn-add-rec-receita"),c=document.getElementById("btn-add-rec-despesa");o&&o.addEventListener("click",()=>le()),c&&c.addEventListener("click",()=>de())}function se(){return k==="despesas"?be():k==="recorrentes"?fe():k==="resumo"?re():ge()}function ge(){const e=document.getElementById("content"),l=new Date,r=l.getFullYear(),o=l.getMonth()+1,c=M.filter(d=>d.ano===r).reduce((d,i)=>d+Number(i.valor),0),v=[...new Set(M.filter(d=>d.ano===r).map(d=>d.mes))],u=v.length?c/v.length:0,s=M.reduce((d,i)=>!d||Number(i.valor)>Number(d.valor)?i:d,null),a=[];for(let d=11;d>=0;d--){const i=new Date(r,o-1-d,1),f=i.getMonth()+1,w=i.getFullYear(),m=M.filter(y=>y.mes===f&&y.ano===w).reduce((y,h)=>y+Number(h.valor),0);a.push({label:ee[f-1],val:m,cur:d===0})}const p=Math.max(...a.map(d=>d.val),1),b=a.map(d=>{const i=Math.round(d.val/p*100);return`<div class="bg2">
      <div class="bv">${d.val>0?"R$"+ue(d.val):""}</div>
      <div class="bar${d.cur?" cur":""}" style="height:${i}%"></div>
      <div class="bl">${d.label}</div>
    </div>`}).join(""),E=M.length?M.map(d=>`
        <tr>
          <td>${B[d.mes-1]}</td>
          <td class="tm">${d.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${n(d.valor)}</td>
          <td class="tm">${C(d.descricao||"—")}${d.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${H(d.criado_em)}</td>
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
        <div class="sv">${s?n(s.valor):"—"}</div>
        <div class="ss">${s?B[s.mes-1]+" "+s.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${b}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${E}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(d=>d.addEventListener("click",()=>{const i=M.find(f=>f.id===d.dataset.id);i&&ie(i)})),e.querySelectorAll(".del-fat").forEach(d=>d.addEventListener("click",()=>$e(d.dataset.id)))}function be(){const e=document.getElementById("content"),l=new Date,r=l.getFullYear(),o=l.getMonth()+1,c=`${r}-${String(o).padStart(2,"0")}`,v=R.filter(i=>(i.data||"").startsWith(c)),u=R.filter(i=>(i.data||"").startsWith(String(r))),s=v.reduce((i,f)=>i+Number(f.valor),0),a=u.reduce((i,f)=>i+Number(f.valor),0),p=A.filter(i=>i.ativa).reduce((i,f)=>i+Number(f.valor),0),b={};for(const i of u)b[i.categoria||"outro"]=(b[i.categoria||"outro"]||0)+Number(i.valor);const E=Object.entries(b).sort(([,i],[,f])=>f-i).map(([i,f])=>{const w=F[i]||F.outro,m=a>0?Math.round(f/a*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${w.cor}"></span>
          <span class="desp-cat-name">${w.l}</span>
          <span class="desp-cat-pct">${m}%</span>
        </div>
        <div class="desp-cat-val">${n(f)}</div>
      </div>`}).join("")||`<div class="empty">Sem despesas em ${r}.</div>`,d=R.length?R.map(i=>{const f=F[i.categoria]||F.outro,w=[];return i.recorrente_id&&w.push('<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>'),i.parcelamento_id&&w.push(`<span class="desp-parc-tag" title="Parcelado">${i.parcela_num}/${i.parcelas_total}</span>`),`<tr>
          <td class="tm">${H(i.data)}</td>
          <td class="tn">${C(i.descricao)}${w.join("")}</td>
          <td><span class="desp-cat-pill" style="background:${f.cor}22;color:${f.cor}">${f.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${n(i.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${i.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${i.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${B[o-1]}</div><div class="sv" style="color:var(--danger)">${n(s)}</div></div>
      <div class="sc"><div class="sl">Despesas ${r}</div><div class="sv">${n(a)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${n(p)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${r}</div>
      <div class="desp-cat-grid">${E}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${d}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(i=>i.addEventListener("click",()=>{const f=R.find(w=>w.id===i.dataset.id);f&&oe(f)})),e.querySelectorAll(".del-desp").forEach(i=>i.addEventListener("click",()=>ce(i.dataset.id)))}function fe(){const e=document.getElementById("content"),l=N.filter(s=>s.ativa).reduce((s,a)=>s+Number(a.valor),0),r=A.filter(s=>s.ativa).reduce((s,a)=>s+Number(a.valor),0),o=l-r,c=(s,a)=>{const p=a==="receita"?"var(--accent)":"var(--danger)",b=a==="despesa"?F[s.categoria]||F.outro:null,E=a==="receita"&&s.cliente_id?U.find(i=>i.id===s.cliente_id):null,d=s.dia_util?`${s.dia_mes}º dia útil`:`Dia ${s.dia_mes}`;return`<div class="desp-rec-card ${s.ativa?"":"paused"}" data-rid="${s.id}" data-tipo="${a}">
      <div class="desp-rec-head">
        ${b?`<span class="desp-cat-pill" style="background:${b.cor}22;color:${b.cor}">${b.l}</span>`:E?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${C(E.empresa||E.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${s.id}" data-tipo="${a}" ${s.ativa?"checked":""}>
          <span>${s.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${C(s.descricao)}</div>
      <div class="desp-rec-val" style="color:${p}">${n(s.valor)}</div>
      <div class="desp-rec-meta">${d} de cada mês${s.ultima_geracao?" · Última: "+H(s.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${s.id}" data-tipo="${a}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${s.id}" data-tipo="${a}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${s.id}" data-tipo="${a}">Excluir</button>
      </div>
    </div>`},v=N.map(s=>c(s,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',u=A.map(s=>c(s,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
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
    </div>`}function V(e,l){const r=new Date,o=l<r.getFullYear()||l===r.getFullYear()&&e<r.getMonth()+1,c=`${l}-${String(e).padStart(2,"0")}`,v=M.filter(m=>m.mes===e&&m.ano===l).reduce((m,y)=>m+Number(y.valor),0),u=R.filter(m=>(m.data||"").startsWith(c)).reduce((m,y)=>m+Number(y.valor),0);let s=0,a=0;if(!o){for(const m of N){if(!m.ativa)continue;M.some(h=>h.recorrente_id===m.id&&h.mes===e&&h.ano===l)||(s+=Number(m.valor))}for(const m of A){if(!m.ativa)continue;R.some(h=>h.recorrente_id===m.id&&(h.data||"").startsWith(c))||(a+=Number(m.valor))}}const p=W.filter(m=>(m.data||"").startsWith(c)).reduce((m,y)=>m+Number(y.valor||0),0),b=new Date(l,e,0),E=O.filter(m=>(m.data||"").startsWith(c)).reduce((m,y)=>m+Number(y.valor||0),0);let d=0,i=0;for(const m of ae){if(!m.ativa||(m.criado_em?new Date(m.criado_em):new Date(0))>b)continue;const h=Number(m.valor_mensal||0),L=O.filter(j=>j.caixinha_id===m.id&&(j.data||"").startsWith(c)).reduce((j,S)=>j+Number(S.valor||0),0);i+=h,d+=Math.max(h,L)}const f=v+s-(u+a),w=f-p-d;return{recReal:v,recPend:s,recProj:v+s,desReal:u,desPend:a,desProj:u+a,lucroProj:f,aportes:p,cxsUsado:E,cxsAlocacao:i,cxsComprometido:d,sobra:w,isPast:o}}function re(){const e=document.getElementById("content"),l=new Date,r=Q,o=K,c=l.getMonth()+1,v=l.getFullYear(),u=[];for(let t=1;t<=12;t++){const g=V(t,r);u.push({label:ee[t-1],mes:t,...g,cur:t===o,hoje:t===c&&r===v})}const s=Math.max(...u.flatMap(t=>[t.recProj,t.desProj]),1),a=u[o-1];o<12||o===12&&V(1,r+1);const p=u.reduce((t,g)=>t+g.recReal,0),b=u.reduce((t,g)=>t+g.desReal,0),E=p-b,d=u.reduce((t,g)=>t+g.recProj,0),i=u.reduce((t,g)=>t+g.desProj,0),f=d-i,w=u.slice().reverse().map(t=>{const g=t.recPend>0?`<b>${n(t.recProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${n(t.recReal)} recebido · ${n(t.recPend)} a receber</div>`:n(t.recReal),_=t.desPend>0?`<b>${n(t.desProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${n(t.desReal)} pago · ${n(t.desPend)} a pagar</div>`:n(t.desReal);return`<tr>
      <td>${t.label}${t.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}${t.isPast?"":' <span style="font-size:10px;color:var(--text-3)">prev</span>'}</td>
      <td style="color:var(--accent)">${g}</td>
      <td style="color:var(--danger)">${_}</td>
      <td style="font-weight:700;color:${t.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(t.lucroProj)}</td>
    </tr>`}).join(""),m=u.map(t=>{const g=Math.round(t.recProj/s*100),_=Math.round(t.desProj/s*100);return`<div class="resumo-bg${t.cur?" cur":""}">
      <div class="resumo-bars">
        <div class="resumo-bar rec${t.isPast?"":" proj"}" style="height:${g}%" title="Receita ${n(t.recProj)}"></div>
        <div class="resumo-bar des${t.isPast?"":" proj"}" style="height:${_}%" title="Despesa ${n(t.desProj)}"></div>
      </div>
      <div class="bl">${t.label}</div>
    </div>`}).join(""),y=[];for(let t=0;t<6;t++){const g=o-1+t;if(g<12){const _=u[g];y.push(X(_))}else{const _=Math.floor(g/12),P=g%12+1,G=r+_,ne=V(P,G),ve={mes:P,...ne,cur:P===c&&G===v};y.push(X(ve))}}const h=o===c&&r===v,L=`
    <div class="resumo-picker">
      <button class="btn bg bsm" id="rsm-prev" title="Mês anterior">◀</button>
      <select class="fsl" id="rsm-mes">${B.map((t,g)=>`<option value="${g+1}"${g+1===o?" selected":""}>${t}</option>`).join("")}</select>
      <input class="fi" type="number" id="rsm-ano" value="${r}" style="width:90px;text-align:center;padding:6px 9px">
      <button class="btn bg bsm" id="rsm-next" title="Próximo mês">▶</button>
      ${h?"":'<button class="btn bg bsm" id="rsm-hoje">Voltar pra hoje</button>'}
    </div>`;e.innerHTML=`
    ${L}

    <!-- Destaque: mês em foco (o selecionado no picker) -->
    <div class="cw" style="margin-bottom:18px;border:1px solid rgba(193,255,42,.2)">
      <div class="ct" style="color:var(--accent)">${a.isPast?"Realizado":"Projeção"} — ${B[a.mes-1]} ${r}${a.hoje?" · atual":""}</div>
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:0;margin-top:12px">
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Receita ${a.isPast?"realizada":"prevista"}</div>
          <div class="sv" style="color:var(--accent)">${n(a.recProj)}</div>
          ${a.recPend>0?`<div class="ss">${n(a.recReal)} recebido · ${n(a.recPend)} a receber</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Despesa ${a.isPast?"paga":"prevista"}</div>
          <div class="sv" style="color:var(--danger)">${n(a.desProj)}</div>
          ${a.desPend>0?`<div class="ss">${n(a.desReal)} pago · ${n(a.desPend)} a pagar</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Lucro bruto</div>
          <div class="sv" style="color:${a.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(a.lucroProj)}</div>
          <div class="ss">Margem ${a.recProj>0?Math.round(a.lucroProj/a.recProj*100)+"%":"—"}</div>
        </div>
      </div>

      <!-- Linha 2: alocações que abatem do lucro -->
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin:10px 0 0">
        <div class="sc" style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15)">
          <div class="sl">Investido (Liberdade)</div>
          <div class="sv" style="color:#A78BFA">${n(a.aportes)}</div>
          <div class="ss">${a.aportes>0?`${Z(a.mes,r)} aporte${Z(a.mes,r)===1?"":"s"}`:"sem aporte"}</div>
        </div>
        <div class="sc" style="background:rgba(74,158,255,.06);border:1px solid rgba(74,158,255,.15)">
          <div class="sl">Caixinhas</div>
          <div class="sv" style="color:#4A9EFF">${n(a.cxsComprometido)}</div>
          <div class="ss">${a.cxsAlocacao>0?`${n(a.cxsUsado)} gasto · ${n(a.cxsAlocacao)} alocado/mês`:"nenhuma caixinha"}</div>
        </div>
        <div class="sc" style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.18)">
          <div class="sl">Sobrou pra você</div>
          <div class="sv" style="color:${a.sobra>=0?"#34D399":"var(--danger)"}">${n(a.sobra)}</div>
          <div class="ss">${a.lucroProj>0?`${Math.round((a.aportes+a.cxsComprometido)/a.lucroProj*100)}% do lucro alocado`:"lucro insuficiente"}</div>
        </div>
      </div>
    </div>

    <!-- Fluxo dos próximos 6 meses a partir do selecionado -->
    <div class="ct" style="margin-bottom:8px">Próximos meses — lucro projetado</div>
    <div class="sg" style="grid-template-columns:repeat(${y.length},1fr);margin-bottom:22px">${y.join("")}</div>

    <!-- Ano corrente -->
    <div class="sg" style="grid-template-columns:repeat(3,1fr)">
      <div class="sc"><div class="sl">Realizado em ${r}</div>
        <div class="sv" style="color:${E>=0?"var(--ok)":"var(--danger)"}">${n(E)}</div>
        <div class="ss">${n(p)} − ${n(b)}</div>
      </div>
      <div class="sc"><div class="sl">Projeção ${r} (com recorrentes)</div>
        <div class="sv" style="color:${f>=0?"var(--ok)":"var(--danger)"}">${n(f)}</div>
        <div class="ss">${n(d)} − ${n(i)}</div>
      </div>
      <div class="sc"><div class="sl">Recorrentes ativas</div>
        <div class="sv">${n(N.filter(t=>t.ativa).reduce((t,g)=>t+Number(g.valor),0)-A.filter(t=>t.ativa).reduce((t,g)=>t+Number(g.valor),0))}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div>
      </div>
    </div>

    <div class="cw">
      <div class="ct">Receita vs Despesa — ${r} (projetado)</div>
      <div class="bc">${m}</div>
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
        <tbody>${w}</tbody>
      </table>
    </div>`;const j=(t,g)=>{let _=t,P=g;_<1&&(_=12,P--),_>12&&(_=1,P++),!(P<2020||P>2099)&&(K=_,Q=P,re())};document.getElementById("rsm-prev").addEventListener("click",()=>j(o-1,r)),document.getElementById("rsm-next").addEventListener("click",()=>j(o+1,r)),document.getElementById("rsm-mes").addEventListener("change",t=>j(parseInt(t.target.value),r)),document.getElementById("rsm-ano").addEventListener("change",t=>{const g=parseInt(t.target.value);g>=2020&&g<=2099&&j(o,g)});const S=document.getElementById("rsm-hoje");S&&S.addEventListener("click",()=>j(c,v))}function X(e,l){const r=e.aportes>0;return`<div class="sc" style="${e.cur?"border-color:rgba(197,248,42,.3)":""}">
    <div class="sl">${B[e.mes-1]}${e.cur?" · atual":""}</div>
    <div class="sv" style="color:${e.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(e.lucroProj)}</div>
    <div class="ss">${n(e.recProj)} − ${n(e.desProj)}</div>
    ${r?`<div class="ss" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--line)">
      <span style="color:#A78BFA">−${n(e.aportes)}</span> aporte
      <div style="color:${e.sobra>=0?"#34D399":"var(--danger)"};font-weight:600;margin-top:2px">${n(e.sobra)} sobra</div>
    </div>`:""}
  </div>`}function Z(e,l){const r=`${l}-${String(e).padStart(2,"0")}`;return W.filter(o=>(o.data||"").startsWith(r)).length}function ie(e={}){const l=!e.id,r=new Date;z(l?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${B.map((o,c)=>`<option value="${c+1}"${(e.mes||r.getMonth()+1)===c+1?" selected":""}>${o}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||r.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${T(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",D),document.getElementById("m-save").addEventListener("click",async()=>{const o={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!o.valor)return $("Valor obrigatório","err");const{error:c}=e.id?await x.from("faturamento").update(o).eq("id",e.id):await x.from("faturamento").insert(o);if(c)return $("Erro: "+c.message,"err");D(),$("Salvo"),I()})}async function $e(e){confirm("Remover?")&&(await x.from("faturamento").delete().eq("id",e),$("Removido"),I())}function oe(e={}){const l=!e.id,r=new Date().toISOString().slice(0,10),o=Y.map(v=>`<option value="${v.k}"${(e.categoria||"outro")===v.k?" selected":""}>${v.l}</option>`).join(""),c=!!e.parcelamento_id;if(z(l?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${T(e.descricao||"")}" placeholder="Ex: Fatura Nubank, TV Samsung, Mensalidade Claude…"></div>
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
  `),l){const v=document.getElementById("d-parc"),u=document.getElementById("d-val"),s=document.getElementById("d-parc-preview"),a=()=>{const p=parseInt(v.value)||1,b=parseFloat(u.value)||0;p<=1?s.textContent="à vista":b>0?s.textContent=`${p}x de R$ ${(b/p).toFixed(2).replace(".",",")}`:s.textContent=`${p}x`};v.addEventListener("input",a),u.addEventListener("input",a)}document.getElementById("m-cancel").addEventListener("click",D),l||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir essa despesa?")&&(await ce(e.id),D())}),c&&document.getElementById("d-del-grupo").addEventListener("click",async()=>{confirm(`Excluir TODAS as ${e.parcelas_total} parcelas desse parcelamento?`)&&(await x.from("despesas").delete().eq("parcelamento_id",e.parcelamento_id),$("Parcelamento excluído"),D(),I())}),document.getElementById("m-save").addEventListener("click",async()=>{const v=document.getElementById("d-desc").value.trim(),u=document.getElementById("d-cat").value,s=parseFloat(document.getElementById("d-val").value)||0,a=document.getElementById("d-data").value;if(!v)return $("Descrição obrigatória","err");if(!s)return $("Valor obrigatório","err");if(!a)return $("Data obrigatória","err");if(e.id){const{error:h}=await x.from("despesas").update({descricao:v,categoria:u,valor:s,data:a}).eq("id",e.id);if(h)return $("Erro: "+h.message,"err");D(),$("Salvo"),I();return}const p=Math.max(1,Math.min(36,parseInt(document.getElementById("d-parc").value)||1));if(p===1){const{error:h}=await x.from("despesas").insert({descricao:v,categoria:u,valor:s,data:a});if(h)return $("Erro: "+h.message,"err");D(),$("Despesa adicionada"),I();return}const b=crypto.randomUUID(),E=Math.round(s/p*100)/100,d=Math.round((s-E*p)*100)/100,[i,f,w]=a.split("-").map(Number),m=[];for(let h=0;h<p;h++){const L=f-1+h,j=i+Math.floor(L/12),S=L%12+1,t=new Date(j,S,0).getDate(),g=Math.min(w,t),_=`${j}-${String(S).padStart(2,"0")}-${String(g).padStart(2,"0")}`,P=h===p-1?E+d:E;m.push({descricao:`${v} (${h+1}/${p})`,categoria:u,valor:P,data:_,parcelamento_id:b,parcela_num:h+1,parcelas_total:p})}const{error:y}=await x.from("despesas").insert(m);if(y)return $("Erro: "+y.message,"err");D(),$(`${p} parcelas criadas`),I()})}async function ce(e){await x.from("despesas").delete().eq("id",e),$("Removida"),I()}function de(e={}){const l=!e.id,r=Y.map(o=>`<option value="${o.k}"${(e.categoria||"outro")===o.k?" selected":""}>${o.l}</option>`).join("");z(l?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${T(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",D),document.getElementById("m-save").addEventListener("click",async()=>{const o={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!o.descricao)return $("Descrição obrigatória","err");if(!o.valor)return $("Valor obrigatório","err");if(o.dia_mes<1||o.dia_mes>31)return $("Dia entre 1 e 31","err");const{error:c}=e.id?await x.from("despesas_recorrentes").update(o).eq("id",e.id):await x.from("despesas_recorrentes").insert({...o,ativa:!0});if(c)return $("Erro: "+c.message,"err");D(),$("Salvo"),I()})}function le(e={}){const l=!e.id,o='<option value="">— sem cliente vinculado —</option>'+U.filter(c=>["proposta","ativo","em_pausa","fechado"].includes(c.status)||c.id===e.cliente_id).map(c=>`<option value="${c.id}"${e.cliente_id===c.id?" selected":""}>${T(c.empresa||c.nome)}</option>`).join("");z(l?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${T(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",D),document.getElementById("m-save").addEventListener("click",async()=>{const c={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!c.descricao)return $("Descrição obrigatória","err");if(!c.valor)return $("Valor obrigatório","err");if(c.dia_mes<1||c.dia_mes>31)return $("Dia entre 1 e 31","err");const{error:v}=e.id?await x.from("receitas_recorrentes").update(c).eq("id",e.id):await x.from("receitas_recorrentes").insert({...c,ativa:!0});if(v)return $("Erro: "+v.message,"err");D(),$("Salvo"),I()})}async function he(e,l){const r=new Date,o=r.toISOString().slice(0,10);l==="receita"?(await x.from("faturamento").insert({mes:r.getMonth()+1,ano:r.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await x.from("receitas_recorrentes").update({ultima_geracao:o}).eq("id",e.id)):(await x.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:o,recorrente_id:e.id}),await x.from("despesas_recorrentes").update({ultima_geracao:o}).eq("id",e.id))}function C(e){return String(e??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l])}function T(e){return C(e)}export{I as render};
