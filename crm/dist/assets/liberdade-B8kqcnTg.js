import{d as k,t as f,c as v,o as rt,f as z,M as nt,h as xt}from"./index-Dta-29re.js";let y=null,h=[],I=[],ct=[],Q=null,n={metaId:null,aporte:2e3,meses:60,taxa:14.25};const Z=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],it=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"],At=360*60*1e3;async function N(){const t=document.getElementById("content");if(t.innerHTML='<div class="empty">Carregando…</div>',await kt(),await tt(),Mt(),!n.metaId||!h.find(a=>a.id===n.metaId)){const a=h.find(i=>i.principal)||h[0];n.metaId=(a==null?void 0:a.id)||null}n.aporte=Math.max(n.aporte,D()),n.taxa=Number(y.selic_aa)||14.25,t.innerHTML=_t(),Dt(t);const e=t.querySelector(".lib-sim-chart");e&&vt(e)}async function kt(){const[t,e,a,i]=await Promise.all([k.from("config_fin").select("*").eq("id","main").maybeSingle(),k.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),k.from("aportes_fin").select("*").order("data",{ascending:!1}),k.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1})]);t.error&&f("config_fin: "+t.error.message,"err"),e.error&&f("metas_fin: "+e.error.message,"err"),a.error&&f("aportes_fin: "+a.error.message,"err"),y=t.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},h=e.data||[],I=a.data||[],ct=i.data||[]}async function tt({manual:t=!1}={}){var e;try{const a=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!a.ok)return t&&f("BCB respondeu "+a.status,"err"),!1;const i=await a.json(),s=Number((e=i==null?void 0:i[0])==null?void 0:e.valor);if(!isFinite(s)||s<=0)return t&&f("Resposta inválida do BCB","err"),!1;const o=Number(y.selic_aa),r=Math.abs(s-o)>.01,l=new Date().toISOString();return y.selic_aa=s,y.atualizado_em=l,await k.from("config_fin").upsert({id:"main",selic_aa:s,atualizado_em:l}),r?f(`Selic atualizada: ${s.toFixed(2)}% a.a.`):t&&f(`Selic confirmada: ${s.toFixed(2)}% a.a.`),Et(),!0}catch{return t&&f("Sem conexão com o BCB","err"),!1}}function Mt(){Q&&clearInterval(Q),Q=setInterval(()=>{tt()},At)}function Et(){const t=document.querySelector(".lib-chip-selic");t&&(t.innerHTML=dt())}function dt(){const t=Number(y.selic_aa).toFixed(2),e=y.atualizado_em?wt(y.atualizado_em):"não verificada";return`<b>Selic</b> ${t}% a.a. <small>BCB · ${e}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`}function wt(t){const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"agora":e<3600?`há ${Math.floor(e/60)}min`:e<86400?`há ${Math.floor(e/3600)}h`:e<86400*30?`há ${Math.floor(e/86400)}d`:new Date(t).toLocaleDateString("pt-BR")}function et({pv:t,pmt:e,taxaAA:a,meses:i}){const s=Math.pow(1+a/100,.08333333333333333)-1,o=[];let r=t;for(let l=0;l<=i;l++)l>0&&(r=r*(1+s)+e),o.push({mes:l,saldo:r,aportado:t+e*l,juros:r-t-e*l});return o}function Y({pv:t,pmt:e,taxaAA:a,meta:i}){if(t>=i)return 0;const s=Math.pow(1+a/100,1/12)-1;if(e<=0&&t*(1+s)<=t)return null;let o=t,r=0;for(;r<1200;)if(o=o*(1+s)+e,r++,o>=i)return r;return null}function ut(t,e){return ct.filter(a=>a.ano===t&&a.mes===e).reduce((a,i)=>a+Number(i.valor||0),0)}function mt(){const t=new Date;let e=0,a=0;for(let i=1;i<=6;i++){const s=new Date(t.getFullYear(),t.getMonth()-i,1),o=ut(s.getFullYear(),s.getMonth()+1);o>0&&(e+=o,a++)}return a?e/a:0}function pt(){const t=new Date;return ut(t.getFullYear(),t.getMonth()+1)}function D(){const t=Number((y==null?void 0:y.aporte_pct_faturamento)||20)/100,e=mt()||pt();return Math.max(0,Math.round(e*t))}function P(t){const e=I.filter(a=>a.meta_id===t.id).reduce((a,i)=>a+Number(i.valor||0),0);return Number(t.valor_inicial||0)+e}function K(t){return I.filter(e=>e.meta_id===t.id)}function Ft(t){const e=new Date().toISOString().slice(0,7);return I.filter(a=>(t?a.meta_id===t:!0)&&(a.data||"").startsWith(e)).reduce((a,i)=>a+Number(i.valor||0),0)}function St(t){const e=D()||1;let a=0;const i=new Date;for(let s=0;s<36;s++){const r=new Date(i.getFullYear(),i.getMonth()-s,1).toISOString().slice(0,7),l=I.filter(c=>(t?c.meta_id===t:!0)&&(c.data||"").startsWith(r)).reduce((c,d)=>c+Number(d.valor||0),0);if(l>=e&&l>0)a++;else break}return a}function _t(){const t=h.find(i=>i.principal)||h[0],e=h.filter(i=>i!==t),a=h.find(i=>i.id===n.metaId)||t;return`
  <div class="lib">
    ${t?It(t):Bt()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${e.map(Ct).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${qt(a)}
    ${jt(a)}
    ${Lt()}
  </div>`}function Bt(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function It(t){const e=P(t),a=Number(t.valor_alvo),i=Math.min(100,e/a*100),s=D(),o=Ft(t.id),r=St(t.id),l=Y({pv:e,pmt:s,taxaAA:Number(y.selic_aa),meta:a});return`
  <div class="lib-hero" style="--meta-color:${t.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${t.icone||"🎯"}</span> META PRINCIPAL · ${w(t.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${Rt(e)}</div>
      <div class="lib-hero-sub">
        de <strong>${v(a)}</strong>
        · ${i.toFixed(1)}% do caminho
        ${l!=null?` · faltam <strong>${l}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${i.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${dt()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${v(s)}/mês <small>(${Number(y.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${v(o)} ${o>=s?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${r} ${r===1?"mês":"meses"} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${Nt(i,t.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${t.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${t.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function Ct(t){const e=P(t),a=Number(t.valor_alvo),i=Math.min(100,e/a*100),s=t.cor||"#C5F82A",o=D(),r=Y({pv:e,pmt:o,taxaAA:Number(y.selic_aa),meta:a}),l=e>=a;return`
  <div class="lib-meta-card${l?" done":""}" style="--meta-color:${s}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${ft(s,.14)};color:${s}">${t.icone||"🎯"}</div>
      <div class="lib-meta-name">${w(t.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${t.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${v(e)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${v(a)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${i.toFixed(2)}%;background:${s}"></div></div>
    <div class="lib-meta-foot">
      <span>${i.toFixed(0)}%</span>
      ${l?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${r!=null?`${r}m no ritmo`:"sem prazo"}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${t.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${t.id}">Simular</button>
    </div>
  </div>`}function qt(t){if(!t)return"";const e=P(t),a=Number(t.valor_alvo),i=et({pv:e,pmt:n.aporte,taxaAA:n.taxa,meses:n.meses}),s=i[i.length-1],o=e+n.aporte*n.meses,r=s.saldo-o,l=Y({pv:e,pmt:n.aporte,taxaAA:n.taxa,meta:a});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${v(e)}</div>
      <div class="lib-stat-sub">${K(t).length} aporte${K(t).length===1?"":"s"} registrado${K(t).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${v(mt())}</div>
      <div class="lib-stat-sub">Mês atual: ${v(pt())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${n.meses}m</div>
      <div class="lib-stat-val ac">${v(s.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${v(r)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${v(Math.max(0,a-e))}</div>
      <div class="lib-stat-sub">${l!=null?`Bate em ${G(l)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function jt(t){if(!t)return"";const e=P(t),a=Number(t.valor_alvo),i=et({pv:e,pmt:n.aporte,taxaAA:n.taxa,meses:n.meses}),s=D()||1e3;return`
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${w(t.nome)}</strong>
          ${h.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${h.map(o=>`<option value="${o.id}"${o.id===t.id?" selected":""}>${o.icone||"🎯"} ${w(o.nome)}</option>`).join("")}
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
            <span class="lib-slider-v">${v(n.aporte)}</span>
          </div>
          <input type="range" id="sim-aporte" min="0" max="20000" step="100" value="${n.aporte}">
        </div>
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Taxa anual</label>
            <span class="lib-slider-v">${n.taxa.toFixed(2)}% a.a.</span>
          </div>
          <input type="range" id="sim-taxa" min="4" max="25" step="0.25" value="${n.taxa}">
        </div>
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Prazo</label>
            <span class="lib-slider-v">${n.meses} meses (${(n.meses/12).toFixed(1)} anos)</span>
          </div>
          <input type="range" id="sim-meses" min="6" max="240" step="1" value="${n.meses}">
        </div>

        <div class="lib-sim-quick">
          <button class="lib-qk" data-pmt="${s}">Sug. ${v(s)}</button>
          <button class="lib-qk" data-pmt="2000">R$ 2k</button>
          <button class="lib-qk" data-pmt="5000">R$ 5k</button>
          <button class="lib-qk" data-pmt="10000">R$ 10k</button>
        </div>
      </div>

      <div class="lib-sim-chart">
        ${bt(i,a)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${v(a)}</span>
        </div>
      </div>
    </div>
  </div>`}function Nt(t,e){const i=2*Math.PI*86,s=i*Math.min(100,t)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${Ht(e,30)}"/>
          <stop offset=".5" stop-color="${e}"/>
          <stop offset="1" stop-color="${Pt(e,25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="86" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="86" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${s} ${i-s}"
              stroke-dashoffset="${i/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${t.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`}function bt(t,e){const s={t:28,r:90,b:32,l:56},o=760-s.l-s.r,r=280-s.t-s.b,l=Math.max(e,...t.map(u=>u.saldo))*1.08,c=u=>s.l+u/(t.length-1)*o,d=u=>s.t+r-Math.max(0,u)/l*r;function g(u){const b=t.map((S,J)=>[c(J),d(S[u])]);if(b.length<2)return"";let E=`M ${b[0][0].toFixed(1)} ${b[0][1].toFixed(1)}`;const F=.18;for(let S=0;S<b.length-1;S++){const J=b[S-1]||b[S],W=b[S],j=b[S+1],st=b[S+2]||j,gt=W[0]+(j[0]-J[0])*F,ht=W[1]+(j[1]-J[1])*F,$t=j[0]-(st[0]-W[0])*F,yt=j[1]-(st[1]-W[1])*F;E+=` C ${gt.toFixed(1)} ${ht.toFixed(1)}, ${$t.toFixed(1)} ${yt.toFixed(1)}, ${j[0].toFixed(1)} ${j[1].toFixed(1)}`}return E}const $=g("saldo"),m=g("aportado"),x=g("juros"),p=c(t.length-1),_=d(0),C=`${$} L ${p.toFixed(1)} ${_.toFixed(1)} L ${s.l} ${_.toFixed(1)} Z`,V=[0,.5,1].map(u=>{const b=l*u;return`<g>
      <line x1="${s.l}" x2="${760-s.r}" y1="${d(b)}" y2="${d(b)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${u===0?"":"2 4"}"/>
      <text x="${s.l-10}" y="${d(b)+3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${H(b)}</text>
    </g>`}).join(""),T=[0,Math.floor(t.length/2),t.length-1].map(u=>{const b=t[u];return`<text x="${c(u)}" y="270" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${b.mes}m</text>`}).join("");let q="",L="";if(e<=l){const u=d(e);q=`
      <line x1="${s.l}" x2="${760-s.r}" y1="${u}" y2="${u}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${760-s.r+4} ${u})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${H(e)}</text>
      </g>`;const b=t.findIndex(E=>E.saldo>=e);if(b>0){const E=c(b),F=d(t[b].saldo);L=`
        <g class="lib-chart-cross" transform="translate(${E} ${F})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${t[b].mes}m · ${G(t[b].mes).toUpperCase()}</text>
          </g>
        </g>`}}const M=t[t.length-1],U=`
    <g transform="translate(${p+8} ${d(M.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${H(M.saldo)}</text>
    </g>
    <g transform="translate(${p+8} ${d(M.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${H(M.aportado)}</text>
    </g>
    <g transform="translate(${p+8} ${d(M.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${H(M.juros)}</text>
    </g>`,X=t.map((u,b)=>c(b).toFixed(1)).join(","),A=t.map(u=>Math.round(u.saldo)).join(","),O=t.map(u=>Math.round(u.aportado)).join(","),B=t.map(u=>Math.round(u.juros)).join(",");return`
  <svg class="lib-chart" viewBox="0 0 760 280" preserveAspectRatio="xMidYMid meet"
       data-w="760" data-h="280" data-pad-l="${s.l}" data-pad-r="${s.r}"
       data-pad-t="${s.t}" data-pad-b="${s.b}"
       data-xs="${X}" data-saldo="${A}" data-aportado="${O}" data-juros="${B}"
       data-meses="${t.map(u=>u.mes).join(",")}">
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

    ${V}
    ${q}

    <path d="${C}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${m}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${x}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${$}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${L}
    ${U}
    ${T}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${s.t}" y2="${s.t+r}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${s.l}" y="${s.t}" width="${o}" height="${r}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`}function vt(t){const e=t.querySelector(".lib-chart"),a=t.querySelector(".lib-chart-tooltip");if(!e||!a)return;const i=e.querySelector(".lib-chart-hover"),s=e.querySelector(".lib-chart-hit"),o=e.querySelector(".lib-chart-vline"),r=e.querySelector(".lib-chart-dot-s"),l=e.querySelector(".lib-chart-dot-a"),c=e.querySelector(".lib-chart-dot-j"),d=e.dataset.xs.split(",").map(Number),g=e.dataset.saldo.split(",").map(Number),$=e.dataset.aportado.split(",").map(Number),m=e.dataset.juros.split(",").map(Number),x=e.dataset.meses.split(",").map(Number),p=+e.dataset.w,_=+e.dataset.h,C=+e.dataset.padT,V=+e.dataset.padB,at=Math.max(...g)*1.08,T=_-C-V,q=L=>C+T-Math.max(0,L)/at*T;s.addEventListener("mousemove",L=>{const M=e.getBoundingClientRect(),U=p/M.width,X=(L.clientX-M.left)*U;let A=0,O=1/0;for(let E=0;E<d.length;E++){const F=Math.abs(d[E]-X);F<O&&(O=F,A=E)}const B=d[A];i.style.opacity=1,o.setAttribute("x1",B),o.setAttribute("x2",B),r.setAttribute("cx",B),r.setAttribute("cy",q(g[A])),l.setAttribute("cx",B),l.setAttribute("cy",q($[A])),c.setAttribute("cx",B),c.setAttribute("cy",q(m[A]));const u=B/p*M.width,b=u>M.width/2?"left":"right";a.style.opacity=1,a.style.left=b==="right"?u+14+"px":u-14-a.offsetWidth+"px",a.style.top=Math.max(8,q(g[A])/_*M.height-a.offsetHeight/2)+"px",a.querySelector(".lib-tt-mes").textContent=`${x[A]}m · ${G(x[A])}`,a.querySelector(".lib-tt-s").textContent=v(g[A]),a.querySelector(".lib-tt-a").textContent=v($[A]),a.querySelector(".lib-tt-j").textContent=v(m[A])}),s.addEventListener("mouseleave",()=>{i.style.opacity=0,a.style.opacity=0})}function Lt(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${I.length?zt():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function zt(){const t={};for(const e of I){const a=(e.data||"").slice(0,7);t[a]||(t[a]=[]),t[a].push(e)}return Object.entries(t).sort((e,a)=>a[0].localeCompare(e[0])).map(([e,a])=>{const[i,s]=e.split("-"),o=a.reduce((r,l)=>r+Number(l.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${nt[parseInt(s)-1]} / ${i}</span>
        <span class="lib-mes-tot">${v(o)}</span>
      </div>
      ${a.map(r=>{const l=h.find(c=>c.id===r.meta_id);return`
        <div class="lib-ap-row" data-ap-edit="${r.id}" title="Clica pra editar">
          <div class="lib-ap-data">${xt(r.data)}</div>
          <div class="lib-ap-meta">${l?`<span class="lib-ap-tag" style="background:${ft(l.cor||"#C5F82A",.15)};color:${l.cor||"#C5F82A"}">${l.icone||"🎯"} ${w(l.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${w(r.fonte||"manual")}${r.observacao?" · "+w(r.observacao):""}</div>
          <div class="lib-ap-val">${v(Number(r.valor))}</div>
          <button class="lib-ap-del" data-aid="${r.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function Dt(t){var e,a,i,s;t.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(o=>o.addEventListener("click",()=>lt())),(e=t.querySelector("#sim-aporte"))==null||e.addEventListener("input",o=>R({aporte:+o.target.value})),(a=t.querySelector("#sim-taxa"))==null||a.addEventListener("input",o=>R({taxa:+o.target.value})),(i=t.querySelector("#sim-meses"))==null||i.addEventListener("input",o=>R({meses:+o.target.value})),(s=t.querySelector("#sim-meta"))==null||s.addEventListener("change",o=>{n.metaId=o.target.value,N()}),t.querySelectorAll(".lib-qk").forEach(o=>o.addEventListener("click",()=>R({aporte:+o.dataset.pmt}))),t.addEventListener("click",async o=>{const r=o.target.closest("[data-aporte]"),l=o.target.closest("[data-sim]"),c=o.target.closest("[data-meta-edit]"),d=o.target.closest(".lib-ap-del"),g=o.target.closest("#lib-selic-refresh");if(g){o.stopPropagation(),g.classList.add("spinning");const m=await tt({manual:!0});if(g.classList.remove("spinning"),m){n.taxa=Number(y.selic_aa);const x=document.getElementById("sim-taxa");x&&document.activeElement!==x&&(x.value=n.taxa,R({taxa:n.taxa}))}return}if(r){ot({metaId:r.dataset.aporte||null});return}if(l){n.metaId=l.dataset.sim,N(),setTimeout(()=>{var m;return(m=document.querySelector(".lib-sim"))==null?void 0:m.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(c){const m=h.find(x=>x.id===c.dataset.metaEdit);m&&lt(m);return}if(d){if(o.stopPropagation(),!confirm("Excluir esse aporte?"))return;const{error:m}=await k.from("aportes_fin").delete().eq("id",d.dataset.aid);if(m)return f("Erro: "+m.message,"err");f("Aporte removido"),N();return}const $=o.target.closest("[data-ap-edit]");if($){const m=I.find(x=>x.id===$.dataset.apEdit);m&&ot({aporte:m})}})}function R(t){Object.assign(n,t);const e=document.getElementById("content"),a=h.find(m=>m.id===n.metaId)||h.find(m=>m.principal)||h[0];if(!a)return;e.querySelectorAll(".lib-slider-v")[0].textContent=v(n.aporte),e.querySelectorAll(".lib-slider-v")[1].textContent=n.taxa.toFixed(2)+"% a.a.",e.querySelectorAll(".lib-slider-v")[2].textContent=`${n.meses} meses (${(n.meses/12).toFixed(1)} anos)`;const i=P(a),s=Number(a.valor_alvo),o=et({pv:i,pmt:n.aporte,taxaAA:n.taxa,meses:n.meses}),r=o[o.length-1],l=i+n.aporte*n.meses,c=e.querySelector(".lib-sim-chart");if(c){const m=c.querySelector(".lib-chart-legend");c.innerHTML=bt(o,s)+(m?m.outerHTML:""),vt(c)}const d=e.querySelectorAll("#lib-stats .lib-stat-val"),g=e.querySelectorAll("#lib-stats .lib-stat-sub");d[2]&&(d[2].textContent=v(r.saldo),g[2].textContent="Juros: "+v(r.saldo-l));const $=Y({pv:i,pmt:n.aporte,taxaAA:n.taxa,meta:s});d[3]&&(d[3].textContent=v(Math.max(0,s-i)),g[3].textContent=$!=null?`Bate em ${G($)}`:"Aumente o aporte")}function ot({metaId:t=null,aporte:e=null}={}){var $,m,x;const a=new Date().toISOString().slice(0,10),i=D(),s=!!e,o=s?e.meta_id||"":t||(($=h.find(p=>p.principal))==null?void 0:$.id)||((m=h[0])==null?void 0:m.id)||"",r=s?e.valor:i||"",l=s?e.data:a,c=s&&e.fonte||"manual",d=s&&e.observacao||"",g=["manual","faturamento","bonus","outro"].map(p=>`<option value="${p}"${p===c?" selected":""}>${p==="manual"?"Manual":p==="faturamento"?"Faturamento":p==="bonus"?"Bônus / Extra":"Outro"}</option>`).join("");rt(s?"Editar aporte":"Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${h.map(p=>`<option value="${p.id}"${p.id===o?" selected":""}>${p.icone||"🎯"} ${w(p.nome)}</option>`).join("")}
        <option value=""${o===""?" selected":""}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${r}">
      ${!s&&i?`<div class="lib-hint">Sugestão: ${v(i)} (${y.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data ${s?'<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>':""}</label>
      <input class="fi" type="date" id="ap-data" value="${l}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${g}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${w(d)}">
    </div>
  `,`
    ${s?'<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>':""}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${s?"Salvar alteração":"Salvar aporte"}</button>
  `),document.getElementById("ap-cancel").addEventListener("click",z),(x=document.getElementById("ap-del"))==null||x.addEventListener("click",async()=>{if(!confirm("Excluir esse aporte?"))return;const{error:p}=await k.from("aportes_fin").delete().eq("id",e.id);if(p)return f("Erro: "+p.message,"err");z(),f("Aporte removido"),N()}),document.getElementById("ap-save").addEventListener("click",async()=>{const p=parseFloat(document.getElementById("ap-val").value)||0;if(p<=0)return f("Valor inválido","err");const _={valor:p,data:document.getElementById("ap-data").value||a,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:C}=s?await k.from("aportes_fin").update(_).eq("id",e.id):await k.from("aportes_fin").insert(_);if(C)return f("Erro: "+C.message,"err");z(),f(s?"Aporte atualizado":"Aporte registrado 🚀"),N()})}function lt(t={}){var r;const e=!t.id,a=t.icone||it[0],i=t.cor||Z[h.length%Z.length],s=it.map(l=>`<button type="button" class="lib-ico-pick${l===a?" on":""}" data-ico="${l}">${l}</button>`).join(""),o=Z.map(l=>`<button type="button" class="lib-cor-pick${l===i?" on":""}" style="background:${l}" data-cor="${l}"></button>`).join("");rt(e?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${w(t.nome||"")}">
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
      <div class="lib-ico-row" id="m-icones">${s}</div>
      <input type="hidden" id="m-ico" value="${a}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="m-cores">${o}</div>
      <input type="hidden" id="m-cor" value="${i}">
    </div>
  `,`
    ${e?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",l=>{const c=l.target.closest(".lib-ico-pick");c&&(document.querySelectorAll(".lib-ico-pick").forEach(d=>d.classList.remove("on")),c.classList.add("on"),document.getElementById("m-ico").value=c.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",l=>{const c=l.target.closest(".lib-cor-pick");c&&(document.querySelectorAll(".lib-cor-pick").forEach(d=>d.classList.remove("on")),c.classList.add("on"),document.getElementById("m-cor").value=c.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",z),(r=document.getElementById("m-del"))==null||r.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${t.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:l}=await k.from("metas_fin").delete().eq("id",t.id);if(l)return f("Erro: "+l.message,"err");z(),f("Meta excluída"),N()}),document.getElementById("m-save").addEventListener("click",async()=>{const l=document.getElementById("m-nome").value.trim(),c=parseFloat(document.getElementById("m-alvo").value)||0;if(!l)return f("Nome obrigatório","err");if(c<=0)return f("Valor alvo inválido","err");const d=document.getElementById("m-principal").checked,g={nome:l,valor_alvo:c,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:d,atualizado_em:new Date().toISOString()};d&&await k.from("metas_fin").update({principal:!1}).neq("id",t.id||"00000000-0000-0000-0000-000000000000");const{error:$}=t.id?await k.from("metas_fin").update(g).eq("id",t.id):await k.from("metas_fin").insert(g);if($)return f("Erro: "+$.message,"err");z(),f(t.id?"Meta atualizada":"Meta criada 🎯"),N()})}function Rt(t){return Math.round(t).toLocaleString("pt-BR")}function H(t){return t>=1e6?(t/1e6).toFixed(1).replace(/\.0$/,"")+"M":t>=1e3?(t/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(t).toString()}function G(t){const e=new Date;return e.setMonth(e.getMonth()+t),nt[e.getMonth()]+"/"+e.getFullYear()}function w(t){return String(t||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function ft(t,e){const a=t.replace("#",""),i=parseInt(a.slice(0,2),16),s=parseInt(a.slice(2,4),16),o=parseInt(a.slice(4,6),16);return`rgba(${i},${s},${o},${e})`}function Ht(t,e){const a=t.replace("#",""),i=Math.min(255,parseInt(a.slice(0,2),16)+e),s=Math.min(255,parseInt(a.slice(2,4),16)+e),o=Math.min(255,parseInt(a.slice(4,6),16)+e);return`rgb(${i},${s},${o})`}function Pt(t,e){const a=t.replace("#",""),i=Math.max(0,parseInt(a.slice(0,2),16)-e),s=Math.max(0,parseInt(a.slice(2,4),16)-e),o=Math.max(0,parseInt(a.slice(4,6),16)-e);return`rgb(${i},${s},${o})`}export{N as render};
