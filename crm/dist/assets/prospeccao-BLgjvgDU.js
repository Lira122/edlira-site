import{d as u,t as v}from"./index-GkEKvS_c.js";let p=null;const m=o=>String(o??"").replace(/[&<>"]/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[a]);async function q(o){const a=new Date(Date.now()+31536e6).toISOString(),{data:e}=await u.from("chatbot_conversations").select("lead_data, stage").eq("phone",o).maybeSingle();if(!e){v("Conversa não encontrada.","er");return}const r={...e.lead_data||{},pausado_ate:a,stage_antes_pausa:e.stage},{error:s}=await u.from("chatbot_conversations").update({stage:"em_pausa",lead_data:r,updated_at:new Date().toISOString()}).eq("phone",o);if(s){v("Erro: "+s.message,"er");return}v("Bot pausado pra este lead."),_()}async function z(o){const{data:a}=await u.from("chatbot_conversations").select("lead_data").eq("phone",o).maybeSingle();if(!a){v("Conversa não encontrada.","er");return}const e={...a.lead_data||{}},r=e.stage_antes_pausa||"situacao";delete e.pausado_ate,delete e.stage_antes_pausa;const{error:s}=await u.from("chatbot_conversations").update({stage:r,lead_data:e,updated_at:new Date().toISOString()}).eq("phone",o);if(s){v("Erro: "+s.message,"er");return}v("Bot retomado."),_()}function F(o){if(!o)return"";const a=Math.floor((Date.now()-new Date(o).getTime())/6e4);if(a<1)return"agora";if(a<60)return`há ${a} min`;const e=Math.floor(a/60);if(e<24)return`há ${e}h`;const r=Math.floor(e/24);return r<30?`há ${r}d`:new Date(o).toLocaleDateString("pt-BR")}const k=["#4A9EFF","#A78BFA","#34D399","#F5A623","#FF6B9D","#22D3EE"];function H(o){let a=0;for(const e of String(o))a=a*31+e.charCodeAt(0)>>>0;return k[a%k.length]}const h={fila:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',sent:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',reply:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',meet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>'};async function _(){var a;p&&(clearInterval(p),p=null);const o=document.getElementById("content");document.getElementById("tbacts").innerHTML="",document.getElementById("prosp-root")||(o.innerHTML='<div class="empty">Carregando...</div>');try{const{count:e}=await u.from("clientes").select("*",{count:"exact",head:!0}).eq("status","prospeccao"),{data:r}=await u.from("chatbot_conversations").select("phone, messages, lead_data, updated_at, stage").eq("lead_data->>origem","disparo_prospeccao").order("updated_at",{ascending:!1}),s=r||[];if(((a=document.getElementById("vtitle"))==null?void 0:a.textContent)!=="Prospecção")return;const l=s.length,b=s.filter(t=>Array.isArray(t.messages)&&t.messages.some(n=>n.role==="user")).length,B=s.filter(t=>{var n;return(n=t.lead_data)==null?void 0:n.reuniao_agendada}).length,w=e||0,f=w+l,$=f?Math.round(l/f*100):0,A=l?Math.round(b/l*100):0,S=[{ic:h.fila,l:"Na fila",v:w,cor:"var(--text)"},{ic:h.sent,l:"Contatados",v:l,cor:"var(--info)"},{ic:h.reply,l:"Responderam",v:b,cor:"var(--ok)"},{ic:h.meet,l:"Reuniões",v:B,cor:"var(--accent)"}].map(t=>`
      <div class="apnl-st">
        <div class="apnl-st-ic">${t.ic}</div>
        <div class="apnl-st-l">${t.l}</div>
        <div class="apnl-st-v" style="color:${t.cor}">${t.v.toLocaleString("pt-BR")}</div>
      </div>`).join(""),E=s.slice(0,12).map(t=>{const n=t.lead_data||{},c=n.empresa||n.nome||t.phone||"—",d=Array.isArray(t.messages)?t.messages:[],g=d.length?d[d.length-1]:null,C=g!=null&&g.content?g.content.replace(/\s+/g," ").trim():"—",I=d.some(L=>L.role==="user"),y=t.stage==="em_pausa";let i;y?i=["off","Pausado"]:n.reuniao_agendada?i=["meet","Reunião 🎯"]:t.stage==="encerrado"||n.opt_out?i=["off","Encerrada"]:I?i=["on","Respondeu"]:i=["wait","Aguardando"];const M=(c.replace(/[^a-zA-Z0-9]/g,"")[0]||"#").toUpperCase(),x=H(c),R=y?"Retomar":"Pausar bot",D=y?"retomar":"pausar";return`
        <div class="apnl-conv-row" data-phone="${m(t.phone)}">
          <div class="apnl-av" style="background:${x}22;color:${x}">${M}</div>
          <div class="apnl-cinfo">
            <div class="apnl-cname">${m(c)}</div>
            <div class="apnl-cmsg">${m(C)}</div>
          </div>
          <div class="apnl-cmeta">
            <span class="apnl-chip ${i[0]}">${i[1]}</span>
            <span class="apnl-ctime">${F(t.updated_at)}</span>
            <button class="btn bg bsm prosp-bot-btn" data-act="${D}" data-phone="${m(t.phone)}" style="margin-top:4px;font-size:11px;padding:4px 10px">${R}</button>
          </div>
        </div>`}).join("");o.innerHTML=`
      <div class="apnl" id="prosp-root">
        <div class="prosp-prog">
          <div class="prosp-prog-top">
            <span><b style="color:var(--text)">${l.toLocaleString("pt-BR")}</b> de ${f.toLocaleString("pt-BR")} leads contatados</span>
            <span>${$}% &nbsp;·&nbsp; taxa de resposta <b style="color:var(--ok)">${A}%</b></span>
          </div>
          <div class="prosp-prog-bar"><div class="prosp-prog-fill" style="width:${$}%"></div></div>
        </div>
        <div class="apnl-stats">${S}</div>
        <div class="apnl-conv">
          <div class="apnl-conv-h">Atividade recente do disparo</div>
          ${E||'<div class="empty" style="padding:30px">Nenhum disparo ainda. Quando você rodar o <b>disparo.bat</b>, os contatos vão aparecer aqui ao vivo.</div>'}
        </div>
        <div style="font-size:11px;color:var(--text-3);text-align:right">atualiza sozinho a cada 30s</div>
      </div>`,document.querySelectorAll(".prosp-bot-btn").forEach(t=>{t.addEventListener("click",n=>{const c=n.currentTarget.dataset.phone,d=n.currentTarget.dataset.act;c&&(d==="pausar"?q(c):z(c))})}),p=setInterval(()=>{if(!document.getElementById("prosp-root")){clearInterval(p),p=null;return}_()},3e4)}catch(e){o.innerHTML=`<div class="empty">Erro ao carregar: ${e.message}</div>`}}export{_ as render};
