import{d as u,s as F,o as B,e as S,f as k,t as o,c as n,h as L,b as P,M as q}from"./index-69yFrWws.js";const R=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],I=Object.fromEntries(R.map(t=>[t.k,t]));let y=[],D=[],h=[],g="receita";async function E(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>',await N(),await K(),await N(),C(),T()}async function N(){const[t,d,c]=await Promise.all([u.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),F("despesas",{order:{column:"data",ascending:!1}}),F("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}})]);y=t.data||[],D=d.data||[],h=c.data||[]}function C(){const t=(a,s)=>`<button class="pj-tab${g===a?" on":""}" data-tab="${a}">${s}</button>`;let d="";g==="receita"&&(d='<button class="btn bp" id="btn-add">+ Receita</button>'),g==="despesas"&&(d='<button class="btn bp" id="btn-add">+ Despesa</button>'),g==="recorrentes"&&(d='<button class="btn bp" id="btn-add">+ Despesa recorrente</button>'),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${t("receita","Receita")}${t("despesas","Despesas")}${t("recorrentes","Recorrentes")}${t("resumo","Resumo")}</div>
    ${d}
  `,document.querySelectorAll(".pj-tab").forEach(a=>a.addEventListener("click",()=>{g=a.dataset.tab,C(),T()}));const c=document.getElementById("btn-add");c&&(g==="receita"&&c.addEventListener("click",()=>V()),g==="despesas"&&c.addEventListener("click",()=>O()),g==="recorrentes"&&c.addEventListener("click",()=>_()))}function T(){return g==="despesas"?W():g==="recorrentes"?G():g==="resumo"?U():Y()}function Y(){const t=document.getElementById("content"),d=new Date,c=d.getFullYear(),a=d.getMonth()+1,s=y.filter(e=>e.ano===c).reduce((e,r)=>e+Number(r.valor),0),m=[...new Set(y.filter(e=>e.ano===c).map(e=>e.mes))],v=m.length?s/m.length:0,p=y.reduce((e,r)=>!e||Number(r.valor)>Number(e.valor)?r:e,null),l=[];for(let e=11;e>=0;e--){const r=new Date(c,a-1-e,1),b=r.getMonth()+1,M=r.getFullYear(),f=y.filter(x=>x.mes===b&&x.ano===M).reduce((x,H)=>x+Number(H.valor),0);l.push({label:q[b-1],val:f,cur:e===0})}const i=Math.max(...l.map(e=>e.val),1),w=l.map(e=>{const r=Math.round(e.val/i*100);return`<div class="bg2">
      <div class="bv">${e.val>0?"R$"+P(e.val):""}</div>
      <div class="bar${e.cur?" cur":""}" style="height:${r}%"></div>
      <div class="bl">${e.label}</div>
    </div>`}).join(""),$=y.length?y.map(e=>`
        <tr>
          <td>${S[e.mes-1]}</td>
          <td class="tm">${e.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${n(e.valor)}</td>
          <td class="tm">${A(e.descricao||"—")}</td>
          <td class="tm">${L(e.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${e.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${e.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';t.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${c}</div><div class="sv ac">${n(s)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${n(v)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${p?n(p.valor):"—"}</div>
        <div class="ss">${p?S[p.mes-1]+" "+p.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${w}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${$}</tbody>
      </table>
    </div>`,t.querySelectorAll(".edit-fat").forEach(e=>e.addEventListener("click",()=>{const r=y.find(b=>b.id===e.dataset.id);r&&V(r)})),t.querySelectorAll(".del-fat").forEach(e=>e.addEventListener("click",()=>J(e.dataset.id)))}function W(){const t=document.getElementById("content"),d=new Date,c=d.getFullYear(),a=d.getMonth()+1,s=`${c}-${String(a).padStart(2,"0")}`,m=D.filter(e=>(e.data||"").startsWith(s)),v=m.reduce((e,r)=>e+Number(r.valor),0),p=D.filter(e=>(e.data||"").startsWith(String(c))).reduce((e,r)=>e+Number(r.valor),0),l=h.filter(e=>e.ativa).reduce((e,r)=>e+Number(r.valor),0),i={};for(const e of m)i[e.categoria||"outro"]=(i[e.categoria||"outro"]||0)+Number(e.valor);const w=Object.entries(i).sort(([,e],[,r])=>r-e).map(([e,r])=>{const b=I[e]||I.outro,M=v>0?Math.round(r/v*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${b.cor}"></span>
          <span class="desp-cat-name">${b.l}</span>
          <span class="desp-cat-pct">${M}%</span>
        </div>
        <div class="desp-cat-val">${n(r)}</div>
      </div>`}).join("")||'<div class="empty">Sem despesas neste mês.</div>',$=D.length?D.map(e=>{const r=I[e.categoria]||I.outro;return`<tr>
          <td class="tm">${L(e.data)}</td>
          <td class="tn">${A(e.descricao)}${e.recorrente_id?'<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>':""}</td>
          <td><span class="desp-cat-pill" style="background:${r.cor}22;color:${r.cor}">${r.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${n(e.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${e.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${e.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';t.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${S[a-1]}</div><div class="sv" style="color:var(--danger)">${n(v)}</div></div>
      <div class="sc"><div class="sl">Despesas ${c}</div><div class="sv">${n(p)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${n(l)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${S[a-1]} ${c}</div>
      <div class="desp-cat-grid">${w}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${$}</tbody>
      </table>
    </div>`,t.querySelectorAll(".edit-desp").forEach(e=>e.addEventListener("click",()=>{const r=D.find(b=>b.id===e.dataset.id);r&&O(r)})),t.querySelectorAll(".del-desp").forEach(e=>e.addEventListener("click",()=>z(e.dataset.id)))}function G(){const t=document.getElementById("content");if(!h.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma despesa recorrente</div>
      <div style="font-size:12px;margin-bottom:18px">Cadastra suas assinaturas mensais (Claude, Supabase, etc.)<br>e elas viram despesa automaticamente no dia certo.</div>
      <button class="btn bp" id="btn-first-rec">+ Adicionar recorrente</button>
    </div>`,document.getElementById("btn-first-rec").addEventListener("click",()=>_());return}const d=h.filter(a=>a.ativa).reduce((a,s)=>a+Number(s.valor),0),c=h.map(a=>{const s=I[a.categoria]||I.outro;return`<div class="desp-rec-card ${a.ativa?"":"paused"}" data-rid="${a.id}">
      <div class="desp-rec-head">
        <span class="desp-cat-pill" style="background:${s.cor}22;color:${s.cor}">${s.l}</span>
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${a.id}" ${a.ativa?"checked":""}>
          <span>${a.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${A(a.descricao)}</div>
      <div class="desp-rec-val">${n(a.valor)}</div>
      <div class="desp-rec-meta">Dia ${a.dia_mes} de cada mês${a.ultima_geracao?" · Última: "+L(a.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${a.id}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${a.id}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${a.id}">Excluir</button>
      </div>
    </div>`}).join("");t.innerHTML=`
    <div class="sg" style="grid-template-columns:1fr 1fr">
      <div class="sc"><div class="sl">Total ativas</div><div class="sv" style="color:var(--danger)">${n(d)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
      <div class="sc"><div class="sl">No ano</div><div class="sv">${n(d*12)}</div></div>
    </div>
    <div class="desp-rec-grid">${c}</div>`,t.addEventListener("click",async a=>{const s=a.target.closest(".rec-edit"),m=a.target.closest(".rec-del"),v=a.target.closest(".rec-run"),p=a.target.closest(".desp-rec-active");if(s){const l=h.find(i=>i.id===s.dataset.rid);l&&_(l)}else if(m){const l=h.find(i=>i.id===m.dataset.rid);l&&confirm(`Excluir "${l.descricao}"? (Despesas já geradas continuam)`)&&(await u.from("despesas_recorrentes").delete().eq("id",l.id),o("Excluída"),E())}else if(v){const l=h.find(i=>i.id===v.dataset.rid);l&&(await Q(l),o("Despesa lançada"),E())}else if(p){const l=h.find(i=>i.id===p.dataset.rid);l&&(l.ativa=p.checked,await u.from("despesas_recorrentes").update({ativa:l.ativa,atualizado_em:new Date().toISOString()}).eq("id",l.id),E())}})}function U(){const t=document.getElementById("content"),d=new Date,c=d.getFullYear(),a=d.getMonth()+1,s=[];for(let i=11;i>=0;i--){const w=new Date(c,a-1-i,1),$=w.getMonth()+1,e=w.getFullYear(),r=`${e}-${String($).padStart(2,"0")}`,b=y.filter(f=>f.mes===$&&f.ano===e).reduce((f,x)=>f+Number(x.valor),0),M=D.filter(f=>(f.data||"").startsWith(r)).reduce((f,x)=>f+Number(x.valor),0);s.push({label:q[$-1],rec:b,des:M,lucro:b-M,cur:i===0})}const m=Math.max(...s.flatMap(i=>[i.rec,i.des,Math.abs(i.lucro)]),1),v=s[s.length-1],p=s.slice().reverse().map(i=>`
    <tr>
      <td>${i.label}${i.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}</td>
      <td style="color:var(--accent);font-weight:500">${n(i.rec)}</td>
      <td style="color:var(--danger);font-weight:500">${n(i.des)}</td>
      <td style="font-weight:700;color:${i.lucro>=0?"var(--ok)":"var(--danger)"}">${n(i.lucro)}</td>
    </tr>`).join(""),l=s.map(i=>{const w=Math.round(i.rec/m*100),$=Math.round(i.des/m*100);return`<div class="resumo-bg">
      <div class="resumo-bars">
        <div class="resumo-bar rec" style="height:${w}%" title="Receita ${n(i.rec)}"></div>
        <div class="resumo-bar des" style="height:${$}%" title="Despesa ${n(i.des)}"></div>
      </div>
      <div class="bl">${i.label}</div>
    </div>`}).join("");t.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receita ${S[a-1]}</div><div class="sv" style="color:var(--accent)">${n(v.rec)}</div></div>
      <div class="sc"><div class="sl">Despesa ${S[a-1]}</div><div class="sv" style="color:var(--danger)">${n(v.des)}</div></div>
      <div class="sc"><div class="sl">Lucro ${S[a-1]}</div><div class="sv" style="color:${v.lucro>=0?"var(--ok)":"var(--danger)"}">${n(v.lucro)}</div></div>
      <div class="sc"><div class="sl">Margem</div><div class="sv">${v.rec>0?Math.round(v.lucro/v.rec*100)+"%":"—"}</div></div>
    </div>
    <div class="cw">
      <div class="ct">Receita vs Despesa — últimos 12 meses</div>
      <div class="bc">${l}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro</th></tr></thead>
        <tbody>${p}</tbody>
      </table>
    </div>`}function V(t={}){const d=!t.id,c=new Date;B(d?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${S.map((a,s)=>`<option value="${s+1}"${(t.mes||c.getMonth()+1)===s+1?" selected":""}>${a}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${t.ano||c.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${t.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${j(t.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",k),document.getElementById("m-save").addEventListener("click",async()=>{const a={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!a.valor)return o("Valor obrigatório","err");const{error:s}=t.id?await u.from("faturamento").update(a).eq("id",t.id):await u.from("faturamento").insert(a);if(s)return o("Erro: "+s.message,"err");k(),o("Salvo"),E()})}async function J(t){confirm("Remover?")&&(await u.from("faturamento").delete().eq("id",t),o("Removido"),E())}function O(t={}){const d=!t.id,c=new Date().toISOString().slice(0,10),a=R.map(s=>`<option value="${s.k}"${(t.categoria||"outro")===s.k?" selected":""}>${s.l}</option>`).join("");B(d?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${j(t.descricao||"")}" placeholder="Ex: Fatura Nubank, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${a}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${t.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data *</label>
      <input class="fi" type="date" id="d-data" value="${t.data||c}"></div>
  `,`
    ${d?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",k),d||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir?")&&(await z(t.id),k())}),document.getElementById("m-save").addEventListener("click",async()=>{const s={descricao:document.getElementById("d-desc").value.trim(),categoria:document.getElementById("d-cat").value,valor:parseFloat(document.getElementById("d-val").value)||0,data:document.getElementById("d-data").value};if(!s.descricao)return o("Descrição obrigatória","err");if(!s.valor)return o("Valor obrigatório","err");if(!s.data)return o("Data obrigatória","err");const{error:m}=t.id?await u.from("despesas").update(s).eq("id",t.id):await u.from("despesas").insert(s);if(m)return o("Erro: "+m.message,"err");k(),o("Salvo"),E()})}async function z(t){await u.from("despesas").delete().eq("id",t),o("Removida"),E()}function _(t={}){const d=!t.id,c=R.map(a=>`<option value="${a.k}"${(t.categoria||"outro")===a.k?" selected":""}>${a.l}</option>`).join("");B(d?"Nova despesa recorrente":"Editar recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${j(t.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="r-cat">${c}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="r-val" type="number" step="0.01" value="${t.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Dia do mês (1-28) *</label>
      <input class="fi" type="number" min="1" max="28" id="r-dia" value="${t.dia_mes||1}" style="width:120px"></div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A despesa é lançada automaticamente toda vez que você abre essa tela e chega o dia configurado.</div>
  `,`
    ${d?"":'<button class="btn bd" id="r-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",k),d||document.getElementById("r-del").addEventListener("click",async()=>{confirm("Excluir?")&&(await u.from("despesas_recorrentes").delete().eq("id",t.id),k(),o("Excluída"),E())}),document.getElementById("m-save").addEventListener("click",async()=>{const a={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,atualizado_em:new Date().toISOString()};if(!a.descricao)return o("Descrição obrigatória","err");if(!a.valor)return o("Valor obrigatório","err");if(a.dia_mes<1||a.dia_mes>28)return o("Dia entre 1 e 28","err");const{error:s}=t.id?await u.from("despesas_recorrentes").update(a).eq("id",t.id):await u.from("despesas_recorrentes").insert({...a,ativa:!0});if(s)return o("Erro: "+s.message,"err");k(),o("Salvo"),E()})}async function K(){const t=new Date,d=t.toISOString().slice(0,10),c=t.getDate(),a=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`;for(const s of h)s.ativa&&(s.ultima_geracao&&s.ultima_geracao.startsWith(a)||c<s.dia_mes||(await u.from("despesas").insert({descricao:s.descricao,categoria:s.categoria,valor:s.valor,data:`${a}-${String(s.dia_mes).padStart(2,"0")}`,recorrente_id:s.id}),await u.from("despesas_recorrentes").update({ultima_geracao:d}).eq("id",s.id)))}async function Q(t){const d=new Date().toISOString().slice(0,10);await u.from("despesas").insert({descricao:t.descricao,categoria:t.categoria,valor:t.valor,data:d,recorrente_id:t.id}),await u.from("despesas_recorrentes").update({ultima_geracao:d}).eq("id",t.id)}function A(t){return String(t??"").replace(/[&<>"']/g,d=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[d])}function j(t){return A(t)}export{E as render};
