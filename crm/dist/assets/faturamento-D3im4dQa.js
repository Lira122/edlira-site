import{d as f,s as F,o as C,e as I,f as x,t as b,c as o,h as V,b as X,M as H}from"./index-CETG5QaC.js";const T=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],S=Object.fromEntries(T.map(e=>[e.k,e]));let w=[],k=[],A=[],M=[],z=[],y="receita",O=!1;async function _(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',Z(),await ee(),Y(),W()}function Z(){O||(O=!0,document.getElementById("content").addEventListener("click",async e=>{if(y!=="recorrentes")return;const l=e.target.closest(".rec-edit"),d=e.target.closest(".rec-del"),s=e.target.closest(".rec-run"),a=e.target.closest(".desp-rec-active"),v=l||d||s||a;if(!v)return;const p=v.dataset.tipo,c=p==="receita"?M:A,n=p==="receita"?"receitas_recorrentes":"despesas_recorrentes",g=c.find(u=>u.id===v.dataset.rid);if(g)try{if(l)p==="receita"?Q(g):K(g);else if(d){if(!confirm(`Excluir "${g.descricao}"? (Lançamentos já gerados continuam)`))return;const{error:u}=await f.from(n).delete().eq("id",g.id);if(u)throw u;b("Excluída"),_()}else if(s)await de(g,p),b(p==="receita"?"Receita lançada":"Despesa lançada"),_();else if(a){g.ativa=a.checked;const{error:u}=await f.from(n).update({ativa:g.ativa,atualizado_em:new Date().toISOString()}).eq("id",g.id);if(u)throw u;_()}}catch(u){console.error("[recorrentes]",u),b("Erro: "+(u.message||u),"err")}}))}async function ee(){const[e,l,d,s,a]=await Promise.all([f.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),F("despesas",{order:{column:"data",ascending:!1}}),F("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),F("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),F("clientes",{columns:"id,nome,empresa,status"})]);w=e.data||[],k=l.data||[],A=d.data||[],M=s.data||[],z=a.data||[]}function Y(){const e=(v,p)=>`<button class="pj-tab${y===v?" on":""}" data-tab="${v}">${p}</button>`;let l="";y==="receita"&&(l='<button class="btn bp" id="btn-add">+ Receita</button>'),y==="despesas"&&(l='<button class="btn bp" id="btn-add">+ Despesa</button>'),y==="recorrentes"&&(l=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${l}
  `,document.querySelectorAll(".pj-tab").forEach(v=>v.addEventListener("click",()=>{y=v.dataset.tab,Y(),W()}));const d=document.getElementById("btn-add");d&&(y==="receita"&&d.addEventListener("click",()=>G()),y==="despesas"&&d.addEventListener("click",()=>U()));const s=document.getElementById("btn-add-rec-receita"),a=document.getElementById("btn-add-rec-despesa");s&&s.addEventListener("click",()=>Q()),a&&a.addEventListener("click",()=>K())}function W(){return y==="despesas"?te():y==="recorrentes"?se():y==="resumo"?ie():ae()}function ae(){const e=document.getElementById("content"),l=new Date,d=l.getFullYear(),s=l.getMonth()+1,a=w.filter(i=>i.ano===d).reduce((i,t)=>i+Number(t.valor),0),v=[...new Set(w.filter(i=>i.ano===d).map(i=>i.mes))],p=v.length?a/v.length:0,c=w.reduce((i,t)=>!i||Number(t.valor)>Number(i.valor)?t:i,null),n=[];for(let i=11;i>=0;i--){const t=new Date(d,s-1-i,1),m=t.getMonth()+1,E=t.getFullYear(),B=w.filter(R=>R.mes===m&&R.ano===E).reduce((R,r)=>R+Number(r.valor),0);n.push({label:H[m-1],val:B,cur:i===0})}const g=Math.max(...n.map(i=>i.val),1),u=n.map(i=>{const t=Math.round(i.val/g*100);return`<div class="bg2">
      <div class="bv">${i.val>0?"R$"+X(i.val):""}</div>
      <div class="bar${i.cur?" cur":""}" style="height:${t}%"></div>
      <div class="bl">${i.label}</div>
    </div>`}).join(""),$=w.length?w.map(i=>`
        <tr>
          <td>${I[i.mes-1]}</td>
          <td class="tm">${i.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${o(i.valor)}</td>
          <td class="tm">${L(i.descricao||"—")}${i.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${V(i.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${i.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${i.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${d}</div><div class="sv ac">${o(a)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${o(p)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${c?o(c.valor):"—"}</div>
        <div class="ss">${c?I[c.mes-1]+" "+c.ano:""}</div>
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
    </div>`,e.querySelectorAll(".edit-fat").forEach(i=>i.addEventListener("click",()=>{const t=w.find(m=>m.id===i.dataset.id);t&&G(t)})),e.querySelectorAll(".del-fat").forEach(i=>i.addEventListener("click",()=>ce(i.dataset.id)))}function te(){const e=document.getElementById("content"),l=new Date,d=l.getFullYear(),s=l.getMonth()+1,a=`${d}-${String(s).padStart(2,"0")}`,v=k.filter(t=>(t.data||"").startsWith(a)),p=k.filter(t=>(t.data||"").startsWith(String(d))),c=v.reduce((t,m)=>t+Number(m.valor),0),n=p.reduce((t,m)=>t+Number(m.valor),0),g=A.filter(t=>t.ativa).reduce((t,m)=>t+Number(m.valor),0),u={};for(const t of p)u[t.categoria||"outro"]=(u[t.categoria||"outro"]||0)+Number(t.valor);const $=Object.entries(u).sort(([,t],[,m])=>m-t).map(([t,m])=>{const E=S[t]||S.outro,B=n>0?Math.round(m/n*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${E.cor}"></span>
          <span class="desp-cat-name">${E.l}</span>
          <span class="desp-cat-pct">${B}%</span>
        </div>
        <div class="desp-cat-val">${o(m)}</div>
      </div>`}).join("")||`<div class="empty">Sem despesas em ${d}.</div>`,i=k.length?k.map(t=>{const m=S[t.categoria]||S.outro;return`<tr>
          <td class="tm">${V(t.data)}</td>
          <td class="tn">${L(t.descricao)}${t.recorrente_id?'<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>':""}</td>
          <td><span class="desp-cat-pill" style="background:${m.cor}22;color:${m.cor}">${m.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${o(t.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${t.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${t.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${I[s-1]}</div><div class="sv" style="color:var(--danger)">${o(c)}</div></div>
      <div class="sc"><div class="sl">Despesas ${d}</div><div class="sv">${o(n)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${o(g)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${d}</div>
      <div class="desp-cat-grid">${$}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${i}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(t=>t.addEventListener("click",()=>{const m=k.find(E=>E.id===t.dataset.id);m&&U(m)})),e.querySelectorAll(".del-desp").forEach(t=>t.addEventListener("click",()=>J(t.dataset.id)))}function se(){const e=document.getElementById("content"),l=M.filter(c=>c.ativa).reduce((c,n)=>c+Number(n.valor),0),d=A.filter(c=>c.ativa).reduce((c,n)=>c+Number(n.valor),0),s=l-d,a=(c,n)=>{const g=n==="receita"?"var(--accent)":"var(--danger)",u=n==="despesa"?S[c.categoria]||S.outro:null,$=n==="receita"&&c.cliente_id?z.find(t=>t.id===c.cliente_id):null,i=c.dia_util?`${c.dia_mes}º dia útil`:`Dia ${c.dia_mes}`;return`<div class="desp-rec-card ${c.ativa?"":"paused"}" data-rid="${c.id}" data-tipo="${n}">
      <div class="desp-rec-head">
        ${u?`<span class="desp-cat-pill" style="background:${u.cor}22;color:${u.cor}">${u.l}</span>`:$?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${L($.empresa||$.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${c.id}" data-tipo="${n}" ${c.ativa?"checked":""}>
          <span>${c.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${L(c.descricao)}</div>
      <div class="desp-rec-val" style="color:${g}">${o(c.valor)}</div>
      <div class="desp-rec-meta">${i} de cada mês${c.ultima_geracao?" · Última: "+V(c.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${c.id}" data-tipo="${n}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${c.id}" data-tipo="${n}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${c.id}" data-tipo="${n}">Excluir</button>
      </div>
    </div>`},v=M.map(c=>a(c,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',p=A.map(c=>a(c,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${o(l)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${o(d)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${s>=0?"var(--ok)":"var(--danger)"}">${o(s)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${o(s*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${v}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${p}</div></div>
    </div>`}function ie(){const e=document.getElementById("content"),l=new Date,d=l.getFullYear(),s=l.getMonth()+1,a=[];for(let r=1;r<=12;r++){const h=`${d}-${String(r).padStart(2,"0")}`,N=w.filter(D=>D.mes===r&&D.ano===d).reduce((D,q)=>D+Number(q.valor),0),P=k.filter(D=>(D.data||"").startsWith(h)).reduce((D,q)=>D+Number(q.valor),0);a.push({label:H[r-1],mes:r,rec:N,des:P,lucro:N-P,cur:r===s})}const v=Math.max(...a.flatMap(r=>[r.rec,r.des,Math.abs(r.lucro)]),1),p=a[s-1],c=a.reduce((r,h)=>r+h.rec,0),n=a.reduce((r,h)=>r+h.des,0),g=c-n,u=12-s+1,$=M.filter(r=>r.ativa).reduce((r,h)=>r+Number(h.valor),0),i=A.filter(r=>r.ativa).reduce((r,h)=>r+Number(h.valor),0),t=c+$*u-p.rec,m=n+i*u-p.des,E=t-m,B=a.slice().reverse().map(r=>`
    <tr>
      <td>${r.label}${r.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}</td>
      <td style="color:var(--accent);font-weight:500">${o(r.rec)}</td>
      <td style="color:var(--danger);font-weight:500">${o(r.des)}</td>
      <td style="font-weight:700;color:${r.lucro>=0?"var(--ok)":"var(--danger)"}">${o(r.lucro)}</td>
    </tr>`).join(""),R=a.map(r=>{const h=Math.round(r.rec/v*100),N=Math.round(r.des/v*100);return`<div class="resumo-bg${r.cur?" cur":""}">
      <div class="resumo-bars">
        <div class="resumo-bar rec" style="height:${h}%" title="Receita ${o(r.rec)}"></div>
        <div class="resumo-bar des" style="height:${N}%" title="Despesa ${o(r.des)}"></div>
      </div>
      <div class="bl">${r.label}</div>
    </div>`}).join("");e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receita ${I[s-1]}</div><div class="sv" style="color:var(--accent)">${o(p.rec)}</div></div>
      <div class="sc"><div class="sl">Despesa ${I[s-1]}</div><div class="sv" style="color:var(--danger)">${o(p.des)}</div></div>
      <div class="sc"><div class="sl">Lucro ${I[s-1]}</div><div class="sv" style="color:${p.lucro>=0?"var(--ok)":"var(--danger)"}">${o(p.lucro)}</div></div>
      <div class="sc"><div class="sl">Margem mês</div><div class="sv">${p.rec>0?Math.round(p.lucro/p.rec*100)+"%":"—"}</div></div>
    </div>

    <div class="sg" style="grid-template-columns:repeat(3,1fr)">
      <div class="sc"><div class="sl">Realizado em ${d}</div>
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
          <span class="sv" style="color:${g>=0?"var(--ok)":"var(--danger)"}">${o(g)}</span>
          <span style="font-size:11px;color:var(--text-3)">lucro</span>
        </div>
        <div class="ss">${o(c)} receita · ${o(n)} despesa</div>
      </div>
      <div class="sc"><div class="sl">Projeção ${d} (com recorrentes)</div>
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
          <span class="sv" style="color:${E>=0?"var(--ok)":"var(--danger)"}">${o(E)}</span>
          <span style="font-size:11px;color:var(--text-3)">lucro</span>
        </div>
        <div class="ss">${o(t)} receita · ${o(m)} despesa</div>
      </div>
      <div class="sc"><div class="sl">Recorrentes ativas</div>
        <div class="sv">${o($-i)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">lucro/mês</span></div>
        <div class="ss">${o($)} entra · ${o(i)} sai</div>
      </div>
    </div>

    <div class="cw">
      <div class="ct">Receita vs Despesa — ${d}</div>
      <div class="bc">${R}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal — ${d}</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro</th></tr></thead>
        <tbody>${B}</tbody>
      </table>
    </div>`}function G(e={}){const l=!e.id,d=new Date;C(l?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${I.map((s,a)=>`<option value="${a+1}"${(e.mes||d.getMonth()+1)===a+1?" selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||d.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${j(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",x),document.getElementById("m-save").addEventListener("click",async()=>{const s={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!s.valor)return b("Valor obrigatório","err");const{error:a}=e.id?await f.from("faturamento").update(s).eq("id",e.id):await f.from("faturamento").insert(s);if(a)return b("Erro: "+a.message,"err");x(),b("Salvo"),_()})}async function ce(e){confirm("Remover?")&&(await f.from("faturamento").delete().eq("id",e),b("Removido"),_())}function U(e={}){const l=!e.id,d=new Date().toISOString().slice(0,10),s=T.map(a=>`<option value="${a.k}"${(e.categoria||"outro")===a.k?" selected":""}>${a.l}</option>`).join("");C(l?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${j(e.descricao||"")}" placeholder="Ex: Fatura Nubank, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${s}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data *</label>
      <input class="fi" type="date" id="d-data" value="${e.data||d}"></div>
  `,`
    ${l?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",x),l||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir?")&&(await J(e.id),x())}),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("d-desc").value.trim(),categoria:document.getElementById("d-cat").value,valor:parseFloat(document.getElementById("d-val").value)||0,data:document.getElementById("d-data").value};if(!a.descricao)return b("Descrição obrigatória","err");if(!a.valor)return b("Valor obrigatório","err");if(!a.data)return b("Data obrigatória","err");const{error:v}=e.id?await f.from("despesas").update(a).eq("id",e.id):await f.from("despesas").insert(a);if(v)return b("Erro: "+v.message,"err");x(),b("Salvo"),_()})}async function J(e){await f.from("despesas").delete().eq("id",e),b("Removida"),_()}function K(e={}){const l=!e.id,d=T.map(s=>`<option value="${s.k}"${(e.categoria||"outro")===s.k?" selected":""}>${s.l}</option>`).join("");C(l?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${j(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",x),document.getElementById("m-save").addEventListener("click",async()=>{const s={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!s.descricao)return b("Descrição obrigatória","err");if(!s.valor)return b("Valor obrigatório","err");if(s.dia_mes<1||s.dia_mes>31)return b("Dia entre 1 e 31","err");const{error:a}=e.id?await f.from("despesas_recorrentes").update(s).eq("id",e.id):await f.from("despesas_recorrentes").insert({...s,ativa:!0});if(a)return b("Erro: "+a.message,"err");x(),b("Salvo"),_()})}function Q(e={}){const l=!e.id,s='<option value="">— sem cliente vinculado —</option>'+z.filter(a=>["proposta","ativo","em_pausa","fechado"].includes(a.status)||a.id===e.cliente_id).map(a=>`<option value="${a.id}"${e.cliente_id===a.id?" selected":""}>${j(a.empresa||a.nome)}</option>`).join("");C(l?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${j(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",x),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!a.descricao)return b("Descrição obrigatória","err");if(!a.valor)return b("Valor obrigatório","err");if(a.dia_mes<1||a.dia_mes>31)return b("Dia entre 1 e 31","err");const{error:v}=e.id?await f.from("receitas_recorrentes").update(a).eq("id",e.id):await f.from("receitas_recorrentes").insert({...a,ativa:!0});if(v)return b("Erro: "+v.message,"err");x(),b("Salvo"),_()})}async function de(e,l){const d=new Date,s=d.toISOString().slice(0,10);l==="receita"?(await f.from("faturamento").insert({mes:d.getMonth()+1,ano:d.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await f.from("receitas_recorrentes").update({ultima_geracao:s}).eq("id",e.id)):(await f.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:s,recorrente_id:e.id}),await f.from("despesas_recorrentes").update({ultima_geracao:s}).eq("id",e.id))}function L(e){return String(e??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l])}function j(e){return L(e)}export{_ as render};
