import{s as K,d as b,t as g,o as U,f as M}from"./index-CDa9fny6.js";const u=t=>String(t??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]);let m=[],x=null;const j="teleprompter_prefs";function k(){try{return JSON.parse(localStorage.getItem(j)||"{}")}catch{return{}}}function _(t){localStorage.setItem(j,JSON.stringify(t))}function N(t,a){const n=String(t||"").trim().split(/\s+/).filter(Boolean).length;return Math.max(1,Math.round(n/a*60))}function D(t){if(t<60)return`${t}s`;const a=Math.floor(t/60),n=t%60;return n?`${a}min ${n}s`:`${a}min`}async function A(){const t=document.getElementById("content");document.getElementById("tbacts").innerHTML=`
    <button class="btn bp" id="tp-new">+ Novo roteiro</button>`,t.innerHTML='<div class="empty">Carregando roteiros...</div>';const{data:a,error:n}=await K("teleprompter_scripts",{order:{column:"atualizado_em",ascending:!1}});if(n){t.innerHTML=`
      <div class="empty" style="padding:60px 20px;text-align:center">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Tabela ainda nao existe</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:18px;line-height:1.5;max-width:520px;margin-left:auto;margin-right:auto">
          Roda o SQL em <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace">supabase/teleprompter-schema.sql</code>
          no <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/sql" target="_blank" style="color:var(--accent)">SQL Editor</a>
          e recarrega essa aba.
        </div>
        <div style="font-size:11px;color:var(--text-3)">${u(n.message)}</div>
      </div>`,document.getElementById("tp-new").disabled=!0;return}if(m=a||[],document.getElementById("tp-new").addEventListener("click",()=>S()),!m.length){t.innerHTML=`
      <div class="empty" style="padding:60px 20px;text-align:center">
        <div style="font-size:48px;margin-bottom:14px">🎬</div>
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhum roteiro salvo</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:22px;line-height:1.5;max-width:420px;margin-left:auto;margin-right:auto">
          Cria seu primeiro roteiro. Depois clica em Executar e o texto rola sozinho na tela enquanto voce le em frente a camera.
        </div>
        <button class="btn bp" id="tp-first">Criar meu primeiro roteiro</button>
      </div>`,document.getElementById("tp-first").addEventListener("click",()=>S());return}t.innerHTML=`
    <div style="margin-bottom:14px;font-size:12px;color:var(--text-3)">
      ${m.length} roteiro${m.length===1?"":"s"} · dica: rotaciona o celular pro modo paisagem antes de executar
    </div>
    <div id="tp-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px"></div>`,document.getElementById("tp-list").innerHTML=m.map(Y).join(""),document.querySelectorAll(".tp-play").forEach(e=>e.addEventListener("click",()=>{const i=m.find(r=>r.id===e.dataset.id);i&&V(i)})),document.querySelectorAll(".tp-edit").forEach(e=>e.addEventListener("click",()=>{const i=m.find(r=>r.id===e.dataset.id);i&&S(i)})),document.querySelectorAll(".tp-del").forEach(e=>e.addEventListener("click",async()=>{const i=m.find(p=>p.id===e.dataset.id);if(!i||!confirm(`Excluir roteiro "${i.titulo}"?`))return;const{error:r}=await b.from("teleprompter_scripts").delete().eq("id",i.id);if(r){g("Erro: "+r.message,"err");return}g("Roteiro excluido"),A()}))}function Y(t){const a=N(t.conteudo,t.velocidade_wpm||150),n=(t.conteudo||"").replace(/\s+/g," ").slice(0,100),e=(t.tags||[]).map(i=>`<span style="font-size:10px;background:rgba(255,255,255,.04);color:var(--text-3);padding:2px 7px;border-radius:10px;border:1px solid var(--line)">${u(i)}</span>`).join("");return`
    <div class="tw" style="padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px">
        <div style="font-weight:500;font-size:14px;line-height:1.35">${u(t.titulo)}</div>
        <div style="font-size:11px;color:var(--text-3);white-space:nowrap">~${D(a)}</div>
      </div>
      <div style="font-size:12px;color:var(--text-3);margin-bottom:10px;line-height:1.5">${u(n)}${(t.conteudo||"").length>100?"…":""}</div>
      ${e?`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">${e}</div>`:""}
      <div style="display:flex;gap:6px;padding-top:10px;border-top:1px solid var(--line)">
        <button class="btn bp bsm tp-play" data-id="${t.id}" style="flex:1">▶ Executar</button>
        <button class="btn bg bsm tp-edit" data-id="${t.id}">✎</button>
        <button class="btn bd bsm tp-del" data-id="${t.id}">🗑</button>
      </div>
      ${t.vezes_usado>0?`<div style="font-size:10px;color:var(--text-3);margin-top:8px">Usado ${t.vezes_usado}x</div>`:""}
    </div>`}function S(t={}){const a=!t.id,n=(t.tags||[]).join(", "),e=t.conteudo||"",i=t.velocidade_wpm||150,r=t.tamanho_fonte||48;U(a?"Novo roteiro":"Editar roteiro",`
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Titulo *</label>
      <input class="fi" id="tp-titulo" value="${u(t.titulo||"")}" placeholder="Ex: Reel Marmoraria Colorado antes e depois" autofocus>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Roteiro *</label>
      <textarea class="fta" id="tp-conteudo" rows="14" placeholder="Cola aqui o texto que voce vai ler. Quebras de linha viram pausas naturais.">${u(e)}</textarea>
      <div id="tp-stats" style="font-size:11px;color:var(--text-3);margin-top:5px"></div>
    </div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg">
        <label class="fl">Velocidade (palavras/min)</label>
        <input class="fi" type="number" id="tp-wpm" value="${i}" min="60" max="300" step="10">
        <div style="font-size:10px;color:var(--text-3);margin-top:3px">150 = leitura normal · 180 = ritmo Reels · 220 = rapido</div>
      </div>
      <div class="fg">
        <label class="fl">Tamanho da fonte</label>
        <input class="fi" type="number" id="tp-fonte" value="${r}" min="24" max="120" step="4">
        <div style="font-size:10px;color:var(--text-3);margin-top:3px">48 = padrao · maior pra celular longe do olho</div>
      </div>
    </div>
    <div class="fg">
      <label class="fl">Tags (separadas por virgula)</label>
      <input class="fi" id="tp-tags" value="${u(n)}" placeholder="reel, adriane, tema-A">
    </div>
  `,`
    ${a?"":'<button class="btn bd" id="tp-del-modal">Excluir</button>'}
    <button class="btn bg" id="tp-cancel">Cancelar</button>
    <button class="btn bp" id="tp-save">${a?"Salvar":"Atualizar"}</button>
  `);const p=()=>{const c=document.getElementById("tp-conteudo").value,s=Number(document.getElementById("tp-wpm").value)||150,f=c.trim().split(/\s+/).filter(Boolean).length,l=N(c,s);document.getElementById("tp-stats").textContent=`${f} palavras · duracao estimada ~${D(l)}`};document.getElementById("tp-conteudo").addEventListener("input",p),document.getElementById("tp-wpm").addEventListener("input",p),p(),document.getElementById("tp-cancel").addEventListener("click",M),a||document.getElementById("tp-del-modal").addEventListener("click",async()=>{confirm(`Excluir "${t.titulo}"?`)&&(await b.from("teleprompter_scripts").delete().eq("id",t.id),M(),g("Roteiro excluido"),A())}),document.getElementById("tp-save").addEventListener("click",async()=>{const c=document.getElementById("tp-titulo").value.trim(),s=document.getElementById("tp-conteudo").value.trim();if(!c)return g("Titulo obrigatorio","err");if(!s)return g("Roteiro vazio","err");const f={titulo:c,conteudo:s,velocidade_wpm:Number(document.getElementById("tp-wpm").value)||150,tamanho_fonte:Number(document.getElementById("tp-fonte").value)||48,tags:document.getElementById("tp-tags").value.split(",").map(L=>L.trim()).filter(Boolean),atualizado_em:new Date().toISOString()},l=a?b.from("teleprompter_scripts").insert(f).select().single():b.from("teleprompter_scripts").update(f).eq("id",t.id).select().single(),{error:d}=await l;if(d)return g("Erro: "+d.message,"err");g(a?"Roteiro criado":"Atualizado"),M(),A()})}async function V(t){const a=k();let n=a.wpm??t.velocidade_wpm??150,e=a.fonte??t.tamanho_fonte??48,i=!!a.mirror,r=!1,p=0,c=0,s=0,f=0;const l=document.createElement("div");l.id="tp-player-ov",l.setAttribute("role","application"),l.innerHTML=`
    <div class="tp-player-marker"></div>
    <div class="tp-player-scroll" id="tp-scroll">
      <div class="tp-player-inner">
        <div class="tp-player-topspacer"></div>
        <div class="tp-player-texto" id="tp-texto">${u(t.conteudo).replace(/\n/g,"<br>")}</div>
        <div class="tp-player-botspacer"></div>
      </div>
    </div>
    <div class="tp-player-controls" id="tp-controls">
      <button class="tp-btn tp-btn-close" id="tp-close" title="Sair (Esc)">✕</button>
      <div class="tp-btn-group">
        <button class="tp-btn" id="tp-speed-down" title="Mais devagar">−</button>
        <span class="tp-badge" id="tp-speed-lbl">${n} wpm</span>
        <button class="tp-btn" id="tp-speed-up" title="Mais rapido">+</button>
      </div>
      <button class="tp-btn tp-btn-play" id="tp-play" title="Play/Pause (Espaco)">▶</button>
      <div class="tp-btn-group">
        <button class="tp-btn" id="tp-font-down" title="Fonte menor">A−</button>
        <button class="tp-btn" id="tp-font-up" title="Fonte maior">A+</button>
      </div>
      <button class="tp-btn ${i?"tp-btn-on":""}" id="tp-mirror" title="Modo espelho">⇋</button>
    </div>
    <div class="tp-player-hint" id="tp-hint">Toque na tela pra play/pause</div>
    <style>
      #tp-player-ov {
        position:fixed;inset:0;z-index:9999;background:#000;color:#fff;
        display:flex;flex-direction:column;align-items:stretch;
        overflow:hidden;-webkit-user-select:none;user-select:none;
      }
      .tp-player-marker {
        position:absolute;left:0;right:0;top:35%;height:2px;
        background:linear-gradient(90deg,transparent,#C5F82A,transparent);
        opacity:.45;pointer-events:none;z-index:10;
      }
      .tp-player-scroll {
        flex:1;overflow:hidden;position:relative;
      }
      .tp-player-inner {
        transform: ${i?"scaleX(-1)":"none"};
        transition: transform .2s;
        padding: 0 max(24px, env(safe-area-inset-left)) 0 max(24px, env(safe-area-inset-right));
      }
      .tp-player-topspacer { height: 45vh; }
      .tp-player-botspacer { height: 60vh; }
      .tp-player-texto {
        font-family:'Inter',system-ui,sans-serif;
        font-weight:500;
        font-size:${e}px;
        line-height:1.35;
        max-width: 1100px;
        margin: 0 auto;
        text-align:center;
        letter-spacing:-.01em;
      }
      .tp-player-controls {
        position:absolute;left:0;right:0;bottom:0;
        display:flex;align-items:center;justify-content:center;gap:14px;
        padding: 16px max(24px,env(safe-area-inset-left)) max(20px,env(safe-area-inset-bottom)) max(24px,env(safe-area-inset-right));
        background:linear-gradient(to top, rgba(0,0,0,.85), transparent);
        transition:opacity .3s;
        flex-wrap:wrap;
      }
      .tp-player-controls.hidden { opacity:0;pointer-events:none }
      .tp-btn {
        background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);
        color:#fff;font-size:15px;font-weight:600;padding:10px 14px;
        border-radius:10px;cursor:pointer;min-width:44px;
        transition: background .15s, transform .1s;
      }
      .tp-btn:active { transform: scale(.94) }
      .tp-btn:hover { background:rgba(255,255,255,.14) }
      .tp-btn-close { background:rgba(255,92,92,.15);border-color:rgba(255,92,92,.3) }
      .tp-btn-play { background:#C5F82A;color:#000;font-size:22px;min-width:66px;padding:12px 22px }
      .tp-btn-on { background:#C5F82A;color:#000 }
      .tp-btn-group { display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.04);padding:4px;border-radius:12px }
      .tp-badge { font-size:12px;color:#A0A0A0;padding:0 8px;min-width:70px;text-align:center }
      .tp-player-hint {
        position:absolute;top:18px;left:50%;transform:translateX(-50%);
        font-size:12px;color:rgba(255,255,255,.5);padding:6px 14px;
        background:rgba(0,0,0,.5);border-radius:20px;
        pointer-events:none;transition:opacity .4s;
      }
      .tp-player-hint.hidden { opacity:0 }
      @media (max-width: 720px) {
        .tp-player-texto { font-size:${Math.max(28,e-8)}px }
        .tp-btn { padding:9px 12px;font-size:14px }
        .tp-btn-play { font-size:19px;min-width:56px }
        .tp-badge { min-width:60px;font-size:11px }
      }
    </style>`,document.body.appendChild(l);const d=document.getElementById("tp-scroll"),L=l.querySelector(".tp-player-inner"),z=document.getElementById("tp-play"),O=document.getElementById("tp-close"),T=document.getElementById("tp-mirror"),G=document.getElementById("tp-speed-lbl"),Q=document.getElementById("tp-texto"),y=document.getElementById("tp-controls"),q=document.getElementById("tp-hint");async function W(){if("wakeLock"in navigator)try{x=await navigator.wakeLock.request("screen")}catch{}}async function C(){try{await(x==null?void 0:x.release()),x=null}catch{}}function I(){y.classList.remove("hidden"),clearTimeout(f),f=setTimeout(()=>{r&&y.classList.add("hidden")},2800)}function X(){const o=n/10,v=e*1.35;return o*v/60}function F(o){if(!r)return;s||(s=o);const v=(o-s)/1e3;s=o,c+=X()*v,d.scrollTop=c,d.scrollTop+d.clientHeight>=d.scrollHeight-4&&($(),y.classList.remove("hidden")),p=requestAnimationFrame(F)}function H(){r||(r=!0,s=0,z.textContent="⏸",q.classList.add("hidden"),I(),W(),p=requestAnimationFrame(F))}function $(){r=!1,z.textContent="▶",y.classList.remove("hidden"),cancelAnimationFrame(p),C()}function B(){r?$():H()}function P(){$(),C(),l.remove(),b.from("teleprompter_scripts").update({vezes_usado:(t.vezes_usado||0)+1,ultimo_uso:new Date().toISOString()}).eq("id",t.id).then(()=>{},()=>{}),document.removeEventListener("keydown",R),document.fullscreenElement&&document.exitFullscreen().catch(()=>{})}function R(o){o.key==="Escape"&&(P(),o.preventDefault()),o.key===" "&&(B(),o.preventDefault()),o.key==="ArrowUp"&&(e=Math.min(120,e+4),h()),o.key==="ArrowDown"&&(e=Math.max(24,e-4),h()),o.key==="ArrowRight"&&(n=Math.min(300,n+10),E()),o.key==="ArrowLeft"&&(n=Math.max(60,n-10),E())}function h(){Q.style.fontSize=e+"px",_({...k(),fonte:e})}function E(){G.textContent=n+" wpm",_({...k(),wpm:n})}function J(){L.style.transform=i?"scaleX(-1)":"none",T.classList.toggle("tp-btn-on",i),_({...k(),mirror:i})}z.addEventListener("click",B),O.addEventListener("click",P),T.addEventListener("click",()=>{i=!i,J()}),document.getElementById("tp-speed-up").addEventListener("click",()=>{n=Math.min(300,n+10),E()}),document.getElementById("tp-speed-down").addEventListener("click",()=>{n=Math.max(60,n-10),E()}),document.getElementById("tp-font-up").addEventListener("click",()=>{e=Math.min(120,e+4),h()}),document.getElementById("tp-font-down").addEventListener("click",()=>{e=Math.max(24,e-4),h()}),d.addEventListener("click",o=>{o.target.closest(".tp-btn")||o.target.closest(".tp-btn-group")||B()}),d.addEventListener("touchstart",I,{passive:!0}),d.addEventListener("mousemove",I),document.addEventListener("keydown",R),setTimeout(()=>q.classList.add("hidden"),4e3);try{await document.documentElement.requestFullscreen()}catch{}const w=document.createElement("div");w.style.cssText=`
    position:fixed;inset:0;background:rgba(0,0,0,.6);
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk','Inter',sans-serif;font-size:200px;
    font-weight:700;color:#C5F82A;z-index:10000;transition:opacity .3s;
  `,l.appendChild(w);for(const o of["3","2","1","GO"])w.textContent=o,await new Promise(v=>setTimeout(v,o==="GO"?500:800));w.remove(),H()}export{A as render};
