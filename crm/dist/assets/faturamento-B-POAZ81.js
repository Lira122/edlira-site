import{d as $,s as q,o as z,e as S,f as j,t as f,c as n,h as O,b as ne,M as Z}from"./index-CxpBpl5D.js";const H=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],A=Object.fromEntries(H.map(e=>[e.k,e]));let I=[],M=[],B=[],L=[],Y=[],W=[],P="receita",G=!1,J=new Date().getMonth()+1,K=new Date().getFullYear();async function _(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',ve(),await ue(),ee(),ae()}function ve(){G||(G=!0,document.getElementById("content").addEventListener("click",async e=>{if(P!=="recorrentes")return;const l=e.target.closest(".rec-edit"),i=e.target.closest(".rec-del"),c=e.target.closest(".rec-run"),d=e.target.closest(".desp-rec-active"),v=l||i||c||d;if(!v)return;const u=v.dataset.tipo,o=u==="receita"?L:B,s=u==="receita"?"receitas_recorrentes":"despesas_recorrentes",p=o.find(g=>g.id===v.dataset.rid);if(p)try{if(l)u==="receita"?ce(p):oe(p);else if(i){if(!confirm(`Excluir "${p.descricao}"? (Lançamentos já gerados continuam)`))return;const{error:g}=await $.from(s).delete().eq("id",p.id);if(g)throw g;f("Excluída"),_()}else if(c)await fe(p,u),f(u==="receita"?"Receita lançada":"Despesa lançada"),_();else if(d){p.ativa=d.checked;const{error:g}=await $.from(s).update({ativa:p.ativa,atualizado_em:new Date().toISOString()}).eq("id",p.id);if(g)throw g;_()}}catch(g){console.error("[recorrentes]",g),f("Erro: "+(g.message||g),"err")}}))}async function ue(){const[e,l,i,c,d,v]=await Promise.all([$.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),q("despesas",{order:{column:"data",ascending:!1}}),q("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),q("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),$.from("aportes_fin").select("data,valor").order("data",{ascending:!1}),q("clientes",{columns:"id,nome,empresa,status"})]);I=e.data||[],M=l.data||[],B=i.data||[],L=c.data||[],Y=d&&!d.error?d.data||[]:[],W=v.data||[]}function ee(){const e=(v,u)=>`<button class="pj-tab${P===v?" on":""}" data-tab="${v}">${u}</button>`;let l="";P==="receita"&&(l='<button class="btn bp" id="btn-add">+ Receita</button>'),P==="despesas"&&(l='<button class="btn bp" id="btn-add">+ Despesa</button>'),P==="recorrentes"&&(l=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${l}
  `,document.querySelectorAll(".pj-tab").forEach(v=>v.addEventListener("click",()=>{P=v.dataset.tab,ee(),ae()}));const i=document.getElementById("btn-add");i&&(P==="receita"&&i.addEventListener("click",()=>se()),P==="despesas"&&i.addEventListener("click",()=>re()));const c=document.getElementById("btn-add-rec-receita"),d=document.getElementById("btn-add-rec-despesa");c&&c.addEventListener("click",()=>ce()),d&&d.addEventListener("click",()=>oe())}function ae(){return P==="despesas"?me():P==="recorrentes"?ge():P==="resumo"?te():pe()}function pe(){const e=document.getElementById("content"),l=new Date,i=l.getFullYear(),c=l.getMonth()+1,d=I.filter(a=>a.ano===i).reduce((a,r)=>a+Number(r.valor),0),v=[...new Set(I.filter(a=>a.ano===i).map(a=>a.mes))],u=v.length?d/v.length:0,o=I.reduce((a,r)=>!a||Number(r.valor)>Number(a.valor)?r:a,null),s=[];for(let a=11;a>=0;a--){const r=new Date(i,c-1-a,1),m=r.getMonth()+1,E=r.getFullYear(),k=I.filter(w=>w.mes===m&&w.ano===E).reduce((w,h)=>w+Number(h.valor),0);s.push({label:Z[m-1],val:k,cur:a===0})}const p=Math.max(...s.map(a=>a.val),1),g=s.map(a=>{const r=Math.round(a.val/p*100);return`<div class="bg2">
      <div class="bv">${a.val>0?"R$"+ne(a.val):""}</div>
      <div class="bar${a.cur?" cur":""}" style="height:${r}%"></div>
      <div class="bl">${a.label}</div>
    </div>`}).join(""),y=I.length?I.map(a=>`
        <tr>
          <td>${S[a.mes-1]}</td>
          <td class="tm">${a.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${n(a.valor)}</td>
          <td class="tm">${N(a.descricao||"—")}${a.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${O(a.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${a.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${a.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${i}</div><div class="sv ac">${n(d)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${n(u)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${o?n(o.valor):"—"}</div>
        <div class="ss">${o?S[o.mes-1]+" "+o.ano:""}</div>
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
        <tbody>${y}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(a=>a.addEventListener("click",()=>{const r=I.find(m=>m.id===a.dataset.id);r&&se(r)})),e.querySelectorAll(".del-fat").forEach(a=>a.addEventListener("click",()=>be(a.dataset.id)))}function me(){const e=document.getElementById("content"),l=new Date,i=l.getFullYear(),c=l.getMonth()+1,d=`${i}-${String(c).padStart(2,"0")}`,v=M.filter(r=>(r.data||"").startsWith(d)),u=M.filter(r=>(r.data||"").startsWith(String(i))),o=v.reduce((r,m)=>r+Number(m.valor),0),s=u.reduce((r,m)=>r+Number(m.valor),0),p=B.filter(r=>r.ativa).reduce((r,m)=>r+Number(m.valor),0),g={};for(const r of u)g[r.categoria||"outro"]=(g[r.categoria||"outro"]||0)+Number(r.valor);const y=Object.entries(g).sort(([,r],[,m])=>m-r).map(([r,m])=>{const E=A[r]||A.outro,k=s>0?Math.round(m/s*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${E.cor}"></span>
          <span class="desp-cat-name">${E.l}</span>
          <span class="desp-cat-pct">${k}%</span>
        </div>
        <div class="desp-cat-val">${n(m)}</div>
      </div>`}).join("")||`<div class="empty">Sem despesas em ${i}.</div>`,a=M.length?M.map(r=>{const m=A[r.categoria]||A.outro,E=[];return r.recorrente_id&&E.push('<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>'),r.parcelamento_id&&E.push(`<span class="desp-parc-tag" title="Parcelado">${r.parcela_num}/${r.parcelas_total}</span>`),`<tr>
          <td class="tm">${O(r.data)}</td>
          <td class="tn">${N(r.descricao)}${E.join("")}</td>
          <td><span class="desp-cat-pill" style="background:${m.cor}22;color:${m.cor}">${m.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${n(r.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${r.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${r.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${S[c-1]}</div><div class="sv" style="color:var(--danger)">${n(o)}</div></div>
      <div class="sc"><div class="sl">Despesas ${i}</div><div class="sv">${n(s)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${n(p)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${i}</div>
      <div class="desp-cat-grid">${y}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${a}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(r=>r.addEventListener("click",()=>{const m=M.find(E=>E.id===r.dataset.id);m&&re(m)})),e.querySelectorAll(".del-desp").forEach(r=>r.addEventListener("click",()=>ie(r.dataset.id)))}function ge(){const e=document.getElementById("content"),l=L.filter(o=>o.ativa).reduce((o,s)=>o+Number(s.valor),0),i=B.filter(o=>o.ativa).reduce((o,s)=>o+Number(s.valor),0),c=l-i,d=(o,s)=>{const p=s==="receita"?"var(--accent)":"var(--danger)",g=s==="despesa"?A[o.categoria]||A.outro:null,y=s==="receita"&&o.cliente_id?W.find(r=>r.id===o.cliente_id):null,a=o.dia_util?`${o.dia_mes}º dia útil`:`Dia ${o.dia_mes}`;return`<div class="desp-rec-card ${o.ativa?"":"paused"}" data-rid="${o.id}" data-tipo="${s}">
      <div class="desp-rec-head">
        ${g?`<span class="desp-cat-pill" style="background:${g.cor}22;color:${g.cor}">${g.l}</span>`:y?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${N(y.empresa||y.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${o.id}" data-tipo="${s}" ${o.ativa?"checked":""}>
          <span>${o.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${N(o.descricao)}</div>
      <div class="desp-rec-val" style="color:${p}">${n(o.valor)}</div>
      <div class="desp-rec-meta">${a} de cada mês${o.ultima_geracao?" · Última: "+O(o.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${o.id}" data-tipo="${s}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${o.id}" data-tipo="${s}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${o.id}" data-tipo="${s}">Excluir</button>
      </div>
    </div>`},v=L.map(o=>d(o,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',u=B.map(o=>d(o,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${n(l)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${n(i)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${c>=0?"var(--ok)":"var(--danger)"}">${n(c)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${n(c*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${v}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${u}</div></div>
    </div>`}function V(e,l){const i=new Date,c=l<i.getFullYear()||l===i.getFullYear()&&e<i.getMonth()+1,d=`${l}-${String(e).padStart(2,"0")}`,v=I.filter(a=>a.mes===e&&a.ano===l).reduce((a,r)=>a+Number(r.valor),0),u=M.filter(a=>(a.data||"").startsWith(d)).reduce((a,r)=>a+Number(r.valor),0);let o=0,s=0;if(!c){for(const a of L){if(!a.ativa)continue;I.some(m=>m.recorrente_id===a.id&&m.mes===e&&m.ano===l)||(o+=Number(a.valor))}for(const a of B){if(!a.ativa)continue;M.some(m=>m.recorrente_id===a.id&&(m.data||"").startsWith(d))||(s+=Number(a.valor))}}const p=Y.filter(a=>(a.data||"").startsWith(d)).reduce((a,r)=>a+Number(r.valor||0),0),g=v+o-(u+s),y=g-p;return{recReal:v,recPend:o,recProj:v+o,desReal:u,desPend:s,desProj:u+s,lucroProj:g,aportes:p,sobra:y,isPast:c}}function te(){const e=document.getElementById("content"),l=new Date,i=K,c=J,d=l.getMonth()+1,v=l.getFullYear(),u=[];for(let t=1;t<=12;t++){const b=V(t,i);u.push({label:Z[t-1],mes:t,...b,cur:t===c,hoje:t===d&&i===v})}const o=Math.max(...u.flatMap(t=>[t.recProj,t.desProj]),1),s=u[c-1];c<12||c===12&&V(1,i+1);const p=u.reduce((t,b)=>t+b.recReal,0),g=u.reduce((t,b)=>t+b.desReal,0),y=p-g,a=u.reduce((t,b)=>t+b.recProj,0),r=u.reduce((t,b)=>t+b.desProj,0),m=a-r,E=u.slice().reverse().map(t=>{const b=t.recPend>0?`<b>${n(t.recProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${n(t.recReal)} recebido · ${n(t.recPend)} a receber</div>`:n(t.recReal),x=t.desPend>0?`<b>${n(t.desProj)}</b><div style="font-size:10px;color:var(--text-3);font-weight:400">${n(t.desReal)} pago · ${n(t.desPend)} a pagar</div>`:n(t.desReal);return`<tr>
      <td>${t.label}${t.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}${t.isPast?"":' <span style="font-size:10px;color:var(--text-3)">prev</span>'}</td>
      <td style="color:var(--accent)">${b}</td>
      <td style="color:var(--danger)">${x}</td>
      <td style="font-weight:700;color:${t.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(t.lucroProj)}</td>
    </tr>`}).join(""),k=u.map(t=>{const b=Math.round(t.recProj/o*100),x=Math.round(t.desProj/o*100);return`<div class="resumo-bg${t.cur?" cur":""}">
      <div class="resumo-bars">
        <div class="resumo-bar rec${t.isPast?"":" proj"}" style="height:${b}%" title="Receita ${n(t.recProj)}"></div>
        <div class="resumo-bar des${t.isPast?"":" proj"}" style="height:${x}%" title="Despesa ${n(t.desProj)}"></div>
      </div>
      <div class="bl">${t.label}</div>
    </div>`}).join(""),w=[];for(let t=0;t<6;t++){const b=c-1+t;if(b<12){const x=u[b];w.push(Q(x))}else{const x=Math.floor(b/12),D=b%12+1,U=i+x,de=V(D,U),le={mes:D,...de,cur:D===d&&U===v};w.push(Q(le))}}const h=c===d&&i===v,T=`
    <div class="resumo-picker">
      <button class="btn bg bsm" id="rsm-prev" title="Mês anterior">◀</button>
      <select class="fsl" id="rsm-mes">${S.map((t,b)=>`<option value="${b+1}"${b+1===c?" selected":""}>${t}</option>`).join("")}</select>
      <input class="fi" type="number" id="rsm-ano" value="${i}" style="width:90px;text-align:center;padding:6px 9px">
      <button class="btn bg bsm" id="rsm-next" title="Próximo mês">▶</button>
      ${h?"":'<button class="btn bg bsm" id="rsm-hoje">Voltar pra hoje</button>'}
    </div>`;e.innerHTML=`
    ${T}

    <!-- Destaque: mês em foco (o selecionado no picker) -->
    <div class="cw" style="margin-bottom:18px;border:1px solid rgba(193,255,42,.2)">
      <div class="ct" style="color:var(--accent)">${s.isPast?"Realizado":"Projeção"} — ${S[s.mes-1]} ${i}${s.hoje?" · atual":""}</div>
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:0;margin-top:12px">
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Receita ${s.isPast?"realizada":"prevista"}</div>
          <div class="sv" style="color:var(--accent)">${n(s.recProj)}</div>
          ${s.recPend>0?`<div class="ss">${n(s.recReal)} recebido · ${n(s.recPend)} a receber</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Despesa ${s.isPast?"paga":"prevista"}</div>
          <div class="sv" style="color:var(--danger)">${n(s.desProj)}</div>
          ${s.desPend>0?`<div class="ss">${n(s.desReal)} pago · ${n(s.desPend)} a pagar</div>`:""}
        </div>
        <div class="sc" style="background:var(--bg-alt)">
          <div class="sl">Lucro bruto</div>
          <div class="sv" style="color:${s.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(s.lucroProj)}</div>
          <div class="ss">Margem ${s.recProj>0?Math.round(s.lucroProj/s.recProj*100)+"%":"—"}</div>
        </div>
      </div>

      <!-- Linha 2: o que sobra pra você depois dos aportes -->
      <div class="sg" style="grid-template-columns:repeat(2,1fr);margin:10px 0 0">
        <div class="sc" style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15)">
          <div class="sl">Comprometido em investimento</div>
          <div class="sv" style="color:#A78BFA">${n(s.aportes)}</div>
          <div class="ss">${s.aportes>0?`${X(s.mes,i)} aporte${X(s.mes,i)===1?"":"s"} em Liberdade`:"nenhum aporte registrado"}</div>
        </div>
        <div class="sc" style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.18)">
          <div class="sl">Sobrou pra você</div>
          <div class="sv" style="color:${s.sobra>=0?"#34D399":"var(--danger)"}">${n(s.sobra)}</div>
          <div class="ss">${s.lucroProj>0?`${Math.round(s.aportes/s.lucroProj*100)}% do lucro indo pra investimento`:"lucro insuficiente"}</div>
        </div>
      </div>
    </div>

    <!-- Fluxo dos próximos 6 meses a partir do selecionado -->
    <div class="ct" style="margin-bottom:8px">Próximos meses — lucro projetado</div>
    <div class="sg" style="grid-template-columns:repeat(${w.length},1fr);margin-bottom:22px">${w.join("")}</div>

    <!-- Ano corrente -->
    <div class="sg" style="grid-template-columns:repeat(3,1fr)">
      <div class="sc"><div class="sl">Realizado em ${i}</div>
        <div class="sv" style="color:${y>=0?"var(--ok)":"var(--danger)"}">${n(y)}</div>
        <div class="ss">${n(p)} − ${n(g)}</div>
      </div>
      <div class="sc"><div class="sl">Projeção ${i} (com recorrentes)</div>
        <div class="sv" style="color:${m>=0?"var(--ok)":"var(--danger)"}">${n(m)}</div>
        <div class="ss">${n(a)} − ${n(r)}</div>
      </div>
      <div class="sc"><div class="sl">Recorrentes ativas</div>
        <div class="sv">${n(L.filter(t=>t.ativa).reduce((t,b)=>t+Number(b.valor),0)-B.filter(t=>t.ativa).reduce((t,b)=>t+Number(b.valor),0))}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div>
      </div>
    </div>

    <div class="cw">
      <div class="ct">Receita vs Despesa — ${i} (projetado)</div>
      <div class="bc">${k}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center;flex-wrap:wrap">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
        <span style="opacity:.6">Barras com listras = projeção (ainda não realizada)</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal — ${i}</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro proj.</th></tr></thead>
        <tbody>${E}</tbody>
      </table>
    </div>`;const R=(t,b)=>{let x=t,D=b;x<1&&(x=12,D--),x>12&&(x=1,D++),!(D<2020||D>2099)&&(J=x,K=D,te())};document.getElementById("rsm-prev").addEventListener("click",()=>R(c-1,i)),document.getElementById("rsm-next").addEventListener("click",()=>R(c+1,i)),document.getElementById("rsm-mes").addEventListener("change",t=>R(parseInt(t.target.value),i)),document.getElementById("rsm-ano").addEventListener("change",t=>{const b=parseInt(t.target.value);b>=2020&&b<=2099&&R(c,b)});const F=document.getElementById("rsm-hoje");F&&F.addEventListener("click",()=>R(d,v))}function Q(e,l){const i=e.aportes>0;return`<div class="sc" style="${e.cur?"border-color:rgba(197,248,42,.3)":""}">
    <div class="sl">${S[e.mes-1]}${e.cur?" · atual":""}</div>
    <div class="sv" style="color:${e.lucroProj>=0?"var(--ok)":"var(--danger)"}">${n(e.lucroProj)}</div>
    <div class="ss">${n(e.recProj)} − ${n(e.desProj)}</div>
    ${i?`<div class="ss" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--line)">
      <span style="color:#A78BFA">−${n(e.aportes)}</span> aporte
      <div style="color:${e.sobra>=0?"#34D399":"var(--danger)"};font-weight:600;margin-top:2px">${n(e.sobra)} sobra</div>
    </div>`:""}
  </div>`}function X(e,l){const i=`${l}-${String(e).padStart(2,"0")}`;return Y.filter(c=>(c.data||"").startsWith(i)).length}function se(e={}){const l=!e.id,i=new Date;z(l?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${S.map((c,d)=>`<option value="${d+1}"${(e.mes||i.getMonth()+1)===d+1?" selected":""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||i.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${C(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const c={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!c.valor)return f("Valor obrigatório","err");const{error:d}=e.id?await $.from("faturamento").update(c).eq("id",e.id):await $.from("faturamento").insert(c);if(d)return f("Erro: "+d.message,"err");j(),f("Salvo"),_()})}async function be(e){confirm("Remover?")&&(await $.from("faturamento").delete().eq("id",e),f("Removido"),_())}function re(e={}){const l=!e.id,i=new Date().toISOString().slice(0,10),c=H.map(v=>`<option value="${v.k}"${(e.categoria||"outro")===v.k?" selected":""}>${v.l}</option>`).join(""),d=!!e.parcelamento_id;if(z(l?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${C(e.descricao||"")}" placeholder="Ex: Fatura Nubank, TV Samsung, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${c}</select></div>
      <div class="fg"><label class="fl">Valor ${l?"TOTAL":""} (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data ${l?"da 1ª parcela":""} *</label>
      <input class="fi" type="date" id="d-data" value="${e.data||i}"></div>

    ${l?`
    <div class="fg" style="margin-top:11px">
      <label class="fl">Parcelas</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="fi" type="number" min="1" max="36" id="d-parc" value="1" style="width:90px">
        <span style="font-size:12px;color:var(--text-3)" id="d-parc-preview">à vista</span>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:4px">Ex: TV em 10x — gera 10 lançamentos mensais a partir da data acima.</div>
    </div>
    `:d?`
    <div style="margin-top:11px;padding:10px 12px;background:rgba(193,255,42,.06);border:1px solid rgba(193,255,42,.15);border-radius:6px;font-size:12px;color:var(--text-2)">
      ↻ Parcela ${e.parcela_num}/${e.parcelas_total} de um parcelamento. Editar aqui afeta só esta parcela.
    </div>
    `:""}
  `,`
    ${l?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    ${d?'<button class="btn bd" id="d-del-grupo">Excluir TODAS as parcelas</button>':""}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),l){const v=document.getElementById("d-parc"),u=document.getElementById("d-val"),o=document.getElementById("d-parc-preview"),s=()=>{const p=parseInt(v.value)||1,g=parseFloat(u.value)||0;p<=1?o.textContent="à vista":g>0?o.textContent=`${p}x de R$ ${(g/p).toFixed(2).replace(".",",")}`:o.textContent=`${p}x`};v.addEventListener("input",s),u.addEventListener("input",s)}document.getElementById("m-cancel").addEventListener("click",j),l||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir essa despesa?")&&(await ie(e.id),j())}),d&&document.getElementById("d-del-grupo").addEventListener("click",async()=>{confirm(`Excluir TODAS as ${e.parcelas_total} parcelas desse parcelamento?`)&&(await $.from("despesas").delete().eq("parcelamento_id",e.parcelamento_id),f("Parcelamento excluído"),j(),_())}),document.getElementById("m-save").addEventListener("click",async()=>{const v=document.getElementById("d-desc").value.trim(),u=document.getElementById("d-cat").value,o=parseFloat(document.getElementById("d-val").value)||0,s=document.getElementById("d-data").value;if(!v)return f("Descrição obrigatória","err");if(!o)return f("Valor obrigatório","err");if(!s)return f("Data obrigatória","err");if(e.id){const{error:h}=await $.from("despesas").update({descricao:v,categoria:u,valor:o,data:s}).eq("id",e.id);if(h)return f("Erro: "+h.message,"err");j(),f("Salvo"),_();return}const p=Math.max(1,Math.min(36,parseInt(document.getElementById("d-parc").value)||1));if(p===1){const{error:h}=await $.from("despesas").insert({descricao:v,categoria:u,valor:o,data:s});if(h)return f("Erro: "+h.message,"err");j(),f("Despesa adicionada"),_();return}const g=crypto.randomUUID(),y=Math.round(o/p*100)/100,a=Math.round((o-y*p)*100)/100,[r,m,E]=s.split("-").map(Number),k=[];for(let h=0;h<p;h++){const T=m-1+h,R=r+Math.floor(T/12),F=T%12+1,t=new Date(R,F,0).getDate(),b=Math.min(E,t),x=`${R}-${String(F).padStart(2,"0")}-${String(b).padStart(2,"0")}`,D=h===p-1?y+a:y;k.push({descricao:`${v} (${h+1}/${p})`,categoria:u,valor:D,data:x,parcelamento_id:g,parcela_num:h+1,parcelas_total:p})}const{error:w}=await $.from("despesas").insert(k);if(w)return f("Erro: "+w.message,"err");j(),f(`${p} parcelas criadas`),_()})}async function ie(e){await $.from("despesas").delete().eq("id",e),f("Removida"),_()}function oe(e={}){const l=!e.id,i=H.map(c=>`<option value="${c.k}"${(e.categoria||"outro")===c.k?" selected":""}>${c.l}</option>`).join("");z(l?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${C(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="r-cat">${i}</select></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const c={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!c.descricao)return f("Descrição obrigatória","err");if(!c.valor)return f("Valor obrigatório","err");if(c.dia_mes<1||c.dia_mes>31)return f("Dia entre 1 e 31","err");const{error:d}=e.id?await $.from("despesas_recorrentes").update(c).eq("id",e.id):await $.from("despesas_recorrentes").insert({...c,ativa:!0});if(d)return f("Erro: "+d.message,"err");j(),f("Salvo"),_()})}function ce(e={}){const l=!e.id,c='<option value="">— sem cliente vinculado —</option>'+W.filter(d=>["proposta","ativo","em_pausa","fechado"].includes(d.status)||d.id===e.cliente_id).map(d=>`<option value="${d.id}"${e.cliente_id===d.id?" selected":""}>${C(d.empresa||d.nome)}</option>`).join("");z(l?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${C(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rr-cli">${c}</select></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",j),document.getElementById("m-save").addEventListener("click",async()=>{const d={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!d.descricao)return f("Descrição obrigatória","err");if(!d.valor)return f("Valor obrigatório","err");if(d.dia_mes<1||d.dia_mes>31)return f("Dia entre 1 e 31","err");const{error:v}=e.id?await $.from("receitas_recorrentes").update(d).eq("id",e.id):await $.from("receitas_recorrentes").insert({...d,ativa:!0});if(v)return f("Erro: "+v.message,"err");j(),f("Salvo"),_()})}async function fe(e,l){const i=new Date,c=i.toISOString().slice(0,10);l==="receita"?(await $.from("faturamento").insert({mes:i.getMonth()+1,ano:i.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await $.from("receitas_recorrentes").update({ultima_geracao:c}).eq("id",e.id)):(await $.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:c,recorrente_id:e.id}),await $.from("despesas_recorrentes").update({ultima_geracao:c}).eq("id",e.id))}function N(e){return String(e??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l])}function C(e){return N(e)}export{_ as render};
