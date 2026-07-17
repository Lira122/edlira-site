import{s as wt,d as S,t as u,o as It,f as U}from"./index-CSO0r_Qf.js";const f=e=>String(e??"").replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]);let E=[],T=null;const ot="teleprompter_prefs";function w(){try{return JSON.parse(localStorage.getItem(ot)||"{}")}catch{return{}}}function C(e){localStorage.setItem(ot,JSON.stringify(e))}function at(e,r){const a=String(e||"").trim().split(/\s+/).filter(Boolean).length;return Math.max(1,Math.round(a/r*60))}function it(e){if(e<60)return`${e}s`;const r=Math.floor(e/60),a=e%60;return a?`${r}min ${a}s`:`${r}min`}async function W(){const e=document.getElementById("content");document.getElementById("tbacts").innerHTML=`
    <button class="btn bp" id="tp-new">+ Novo roteiro</button>`,e.innerHTML='<div class="empty">Carregando roteiros...</div>';const{data:r,error:a}=await wt("teleprompter_scripts",{order:{column:"atualizado_em",ascending:!1}});if(a){e.innerHTML=`
      <div class="empty" style="padding:60px 20px;text-align:center">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Tabela ainda nao existe</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:18px;line-height:1.5;max-width:520px;margin-left:auto;margin-right:auto">
          Roda o SQL em <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace">supabase/teleprompter-schema.sql</code>
          no <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/sql" target="_blank" style="color:var(--accent)">SQL Editor</a>
          e recarrega essa aba.
        </div>
        <div style="font-size:11px;color:var(--text-3)">${f(a.message)}</div>
      </div>`,document.getElementById("tp-new").disabled=!0;return}if(E=r||[],document.getElementById("tp-new").addEventListener("click",()=>X()),!E.length){e.innerHTML=`
      <div class="empty" style="padding:60px 20px;text-align:center">
        <div style="font-size:48px;margin-bottom:14px">🎬</div>
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhum roteiro salvo</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:22px;line-height:1.5;max-width:420px;margin-left:auto;margin-right:auto">
          Cria seu primeiro roteiro. Depois clica em Executar e o texto rola sozinho na tela enquanto voce le em frente a camera.
        </div>
        <button class="btn bp" id="tp-first">Criar meu primeiro roteiro</button>
      </div>`,document.getElementById("tp-first").addEventListener("click",()=>X());return}e.innerHTML=`
    <div style="margin-bottom:14px;font-size:12px;color:var(--text-3)">
      ${E.length} roteiro${E.length===1?"":"s"} · dica: rotaciona o celular pro modo paisagem antes de executar
    </div>
    <div id="tp-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px"></div>`,document.getElementById("tp-list").innerHTML=E.map(kt).join(""),document.querySelectorAll(".tp-play").forEach(o=>o.addEventListener("click",()=>{const s=E.find(m=>m.id===o.dataset.id);s&&Lt(s)})),document.querySelectorAll(".tp-edit").forEach(o=>o.addEventListener("click",()=>{const s=E.find(m=>m.id===o.dataset.id);s&&X(s)})),document.querySelectorAll(".tp-del").forEach(o=>o.addEventListener("click",async()=>{const s=E.find(v=>v.id===o.dataset.id);if(!s||!confirm(`Excluir roteiro "${s.titulo}"?`))return;const{error:m}=await S.from("teleprompter_scripts").delete().eq("id",s.id);if(m){u("Erro: "+m.message,"err");return}u("Roteiro excluido"),W()}))}function kt(e){const r=at(e.conteudo,e.velocidade_wpm||150),a=(e.conteudo||"").replace(/\s+/g," ").slice(0,100),o=(e.tags||[]).map(s=>`<span style="font-size:10px;background:rgba(255,255,255,.04);color:var(--text-3);padding:2px 7px;border-radius:10px;border:1px solid var(--line)">${f(s)}</span>`).join("");return`
    <div class="tw" style="padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px">
        <div style="font-weight:500;font-size:14px;line-height:1.35">${f(e.titulo)}</div>
        <div style="font-size:11px;color:var(--text-3);white-space:nowrap">~${it(r)}</div>
      </div>
      <div style="font-size:12px;color:var(--text-3);margin-bottom:10px;line-height:1.5">${f(a)}${(e.conteudo||"").length>100?"…":""}</div>
      ${o?`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">${o}</div>`:""}
      <div style="display:flex;gap:6px;padding-top:10px;border-top:1px solid var(--line)">
        <button class="btn bp bsm tp-play" data-id="${e.id}" style="flex:1">▶ Executar</button>
        <button class="btn bg bsm tp-edit" data-id="${e.id}">✎</button>
        <button class="btn bd bsm tp-del" data-id="${e.id}">🗑</button>
      </div>
      ${e.vezes_usado>0?`<div style="font-size:10px;color:var(--text-3);margin-top:8px">Usado ${e.vezes_usado}x</div>`:""}
    </div>`}function X(e={}){const r=!e.id,a=(e.tags||[]).join(", "),o=e.conteudo||"",s=e.velocidade_wpm||150,m=e.tamanho_fonte||48;It(r?"Novo roteiro":"Editar roteiro",`
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Titulo *</label>
      <input class="fi" id="tp-titulo" value="${f(e.titulo||"")}" placeholder="Ex: Reel Marmoraria Colorado antes e depois" autofocus>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Roteiro *</label>
      <textarea class="fta" id="tp-conteudo" rows="14" placeholder="Cola aqui o texto que voce vai ler. Quebras de linha viram pausas naturais.">${f(o)}</textarea>
      <div id="tp-stats" style="font-size:11px;color:var(--text-3);margin-top:5px"></div>
    </div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg">
        <label class="fl">Velocidade (palavras/min)</label>
        <input class="fi" type="number" id="tp-wpm" value="${s}" min="60" max="500" step="10">
        <div style="font-size:10px;color:var(--text-3);margin-top:3px">150 = leitura normal · 180 = ritmo Reels · 220 = rapido</div>
      </div>
      <div class="fg">
        <label class="fl">Tamanho da fonte</label>
        <input class="fi" type="number" id="tp-fonte" value="${m}" min="24" max="120" step="4">
        <div style="font-size:10px;color:var(--text-3);margin-top:3px">48 = padrao · maior pra celular longe do olho</div>
      </div>
    </div>
    <div class="fg">
      <label class="fl">Tags (separadas por virgula)</label>
      <input class="fi" id="tp-tags" value="${f(a)}" placeholder="reel, adriane, tema-A">
    </div>
  `,`
    ${r?"":'<button class="btn bd" id="tp-del-modal">Excluir</button>'}
    <button class="btn bg" id="tp-cancel">Cancelar</button>
    <button class="btn bp" id="tp-save">${r?"Salvar":"Atualizar"}</button>
  `);const v=()=>{const y=document.getElementById("tp-conteudo").value,g=Number(document.getElementById("tp-wpm").value)||150,I=y.trim().split(/\s+/).filter(Boolean).length,i=at(y,g);document.getElementById("tp-stats").textContent=`${I} palavras · duracao estimada ~${it(i)}`};document.getElementById("tp-conteudo").addEventListener("input",v),document.getElementById("tp-wpm").addEventListener("input",v),v(),document.getElementById("tp-cancel").addEventListener("click",U),r||document.getElementById("tp-del-modal").addEventListener("click",async()=>{confirm(`Excluir "${e.titulo}"?`)&&(await S.from("teleprompter_scripts").delete().eq("id",e.id),U(),u("Roteiro excluido"),W())}),document.getElementById("tp-save").addEventListener("click",async()=>{const y=document.getElementById("tp-titulo").value.trim(),g=document.getElementById("tp-conteudo").value.trim();if(!y)return u("Titulo obrigatorio","err");if(!g)return u("Roteiro vazio","err");const I={titulo:y,conteudo:g,velocidade_wpm:Number(document.getElementById("tp-wpm").value)||150,tamanho_fonte:Number(document.getElementById("tp-fonte").value)||48,tags:document.getElementById("tp-tags").value.split(",").map(l=>l.trim()).filter(Boolean),atualizado_em:new Date().toISOString()},i=r?S.from("teleprompter_scripts").insert(I).select().single():S.from("teleprompter_scripts").update(I).eq("id",e.id).select().single(),{error:k}=await i;if(k)return u("Erro: "+k.message,"err");u(r?"Roteiro criado":"Atualizado"),U(),W()})}async function Lt(e){const r=w();let a=r.wpm??e.velocidade_wpm??150,o=r.fonte??e.tamanho_fonte??48,s=!!r.mirror,m=!1,v=0,y=0,g=0,I=0,i=null,k=!1,l=null,j=[],Q=0,$=0,L=[],B=w().audioDeviceId||null,M=!!w().audioModoExterno;const b=document.createElement("div");b.id="tp-player-ov",b.setAttribute("role","application"),b.innerHTML=`
    <video id="tp-cam" class="tp-cam" autoplay muted playsinline></video>
    <div class="tp-player-marker"></div>
    <div class="tp-player-scroll" id="tp-scroll">
      <div class="tp-player-inner">
        <div class="tp-player-topspacer"></div>
        <div class="tp-player-texto" id="tp-texto">${f(e.conteudo).replace(/\n/g,"<br>")}</div>
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
        <span class="tp-badge" id="tp-speed-lbl">${a} wpm</span>
        <button class="tp-btn" id="tp-speed-up" title="Mais rapido">+</button>
      </div>
      <button class="tp-btn tp-btn-play" id="tp-play" title="Play/Pause (Espaco)">▶</button>
      <div class="tp-btn-group">
        <button class="tp-btn" id="tp-font-down" title="Fonte menor">A−</button>
        <button class="tp-btn" id="tp-font-up" title="Fonte maior">A+</button>
      </div>
      <button class="tp-btn ${s?"tp-btn-on":""}" id="tp-mirror" title="Modo espelho">⇋</button>
      <button class="tp-btn" id="tp-cam-btn" title="Ativar camera">🎥</button>
      <button class="tp-btn" id="tp-mic-btn" style="display:none" title="Trocar microfone">🎙</button>
      <button class="tp-btn tp-btn-rec" id="tp-rec-btn" style="display:none" title="Gravar">🔴</button>
    </div>
    <div class="tp-mic-chip" id="tp-mic-chip" style="display:none"></div>
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
      .tp-mic-chip {
        position:absolute; top: calc(max(18px, env(safe-area-inset-top)) + 40px);
        left:50%; transform:translateX(-50%);
        background:rgba(0,0,0,.55);color:rgba(255,255,255,.75);
        padding:5px 12px; border-radius:16px;
        font-size:11px; z-index:24;
        border:1px solid rgba(255,255,255,.1);
        pointer-events:none;
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
        transform: ${s?"scaleX(-1)":"none"};
        transition: transform .2s;
        padding: 0 max(24px, env(safe-area-inset-left)) 0 max(24px, env(safe-area-inset-right));
      }
      .tp-player-topspacer { height: 45vh; }
      .tp-player-botspacer { height: 60vh; }
      .tp-player-texto {
        font-family:'Inter',system-ui,sans-serif;
        font-weight:500;
        font-size:${o}px;
        line-height:1.35;
        max-width: 1100px;
        margin: 0 auto;
        text-align:center;
        letter-spacing:-.01em;
      }
      .tp-player-controls {
        position:absolute;left:0;right:0;bottom:0;z-index:30;
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
        position:absolute;top:18px;left:50%;transform:translateX(-50%);z-index:25;
        font-size:12px;color:rgba(255,255,255,.5);padding:6px 14px;
        background:rgba(0,0,0,.5);border-radius:20px;
        pointer-events:none;transition:opacity .4s;
      }
      .tp-player-hint.hidden { opacity:0 }
      @media (max-width: 720px) {
        .tp-player-texto { font-size:${Math.max(28,o-8)}px }
        .tp-btn { padding:9px 12px;font-size:14px }
        .tp-btn-play { font-size:19px;min-width:56px }
        .tp-badge { min-width:60px;font-size:11px }
      }
    </style>`,document.body.appendChild(b);const z=document.getElementById("tp-scroll"),rt=b.querySelector(".tp-player-inner"),F=document.getElementById("tp-play"),st=document.getElementById("tp-close"),Y=document.getElementById("tp-mirror"),lt=document.getElementById("tp-speed-lbl"),dt=document.getElementById("tp-texto"),_=document.getElementById("tp-controls"),J=document.getElementById("tp-hint");async function ct(){if("wakeLock"in navigator)try{T=await navigator.wakeLock.request("screen")}catch{}}async function K(){try{await(T==null?void 0:T.release()),T=null}catch{}}function H(){_.classList.remove("hidden"),clearTimeout(I),I=setTimeout(()=>{m&&_.classList.add("hidden")},2800)}function pt(){const t=document.getElementById("tp-scroll"),n=Math.min((t==null?void 0:t.clientWidth)||400,1100)-48,c=o*.5,d=Math.max(10,Math.floor(n/c)),h=a*6/60/d,x=o*1.35;return h*x}function V(t){if(!m)return;g||(g=t);const n=(t-g)/1e3;g=t,y+=pt()*n,z.scrollTop=y,z.scrollTop+z.clientHeight>=z.scrollHeight-4&&(A(),_.classList.remove("hidden")),v=requestAnimationFrame(V)}function G(){m||(m=!0,g=0,F.textContent="⏸",J.classList.add("hidden"),H(),ct(),v=requestAnimationFrame(V))}function A(){m=!1,F.textContent="▶",_.classList.remove("hidden"),cancelAnimationFrame(v),K()}function N(){m?A():G()}function Z(){if(A(),l&&l.state!=="inactive")try{l.stop()}catch{}$&&clearInterval($),i&&(i.getTracks().forEach(t=>t.stop()),i=null),K(),b.remove(),S.from("teleprompter_scripts").update({vezes_usado:(e.vezes_usado||0)+1,ultimo_uso:new Date().toISOString()}).eq("id",e.id).then(()=>{},()=>{}),document.removeEventListener("keydown",et),document.fullscreenElement&&document.exitFullscreen().catch(()=>{})}function mt(){if(M){const n={autoGainControl:!1,noiseSuppression:!1,echoCancellation:!1,sampleRate:48e3,channelCount:1};return B&&(n.deviceId={exact:B}),n}const t={autoGainControl:!1,noiseSuppression:!0,echoCancellation:!0,sampleRate:48e3,channelCount:1};return B&&(t.deviceId={exact:B}),t}async function tt(){try{i=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30}},audio:mt()});const t=document.getElementById("tp-cam");t.srcObject=i,k=!0,b.classList.add("tp-cam-on"),document.getElementById("tp-cam-btn").textContent="🎥",document.getElementById("tp-cam-btn").classList.add("tp-btn-on"),document.getElementById("tp-rec-btn").style.display="",document.getElementById("tp-mic-btn").style.display="";try{L=(await navigator.mediaDevices.enumerateDevices()).filter(c=>c.kind==="audioinput"),ut()}catch{}u("Camera ativa. Texto rola por cima do video.")}catch(t){console.error("[tp-cam]",t),u("Nao consegui acessar a camera: "+(t.message||t.name),"err")}}function ut(){var x,P,nt;const t=document.getElementById("tp-mic-chip");if(!t)return;const n=(x=i==null?void 0:i.getAudioTracks)==null?void 0:x.call(i)[0],d=(((P=n==null?void 0:n.getSettings)==null?void 0:P.call(n))||{}).deviceId||B,p=L.find(Et=>Et.deviceId===d),h=((nt=p==null?void 0:p.label)==null?void 0:nt.replace(/\(.*\)$/,"").trim())||"Mic";t.innerHTML=`🎙 <strong style="color:#fff">${f(h.slice(0,26))}</strong>${M?' · <span style="color:#C5F82A">externo</span>':""}`,t.style.display=""}async function ft(){if(!L.length)return;const t=L.map((d,p)=>`${p+1}. ${d.label||"Mic "+(p+1)}`).join(`
`),n=prompt(`Escolhe o mic (1-${L.length}):

${t}

Ou escreve "externo" pra alternar modo mic externo (sem processing).`);if(!n)return;if(/^ext/i.test(n))M=!M,C({...w(),audioModoExterno:M});else{const d=parseInt(n,10);if(!(d>=1&&d<=L.length))return;B=L[d-1].deviceId,C({...w(),audioDeviceId:B})}l&&l.state==="recording"&&O(),i==null||i.getTracks().forEach(d=>d.stop()),i=null,await tt()}function gt(){l&&l.state!=="inactive"&&O(),i&&(i.getTracks().forEach(t=>t.stop()),i=null),document.getElementById("tp-cam").srcObject=null,k=!1,b.classList.remove("tp-cam-on"),document.getElementById("tp-cam-btn").classList.remove("tp-btn-on"),document.getElementById("tp-rec-btn").style.display="none"}function vt(){const t=["video/mp4;codecs=avc1,mp4a","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"];for(const n of t)if(MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(n))return n;return""}function bt(){if(!i)return;j=[];const t=vt(),n={videoBitsPerSecond:4e6,audioBitsPerSecond:192e3};t&&(n.mimeType=t);try{l=new MediaRecorder(i,n)}catch{try{l=new MediaRecorder(i,t?{mimeType:t,videoBitsPerSecond:4e6}:void 0)}catch{u("Gravacao nao suportada nesse navegador","err");return}}l.ondataavailable=c=>{c.data&&c.data.size&&j.push(c.data)},l.onstop=()=>{const c=l.mimeType||t||"video/webm",d=new Blob(j,{type:c}),p=URL.createObjectURL(d),h=c.includes("mp4")?"mp4":"webm",x=`${e.titulo.replace(/[^\w-]+/g,"_").slice(0,40)}_${new Date().toISOString().slice(0,16).replace(/[:T]/g,"-")}.${h}`;yt(p,x,d.size)},l.start(1e3),Q=Date.now(),document.getElementById("tp-rec-badge").style.display="flex",document.getElementById("tp-rec-btn").textContent="⏹",document.getElementById("tp-rec-btn").classList.add("on"),$=setInterval(()=>{const c=Math.floor((Date.now()-Q)/1e3),d=Math.floor(c/60),p=c%60;document.getElementById("tp-rec-time").textContent=`${d}:${String(p).padStart(2,"0")}`},500),m||G()}function O(){if(!(!l||l.state==="inactive")){try{l.stop()}catch{}clearInterval($),$=0,document.getElementById("tp-rec-badge").style.display="none",document.getElementById("tp-rec-btn").textContent="🔴",document.getElementById("tp-rec-btn").classList.remove("on"),m&&A()}}function xt(){k&&(l&&l.state==="recording"?O():bt())}function yt(t,n,c){const d=(c/1024/1024).toFixed(1),p=document.createElement("div");p.style.cssText=`
      position:fixed;inset:0;background:rgba(0,0,0,.94);z-index:10001;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:24px;gap:16px;
    `,p.innerHTML=`
      <div style="font-size:14px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Gravaçao pronta</div>
      <video src="${t}" controls playsinline style="max-width:min(90vw,720px);max-height:60vh;border-radius:10px;border:1px solid rgba(255,255,255,.08)"></video>
      <div style="font-size:12px;color:var(--text-3)">${f(n)} · ${d} MB</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <a href="${t}" download="${f(n)}" class="btn bp" style="text-decoration:none;padding:12px 22px">⬇ Baixar</a>
        <button class="btn bg" id="tp-share" style="padding:12px 22px">Compartilhar</button>
        <button class="btn bd" id="tp-descartar" style="padding:12px 22px">Descartar</button>
      </div>
      <div style="font-size:11px;color:var(--text-3);max-width:480px;text-align:center;line-height:1.5">
        No celular: apos baixar, o arquivo vai pra pasta Downloads. Voce pode subir no Instagram/TikTok/YouTube depois. No iPhone use o botao Compartilhar pra salvar no Rolo.
      </div>
    `,document.body.appendChild(p),p.querySelector("#tp-descartar").addEventListener("click",()=>{URL.revokeObjectURL(t),p.remove()}),p.querySelector("#tp-share").addEventListener("click",async()=>{if(!navigator.share){u("Compartilhamento nao suportado, use Baixar","warn");return}try{const x=await(await fetch(t)).blob(),P=new File([x],n,{type:x.type});await navigator.share({files:[P],title:e.titulo})}catch(h){h.name!=="AbortError"&&u("Erro ao compartilhar","err")}})}function et(t){t.key==="Escape"&&(Z(),t.preventDefault()),t.key===" "&&(N(),t.preventDefault()),t.key==="ArrowUp"&&(o=Math.min(120,o+4),q()),t.key==="ArrowDown"&&(o=Math.max(24,o-4),q()),t.key==="ArrowRight"&&(a=Math.min(500,a+10),R()),t.key==="ArrowLeft"&&(a=Math.max(60,a-10),R())}function q(){dt.style.fontSize=o+"px",C({...w(),fonte:o})}function R(){lt.textContent=a+" wpm",C({...w(),wpm:a})}function ht(){rt.style.transform=s?"scaleX(-1)":"none",Y.classList.toggle("tp-btn-on",s),C({...w(),mirror:s})}F.addEventListener("click",N),st.addEventListener("click",Z),Y.addEventListener("click",()=>{s=!s,ht()}),document.getElementById("tp-cam-btn").addEventListener("click",()=>{k?gt():tt()}),document.getElementById("tp-rec-btn").addEventListener("click",xt),document.getElementById("tp-mic-btn").addEventListener("click",ft),document.getElementById("tp-speed-up").addEventListener("click",()=>{a=Math.min(500,a+10),R()}),document.getElementById("tp-speed-down").addEventListener("click",()=>{a=Math.max(60,a-10),R()}),document.getElementById("tp-font-up").addEventListener("click",()=>{o=Math.min(120,o+4),q()}),document.getElementById("tp-font-down").addEventListener("click",()=>{o=Math.max(24,o-4),q()}),z.addEventListener("click",t=>{t.target.closest(".tp-btn")||t.target.closest(".tp-btn-group")||N()}),z.addEventListener("touchstart",H,{passive:!0}),z.addEventListener("mousemove",H),document.addEventListener("keydown",et),setTimeout(()=>J.classList.add("hidden"),4e3);try{await document.documentElement.requestFullscreen()}catch{}const D=document.createElement("div");D.style.cssText=`
    position:fixed;inset:0;background:rgba(0,0,0,.6);
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk','Inter',sans-serif;font-size:200px;
    font-weight:700;color:#C5F82A;z-index:10000;transition:opacity .3s;
  `,b.appendChild(D);for(const t of["3","2","1","GO"])D.textContent=t,await new Promise(n=>setTimeout(n,t==="GO"?500:800));D.remove(),G()}export{W as render};
