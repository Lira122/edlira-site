import{d as $,t as b,c as u,o as R,f as M,M as D,h as U}from"./index-WdxUK1KB.js";let g=null,m=[],k=[],H=[],r={metaId:null,aporte:2e3,meses:60,taxa:14.25};const B=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],L=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"];async function A(){const t=document.getElementById("content");if(t.innerHTML='<div class="empty">Carregando…</div>',await Q(),await Z(),!r.metaId||!m.find(e=>e.id===r.metaId)){const e=m.find(a=>a.principal)||m[0];r.metaId=(e==null?void 0:e.id)||null}r.aporte=Math.max(r.aporte,E()),r.taxa=Number(g.selic_aa)||14.25,t.innerHTML=tt(),ct(t)}async function Q(){const[t,e,a,s]=await Promise.all([$.from("config_fin").select("*").eq("id","main").maybeSingle(),$.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),$.from("aportes_fin").select("*").order("data",{ascending:!1}),$.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1})]);t.error&&b("config_fin: "+t.error.message,"err"),e.error&&b("metas_fin: "+e.error.message,"err"),a.error&&b("aportes_fin: "+a.error.message,"err"),g=t.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},m=e.data||[],k=a.data||[],H=s.data||[]}async function Z(){var t;try{const e=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!e.ok)return;const a=await e.json(),s=Number((t=a==null?void 0:a[0])==null?void 0:t.valor);if(!isFinite(s)||s<=0)return;const i=Number(g.selic_aa);Math.abs(s-i)>.01?(g.selic_aa=s,await $.from("config_fin").upsert({id:"main",selic_aa:s,atualizado_em:new Date().toISOString()}),b(`Selic atualizada: ${s.toFixed(2)}% a.a.`)):g.selic_aa=s}catch{}}function N({pv:t,pmt:e,taxaAA:a,meses:s}){const i=Math.pow(1+a/100,.08333333333333333)-1,l=[];let n=t;for(let o=0;o<=s;o++)o>0&&(n=n*(1+i)+e),l.push({mes:o,saldo:n,aportado:t+e*o,juros:n-t-e*o});return l}function I({pv:t,pmt:e,taxaAA:a,meta:s}){if(t>=s)return 0;const i=Math.pow(1+a/100,1/12)-1;if(e<=0&&t*(1+i)<=t)return null;let l=t,n=0;for(;n<1200;)if(l=l*(1+i)+e,n++,l>=s)return n;return null}function O(t,e){return H.filter(a=>a.ano===t&&a.mes===e).reduce((a,s)=>a+Number(s.valor||0),0)}function P(){const t=new Date;let e=0,a=0;for(let s=1;s<=6;s++){const i=new Date(t.getFullYear(),t.getMonth()-s,1),l=O(i.getFullYear(),i.getMonth()+1);l>0&&(e+=l,a++)}return a?e/a:0}function T(){const t=new Date;return O(t.getFullYear(),t.getMonth()+1)}function E(){const t=Number((g==null?void 0:g.aporte_pct_faturamento)||20)/100,e=P()||T();return Math.max(0,Math.round(e*t))}function _(t){const e=k.filter(a=>a.meta_id===t.id).reduce((a,s)=>a+Number(s.valor||0),0);return Number(t.valor_inicial||0)+e}function q(t){return k.filter(e=>e.meta_id===t.id)}function K(t){const e=new Date().toISOString().slice(0,7);return k.filter(a=>(t?a.meta_id===t:!0)&&(a.data||"").startsWith(e)).reduce((a,s)=>a+Number(s.valor||0),0)}function X(t){const e=E()||1;let a=0;const s=new Date;for(let i=0;i<36;i++){const n=new Date(s.getFullYear(),s.getMonth()-i,1).toISOString().slice(0,7),o=k.filter(c=>(t?c.meta_id===t:!0)&&(c.data||"").startsWith(n)).reduce((c,d)=>c+Number(d.valor||0),0);if(o>=e&&o>0)a++;else break}return a}function tt(){const t=m.find(s=>s.principal)||m[0],e=m.filter(s=>s!==t),a=m.find(s=>s.id===r.metaId)||t;return`
  <div class="lib">
    ${t?at(t):et()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${e.map(st).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${it(a)}
    ${lt(a)}
    ${nt()}
  </div>`}function et(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function at(t){const e=_(t),a=Number(t.valor_alvo),s=Math.min(100,e/a*100),i=E(),l=K(t.id),n=X(t.id),o=I({pv:e,pmt:i,taxaAA:Number(g.selic_aa),meta:a});return`
  <div class="lib-hero" style="--meta-color:${t.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${t.icone||"🎯"}</span> META PRINCIPAL · ${y(t.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${ut(e)}</div>
      <div class="lib-hero-sub">
        de <strong>${u(a)}</strong>
        · ${s.toFixed(1)}% do caminho
        ${o!=null?` · faltam <strong>${o}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${s.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip"><b>Selic</b> ${Number(g.selic_aa).toFixed(2)}% a.a. <small>(BCB)</small></span>
        <span class="lib-chip"><b>Aporte sug.</b> ${u(i)}/mês <small>(${Number(g.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${u(l)} ${l>=i?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${n} ${n===1?"mês":"meses"} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${ot(s,t.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${t.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${t.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function st(t){const e=_(t),a=Number(t.valor_alvo),s=Math.min(100,e/a*100),i=t.cor||"#C5F82A",l=E(),n=I({pv:e,pmt:l,taxaAA:Number(g.selic_aa),meta:a}),o=e>=a;return`
  <div class="lib-meta-card${o?" done":""}" style="--meta-color:${i}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${Y(i,.14)};color:${i}">${t.icone||"🎯"}</div>
      <div class="lib-meta-name">${y(t.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${t.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${u(e)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${u(a)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${s.toFixed(2)}%;background:${i}"></div></div>
    <div class="lib-meta-foot">
      <span>${s.toFixed(0)}%</span>
      ${o?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${n!=null?`${n}m no ritmo`:"sem prazo"}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${t.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${t.id}">Simular</button>
    </div>
  </div>`}function it(t){if(!t)return"";const e=_(t),a=Number(t.valor_alvo),s=N({pv:e,pmt:r.aporte,taxaAA:r.taxa,meses:r.meses}),i=s[s.length-1],l=e+r.aporte*r.meses,n=i.saldo-l,o=I({pv:e,pmt:r.aporte,taxaAA:r.taxa,meta:a});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${u(e)}</div>
      <div class="lib-stat-sub">${q(t).length} aporte${q(t).length===1?"":"s"} registrado${q(t).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${u(P())}</div>
      <div class="lib-stat-sub">Mês atual: ${u(T())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${r.meses}m</div>
      <div class="lib-stat-val ac">${u(i.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${u(n)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${u(Math.max(0,a-e))}</div>
      <div class="lib-stat-sub">${o!=null?`Bate em ${J(o)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function lt(t){if(!t)return"";const e=_(t),a=Number(t.valor_alvo),s=N({pv:e,pmt:r.aporte,taxaAA:r.taxa,meses:r.meses}),i=E()||1e3;return`
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${y(t.nome)}</strong>
          ${m.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${m.map(l=>`<option value="${l.id}"${l.id===t.id?" selected":""}>${l.icone||"🎯"} ${y(l.nome)}</option>`).join("")}
            </select>
          `:""}
        </div>
      </div>
    </div>

    <div class="lib-sim">
      <div class="lib-sim-controls">
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Aporte mensal</label>
            <span class="lib-slider-v">${u(r.aporte)}</span>
          </div>
          <input type="range" id="sim-aporte" min="0" max="20000" step="100" value="${r.aporte}">
        </div>
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Taxa anual</label>
            <span class="lib-slider-v">${r.taxa.toFixed(2)}% a.a.</span>
          </div>
          <input type="range" id="sim-taxa" min="4" max="25" step="0.25" value="${r.taxa}">
        </div>
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Prazo</label>
            <span class="lib-slider-v">${r.meses} meses (${(r.meses/12).toFixed(1)} anos)</span>
          </div>
          <input type="range" id="sim-meses" min="6" max="240" step="1" value="${r.meses}">
        </div>

        <div class="lib-sim-quick">
          <button class="lib-qk" data-pmt="${i}">Sug. ${u(i)}</button>
          <button class="lib-qk" data-pmt="2000">R$ 2k</button>
          <button class="lib-qk" data-pmt="5000">R$ 5k</button>
          <button class="lib-qk" data-pmt="10000">R$ 10k</button>
        </div>
      </div>

      <div class="lib-sim-chart">
        ${W(s,a)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${u(a)}</span>
        </div>
      </div>
    </div>
  </div>`}function ot(t,e){const s=2*Math.PI*86,i=s*Math.min(100,t)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${mt(e,30)}"/>
          <stop offset=".5" stop-color="${e}"/>
          <stop offset="1" stop-color="${pt(e,25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="86" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="86" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${i} ${s-i}"
              stroke-dashoffset="${s/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${t.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`}function W(t,e){const i={t:14,r:14,b:24,l:50},l=640-i.l-i.r,n=220-i.t-i.b,o=Math.max(e,...t.map(v=>v.saldo))*1.05,c=v=>i.l+v/(t.length-1)*l,d=v=>i.t+n-v/o*n,p=v=>t.map((f,F)=>`${F===0?"M":"L"} ${c(F).toFixed(1)} ${d(f[v]).toFixed(1)}`).join(" "),h=`${t.map((v,f)=>`${f===0?"M":"L"} ${c(f).toFixed(1)} ${d(v.saldo).toFixed(1)}`).join(" ")} L ${c(t.length-1).toFixed(1)} ${d(0).toFixed(1)} L ${i.l} ${d(0).toFixed(1)} Z`,x=[0,.25,.5,.75,1].map(v=>{const f=o*v;return`<g><line x1="${i.l}" x2="${640-i.r}" y1="${d(f)}" y2="${d(f)}" stroke="rgba(255,255,255,.05)" /><text x="${i.l-8}" y="${d(f)+3}" font-size="9" fill="rgba(255,255,255,.35)" text-anchor="end" font-family="JetBrains Mono">${z(f)}</text></g>`}).join(""),C=Math.max(1,Math.round(t.length/8)),V=t.filter((v,f)=>f%C===0).map((v,f)=>{const F=f*C;return`<text x="${c(F)}" y="214" font-size="9" fill="rgba(255,255,255,.35)" text-anchor="middle" font-family="JetBrains Mono">${v.mes}m</text>`}).join(""),w=d(e),G=e<=o?`<line x1="${i.l}" x2="${640-i.r}" y1="${w}" y2="${w}" stroke="rgba(255,255,255,.35)" stroke-dasharray="4 4"/>
       <text x="${640-i.r-4}" y="${w-5}" font-size="9" text-anchor="end" fill="rgba(255,255,255,.5)" font-family="JetBrains Mono">META ${z(e)}</text>`:"";return`
  <svg class="lib-chart" viewBox="0 0 640 220" preserveAspectRatio="none">
    <defs>
      <linearGradient id="lg-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#C5F82A" stop-opacity=".35"/>
        <stop offset="1" stop-color="#C5F82A" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${x}
    ${G}
    <path d="${h}" fill="url(#lg-area)"/>
    <path d="${p("aportado")}" fill="none" stroke="#4A9EFF" stroke-width="1.5" stroke-dasharray="3 3" opacity=".7"/>
    <path d="${p("juros")}"    fill="none" stroke="#A78BFA" stroke-width="1.5" opacity=".75"/>
    <path d="${p("saldo")}"    fill="none" stroke="#C5F82A" stroke-width="2.2"/>
    ${V}
  </svg>`}function nt(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${k.length?rt():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function rt(){const t={};for(const e of k){const a=(e.data||"").slice(0,7);t[a]||(t[a]=[]),t[a].push(e)}return Object.entries(t).sort((e,a)=>a[0].localeCompare(e[0])).map(([e,a])=>{const[s,i]=e.split("-"),l=a.reduce((n,o)=>n+Number(o.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${D[parseInt(i)-1]} / ${s}</span>
        <span class="lib-mes-tot">${u(l)}</span>
      </div>
      ${a.map(n=>{const o=m.find(c=>c.id===n.meta_id);return`
        <div class="lib-ap-row">
          <div class="lib-ap-data">${U(n.data)}</div>
          <div class="lib-ap-meta">${o?`<span class="lib-ap-tag" style="background:${Y(o.cor||"#C5F82A",.15)};color:${o.cor||"#C5F82A"}">${o.icone||"🎯"} ${y(o.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${y(n.fonte||"manual")}${n.observacao?" · "+y(n.observacao):""}</div>
          <div class="lib-ap-val">${u(Number(n.valor))}</div>
          <button class="lib-ap-del" data-aid="${n.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function ct(t){var e,a,s,i;t.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(l=>l.addEventListener("click",()=>j())),(e=t.querySelector("#sim-aporte"))==null||e.addEventListener("input",l=>S({aporte:+l.target.value})),(a=t.querySelector("#sim-taxa"))==null||a.addEventListener("input",l=>S({taxa:+l.target.value})),(s=t.querySelector("#sim-meses"))==null||s.addEventListener("input",l=>S({meses:+l.target.value})),(i=t.querySelector("#sim-meta"))==null||i.addEventListener("change",l=>{r.metaId=l.target.value,A()}),t.querySelectorAll(".lib-qk").forEach(l=>l.addEventListener("click",()=>S({aporte:+l.dataset.pmt}))),t.addEventListener("click",async l=>{const n=l.target.closest("[data-aporte]"),o=l.target.closest("[data-sim]"),c=l.target.closest("[data-meta-edit]"),d=l.target.closest(".lib-ap-del");if(n){dt({metaId:n.dataset.aporte||null});return}if(o){r.metaId=o.dataset.sim,A(),setTimeout(()=>{var p;return(p=document.querySelector(".lib-sim"))==null?void 0:p.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(c){const p=m.find(h=>h.id===c.dataset.metaEdit);p&&j(p);return}if(d){if(!confirm("Excluir esse aporte?"))return;const{error:p}=await $.from("aportes_fin").delete().eq("id",d.dataset.aid);if(p)return b("Erro: "+p.message,"err");b("Aporte removido"),A();return}})}function S(t){Object.assign(r,t);const e=document.getElementById("content"),a=m.find(x=>x.id===r.metaId)||m.find(x=>x.principal)||m[0];if(!a)return;e.querySelectorAll(".lib-slider-v")[0].textContent=u(r.aporte),e.querySelectorAll(".lib-slider-v")[1].textContent=r.taxa.toFixed(2)+"% a.a.",e.querySelectorAll(".lib-slider-v")[2].textContent=`${r.meses} meses (${(r.meses/12).toFixed(1)} anos)`;const s=_(a),i=Number(a.valor_alvo),l=N({pv:s,pmt:r.aporte,taxaAA:r.taxa,meses:r.meses}),n=l[l.length-1],o=s+r.aporte*r.meses,c=e.querySelector(".lib-sim-chart");if(c){const x=c.querySelector(".lib-chart-legend");c.innerHTML=W(l,i)+(x?x.outerHTML:"")}const d=e.querySelectorAll("#lib-stats .lib-stat-val"),p=e.querySelectorAll("#lib-stats .lib-stat-sub");d[2]&&(d[2].textContent=u(n.saldo),p[2].textContent="Juros: "+u(n.saldo-o));const h=I({pv:s,pmt:r.aporte,taxaAA:r.taxa,meta:i});d[3]&&(d[3].textContent=u(Math.max(0,i-s)),p[3].textContent=h!=null?`Bate em ${J(h)}`:"Aumente o aporte")}function dt({metaId:t=null}={}){var i,l;const e=new Date().toISOString().slice(0,10),a=E(),s=t||((i=m.find(n=>n.principal))==null?void 0:i.id)||((l=m[0])==null?void 0:l.id)||"";R("Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${m.map(n=>`<option value="${n.id}"${n.id===s?" selected":""}>${n.icone||"🎯"} ${y(n.nome)}</option>`).join("")}
        <option value="">— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${a||""}">
      ${a?`<div class="lib-hint">Sugestão: ${u(a)} (${g.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data</label>
      <input class="fi" type="date" id="ap-data" value="${e}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">
        <option value="manual">Manual</option>
        <option value="faturamento">Faturamento</option>
        <option value="bonus">Bônus / Extra</option>
        <option value="outro">Outro</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux">
    </div>
  `,`
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">Salvar aporte</button>
  `),document.getElementById("ap-cancel").addEventListener("click",M),document.getElementById("ap-save").addEventListener("click",async()=>{const n=parseFloat(document.getElementById("ap-val").value)||0;if(n<=0)return b("Valor inválido","err");const o={valor:n,data:document.getElementById("ap-data").value||e,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:c}=await $.from("aportes_fin").insert(o);if(c)return b("Erro: "+c.message,"err");M(),b("Aporte registrado 🚀"),A()})}function j(t={}){var n;const e=!t.id,a=t.icone||L[0],s=t.cor||B[m.length%B.length],i=L.map(o=>`<button type="button" class="lib-ico-pick${o===a?" on":""}" data-ico="${o}">${o}</button>`).join(""),l=B.map(o=>`<button type="button" class="lib-cor-pick${o===s?" on":""}" style="background:${o}" data-cor="${o}"></button>`).join("");R(e?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${y(t.nome||"")}">
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Valor alvo (R$)</label>
        <input class="fi" type="number" id="m-alvo" step="100" placeholder="15000" value="${t.valor_alvo||""}">
      </div>
      <div class="fg"><label class="fl">Saldo inicial (R$)</label>
        <input class="fi" type="number" id="m-ini" step="100" placeholder="0" value="${t.valor_inicial||0}">
        <div class="lib-hint">Quanto você já tem reservado pra essa meta</div>
      </div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Prazo (meses, opcional)</label>
        <input class="fi" type="number" id="m-prazo" step="1" placeholder="Sem prazo" value="${t.prazo_meses||""}">
      </div>
      <div class="fg"><label class="fl">
        <input type="checkbox" id="m-principal"${t.principal?" checked":""}> Marcar como meta principal
      </label>
      <div class="lib-hint">A principal vai no hero (só uma por vez)</div>
      </div>
    </div>
    <div class="fg"><label class="fl">Ícone</label>
      <div class="lib-ico-row" id="m-icones">${i}</div>
      <input type="hidden" id="m-ico" value="${a}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="m-cores">${l}</div>
      <input type="hidden" id="m-cor" value="${s}">
    </div>
  `,`
    ${e?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",o=>{const c=o.target.closest(".lib-ico-pick");c&&(document.querySelectorAll(".lib-ico-pick").forEach(d=>d.classList.remove("on")),c.classList.add("on"),document.getElementById("m-ico").value=c.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",o=>{const c=o.target.closest(".lib-cor-pick");c&&(document.querySelectorAll(".lib-cor-pick").forEach(d=>d.classList.remove("on")),c.classList.add("on"),document.getElementById("m-cor").value=c.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",M),(n=document.getElementById("m-del"))==null||n.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${t.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:o}=await $.from("metas_fin").delete().eq("id",t.id);if(o)return b("Erro: "+o.message,"err");M(),b("Meta excluída"),A()}),document.getElementById("m-save").addEventListener("click",async()=>{const o=document.getElementById("m-nome").value.trim(),c=parseFloat(document.getElementById("m-alvo").value)||0;if(!o)return b("Nome obrigatório","err");if(c<=0)return b("Valor alvo inválido","err");const d=document.getElementById("m-principal").checked,p={nome:o,valor_alvo:c,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:d,atualizado_em:new Date().toISOString()};d&&await $.from("metas_fin").update({principal:!1}).neq("id",t.id||"00000000-0000-0000-0000-000000000000");const{error:h}=t.id?await $.from("metas_fin").update(p).eq("id",t.id):await $.from("metas_fin").insert(p);if(h)return b("Erro: "+h.message,"err");M(),b(t.id?"Meta atualizada":"Meta criada 🎯"),A()})}function ut(t){return Math.round(t).toLocaleString("pt-BR")}function z(t){return t>=1e6?(t/1e6).toFixed(1).replace(/\.0$/,"")+"M":t>=1e3?(t/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(t).toString()}function J(t){const e=new Date;return e.setMonth(e.getMonth()+t),D[e.getMonth()]+"/"+e.getFullYear()}function y(t){return String(t||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Y(t,e){const a=t.replace("#",""),s=parseInt(a.slice(0,2),16),i=parseInt(a.slice(2,4),16),l=parseInt(a.slice(4,6),16);return`rgba(${s},${i},${l},${e})`}function mt(t,e){const a=t.replace("#",""),s=Math.min(255,parseInt(a.slice(0,2),16)+e),i=Math.min(255,parseInt(a.slice(2,4),16)+e),l=Math.min(255,parseInt(a.slice(4,6),16)+e);return`rgb(${s},${i},${l})`}function pt(t,e){const a=t.replace("#",""),s=Math.max(0,parseInt(a.slice(0,2),16)-e),i=Math.max(0,parseInt(a.slice(2,4),16)-e),l=Math.max(0,parseInt(a.slice(4,6),16)-e);return`rgb(${s},${i},${l})`}export{A as render};
