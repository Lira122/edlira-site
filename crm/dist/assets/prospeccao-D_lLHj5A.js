import{d as $}from"./index-my2fy3xs.js";let i=null;const x=o=>String(o??"").replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function R(o){if(!o)return"";const t=Math.floor((Date.now()-new Date(o).getTime())/6e4);if(t<1)return"agora";if(t<60)return`há ${t} min`;const a=Math.floor(t/60);if(a<24)return`há ${a}h`;const l=Math.floor(a/24);return l<30?`há ${l}d`:new Date(o).toLocaleDateString("pt-BR")}const k=["#4A9EFF","#A78BFA","#34D399","#F5A623","#FF6B9D","#22D3EE"];function I(o){let t=0;for(const a of String(o))t=t*31+a.charCodeAt(0)>>>0;return k[t%k.length]}const v={fila:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',sent:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',reply:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',meet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>'};async function L(){var t;i&&(clearInterval(i),i=null);const o=document.getElementById("content");document.getElementById("tbacts").innerHTML="",document.getElementById("prosp-root")||(o.innerHTML='<div class="empty">Carregando...</div>');try{const{count:a}=await $.from("clientes").select("*",{count:"exact",head:!0}).eq("status","prospeccao"),{data:l}=await $.from("chatbot_conversations").select("phone, messages, lead_data, updated_at, stage").eq("lead_data->>origem","disparo_prospeccao").order("updated_at",{ascending:!1}),c=l||[];if(((t=document.getElementById("vtitle"))==null?void 0:t.textContent)!=="Prospecção")return;const s=c.length,m=c.filter(e=>Array.isArray(e.messages)&&e.messages.some(n=>n.role==="user")).length,w=c.filter(e=>{var n;return(n=e.lead_data)==null?void 0:n.reuniao_agendada}).length,h=a||0,g=h+s,f=g?Math.round(s/g*100):0,A=s?Math.round(m/s*100):0,B=[{ic:v.fila,l:"Na fila",v:h,cor:"var(--text)"},{ic:v.sent,l:"Contatados",v:s,cor:"var(--info)"},{ic:v.reply,l:"Responderam",v:m,cor:"var(--ok)"},{ic:v.meet,l:"Reuniões",v:w,cor:"var(--accent)"}].map(e=>`
      <div class="apnl-st">
        <div class="apnl-st-ic">${e.ic}</div>
        <div class="apnl-st-l">${e.l}</div>
        <div class="apnl-st-v" style="color:${e.cor}">${e.v.toLocaleString("pt-BR")}</div>
      </div>`).join(""),b=c.slice(0,12).map(e=>{const n=e.lead_data||{},u=n.empresa||n.nome||e.phone||"—",d=Array.isArray(e.messages)?e.messages:[],p=d.length?d[d.length-1]:null,_=p!=null&&p.content?p.content.replace(/\s+/g," ").trim():"—",C=d.some(E=>E.role==="user");let r;n.reuniao_agendada?r=["meet","Reunião 🎯"]:e.stage==="encerrado"||n.opt_out?r=["off","Encerrada"]:C?r=["on","Respondeu"]:r=["wait","Aguardando"];const M=(u.replace(/[^a-zA-Z0-9]/g,"")[0]||"#").toUpperCase(),y=I(u);return`
        <div class="apnl-conv-row">
          <div class="apnl-av" style="background:${y}22;color:${y}">${M}</div>
          <div class="apnl-cinfo">
            <div class="apnl-cname">${x(u)}</div>
            <div class="apnl-cmsg">${x(_)}</div>
          </div>
          <div class="apnl-cmeta">
            <span class="apnl-chip ${r[0]}">${r[1]}</span>
            <span class="apnl-ctime">${R(e.updated_at)}</span>
          </div>
        </div>`}).join("");o.innerHTML=`
      <div class="apnl" id="prosp-root">
        <div class="prosp-prog">
          <div class="prosp-prog-top">
            <span><b style="color:var(--text)">${s.toLocaleString("pt-BR")}</b> de ${g.toLocaleString("pt-BR")} leads contatados</span>
            <span>${f}% &nbsp;·&nbsp; taxa de resposta <b style="color:var(--ok)">${A}%</b></span>
          </div>
          <div class="prosp-prog-bar"><div class="prosp-prog-fill" style="width:${f}%"></div></div>
        </div>
        <div class="apnl-stats">${B}</div>
        <div class="apnl-conv">
          <div class="apnl-conv-h">Atividade recente do disparo</div>
          ${b||'<div class="empty" style="padding:30px">Nenhum disparo ainda. Quando você rodar o <b>disparo.bat</b>, os contatos vão aparecer aqui ao vivo.</div>'}
        </div>
        <div style="font-size:11px;color:var(--text-3);text-align:right">atualiza sozinho a cada 30s</div>
      </div>`,i=setInterval(()=>{if(!document.getElementById("prosp-root")){clearInterval(i),i=null;return}L()},3e4)}catch(a){o.innerHTML=`<div class="empty">Erro ao carregar: ${a.message}</div>`}}export{L as render};
