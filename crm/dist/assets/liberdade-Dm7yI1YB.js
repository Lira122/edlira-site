import{d as M,t as v,c as f,o as ct,f as D,M as dt,h as Mt}from"./index-vvqLxNqm.js";let x=null,g=[],j=[],ut=[],tt=null,r={metaId:null,meses:60,taxa:14.25,fases:[{inicio:0,aporte:2e3}]};const et=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],lt=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"],wt=360*60*1e3;async function w(){var a;const t=document.getElementById("content");if(t.innerHTML='<div class="empty">Carregando…</div>',await Et(),await st(),Ft(),!r.metaId||!g.find(i=>i.id===r.metaId)){const i=g.find(o=>o.principal)||g[0];r.metaId=(i==null?void 0:i.id)||null}(a=r.fases)!=null&&a.length||(r.fases=[{inicio:0,aporte:2e3}]),r.fases[0].aporte=Math.max(r.fases[0].aporte,H()),r.taxa=Number(x.selic_aa)||14.25,t.innerHTML=jt(),Pt(t);const e=t.querySelector(".lib-sim-chart");e&&ht(e)}async function Et(){const[t,e,a,i]=await Promise.all([M.from("config_fin").select("*").eq("id","main").maybeSingle(),M.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),M.from("aportes_fin").select("*").order("data",{ascending:!1}),M.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1})]);t.error&&v("config_fin: "+t.error.message,"err"),e.error&&v("metas_fin: "+e.error.message,"err"),a.error&&v("aportes_fin: "+a.error.message,"err"),x=t.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},g=e.data||[],j=a.data||[],ut=i.data||[]}async function st({manual:t=!1}={}){var e;try{const a=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!a.ok)return t&&v("BCB respondeu "+a.status,"err"),!1;const i=await a.json(),o=Number((e=i==null?void 0:i[0])==null?void 0:e.valor);if(!isFinite(o)||o<=0)return t&&v("Resposta inválida do BCB","err"),!1;const l=Number(x.selic_aa),n=Math.abs(o-l)>.01,s=new Date().toISOString();return x.selic_aa=o,x.atualizado_em=s,await M.from("config_fin").upsert({id:"main",selic_aa:o,atualizado_em:s}),n?v(`Selic atualizada: ${o.toFixed(2)}% a.a.`):t&&v(`Selic confirmada: ${o.toFixed(2)}% a.a.`),St(),!0}catch{return t&&v("Sem conexão com o BCB","err"),!1}}function Ft(){tt&&clearInterval(tt),tt=setInterval(()=>{st()},wt)}function St(){const t=document.querySelector(".lib-chip-selic");t&&(t.innerHTML=mt())}function mt(){const t=Number(x.selic_aa).toFixed(2),e=x.atualizado_em?_t(x.atualizado_em):"não verificada";return`<b>Selic</b> ${t}% a.a. <small>BCB · ${e}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`}function _t(t){const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"agora":e<3600?`há ${Math.floor(e/60)}min`:e<86400?`há ${Math.floor(e/3600)}h`:e<86400*30?`há ${Math.floor(e/86400)}d`:new Date(t).toLocaleDateString("pt-BR")}function pt(t,e){if(!(t!=null&&t.length))return 0;const a=[...t].sort((o,l)=>o.inicio-l.inicio);let i=0;for(const o of a)o.inicio<=e&&(i=Number(o.aporte)||0);return i}function it({pv:t,fases:e,taxaAA:a,meses:i}){const o=Math.pow(1+a/100,.08333333333333333)-1,l=[];let n=t,s=t;for(let c=0;c<=i;c++){if(c>0){const d=pt(e,c-1);n=n*(1+o)+d,s+=d}l.push({mes:c,saldo:n,aportado:s,juros:n-s})}return l}function G({pv:t,fases:e,taxaAA:a,meta:i}){if(t>=i)return 0;const o=Math.pow(1+a/100,1/12)-1;let l=t,n=0;for(;n<1200;){const s=pt(e,n);if(l=l*(1+o)+s,n++,l>=i)return n;if(s===0&&l<=t*1.0001&&n>12)return null}return null}function bt(t,e){return ut.filter(a=>a.ano===t&&a.mes===e).reduce((a,i)=>a+Number(i.valor||0),0)}function ft(){const t=new Date;let e=0,a=0;for(let i=1;i<=6;i++){const o=new Date(t.getFullYear(),t.getMonth()-i,1),l=bt(o.getFullYear(),o.getMonth()+1);l>0&&(e+=l,a++)}return a?e/a:0}function vt(){const t=new Date;return bt(t.getFullYear(),t.getMonth()+1)}function H(){const t=Number((x==null?void 0:x.aporte_pct_faturamento)||20)/100,e=ft()||vt();return Math.max(0,Math.round(e*t))}function J(t){const e=j.filter(a=>a.meta_id===t.id).reduce((a,i)=>a+Number(i.valor||0),0);return Number(t.valor_inicial||0)+e}function at(t){return j.filter(e=>e.meta_id===t.id)}function Bt(t){const e=new Date().toISOString().slice(0,7);return j.filter(a=>(t?a.meta_id===t:!0)&&(a.data||"").startsWith(e)).reduce((a,i)=>a+Number(i.valor||0),0)}function It(t){const e=H()||1;let a=0;const i=new Date;for(let o=0;o<36;o++){const n=new Date(i.getFullYear(),i.getMonth()-o,1).toISOString().slice(0,7),s=j.filter(c=>(t?c.meta_id===t:!0)&&(c.data||"").startsWith(n)).reduce((c,d)=>c+Number(d.valor||0),0);if(s>=e&&s>0)a++;else break}return a}function jt(){const t=g.find(i=>i.principal)||g[0],e=g.filter(i=>i!==t),a=g.find(i=>i.id===r.metaId)||t;return`
  <div class="lib">
    ${t?Ct(t):qt()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${e.map(Nt).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${Lt(a)}
    ${zt(a)}
    ${Dt()}
  </div>`}function qt(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function Ct(t){const e=J(t),a=Number(t.valor_alvo),i=Math.min(100,e/a*100),o=H(),l=Bt(t.id),n=It(t.id),s=G({pv:e,fases:[{inicio:0,aporte:o}],taxaAA:Number(x.selic_aa),meta:a});return`
  <div class="lib-hero" style="--meta-color:${t.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${t.icone||"🎯"}</span> META PRINCIPAL · ${E(t.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${Tt(e)}</div>
      <div class="lib-hero-sub">
        de <strong>${f(a)}</strong>
        · ${i.toFixed(1)}% do caminho
        ${s!=null?` · faltam <strong>${s}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${i.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${mt()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${f(o)}/mês <small>(${Number(x.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${f(l)} ${l>=o?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${n} ${n===1?"mês":"meses"} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${Rt(i,t.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${t.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${t.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function Nt(t){const e=J(t),a=Number(t.valor_alvo),i=Math.min(100,e/a*100),o=t.cor||"#C5F82A",l=H(),n=G({pv:e,fases:[{inicio:0,aporte:l}],taxaAA:Number(x.selic_aa),meta:a}),s=e>=a;return`
  <div class="lib-meta-card${s?" done":""}" style="--meta-color:${o}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${$t(o,.14)};color:${o}">${t.icone||"🎯"}</div>
      <div class="lib-meta-name">${E(t.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${t.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${f(e)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${f(a)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${i.toFixed(2)}%;background:${o}"></div></div>
    <div class="lib-meta-foot">
      <span>${i.toFixed(0)}%</span>
      ${s?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${n!=null?`${n}m no ritmo`:"sem prazo"}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${t.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${t.id}">Simular</button>
    </div>
  </div>`}function Lt(t){if(!t)return"";const e=J(t),a=Number(t.valor_alvo),i=it({pv:e,fases:r.fases,taxaAA:r.taxa,meses:r.meses}),o=i[i.length-1];o.aportado;const l=o.juros,n=G({pv:e,fases:r.fases,taxaAA:r.taxa,meta:a});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${f(e)}</div>
      <div class="lib-stat-sub">${at(t).length} aporte${at(t).length===1?"":"s"} registrado${at(t).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${f(ft())}</div>
      <div class="lib-stat-sub">Mês atual: ${f(vt())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${r.meses}m</div>
      <div class="lib-stat-val ac">${f(o.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${f(l)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${f(Math.max(0,a-e))}</div>
      <div class="lib-stat-sub">${n!=null?`Bate em ${U(n)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function zt(t){if(!t)return"";const e=J(t),a=Number(t.valor_alvo),i=it({pv:e,fases:r.fases,taxaAA:r.taxa,meses:r.meses}),o=H()||1e3,l=r.fases.map((n,s)=>`
    <div class="lib-fase" data-fase-idx="${s}">
      <div class="lib-fase-when">
        ${s===0?'<span class="lib-fase-tag">Início</span>':`<input type="number" class="lib-fase-inicio" min="1" max="${r.meses}" step="1" value="${n.inicio}"> <small>em diante</small>`}
      </div>
      <div class="lib-fase-val">
        <input type="number" class="lib-fase-aporte" min="0" step="100" value="${n.aporte}"> <small>R$/mês</small>
      </div>
      ${s>0?'<button class="lib-fase-del" title="Remover fase">×</button>':""}
    </div>
  `).join("");return`
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${E(t.nome)}</strong>
          ${g.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${g.map(n=>`<option value="${n.id}"${n.id===t.id?" selected":""}>${n.icone||"🎯"} ${E(n.nome)}</option>`).join("")}
            </select>
          `:""}
        </div>
      </div>
    </div>

    <div class="lib-sim">
      <div class="lib-sim-controls">
        <!-- Fases de aporte -->
        <div class="lib-fases">
          <div class="lib-fases-head">
            <label>Fases de aporte</label>
            <span class="lib-fases-hint">Aporta R$X até o mês N, depois aumenta/diminui</span>
          </div>
          <div class="lib-fases-list" id="lib-fases-list">
            ${l}
          </div>
          <button type="button" class="btn bg bsm" id="lib-fase-add">+ Adicionar fase</button>
          <div class="lib-sim-quick" style="margin-top:8px">
            <small style="color:var(--text-3);font-family:var(--ff-mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;align-self:center;margin-right:4px">Aplicar na fase 1:</small>
            <button class="lib-qk" data-pmt="${o}">${f(o)}</button>
            <button class="lib-qk" data-pmt="2000">R$ 2k</button>
            <button class="lib-qk" data-pmt="5000">R$ 5k</button>
            <button class="lib-qk" data-pmt="10000">R$ 10k</button>
          </div>
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
      </div>

      <div class="lib-sim-chart">
        ${gt(i,a,r.fases)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${f(a)}</span>
        </div>
      </div>
    </div>
  </div>`}function Rt(t,e){const i=2*Math.PI*86,o=i*Math.min(100,t)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${Jt(e,30)}"/>
          <stop offset=".5" stop-color="${e}"/>
          <stop offset="1" stop-color="${Ot(e,25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="86" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="86" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${o} ${i-o}"
              stroke-dashoffset="${i/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${t.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`}function gt(t,e,a=null){const l={t:38,r:90,b:32,l:56},n=760-l.l-l.r,s=290-l.t-l.b,c=Math.max(e,...t.map(m=>m.saldo))*1.08,d=m=>l.l+m/(t.length-1)*n,p=m=>l.t+s-Math.max(0,m)/c*s;function h(m){const b=t.map((F,V)=>[d(V),p(F[m])]);if(b.length<2)return"";let L=`M ${b[0][0].toFixed(1)} ${b[0][1].toFixed(1)}`;const z=.18;for(let F=0;F<b.length-1;F++){const V=b[F-1]||b[F],Y=b[F],q=b[F+1],ot=b[F+2]||q,yt=Y[0]+(q[0]-V[0])*z,xt=Y[1]+(q[1]-V[1])*z,At=q[0]-(ot[0]-Y[0])*z,kt=q[1]-(ot[1]-Y[1])*z;L+=` C ${yt.toFixed(1)} ${xt.toFixed(1)}, ${At.toFixed(1)} ${kt.toFixed(1)}, ${q[0].toFixed(1)} ${q[1].toFixed(1)}`}return L}const A=h("saldo"),y=h("aportado"),u=h("juros"),$=d(t.length-1),S=p(0),X=`${A} L ${$.toFixed(1)} ${S.toFixed(1)} L ${l.l} ${S.toFixed(1)} Z`,Q=[0,.5,1].map(m=>{const b=c*m;return`<g>
      <line x1="${l.l}" x2="${760-l.r}" y1="${p(b)}" y2="${p(b)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${m===0?"":"2 4"}"/>
      <text x="${l.l-10}" y="${p(b)+3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${R(b)}</text>
    </g>`}).join(""),C=[0,Math.floor(t.length/2),t.length-1].map(m=>{const b=t[m];return`<text x="${d(m)}" y="280" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${b.mes}m</text>`}).join("");let N="";a&&a.length>1&&(N=a.slice(1).map(m=>{if(m.inicio<=0||m.inicio>=t.length)return"";const b=d(m.inicio);return`
        <line x1="${b}" x2="${b}" y1="${l.t}" y2="${l.t+s}" stroke="rgba(167,139,250,.45)" stroke-dasharray="3 3" stroke-width="1"/>
        <g transform="translate(${b} ${l.t-14})">
          <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(167,139,250,.18)" stroke="rgba(167,139,250,.5)"/>
          <text x="0" y="3" font-size="9.5" font-weight="700" fill="#C7B3FB" text-anchor="middle" font-family="JetBrains Mono">→ ${R(m.aporte)}/m</text>
        </g>`}).join(""));let _="",O="";if(e<=c){const m=p(e);_=`
      <line x1="${l.l}" x2="${760-l.r}" y1="${m}" y2="${m}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${760-l.r+4} ${m})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${R(e)}</text>
      </g>`;const b=t.findIndex(L=>L.saldo>=e);if(b>0){const L=d(b),z=p(t[b].saldo);O=`
        <g class="lib-chart-cross" transform="translate(${L} ${z})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${t[b].mes}m · ${U(t[b].mes).toUpperCase()}</text>
          </g>
        </g>`}}const B=t[t.length-1],k=`
    <g transform="translate(${$+8} ${p(B.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${R(B.saldo)}</text>
    </g>
    <g transform="translate(${$+8} ${p(B.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${R(B.aportado)}</text>
    </g>
    <g transform="translate(${$+8} ${p(B.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${R(B.juros)}</text>
    </g>`,W=t.map((m,b)=>d(b).toFixed(1)).join(","),I=t.map(m=>Math.round(m.saldo)).join(","),P=t.map(m=>Math.round(m.aportado)).join(","),K=t.map(m=>Math.round(m.juros)).join(",");return`
  <svg class="lib-chart" viewBox="0 0 760 290" preserveAspectRatio="xMidYMid meet"
       data-w="760" data-h="290" data-pad-l="${l.l}" data-pad-r="${l.r}"
       data-pad-t="${l.t}" data-pad-b="${l.b}"
       data-xs="${W}" data-saldo="${I}" data-aportado="${P}" data-juros="${K}"
       data-meses="${t.map(m=>m.mes).join(",")}">
    <defs>
      <linearGradient id="lg-area-saldo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#C5F82A" stop-opacity=".5"/>
        <stop offset="50%"  stop-color="#C5F82A" stop-opacity=".15"/>
        <stop offset="100%" stop-color="#C5F82A" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="lg-stroke-saldo" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#E6FF7A"/>
        <stop offset=".6" stop-color="#C5F82A"/>
        <stop offset="1"   stop-color="#34D399"/>
      </linearGradient>
      <filter id="f-glow-saldo" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    ${Q}
    ${N}
    ${_}

    <path d="${X}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${y}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${u}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${A}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${O}
    ${k}
    ${C}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${l.t}" y2="${l.t+s}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${l.l}" y="${l.t}" width="${n}" height="${s}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`}function ht(t){const e=t.querySelector(".lib-chart"),a=t.querySelector(".lib-chart-tooltip");if(!e||!a)return;const i=e.querySelector(".lib-chart-hover"),o=e.querySelector(".lib-chart-hit"),l=e.querySelector(".lib-chart-vline"),n=e.querySelector(".lib-chart-dot-s"),s=e.querySelector(".lib-chart-dot-a"),c=e.querySelector(".lib-chart-dot-j"),d=e.dataset.xs.split(",").map(Number),p=e.dataset.saldo.split(",").map(Number),h=e.dataset.aportado.split(",").map(Number),A=e.dataset.juros.split(",").map(Number),y=e.dataset.meses.split(",").map(Number),u=+e.dataset.w,$=+e.dataset.h,S=+e.dataset.padT,X=+e.dataset.padB,Q=Math.max(...p)*1.08,Z=$-S-X,C=N=>S+Z-Math.max(0,N)/Q*Z;o.addEventListener("mousemove",N=>{const _=e.getBoundingClientRect(),O=u/_.width,B=(N.clientX-_.left)*O;let k=0,W=1/0;for(let m=0;m<d.length;m++){const b=Math.abs(d[m]-B);b<W&&(W=b,k=m)}const I=d[k];i.style.opacity=1,l.setAttribute("x1",I),l.setAttribute("x2",I),n.setAttribute("cx",I),n.setAttribute("cy",C(p[k])),s.setAttribute("cx",I),s.setAttribute("cy",C(h[k])),c.setAttribute("cx",I),c.setAttribute("cy",C(A[k]));const P=I/u*_.width,K=P>_.width/2?"left":"right";a.style.opacity=1,a.style.left=K==="right"?P+14+"px":P-14-a.offsetWidth+"px",a.style.top=Math.max(8,C(p[k])/$*_.height-a.offsetHeight/2)+"px",a.querySelector(".lib-tt-mes").textContent=`${y[k]}m · ${U(y[k])}`,a.querySelector(".lib-tt-s").textContent=f(p[k]),a.querySelector(".lib-tt-a").textContent=f(h[k]),a.querySelector(".lib-tt-j").textContent=f(A[k])}),o.addEventListener("mouseleave",()=>{i.style.opacity=0,a.style.opacity=0})}function Dt(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${j.length?Ht():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function Ht(){const t={};for(const e of j){const a=(e.data||"").slice(0,7);t[a]||(t[a]=[]),t[a].push(e)}return Object.entries(t).sort((e,a)=>a[0].localeCompare(e[0])).map(([e,a])=>{const[i,o]=e.split("-"),l=a.reduce((n,s)=>n+Number(s.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${dt[parseInt(o)-1]} / ${i}</span>
        <span class="lib-mes-tot">${f(l)}</span>
      </div>
      ${a.map(n=>{const s=g.find(c=>c.id===n.meta_id);return`
        <div class="lib-ap-row" data-ap-edit="${n.id}" title="Clica pra editar">
          <div class="lib-ap-data">${Mt(n.data)}</div>
          <div class="lib-ap-meta">${s?`<span class="lib-ap-tag" style="background:${$t(s.cor||"#C5F82A",.15)};color:${s.cor||"#C5F82A"}">${s.icone||"🎯"} ${E(s.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${E(n.fonte||"manual")}${n.observacao?" · "+E(n.observacao):""}</div>
          <div class="lib-ap-val">${f(Number(n.valor))}</div>
          <button class="lib-ap-del" data-aid="${n.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function Pt(t){var e,a,i,o,l,n;t.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(s=>s.addEventListener("click",()=>rt())),(e=t.querySelector("#sim-taxa"))==null||e.addEventListener("input",s=>T({taxa:+s.target.value})),(a=t.querySelector("#sim-meses"))==null||a.addEventListener("input",s=>T({meses:+s.target.value})),(i=t.querySelector("#sim-meta"))==null||i.addEventListener("change",s=>{r.metaId=s.target.value,w()}),(o=t.querySelector("#lib-fases-list"))==null||o.addEventListener("input",s=>{const c=s.target.closest(".lib-fase");if(!c)return;const d=+c.dataset.faseIdx;r.fases[d]&&(s.target.classList.contains("lib-fase-aporte")?(r.fases[d].aporte=Math.max(0,+s.target.value||0),T({})):s.target.classList.contains("lib-fase-inicio")&&(r.fases[d].inicio=Math.max(1,Math.min(r.meses,+s.target.value||1)),T({})))}),(l=t.querySelector("#lib-fase-add"))==null||l.addEventListener("click",()=>{const s=r.fases[r.fases.length-1],c=Math.min(r.meses,((s==null?void 0:s.inicio)||0)+12),d=Math.round(((s==null?void 0:s.aporte)||2e3)*1.5);r.fases.push({inicio:c,aporte:d}),w(),setTimeout(()=>{var p;return(p=document.querySelector(".lib-fase:last-child .lib-fase-aporte"))==null?void 0:p.focus()},50)}),(n=t.querySelector("#lib-fases-list"))==null||n.addEventListener("click",s=>{const c=s.target.closest(".lib-fase-del");if(!c)return;const p=+c.closest(".lib-fase").dataset.faseIdx;p!==0&&(r.fases.splice(p,1),w())}),t.querySelectorAll(".lib-qk").forEach(s=>s.addEventListener("click",()=>{r.fases[0].aporte=+s.dataset.pmt,w()})),t.addEventListener("click",async s=>{const c=s.target.closest("[data-aporte]"),d=s.target.closest("[data-sim]"),p=s.target.closest("[data-meta-edit]"),h=s.target.closest(".lib-ap-del"),A=s.target.closest("#lib-selic-refresh");if(A){s.stopPropagation(),A.classList.add("spinning");const u=await st({manual:!0});if(A.classList.remove("spinning"),u){r.taxa=Number(x.selic_aa);const $=document.getElementById("sim-taxa");$&&document.activeElement!==$&&($.value=r.taxa,T({taxa:r.taxa}))}return}if(c){nt({metaId:c.dataset.aporte||null});return}if(d){r.metaId=d.dataset.sim,w(),setTimeout(()=>{var u;return(u=document.querySelector(".lib-sim"))==null?void 0:u.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(p){const u=g.find($=>$.id===p.dataset.metaEdit);u&&rt(u);return}if(h){if(s.stopPropagation(),!confirm("Excluir esse aporte?"))return;const{error:u}=await M.from("aportes_fin").delete().eq("id",h.dataset.aid);if(u)return v("Erro: "+u.message,"err");v("Aporte removido"),w();return}const y=s.target.closest("[data-ap-edit]");if(y){const u=j.find($=>$.id===y.dataset.apEdit);u&&nt({aporte:u})}})}function T(t){Object.assign(r,t);const e=document.getElementById("content"),a=g.find(y=>y.id===r.metaId)||g.find(y=>y.principal)||g[0];if(!a)return;const i=e.querySelectorAll(".lib-slider-v");i[0]&&(i[0].textContent=r.taxa.toFixed(2)+"% a.a."),i[1]&&(i[1].textContent=`${r.meses} meses (${(r.meses/12).toFixed(1)} anos)`);const o=J(a),l=Number(a.valor_alvo),n=it({pv:o,fases:r.fases,taxaAA:r.taxa,meses:r.meses}),s=n[n.length-1],c=s.aportado,d=e.querySelector(".lib-sim-chart");if(d){const y=d.querySelector(".lib-chart-legend");d.innerHTML=gt(n,l,r.fases)+(y?y.outerHTML:""),ht(d)}const p=e.querySelectorAll("#lib-stats .lib-stat-val"),h=e.querySelectorAll("#lib-stats .lib-stat-sub");p[2]&&(p[2].textContent=f(s.saldo),h[2].textContent="Juros: "+f(s.saldo-c));const A=G({pv:o,fases:r.fases,taxaAA:r.taxa,meta:l});p[3]&&(p[3].textContent=f(Math.max(0,l-o)),h[3].textContent=A!=null?`Bate em ${U(A)}`:"Aumente o aporte")}function nt({metaId:t=null,aporte:e=null}={}){var h,A,y;const a=new Date().toISOString().slice(0,10),i=H(),o=!!e,l=o?e.meta_id||"":t||((h=g.find(u=>u.principal))==null?void 0:h.id)||((A=g[0])==null?void 0:A.id)||"",n=o?e.valor:i||"",s=o?e.data:a,c=o&&e.fonte||"manual",d=o&&e.observacao||"",p=["manual","faturamento","bonus","outro"].map(u=>`<option value="${u}"${u===c?" selected":""}>${u==="manual"?"Manual":u==="faturamento"?"Faturamento":u==="bonus"?"Bônus / Extra":"Outro"}</option>`).join("");ct(o?"Editar aporte":"Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${g.map(u=>`<option value="${u.id}"${u.id===l?" selected":""}>${u.icone||"🎯"} ${E(u.nome)}</option>`).join("")}
        <option value=""${l===""?" selected":""}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${n}">
      ${!o&&i?`<div class="lib-hint">Sugestão: ${f(i)} (${x.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data ${o?'<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>':""}</label>
      <input class="fi" type="date" id="ap-data" value="${s}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${p}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${E(d)}">
    </div>
  `,`
    ${o?'<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>':""}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${o?"Salvar alteração":"Salvar aporte"}</button>
  `),document.getElementById("ap-cancel").addEventListener("click",D),(y=document.getElementById("ap-del"))==null||y.addEventListener("click",async()=>{if(!confirm("Excluir esse aporte?"))return;const{error:u}=await M.from("aportes_fin").delete().eq("id",e.id);if(u)return v("Erro: "+u.message,"err");D(),v("Aporte removido"),w()}),document.getElementById("ap-save").addEventListener("click",async()=>{const u=parseFloat(document.getElementById("ap-val").value)||0;if(u<=0)return v("Valor inválido","err");const $={valor:u,data:document.getElementById("ap-data").value||a,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:S}=o?await M.from("aportes_fin").update($).eq("id",e.id):await M.from("aportes_fin").insert($);if(S)return v("Erro: "+S.message,"err");D(),v(o?"Aporte atualizado":"Aporte registrado 🚀"),w()})}function rt(t={}){var n;const e=!t.id,a=t.icone||lt[0],i=t.cor||et[g.length%et.length],o=lt.map(s=>`<button type="button" class="lib-ico-pick${s===a?" on":""}" data-ico="${s}">${s}</button>`).join(""),l=et.map(s=>`<button type="button" class="lib-cor-pick${s===i?" on":""}" style="background:${s}" data-cor="${s}"></button>`).join("");ct(e?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${E(t.nome||"")}">
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
      <div class="lib-ico-row" id="m-icones">${o}</div>
      <input type="hidden" id="m-ico" value="${a}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="m-cores">${l}</div>
      <input type="hidden" id="m-cor" value="${i}">
    </div>
  `,`
    ${e?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",s=>{const c=s.target.closest(".lib-ico-pick");c&&(document.querySelectorAll(".lib-ico-pick").forEach(d=>d.classList.remove("on")),c.classList.add("on"),document.getElementById("m-ico").value=c.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",s=>{const c=s.target.closest(".lib-cor-pick");c&&(document.querySelectorAll(".lib-cor-pick").forEach(d=>d.classList.remove("on")),c.classList.add("on"),document.getElementById("m-cor").value=c.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",D),(n=document.getElementById("m-del"))==null||n.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${t.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:s}=await M.from("metas_fin").delete().eq("id",t.id);if(s)return v("Erro: "+s.message,"err");D(),v("Meta excluída"),w()}),document.getElementById("m-save").addEventListener("click",async()=>{const s=document.getElementById("m-nome").value.trim(),c=parseFloat(document.getElementById("m-alvo").value)||0;if(!s)return v("Nome obrigatório","err");if(c<=0)return v("Valor alvo inválido","err");const d=document.getElementById("m-principal").checked,p={nome:s,valor_alvo:c,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:d,atualizado_em:new Date().toISOString()};d&&await M.from("metas_fin").update({principal:!1}).neq("id",t.id||"00000000-0000-0000-0000-000000000000");const{error:h}=t.id?await M.from("metas_fin").update(p).eq("id",t.id):await M.from("metas_fin").insert(p);if(h)return v("Erro: "+h.message,"err");D(),v(t.id?"Meta atualizada":"Meta criada 🎯"),w()})}function Tt(t){return Math.round(t).toLocaleString("pt-BR")}function R(t){return t>=1e6?(t/1e6).toFixed(1).replace(/\.0$/,"")+"M":t>=1e3?(t/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(t).toString()}function U(t){const e=new Date;return e.setMonth(e.getMonth()+t),dt[e.getMonth()]+"/"+e.getFullYear()}function E(t){return String(t||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function $t(t,e){const a=t.replace("#",""),i=parseInt(a.slice(0,2),16),o=parseInt(a.slice(2,4),16),l=parseInt(a.slice(4,6),16);return`rgba(${i},${o},${l},${e})`}function Jt(t,e){const a=t.replace("#",""),i=Math.min(255,parseInt(a.slice(0,2),16)+e),o=Math.min(255,parseInt(a.slice(2,4),16)+e),l=Math.min(255,parseInt(a.slice(4,6),16)+e);return`rgb(${i},${o},${l})`}function Ot(t,e){const a=t.replace("#",""),i=Math.max(0,parseInt(a.slice(0,2),16)-e),o=Math.max(0,parseInt(a.slice(2,4),16)-e),l=Math.max(0,parseInt(a.slice(4,6),16)-e);return`rgb(${i},${o},${l})`}export{w as render};
