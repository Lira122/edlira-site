import{s as ft,d as L,t as p,o as gt,f as F}from"./index-CE09sjGB.js";const m=e=>String(e??"").replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]);let b=[],I=null;const K="teleprompter_prefs";function _(){try{return JSON.parse(localStorage.getItem(K)||"{}")}catch{return{}}}function D(e){localStorage.setItem(K,JSON.stringify(e))}function V(e,i){const n=String(e||"").trim().split(/\s+/).filter(Boolean).length;return Math.max(1,Math.round(n/i*60))}function Z(e){if(e<60)return`${e}s`;const i=Math.floor(e/60),n=e%60;return n?`${i}min ${n}s`:`${i}min`}async function P(){const e=document.getElementById("content");document.getElementById("tbacts").innerHTML=`
    <button class="btn bp" id="tp-new">+ Novo roteiro</button>`,e.innerHTML='<div class="empty">Carregando roteiros...</div>';const{data:i,error:n}=await ft("teleprompter_scripts",{order:{column:"atualizado_em",ascending:!1}});if(n){e.innerHTML=`
      <div class="empty" style="padding:60px 20px;text-align:center">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Tabela ainda nao existe</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:18px;line-height:1.5;max-width:520px;margin-left:auto;margin-right:auto">
          Roda o SQL em <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace">supabase/teleprompter-schema.sql</code>
          no <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/sql" target="_blank" style="color:var(--accent)">SQL Editor</a>
          e recarrega essa aba.
        </div>
        <div style="font-size:11px;color:var(--text-3)">${m(n.message)}</div>
      </div>`,document.getElementById("tp-new").disabled=!0;return}if(b=i||[],document.getElementById("tp-new").addEventListener("click",()=>H()),!b.length){e.innerHTML=`
      <div class="empty" style="padding:60px 20px;text-align:center">
        <div style="font-size:48px;margin-bottom:14px">🎬</div>
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhum roteiro salvo</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:22px;line-height:1.5;max-width:420px;margin-left:auto;margin-right:auto">
          Cria seu primeiro roteiro. Depois clica em Executar e o texto rola sozinho na tela enquanto voce le em frente a camera.
        </div>
        <button class="btn bp" id="tp-first">Criar meu primeiro roteiro</button>
      </div>`,document.getElementById("tp-first").addEventListener("click",()=>H());return}e.innerHTML=`
    <div style="margin-bottom:14px;font-size:12px;color:var(--text-3)">
      ${b.length} roteiro${b.length===1?"":"s"} · dica: rotaciona o celular pro modo paisagem antes de executar
    </div>
    <div id="tp-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px"></div>`,document.getElementById("tp-list").innerHTML=b.map(vt).join(""),document.querySelectorAll(".tp-play").forEach(a=>a.addEventListener("click",()=>{const r=b.find(s=>s.id===a.dataset.id);r&&bt(r)})),document.querySelectorAll(".tp-edit").forEach(a=>a.addEventListener("click",()=>{const r=b.find(s=>s.id===a.dataset.id);r&&H(r)})),document.querySelectorAll(".tp-del").forEach(a=>a.addEventListener("click",async()=>{const r=b.find(u=>u.id===a.dataset.id);if(!r||!confirm(`Excluir roteiro "${r.titulo}"?`))return;const{error:s}=await L.from("teleprompter_scripts").delete().eq("id",r.id);if(s){p("Erro: "+s.message,"err");return}p("Roteiro excluido"),P()}))}function vt(e){const i=V(e.conteudo,e.velocidade_wpm||150),n=(e.conteudo||"").replace(/\s+/g," ").slice(0,100),a=(e.tags||[]).map(r=>`<span style="font-size:10px;background:rgba(255,255,255,.04);color:var(--text-3);padding:2px 7px;border-radius:10px;border:1px solid var(--line)">${m(r)}</span>`).join("");return`
    <div class="tw" style="padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px">
        <div style="font-weight:500;font-size:14px;line-height:1.35">${m(e.titulo)}</div>
        <div style="font-size:11px;color:var(--text-3);white-space:nowrap">~${Z(i)}</div>
      </div>
      <div style="font-size:12px;color:var(--text-3);margin-bottom:10px;line-height:1.5">${m(n)}${(e.conteudo||"").length>100?"…":""}</div>
      ${a?`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">${a}</div>`:""}
      <div style="display:flex;gap:6px;padding-top:10px;border-top:1px solid var(--line)">
        <button class="btn bp bsm tp-play" data-id="${e.id}" style="flex:1">▶ Executar</button>
        <button class="btn bg bsm tp-edit" data-id="${e.id}">✎</button>
        <button class="btn bd bsm tp-del" data-id="${e.id}">🗑</button>
      </div>
      ${e.vezes_usado>0?`<div style="font-size:10px;color:var(--text-3);margin-top:8px">Usado ${e.vezes_usado}x</div>`:""}
    </div>`}function H(e={}){const i=!e.id,n=(e.tags||[]).join(", "),a=e.conteudo||"",r=e.velocidade_wpm||150,s=e.tamanho_fonte||48;gt(i?"Novo roteiro":"Editar roteiro",`
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Titulo *</label>
      <input class="fi" id="tp-titulo" value="${m(e.titulo||"")}" placeholder="Ex: Reel Marmoraria Colorado antes e depois" autofocus>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Roteiro *</label>
      <textarea class="fta" id="tp-conteudo" rows="14" placeholder="Cola aqui o texto que voce vai ler. Quebras de linha viram pausas naturais.">${m(a)}</textarea>
      <div id="tp-stats" style="font-size:11px;color:var(--text-3);margin-top:5px"></div>
    </div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg">
        <label class="fl">Velocidade (palavras/min)</label>
        <input class="fi" type="number" id="tp-wpm" value="${r}" min="60" max="300" step="10">
        <div style="font-size:10px;color:var(--text-3);margin-top:3px">150 = leitura normal · 180 = ritmo Reels · 220 = rapido</div>
      </div>
      <div class="fg">
        <label class="fl">Tamanho da fonte</label>
        <input class="fi" type="number" id="tp-fonte" value="${s}" min="24" max="120" step="4">
        <div style="font-size:10px;color:var(--text-3);margin-top:3px">48 = padrao · maior pra celular longe do olho</div>
      </div>
    </div>
    <div class="fg">
      <label class="fl">Tags (separadas por virgula)</label>
      <input class="fi" id="tp-tags" value="${m(n)}" placeholder="reel, adriane, tema-A">
    </div>
  `,`
    ${i?"":'<button class="btn bd" id="tp-del-modal">Excluir</button>'}
    <button class="btn bg" id="tp-cancel">Cancelar</button>
    <button class="btn bp" id="tp-save">${i?"Salvar":"Atualizar"}</button>
  `);const u=()=>{const g=document.getElementById("tp-conteudo").value,c=Number(document.getElementById("tp-wpm").value)||150,x=g.trim().split(/\s+/).filter(Boolean).length,d=V(g,c);document.getElementById("tp-stats").textContent=`${x} palavras · duracao estimada ~${Z(d)}`};document.getElementById("tp-conteudo").addEventListener("input",u),document.getElementById("tp-wpm").addEventListener("input",u),u(),document.getElementById("tp-cancel").addEventListener("click",F),i||document.getElementById("tp-del-modal").addEventListener("click",async()=>{confirm(`Excluir "${e.titulo}"?`)&&(await L.from("teleprompter_scripts").delete().eq("id",e.id),F(),p("Roteiro excluido"),P())}),document.getElementById("tp-save").addEventListener("click",async()=>{const g=document.getElementById("tp-titulo").value.trim(),c=document.getElementById("tp-conteudo").value.trim();if(!g)return p("Titulo obrigatorio","err");if(!c)return p("Roteiro vazio","err");const x={titulo:g,conteudo:c,velocidade_wpm:Number(document.getElementById("tp-wpm").value)||150,tamanho_fonte:Number(document.getElementById("tp-fonte").value)||48,tags:document.getElementById("tp-tags").value.split(",").map(l=>l.trim()).filter(Boolean),atualizado_em:new Date().toISOString()},d=i?L.from("teleprompter_scripts").insert(x).select().single():L.from("teleprompter_scripts").update(x).eq("id",e.id).select().single(),{error:y}=await d;if(y)return p("Erro: "+y.message,"err");p(i?"Roteiro criado":"Atualizado"),F(),P()})}async function bt(e){const i=_();let n=i.wpm??e.velocidade_wpm??150,a=i.fonte??e.tamanho_fonte??48,r=!!i.mirror,s=!1,u=0,g=0,c=0,x=0,d=null,y=!1,l=null,C=[],N=0,w=0;const f=document.createElement("div");f.id="tp-player-ov",f.setAttribute("role","application"),f.innerHTML=`
    <video id="tp-cam" class="tp-cam" autoplay muted playsinline></video>
    <div class="tp-player-marker"></div>
    <div class="tp-player-scroll" id="tp-scroll">
      <div class="tp-player-inner">
        <div class="tp-player-topspacer"></div>
        <div class="tp-player-texto" id="tp-texto">${m(e.conteudo).replace(/\n/g,"<br>")}</div>
        <div class="tp-player-botspacer"></div>
      </div>
    </div>
    <div class="tp-rec-badge" id="tp-rec-badge" style="display:none">
      <span class="tp-rec-dot"></span><span id="tp-rec-time">0:00</span>
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
      <button class="tp-btn ${r?"tp-btn-on":""}" id="tp-mirror" title="Modo espelho">⇋</button>
      <button class="tp-btn" id="tp-cam-btn" title="Ativar camera">🎥</button>
      <button class="tp-btn tp-btn-rec" id="tp-rec-btn" style="display:none" title="Gravar">🔴</button>
    </div>
    <div class="tp-player-hint" id="tp-hint">Toque na tela pra play/pause</div>
    <style>
      #tp-player-ov {
        position:fixed;inset:0;z-index:9999;background:#000;color:#fff;
        display:flex;flex-direction:column;align-items:stretch;
        overflow:hidden;-webkit-user-select:none;user-select:none;
      }
      .tp-cam {
        position:absolute;inset:0;width:100%;height:100%;
        object-fit:cover;z-index:0;opacity:0;
        transition:opacity .3s;
        /* Espelha o preview da camera frontal (self-view natural) */
        transform: scaleX(-1);
      }
      #tp-player-ov.tp-cam-on .tp-cam { opacity:1 }
      #tp-player-ov.tp-cam-on .tp-player-texto {
        text-shadow: 0 0 12px rgba(0,0,0,.95), 0 2px 8px rgba(0,0,0,.9), 0 0 24px rgba(0,0,0,.6);
        color: #fff;
      }
      #tp-player-ov.tp-cam-on .tp-player-scroll {
        background: linear-gradient(180deg,
          rgba(0,0,0,.35) 0%,
          rgba(0,0,0,.5) 30%,
          rgba(0,0,0,.5) 60%,
          rgba(0,0,0,.35) 100%);
      }
      .tp-rec-badge {
        position:absolute;top: max(18px, env(safe-area-inset-top));
        left:50%;transform:translateX(-50%);
        display:flex;align-items:center;gap:8px;
        background:rgba(255,0,0,.85);color:#fff;
        padding:6px 14px;border-radius:20px;
        font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;
        z-index:20;box-shadow:0 4px 12px rgba(0,0,0,.4);
      }
      .tp-rec-dot {
        width:9px;height:9px;border-radius:50%;background:#fff;
        animation: tp-rec-pulse 1s infinite;
      }
      @keyframes tp-rec-pulse {
        0%,100% { opacity:1 } 50% { opacity:.3 }
      }
      .tp-btn-rec { background:rgba(255,0,0,.2);border-color:rgba(255,0,0,.4) }
      .tp-btn-rec.on { background:#ff3b3b;color:#fff }
      .tp-player-marker {
        position:absolute;left:0;right:0;top:35%;height:2px;
        background:linear-gradient(90deg,transparent,#C5F82A,transparent);
        opacity:.45;pointer-events:none;z-index:10;
      }
      .tp-player-scroll {
        flex:1;overflow:hidden;position:relative;z-index:5;
      }
      .tp-player-inner {
        transform: ${r?"scaleX(-1)":"none"};
        transition: transform .2s;
        padding: 0 max(24px, env(safe-area-inset-left)) 0 max(24px, env(safe-area-inset-right));
      }
      .tp-player-topspacer { height: 45vh; }
      .tp-player-botspacer { height: 60vh; }
      .tp-player-texto {
        font-family:'Inter',system-ui,sans-serif;
        font-weight:500;
        font-size:${a}px;
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
        .tp-player-texto { font-size:${Math.max(28,a-8)}px }
        .tp-btn { padding:9px 12px;font-size:14px }
        .tp-btn-play { font-size:19px;min-width:56px }
        .tp-badge { min-width:60px;font-size:11px }
      }
    </style>`,document.body.appendChild(f);const h=document.getElementById("tp-scroll"),tt=f.querySelector(".tp-player-inner"),A=document.getElementById("tp-play"),et=document.getElementById("tp-close"),O=document.getElementById("tp-mirror"),at=document.getElementById("tp-speed-lbl"),nt=document.getElementById("tp-texto"),B=document.getElementById("tp-controls"),G=document.getElementById("tp-hint");async function ot(){if("wakeLock"in navigator)try{I=await navigator.wakeLock.request("screen")}catch{}}async function U(){try{await(I==null?void 0:I.release()),I=null}catch{}}function q(){B.classList.remove("hidden"),clearTimeout(x),x=setTimeout(()=>{s&&B.classList.add("hidden")},2800)}function it(){const t=n/10,o=a*1.35;return t*o/60}function X(t){if(!s)return;c||(c=t);const o=(t-c)/1e3;c=t,g+=it()*o,h.scrollTop=g,h.scrollTop+h.clientHeight>=h.scrollHeight-4&&(z(),B.classList.remove("hidden")),u=requestAnimationFrame(X)}function R(){s||(s=!0,c=0,A.textContent="⏸",G.classList.add("hidden"),q(),ot(),u=requestAnimationFrame(X))}function z(){s=!1,A.textContent="▶",B.classList.remove("hidden"),cancelAnimationFrame(u),U()}function j(){s?z():R()}function Q(){if(z(),l&&l.state!=="inactive")try{l.stop()}catch{}w&&clearInterval(w),d&&(d.getTracks().forEach(t=>t.stop()),d=null),U(),f.remove(),L.from("teleprompter_scripts").update({vezes_usado:(e.vezes_usado||0)+1,ultimo_uso:new Date().toISOString()}).eq("id",e.id).then(()=>{},()=>{}),document.removeEventListener("keydown",Y),document.fullscreenElement&&document.exitFullscreen().catch(()=>{})}async function rt(){try{d=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1920},height:{ideal:1080}},audio:!0});const t=document.getElementById("tp-cam");t.srcObject=d,y=!0,f.classList.add("tp-cam-on"),document.getElementById("tp-cam-btn").textContent="🎥",document.getElementById("tp-cam-btn").classList.add("tp-btn-on"),document.getElementById("tp-rec-btn").style.display="",p("Camera ativa. Texto rola por cima do video.")}catch(t){console.error("[tp-cam]",t),p("Nao consegui acessar a camera: "+(t.message||t.name),"err")}}function st(){l&&l.state!=="inactive"&&W(),d&&(d.getTracks().forEach(t=>t.stop()),d=null),document.getElementById("tp-cam").srcObject=null,y=!1,f.classList.remove("tp-cam-on"),document.getElementById("tp-cam-btn").classList.remove("tp-btn-on"),document.getElementById("tp-rec-btn").style.display="none"}function lt(){const t=["video/mp4;codecs=avc1,mp4a","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"];for(const o of t)if(MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(o))return o;return""}function dt(){if(!d)return;C=[];const t=lt();try{l=new MediaRecorder(d,t?{mimeType:t,videoBitsPerSecond:4e6}:void 0)}catch{p("Gravacao nao suportada nesse navegador","err");return}l.ondataavailable=o=>{o.data&&o.data.size&&C.push(o.data)},l.onstop=()=>{const o=l.mimeType||t||"video/webm",E=new Blob(C,{type:o}),k=URL.createObjectURL(E),v=o.includes("mp4")?"mp4":"webm",S=`${e.titulo.replace(/[^\w-]+/g,"_").slice(0,40)}_${new Date().toISOString().slice(0,16).replace(/[:T]/g,"-")}.${v}`;ct(k,S,E.size)},l.start(1e3),N=Date.now(),document.getElementById("tp-rec-badge").style.display="flex",document.getElementById("tp-rec-btn").textContent="⏹",document.getElementById("tp-rec-btn").classList.add("on"),w=setInterval(()=>{const o=Math.floor((Date.now()-N)/1e3),E=Math.floor(o/60),k=o%60;document.getElementById("tp-rec-time").textContent=`${E}:${String(k).padStart(2,"0")}`},500),s||R()}function W(){if(!(!l||l.state==="inactive")){try{l.stop()}catch{}clearInterval(w),w=0,document.getElementById("tp-rec-badge").style.display="none",document.getElementById("tp-rec-btn").textContent="🔴",document.getElementById("tp-rec-btn").classList.remove("on"),s&&z()}}function pt(){y&&(l&&l.state==="recording"?W():dt())}function ct(t,o,E){const k=(E/1024/1024).toFixed(1),v=document.createElement("div");v.style.cssText=`
      position:fixed;inset:0;background:rgba(0,0,0,.94);z-index:10001;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:24px;gap:16px;
    `,v.innerHTML=`
      <div style="font-size:14px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Gravaçao pronta</div>
      <video src="${t}" controls playsinline style="max-width:min(90vw,720px);max-height:60vh;border-radius:10px;border:1px solid rgba(255,255,255,.08)"></video>
      <div style="font-size:12px;color:var(--text-3)">${m(o)} · ${k} MB</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <a href="${t}" download="${m(o)}" class="btn bp" style="text-decoration:none;padding:12px 22px">⬇ Baixar</a>
        <button class="btn bg" id="tp-share" style="padding:12px 22px">Compartilhar</button>
        <button class="btn bd" id="tp-descartar" style="padding:12px 22px">Descartar</button>
      </div>
      <div style="font-size:11px;color:var(--text-3);max-width:480px;text-align:center;line-height:1.5">
        No celular: apos baixar, o arquivo vai pra pasta Downloads. Voce pode subir no Instagram/TikTok/YouTube depois. No iPhone use o botao Compartilhar pra salvar no Rolo.
      </div>
    `,document.body.appendChild(v),v.querySelector("#tp-descartar").addEventListener("click",()=>{URL.revokeObjectURL(t),v.remove()}),v.querySelector("#tp-share").addEventListener("click",async()=>{if(!navigator.share){p("Compartilhamento nao suportado, use Baixar","warn");return}try{const J=await(await fetch(t)).blob(),ut=new File([J],o,{type:J.type});await navigator.share({files:[ut],title:e.titulo})}catch(S){S.name!=="AbortError"&&p("Erro ao compartilhar","err")}})}function Y(t){t.key==="Escape"&&(Q(),t.preventDefault()),t.key===" "&&(j(),t.preventDefault()),t.key==="ArrowUp"&&(a=Math.min(120,a+4),$()),t.key==="ArrowDown"&&(a=Math.max(24,a-4),$()),t.key==="ArrowRight"&&(n=Math.min(300,n+10),M()),t.key==="ArrowLeft"&&(n=Math.max(60,n-10),M())}function $(){nt.style.fontSize=a+"px",D({..._(),fonte:a})}function M(){at.textContent=n+" wpm",D({..._(),wpm:n})}function mt(){tt.style.transform=r?"scaleX(-1)":"none",O.classList.toggle("tp-btn-on",r),D({..._(),mirror:r})}A.addEventListener("click",j),et.addEventListener("click",Q),O.addEventListener("click",()=>{r=!r,mt()}),document.getElementById("tp-cam-btn").addEventListener("click",()=>{y?st():rt()}),document.getElementById("tp-rec-btn").addEventListener("click",pt),document.getElementById("tp-speed-up").addEventListener("click",()=>{n=Math.min(300,n+10),M()}),document.getElementById("tp-speed-down").addEventListener("click",()=>{n=Math.max(60,n-10),M()}),document.getElementById("tp-font-up").addEventListener("click",()=>{a=Math.min(120,a+4),$()}),document.getElementById("tp-font-down").addEventListener("click",()=>{a=Math.max(24,a-4),$()}),h.addEventListener("click",t=>{t.target.closest(".tp-btn")||t.target.closest(".tp-btn-group")||j()}),h.addEventListener("touchstart",q,{passive:!0}),h.addEventListener("mousemove",q),document.addEventListener("keydown",Y),setTimeout(()=>G.classList.add("hidden"),4e3);try{await document.documentElement.requestFullscreen()}catch{}const T=document.createElement("div");T.style.cssText=`
    position:fixed;inset:0;background:rgba(0,0,0,.6);
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk','Inter',sans-serif;font-size:200px;
    font-weight:700;color:#C5F82A;z-index:10000;transition:opacity .3s;
  `,f.appendChild(T);for(const t of["3","2","1","GO"])T.textContent=t,await new Promise(o=>setTimeout(o,t==="GO"?500:800));T.remove(),R()}export{P as render};
