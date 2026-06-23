import{d as y,s as z,o as q,e as B,f as j,t as b,c as v,h as O,b as de,M as Q}from"./index-CY-rn3Ob.js";const H=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],L=Object.fromEntries(H.map(e=>[e.k,e]));let P=[],M=[],S=[],A=[],Y=[],I="receita",U=!1,G=new Date().getMonth()+1,J=new Date().getFullYear();async function _(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',le(),await ne(),X(),Z()}function le(){U||(U=!0,document.getElementById("content").addEventListener("click",async e=>{if(I!=="recorrentes")return;const n=e.target.closest(".rec-edit"),c=e.target.closest(".rec-del"),i=e.target.closest(".rec-run"),o=e.target.closest(".desp-rec-active"),u=n||c||i||o;if(!u)return;const m=u.dataset.tipo,t=m==="receita"?A:S,s=m==="receita"?"receitas_recorrentes":"despesas_recorrentes",d=t.find(p=>p.id===u.dataset.rid);if(d)try{if(n)m==="receita"?ie(d):re(d);else if(c){if(!confirm(`Excluir "${d.descricao}"? (Lançamentos já gerados continuam)`))return;const{error:p}=await y.from(s).delete().eq("id",d.id);if(p)throw p;b("Excluída"),_()}else if(i)await ge(d,m),b(m==="receita"?"Receita lançada":"Despesa lançada"),_();else if(o){d.ativa=o.checked;const{error:p}=await y.from(s).update({ativa:d.ativa,atualizado_em:new Date().toISOString()}).eq("id",d.id);if(p)throw p;_()}}catch(p){console.error("[recorrentes]",p),b("Erro: "+(p.message||p),"err")}}))}async function ne(){const[e,n,c,i,o]=await Promise.all([y.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),z("despesas",{order:{column:"data",ascending:!1}}),z("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),z("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),z("clientes",{columns:"id,nome,empresa,status"})]);P=e.data||[],M=n.data||[],S=c.data||[],A=i.data||[],Y=o.data||[]}function X(){const e=(u,m)=>`<button class="pj-tab${I===u?" on":""}" data-tab="${u}">${m}</button>`;let n="";I==="receita"&&(n='<button class="btn bp" id="btn-add">+ Receita</button>'),I==="despesas"&&(n='<button class="btn bp" id="btn-add">+ Despesa</button>'),I==="recorrentes"&&(n=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${n}
  `,document.querySelectorAll(".pj-tab").forEach(u=>u.addEventListener("click",()=>{I=u.dataset.tab,X(),Z()}));const c=document.getElementById("btn-add");c&&(I==="receita"&&c.addEventListener("click",()=>ae()),I==="despesas"&&c.addEventListener("click",()=>te()));const i=document.getElementById("btn-add-rec-receita"),o=document.getElementById("btn-add-rec-despesa");i&&i.addEventListener("click",()=>ie()),o&&o.addEventListener("click",()=>re())}function Z(){return I==="despesas"?ue():I==="recorrentes"?me():I==="resumo"?ee():ve()}function ve(){const e=document.getElementById("content"),n=new Date,c=n.getFullYear(),i=n.getMonth()+1,o=P.filter(l=>l.ano===c).reduce((l,r)=>l+Number(r.valor),0),u=[...new Set(P.filter(l=>l.ano===c).map(l=>l.mes))],m=u.length?o/u.length:0,t=P.reduce((l,r)=>!l||Number(r.valor)>Number(l.valor)?r:l,null),s=[];for(let l=11;l>=0;l--){const r=new Date(c,i-1-l,1),f=r.getMonth()+1,x=r.getFullYear(),k=P.filter(w=>w.mes===f&&w.ano===x).reduce((w,h)=>w+Number(h.valor),0);s.push({label:Q[f-1],val:k,cur:l===0})}const d=Math.max(...s.map(l=>l.val),1),p=s.map(l=>{const r=Math.round(l.val/d*100);return`<div class="bg2">
      <div class="bv">${l.val>0?"R$"+de(l.val):""}</div>
      <div class="bar${l.cur?" cur":""}" style="height:${r}%"></div>
      <div class="bl">${l.label}</div>
    </div>`}).join(""),$=P.length?P.map(l=>`
        <tr>
          <td>${B[l.mes-1]}</td>
          <td class="tm">${l.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${v(l.valor)}</td>
          <td class="tm">${N(l.descricao||"—")}${l.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${O(l.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${l.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${l.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${c}</div><div class="sv ac">${v(o)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${v(m)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${t?v(t.valor):"—"}</div>
        <div class="ss">${t?B[t.mes-1]+" "+t.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${p}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${$}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(l=>l.addEventListener("click",()=>{const r=P.find(f=>f.id===l.dataset.id);r&&ae(r)})),e.querySelectorAll(".del-fat").forEach(l=>l.addEventListener("click",()=>pe(l.dataset.id)))}function ue(){const e=document.getElementById("content"),n=new Date,c=n.getFullYear(),i=n.getMonth()+1,o=`${c}-${String(i).padStart(2,"0")}`,u=M.filter(r=>(r.data||"").startsWith(o)),m=M.filter(r=>(r.data||"").startsWith(String(c))),t=u.reduce((r,f)=>r+Number(f.valor),0),s=m.reduce((r,f)=>r+Number(f.valor),0),d=S.filter(r=>r.ativa).reduce((r,f)=>r+Number(f.valor),0),p={};for(const r of m)p[r.categoria||"outro"]=(p[r.categoria||"outro"]||0)+Number(r.valor);const $=Object.entries(p).sort(([,r],[,f])=>f-r).map(([r,f])=>{const x=L[r]||L.outro,k=s>0?Math.round(f/s*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${x.cor}"></span>
          <span class="desp-cat-name">${x.l}</span>
          <span class="desp-cat-pct">${k}%</span>
        </div>
        <div class="desp-cat-val">${v(f)}</div>
      </div>`}).join("")||`<div class="empty">Sem despesas em ${c}.</div>`,l=M.length?M.map(r=>{const f=L[r.categoria]||L.outro,x=[];return r.recorrente_id&&x.push('<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>'),r.parcelamento_id&&x.push(`<span class="desp-parc-tag" title="Parcelado">${r.parcela_num}/${r.parcelas_total}</span>`),`<tr>
          <td class="tm">${O(r.data)}</td>
          <td class="tn">${N(r.descricao)}${x.join("")}</td>
          <td><span class="desp-cat-pill" style="background:${f.cor}22;color:${f.cor}">${f.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${v(r.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${r.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${r.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${B[i-1]}</div><div class="sv" style="color:var(--danger)">${v(t)}</div></div>
      <div class="sc"><div class="sl">Despesas ${c}</div><div class="sv">${v(s)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${v(d)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${c}</div>
      <div class="desp-cat-grid">${$}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(r=>r.addEventListener("click",()=>{const f=M.find(x=>x.id===r.dataset.id);f&&te(f)})),e.querySelectorAll(".del-desp").forEach(r=>r.addEventListener("click",()=>se(r.dataset.id)))}function me(){const e=document.getElementById("content"),n=A.filter(t=>t.ativa).reduce((t,s)=>t+Number(s.valor),0),c=S.filter(t=>t.ativa).reduce((t,s)=>t+Number(s.valor),0),i=n-c,o=(t,s)=>{const d=s==="receita"?"var(--accent)":"var(--danger)",p=s==="despesa"?L[t.categoria]||L.outro:null,$=s==="receita"&&t.cliente_id?Y.find(r=>r.id===t.cliente_id):null,l=t.dia_util?`${t.dia_mes}º dia útil`:`Dia ${t.dia_mes}`;return`<div class="desp-rec-card ${t.ativa?"":"paused"}" data-rid="${t.id}" data-tipo="${s}">
      <div class="desp-rec-head">
        ${p?`<span class="desp-cat-pill" style="background:${p.cor}22;color:${p.cor}">${p.l}</span>`:$?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${N($.empresa||$.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${t.id}" data-tipo="${s}" ${t.ativa?"checked":""}>
          <span>${t.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${N(t.descricao)}</div>
      <div class="desp-rec-val" style="color:${d}">${v(t.valor)}</div>
      <div class="desp-rec-meta">${l} de cada mês${t.ultima_geracao?" · Última: "+O(t.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${t.id}" data-tipo="${s}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${t.id}" data-tipo="${s}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${t.id}" data-tipo="${s}">Excluir</button>
      </div>
    </div>`},u=A.map(t=>o(t,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',m=S.map(t=>o(t,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${v(n)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${v(c)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${i>=0?"var(--ok)":"var(--danger)"}">${v(i)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${v(i*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${u}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${m}</div></div>
    </div>`}function V(e,n){const c=new Date,i=n<c.getFullYear()||n===c.getFullYear()&&e<c.getMonth()+1,o=`${n}-${String(e).padStart(2,"0")}`,u=P.filter(d=>d.mes===e&&d.ano===n).reduce((d,p)=>d+Number(p.valor),0),m=M.filter(d=>(d.data||"").startsWith(o)).reduce((d,p)=>d+Number(p.valor),0);let t=0,s=0;if(!i){for(const d of A){if(!d.ativa)continue;P.some($=>$.recorrente_id===d.id&&$.mes===e&&$.ano===n)||(t+=Number(d.valor))}for(const d of S){if(!d.ativa)continue;M.some($=>$.recorrente_id===d.id&&($.data||"").startsWith(o))||(s+=Number(d.valor))}}return{recReal:u,recPend:t,recProj:u+t,desReal:m,desPend:s,desProj:m+s,lucroProj:u+t-(m+s),isPast:i}}function ee(){const e=document.getElementById("content"),n=new Date,c=J,i=G,o=n.getMonth()+1,u=n.getFullYear(),m=[];for(let a=1;a<=12;a++){const g=V(a,c);m.push({label:Q[a-1],mes:a,...g,cur:a===i,hoje:a===o&&c===u})}const t=Math.max(...m.flatMap(a=>[a.recProj,a.desProj]),1),s=m[i-1];i<12||i===12&&V(1,c+1);const d=m.reduce((a,g)=>a+g.recReal,0),p=m.reduce((a,g)=>a+g.desReal,0),$=d-p,l=m.reduce((a,g)=>a+g.recProj,0),r=m.reduce((a,g)=>a+g.desProj,0),f=l-r,x=m.slice().reverse().map(a=>{const g=a.recPend>0?`<b>${v(a.recProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${v(a.recReal)} recebido · ${v(a.recPend)} a receber</div>`:v(a.recReal),E=a.desPend>0?`<b>${v(a.desProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${v(a.desReal)} pago · ${v(a.desPend)} a pagar</div>`:v(a.desReal);return`<tr>
      <td>${a.label}${a.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}${a.isPast?"":' <span style="font-size:10px;color:var(--text-3)">prev</span>'}</td>
      <td style="color:var(--accent)">${g}</td>
      <td style="color:var(--danger)">${E}</td>
      <td style="font-weight:700;color:${a.lucroProj>=0?"var(--ok)":"var(--danger)"}">${v(a.lucroProj)}</td>
    </tr>`}).join(""),k=m.map(a=>{const g=Math.round(a.recProj/t*100),E=Math.round(a.desProj/t*100);return`<div class="resumo-bg${a.cur?" cur":""}">
      <div class="resumo-bars">
        <div class="resumo-bar rec${a.isPast?"":" proj"}" style="height:${g}%" title="Receita ${v(a.recProj)}"></div>
        <div class="resumo-bar des${a.isPast?"":" proj"}" style="height:${E}%" title="Despesa ${v(a.desProj)}"></div>
      </div>
      <div class="bl">${a.label}</div>
    </div>`}).join(""),w=[];for(let a=0;a<6;a++){const g=i-1+a;if(g<12){const E=m[g];w.push(K(E))}else{const E=Math.floor(g/12),D=g%12+1,W=c+E,ce=V(D,W),oe={mes:D,...ce,cur:D===o&&W===u};w.push(K(oe))}}const h=i===o&&c===u,T=`
    <div class="resumo-picker">
      <button class="btn bg bsm" id="rsm-prev" title="Mês anterior">◀</button>
      <select class="fsl" id="rsm-mes">${B.map((a,g)=>`<option value="${g+1}"${g+1===i?" selected":""}>${a}</option>`).join("")}</select>
      <input class="fi" type="number" id="rsm-ano" value="${c}" style="width:90px;text-align:center;padding:6px 9px">
      <button class="btn bg bsm" id="rsm-next" title="Próximo mês">▶</button>
      ${h?"":'<button class="btn bg bsm" id="rsm-hoje">Voltar pra hoje</button>'}
    </div>`;e.innerHTML=`
    ${T}

    <!-- Destaque: mês em foco (o selecionado no picker) -->
    <div class="cw" style="margin-bottom:18px;border:1px solid rgba(193,255,42,.2)">
      <div class="ct" style="color:var(--accent)">${s.isPast?"Realizado":"Projeção"} — ${B[s.mes-1]} ${c}${s.hoje?" · atual":""}</div>
      <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:0;margin-top:12px">
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Receita ${s.isPast?"realizada":"prevista"}</div>
          <div class="sv" style="color:var(--accent)">${v(s.recProj)}</div>
          ${s.recPend>0?`<div class="ss">${v(s.recReal)} recebido · ${v(s.recPend)} a receber</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Despesa ${s.isPast?"paga":"prevista"}</div>
          <div class="sv" style="color:var(--danger)">${v(s.desProj)}</div>
          ${s.desPend>0?`<div class="ss">${v(s.desReal)} pago · ${v(s.desPend)} a pagar</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Lucro ${s.isPast?"realizado":"projetado"}</div>
          <div class="sv" style="color:${s.lucroProj>=0?"var(--ok)":"var(--danger)"}">${v(s.lucroProj)}</div>
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Margem</div>
          <div class="sv">${s.recProj>0?Math.round(s.lucroProj/s.recProj*100)+"%":"—"}</div>
        </div>
      </div>
    </div>

    <!-- Fluxo dos próximos 6 meses a partir do selecionado -->
    <div class="ct" style="margin-bottom:8px">Próximos meses — lucro projetado</div>
    <div class="sg" style="grid-template-columns:repeat(${w.length},1fr);margin-bottom:22px">${w.join("")}</div>

    <!-- Ano corrente -->
    <div class="sg" style="grid-template-columns:repeat(3,1fr)">
      <div class="sc"><div class="sl">Realizado em ${c}</div>
        <div class="sv" style="color:${$>=0?"var(--ok)":"var(--danger)"}">${v($)}</div>
        <div class="ss">${v(d)} − ${v(p)}</div>
      </div>
      <div class="sc"><div class="sl">Projeção ${c} (com recorrentes)</div>
        <div class="sv" style="color:${f>=0?"var(--ok)":"var(--danger)"}">${v(f)}</div>
        <div class="ss">${v(l)} − ${v(r)}</div>
      </div>
      <div class="sc"><div class="sl">Recorrentes ativas</div>
        <div class="sv">${v(A.filter(a=>a.ativa).reduce((a,g)=>a+Number(g.valor),0)-S.filter(a=>a.ativa).reduce((a,g)=>a+Number(g.valor),0))}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div>
      </div>
    </div>

    <div class="cw">
      <div class="ct">Receita vs Despesa — ${c} (projetado)</div>
      <div class="bc">${k}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center;flex-wrap:wrap">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
        <span style="opacity:.6">Barras com listras = projeção (ainda não realizada)</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal — ${c}</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro proj.</th></tr></thead>
        <tbody>${x}</tbody>
      </table>
    </div>`;const R=(a,g)=>{let E=a,D=g;E<1&&(E=12,D--),E>12&&(E=1,D++),!(D<2020||D>2099)&&(G=E,J=D,ee())};document.getElementById("rsm-prev").addEventListener("click",()=>R(i-1,c)),document.getElementById("rsm-next").addEventListener("click",()=>R(i+1,c)),document.getElementById("rsm-mes").addEventListener("change",a=>R(parseInt(a.target.value),c)),document.getElementById("rsm-ano").addEventListener("change",a=>{const g=parseInt(a.target.value);g>=2020&&g<=2099&&R(i,g)});const F=document.getElementById("rsm-hoje");F&&F.addEventListener("click",()=>R(o,u))}function K(e,n){return`<div class="sc" style="${e.cur?"border-color:rgba(197,248,42,.3)":""}">
    <div class="sl">${B[e.mes-1]}${e.cur?" · atual":""}</div>
    <div class="sv" style="color:${e.lucroProj>=0?"var(--ok)":"var(--danger)"}">${v(e.lucroProj)}</div>
    <div class="ss">${v(e.recProj)} − ${v(e.desProj)}</div>
  </div>`}function ae(e={}){const n=!e.id,c=new Date;q(n?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${B.map((i,o)=>`<option value="${o+1}"${(e.mes||c.getMonth()+1)===o+1?" selected":""}>${i}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||c.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${C(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const i={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!i.valor)return b("Valor obrigatório","err");const{error:o}=e.id?await y.from("faturamento").update(i).eq("id",e.id):await y.from("faturamento").insert(i);if(o)return b("Erro: "+o.message,"err");j(),b("Salvo"),_()})}async function pe(e){confirm("Remover?")&&(await y.from("faturamento").delete().eq("id",e),b("Removido"),_())}function te(e={}){const n=!e.id,c=new Date().toISOString().slice(0,10),i=H.map(u=>`<option value="${u.k}"${(e.categoria||"outro")===u.k?" selected":""}>${u.l}</option>`).join(""),o=!!e.parcelamento_id;if(q(n?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${C(e.descricao||"")}" placeholder="Ex: Fatura Nubank, TV Samsung, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${i}</select></div>
      <div class="fg"><label class="fl">Valor ${n?"TOTAL":""} (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data ${n?"da 1ª parcela":""} *</label>
      <input class="fi" type="date" id="d-data" value="${e.data||c}"></div>

    ${n?`
    <div class="fg" style="margin-top:11px">
      <label class="fl">Parcelas</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="fi" type="number" min="1" max="36" id="d-parc" value="1" style="width:90px">
        <span style="font-size:12px;color:var(--text-3)" id="d-parc-preview">à vista</span>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:4px">Ex: TV em 10x — gera 10 lançamentos mensais a partir da data acima.</div>
    </div>
    `:o?`
    <div style="margin-top:11px;padding:10px 12px;background:rgba(193,255,42,.06);border:1px solid rgba(193,255,42,.15);border-radius:6px;font-size:12px;color:var(--text-2)">
      ↻ Parcela ${e.parcela_num}/${e.parcelas_total} de um parcelamento. Editar aqui afeta só esta parcela.
    </div>
    `:""}
  `,`
    ${n?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    ${o?'<button class="btn bd" id="d-del-grupo">Excluir TODAS as parcelas</button>':""}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),n){const u=document.getElementById("d-parc"),m=document.getElementById("d-val"),t=document.getElementById("d-parc-preview"),s=()=>{const d=parseInt(u.value)||1,p=parseFloat(m.value)||0;d<=1?t.textContent="à vista":p>0?t.textContent=`${d}x de R$ ${(p/d).toFixed(2).replace(".",",")}`:t.textContent=`${d}x`};u.addEventListener("input",s),m.addEventListener("input",s)}document.getElementById("m-cancel").addEventListener("click",j),n||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir essa despesa?")&&(await se(e.id),j())}),o&&document.getElementById("d-del-grupo").addEventListener("click",async()=>{confirm(`Excluir TODAS as ${e.parcelas_total} parcelas desse parcelamento?`)&&(await y.from("despesas").delete().eq("parcelamento_id",e.parcelamento_id),b("Parcelamento excluído"),j(),_())}),document.getElementById("m-save").addEventListener("click",async()=>{const u=document.getElementById("d-desc").value.trim(),m=document.getElementById("d-cat").value,t=parseFloat(document.getElementById("d-val").value)||0,s=document.getElementById("d-data").value;if(!u)return b("Descrição obrigatória","err");if(!t)return b("Valor obrigatório","err");if(!s)return b("Data obrigatória","err");if(e.id){const{error:h}=await y.from("despesas").update({descricao:u,categoria:m,valor:t,data:s}).eq("id",e.id);if(h)return b("Erro: "+h.message,"err");j(),b("Salvo"),_();return}const d=Math.max(1,Math.min(36,parseInt(document.getElementById("d-parc").value)||1));if(d===1){const{error:h}=await y.from("despesas").insert({descricao:u,categoria:m,valor:t,data:s});if(h)return b("Erro: "+h.message,"err");j(),b("Despesa adicionada"),_();return}const p=crypto.randomUUID(),$=Math.round(t/d*100)/100,l=Math.round((t-$*d)*100)/100,[r,f,x]=s.split("-").map(Number),k=[];for(let h=0;h<d;h++){const T=f-1+h,R=r+Math.floor(T/12),F=T%12+1,a=new Date(R,F,0).getDate(),g=Math.min(x,a),E=`${R}-${String(F).padStart(2,"0")}-${String(g).padStart(2,"0")}`,D=h===d-1?$+l:$;k.push({descricao:`${u} (${h+1}/${d})`,categoria:m,valor:D,data:E,parcelamento_id:p,parcela_num:h+1,parcelas_total:d})}const{error:w}=await y.from("despesas").insert(k);if(w)return b("Erro: "+w.message,"err");j(),b(`${d} parcelas criadas`),_()})}async function se(e){await y.from("despesas").delete().eq("id",e),b("Removida"),_()}function re(e={}){const n=!e.id,c=H.map(i=>`<option value="${i.k}"${(e.categoria||"outro")===i.k?" selected":""}>${i.l}</option>`).join("");q(n?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${C(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="r-cat">${c}</select></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const i={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!i.descricao)return b("Descrição obrigatória","err");if(!i.valor)return b("Valor obrigatório","err");if(i.dia_mes<1||i.dia_mes>31)return b("Dia entre 1 e 31","err");const{error:o}=e.id?await y.from("despesas_recorrentes").update(i).eq("id",e.id):await y.from("despesas_recorrentes").insert({...i,ativa:!0});if(o)return b("Erro: "+o.message,"err");j(),b("Salvo"),_()})}function ie(e={}){const n=!e.id,i='<option value="">— sem cliente vinculado —</option>'+Y.filter(o=>["proposta","ativo","em_pausa","fechado"].includes(o.status)||o.id===e.cliente_id).map(o=>`<option value="${o.id}"${e.cliente_id===o.id?" selected":""}>${C(o.empresa||o.nome)}</option>`).join("");q(n?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${C(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const o={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!o.descricao)return b("Descrição obrigatória","err");if(!o.valor)return b("Valor obrigatório","err");if(o.dia_mes<1||o.dia_mes>31)return b("Dia entre 1 e 31","err");const{error:u}=e.id?await y.from("receitas_recorrentes").update(o).eq("id",e.id):await y.from("receitas_recorrentes").insert({...o,ativa:!0});if(u)return b("Erro: "+u.message,"err");j(),b("Salvo"),_()})}async function ge(e,n){const c=new Date,i=c.toISOString().slice(0,10);n==="receita"?(await y.from("faturamento").insert({mes:c.getMonth()+1,ano:c.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await y.from("receitas_recorrentes").update({ultima_geracao:i}).eq("id",e.id)):(await y.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:i,recorrente_id:e.id}),await y.from("despesas_recorrentes").update({ultima_geracao:i}).eq("id",e.id))}function N(e){return String(e??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n])}function C(e){return N(e)}export{_ as render};
