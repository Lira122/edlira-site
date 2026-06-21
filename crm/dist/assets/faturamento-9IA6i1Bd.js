import{d as b,s as M,o as L,e as _,f as E,t as m,c as p,h as j,b as G,M as q}from"./index-BTyw7Ize.js";const F=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],k=Object.fromEntries(F.map(e=>[e.k,e]));let y=[],x=[],R=[],A=[],N=[],$="receita",C=!1;async function w(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',U(),await J(),V(),T()}function U(){C||(C=!0,document.getElementById("content").addEventListener("click",async e=>{if($!=="recorrentes")return;const c=e.target.closest(".rec-edit"),r=e.target.closest(".rec-del"),s=e.target.closest(".rec-run"),a=e.target.closest(".desp-rec-active"),o=c||r||s||a;if(!o)return;const v=o.dataset.tipo,i=v==="receita"?A:R,u=v==="receita"?"receitas_recorrentes":"despesas_recorrentes",d=i.find(n=>n.id===o.dataset.rid);if(d)try{if(c)v==="receita"?H(d):Y(d);else if(r){if(!confirm(`Excluir "${d.descricao}"? (Lançamentos já gerados continuam)`))return;const{error:n}=await b.from(u).delete().eq("id",d.id);if(n)throw n;m("Excluída"),w()}else if(s)await te(d,v),m(v==="receita"?"Receita lançada":"Despesa lançada"),w();else if(a){d.ativa=a.checked;const{error:n}=await b.from(u).update({ativa:d.ativa,atualizado_em:new Date().toISOString()}).eq("id",d.id);if(n)throw n;w()}}catch(n){console.error("[recorrentes]",n),m("Erro: "+(n.message||n),"err")}}))}async function J(){const[e,c,r,s,a]=await Promise.all([b.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),M("despesas",{order:{column:"data",ascending:!1}}),M("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),M("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),M("clientes",{columns:"id,nome,empresa,status"})]);y=e.data||[],x=c.data||[],R=r.data||[],A=s.data||[],N=a.data||[]}function V(){const e=(o,v)=>`<button class="pj-tab${$===o?" on":""}" data-tab="${o}">${v}</button>`;let c="";$==="receita"&&(c='<button class="btn bp" id="btn-add">+ Receita</button>'),$==="despesas"&&(c='<button class="btn bp" id="btn-add">+ Despesa</button>'),$==="recorrentes"&&(c=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${c}
  `,document.querySelectorAll(".pj-tab").forEach(o=>o.addEventListener("click",()=>{$=o.dataset.tab,V(),T()}));const r=document.getElementById("btn-add");r&&($==="receita"&&r.addEventListener("click",()=>O()),$==="despesas"&&r.addEventListener("click",()=>z()));const s=document.getElementById("btn-add-rec-receita"),a=document.getElementById("btn-add-rec-despesa");s&&s.addEventListener("click",()=>H()),a&&a.addEventListener("click",()=>Y())}function T(){return $==="despesas"?Q():$==="recorrentes"?X():$==="resumo"?Z():K()}function K(){const e=document.getElementById("content"),c=new Date,r=c.getFullYear(),s=c.getMonth()+1,a=y.filter(t=>t.ano===r).reduce((t,l)=>t+Number(l.valor),0),o=[...new Set(y.filter(t=>t.ano===r).map(t=>t.mes))],v=o.length?a/o.length:0,i=y.reduce((t,l)=>!t||Number(l.valor)>Number(t.valor)?l:t,null),u=[];for(let t=11;t>=0;t--){const l=new Date(r,s-1-t,1),f=l.getMonth()+1,I=l.getFullYear(),h=y.filter(D=>D.mes===f&&D.ano===I).reduce((D,W)=>D+Number(W.valor),0);u.push({label:q[f-1],val:h,cur:t===0})}const d=Math.max(...u.map(t=>t.val),1),n=u.map(t=>{const l=Math.round(t.val/d*100);return`<div class="bg2">
      <div class="bv">${t.val>0?"R$"+G(t.val):""}</div>
      <div class="bar${t.cur?" cur":""}" style="height:${l}%"></div>
      <div class="bl">${t.label}</div>
    </div>`}).join(""),g=y.length?y.map(t=>`
        <tr>
          <td>${_[t.mes-1]}</td>
          <td class="tm">${t.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${p(t.valor)}</td>
          <td class="tm">${S(t.descricao||"—")}${t.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${j(t.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${t.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${t.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${r}</div><div class="sv ac">${p(a)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${p(v)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${i?p(i.valor):"—"}</div>
        <div class="ss">${i?_[i.mes-1]+" "+i.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${n}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${g}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(t=>t.addEventListener("click",()=>{const l=y.find(f=>f.id===t.dataset.id);l&&O(l)})),e.querySelectorAll(".del-fat").forEach(t=>t.addEventListener("click",()=>ee(t.dataset.id)))}function Q(){const e=document.getElementById("content"),c=new Date,r=c.getFullYear(),s=c.getMonth()+1,a=`${r}-${String(s).padStart(2,"0")}`,o=x.filter(t=>(t.data||"").startsWith(a)),v=o.reduce((t,l)=>t+Number(l.valor),0),i=x.filter(t=>(t.data||"").startsWith(String(r))).reduce((t,l)=>t+Number(l.valor),0),u=R.filter(t=>t.ativa).reduce((t,l)=>t+Number(l.valor),0),d={};for(const t of o)d[t.categoria||"outro"]=(d[t.categoria||"outro"]||0)+Number(t.valor);const n=Object.entries(d).sort(([,t],[,l])=>l-t).map(([t,l])=>{const f=k[t]||k.outro,I=v>0?Math.round(l/v*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${f.cor}"></span>
          <span class="desp-cat-name">${f.l}</span>
          <span class="desp-cat-pct">${I}%</span>
        </div>
        <div class="desp-cat-val">${p(l)}</div>
      </div>`}).join("")||'<div class="empty">Sem despesas neste mês.</div>',g=x.length?x.map(t=>{const l=k[t.categoria]||k.outro;return`<tr>
          <td class="tm">${j(t.data)}</td>
          <td class="tn">${S(t.descricao)}${t.recorrente_id?'<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>':""}</td>
          <td><span class="desp-cat-pill" style="background:${l.cor}22;color:${l.cor}">${l.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${p(t.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${t.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${t.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${_[s-1]}</div><div class="sv" style="color:var(--danger)">${p(v)}</div></div>
      <div class="sc"><div class="sl">Despesas ${r}</div><div class="sv">${p(i)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${p(u)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${_[s-1]} ${r}</div>
      <div class="desp-cat-grid">${n}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${g}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(t=>t.addEventListener("click",()=>{const l=x.find(f=>f.id===t.dataset.id);l&&z(l)})),e.querySelectorAll(".del-desp").forEach(t=>t.addEventListener("click",()=>P(t.dataset.id)))}function X(){const e=document.getElementById("content"),c=A.filter(i=>i.ativa).reduce((i,u)=>i+Number(u.valor),0),r=R.filter(i=>i.ativa).reduce((i,u)=>i+Number(u.valor),0),s=c-r,a=(i,u)=>{const d=u==="receita"?"var(--accent)":"var(--danger)",n=u==="despesa"?k[i.categoria]||k.outro:null,g=u==="receita"&&i.cliente_id?N.find(l=>l.id===i.cliente_id):null,t=i.dia_util?`${i.dia_mes}º dia útil`:`Dia ${i.dia_mes}`;return`<div class="desp-rec-card ${i.ativa?"":"paused"}" data-rid="${i.id}" data-tipo="${u}">
      <div class="desp-rec-head">
        ${n?`<span class="desp-cat-pill" style="background:${n.cor}22;color:${n.cor}">${n.l}</span>`:g?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${S(g.empresa||g.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${i.id}" data-tipo="${u}" ${i.ativa?"checked":""}>
          <span>${i.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${S(i.descricao)}</div>
      <div class="desp-rec-val" style="color:${d}">${p(i.valor)}</div>
      <div class="desp-rec-meta">${t} de cada mês${i.ultima_geracao?" · Última: "+j(i.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${i.id}" data-tipo="${u}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${i.id}" data-tipo="${u}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${i.id}" data-tipo="${u}">Excluir</button>
      </div>
    </div>`},o=A.map(i=>a(i,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',v=R.map(i=>a(i,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${p(c)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${p(r)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${s>=0?"var(--ok)":"var(--danger)"}">${p(s)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${p(s*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${o}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${v}</div></div>
    </div>`}function Z(){const e=document.getElementById("content"),c=new Date,r=c.getFullYear(),s=c.getMonth()+1,a=[];for(let d=11;d>=0;d--){const n=new Date(r,s-1-d,1),g=n.getMonth()+1,t=n.getFullYear(),l=`${t}-${String(g).padStart(2,"0")}`,f=y.filter(h=>h.mes===g&&h.ano===t).reduce((h,D)=>h+Number(D.valor),0),I=x.filter(h=>(h.data||"").startsWith(l)).reduce((h,D)=>h+Number(D.valor),0);a.push({label:q[g-1],rec:f,des:I,lucro:f-I,cur:d===0})}const o=Math.max(...a.flatMap(d=>[d.rec,d.des,Math.abs(d.lucro)]),1),v=a[a.length-1],i=a.slice().reverse().map(d=>`
    <tr>
      <td>${d.label}${d.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}</td>
      <td style="color:var(--accent);font-weight:500">${p(d.rec)}</td>
      <td style="color:var(--danger);font-weight:500">${p(d.des)}</td>
      <td style="font-weight:700;color:${d.lucro>=0?"var(--ok)":"var(--danger)"}">${p(d.lucro)}</td>
    </tr>`).join(""),u=a.map(d=>{const n=Math.round(d.rec/o*100),g=Math.round(d.des/o*100);return`<div class="resumo-bg">
      <div class="resumo-bars">
        <div class="resumo-bar rec" style="height:${n}%" title="Receita ${p(d.rec)}"></div>
        <div class="resumo-bar des" style="height:${g}%" title="Despesa ${p(d.des)}"></div>
      </div>
      <div class="bl">${d.label}</div>
    </div>`}).join("");e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receita ${_[s-1]}</div><div class="sv" style="color:var(--accent)">${p(v.rec)}</div></div>
      <div class="sc"><div class="sl">Despesa ${_[s-1]}</div><div class="sv" style="color:var(--danger)">${p(v.des)}</div></div>
      <div class="sc"><div class="sl">Lucro ${_[s-1]}</div><div class="sv" style="color:${v.lucro>=0?"var(--ok)":"var(--danger)"}">${p(v.lucro)}</div></div>
      <div class="sc"><div class="sl">Margem</div><div class="sv">${v.rec>0?Math.round(v.lucro/v.rec*100)+"%":"—"}</div></div>
    </div>
    <div class="cw">
      <div class="ct">Receita vs Despesa — últimos 12 meses</div>
      <div class="bc">${u}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro</th></tr></thead>
        <tbody>${i}</tbody>
      </table>
    </div>`}function O(e={}){const c=!e.id,r=new Date;L(c?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${_.map((s,a)=>`<option value="${a+1}"${(e.mes||r.getMonth()+1)===a+1?" selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||r.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${B(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",E),document.getElementById("m-save").addEventListener("click",async()=>{const s={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!s.valor)return m("Valor obrigatório","err");const{error:a}=e.id?await b.from("faturamento").update(s).eq("id",e.id):await b.from("faturamento").insert(s);if(a)return m("Erro: "+a.message,"err");E(),m("Salvo"),w()})}async function ee(e){confirm("Remover?")&&(await b.from("faturamento").delete().eq("id",e),m("Removido"),w())}function z(e={}){const c=!e.id,r=new Date().toISOString().slice(0,10),s=F.map(a=>`<option value="${a.k}"${(e.categoria||"outro")===a.k?" selected":""}>${a.l}</option>`).join("");L(c?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${B(e.descricao||"")}" placeholder="Ex: Fatura Nubank, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${s}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data *</label>
      <input class="fi" type="date" id="d-data" value="${e.data||r}"></div>
  `,`
    ${c?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",E),c||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir?")&&(await P(e.id),E())}),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("d-desc").value.trim(),categoria:document.getElementById("d-cat").value,valor:parseFloat(document.getElementById("d-val").value)||0,data:document.getElementById("d-data").value};if(!a.descricao)return m("Descrição obrigatória","err");if(!a.valor)return m("Valor obrigatório","err");if(!a.data)return m("Data obrigatória","err");const{error:o}=e.id?await b.from("despesas").update(a).eq("id",e.id):await b.from("despesas").insert(a);if(o)return m("Erro: "+o.message,"err");E(),m("Salvo"),w()})}async function P(e){await b.from("despesas").delete().eq("id",e),m("Removida"),w()}function Y(e={}){const c=!e.id,r=F.map(s=>`<option value="${s.k}"${(e.categoria||"outro")===s.k?" selected":""}>${s.l}</option>`).join("");L(c?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${B(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",E),document.getElementById("m-save").addEventListener("click",async()=>{const s={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!s.descricao)return m("Descrição obrigatória","err");if(!s.valor)return m("Valor obrigatório","err");if(s.dia_mes<1||s.dia_mes>31)return m("Dia entre 1 e 31","err");const{error:a}=e.id?await b.from("despesas_recorrentes").update(s).eq("id",e.id):await b.from("despesas_recorrentes").insert({...s,ativa:!0});if(a)return m("Erro: "+a.message,"err");E(),m("Salvo"),w()})}function H(e={}){const c=!e.id,s='<option value="">— sem cliente vinculado —</option>'+N.filter(a=>["proposta","ativo","em_pausa","fechado"].includes(a.status)||a.id===e.cliente_id).map(a=>`<option value="${a.id}"${e.cliente_id===a.id?" selected":""}>${B(a.empresa||a.nome)}</option>`).join("");L(c?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${B(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
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
  `),document.getElementById("m-cancel").addEventListener("click",E),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!a.descricao)return m("Descrição obrigatória","err");if(!a.valor)return m("Valor obrigatório","err");if(a.dia_mes<1||a.dia_mes>31)return m("Dia entre 1 e 31","err");const{error:o}=e.id?await b.from("receitas_recorrentes").update(a).eq("id",e.id):await b.from("receitas_recorrentes").insert({...a,ativa:!0});if(o)return m("Erro: "+o.message,"err");E(),m("Salvo"),w()})}async function te(e,c){const r=new Date,s=r.toISOString().slice(0,10);c==="receita"?(await b.from("faturamento").insert({mes:r.getMonth()+1,ano:r.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await b.from("receitas_recorrentes").update({ultima_geracao:s}).eq("id",e.id)):(await b.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:s,recorrente_id:e.id}),await b.from("despesas_recorrentes").update({ultima_geracao:s}).eq("id",e.id))}function S(e){return String(e??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c])}function B(e){return S(e)}export{w as render};
