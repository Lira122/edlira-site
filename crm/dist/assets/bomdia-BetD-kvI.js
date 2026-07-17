import{s as J,d as c,e as K,c as u,h as x,l as V}from"./index-CSO0r_Qf.js";const N=["quem madruga, tem cliente antes das 10.","meta grande não se resolve num dia — se resolve TODO dia.","aporte pequeno, todo mês, > aporte grande esporádico.","o dia de hoje é o único que você tem controle real.","lead quente esfria em 4h. bora responder.","faturamento não paga a Liberdade, aporte paga.","ninguém acorda R$100k mais rico. você acorda R$500 mais rico, 200 vezes.","foco no processo. resultado é consequência."];async function ta(){const i=document.getElementById("content");i.innerHTML='<div class="empty">Preparando seu briefing...</div>';try{const e=new Date,r=e.getHours(),d=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo"}).format(e),t=new Date(e);t.setDate(t.getDate()-1);const s=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo"}).format(t),n=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`,[{data:b},{data:y},{data:F},{data:O},{data:R},{data:C},{data:E},{count:L},{count:Y},{count:S}]=await Promise.all([J("clientes"),c.from("faturamento").select("*"),c.from("tarefas").select("*").is("feito_em",null).order("prazo",{ascending:!0}).limit(30),c.from("metas_fin").select("*").eq("status","ativa"),c.from("aportes_fin").select("*").gte("data",n+"-01").order("data",{ascending:!1}),c.from("planos_fin").select("*").eq("ativo",!0),c.from("agenda_eventos").select("*").gte("inicio",d).order("inicio").limit(10),c.from("clientes").select("*",{count:"exact",head:!0}).eq("status","prospeccao").not("whatsapp","is",null),c.from("chatbot_conversations").select("*",{count:"exact",head:!0}).eq("lead_data->>origem","disparo_prospeccao").eq("lead_data->>disparo_dia",d),c.from("chatbot_conversations").select("*",{count:"exact",head:!0}).gte("created_at",s+"T00:00:00")]),I=(b||[]).filter(a=>["novo","qualificado","proposta"].includes(a.status)).filter(a=>{const o=new Date(a.atualizado_em||a.criado_em);return Date.now()-o.getTime()>4*3600*1e3}).sort((a,o)=>a.temperatura==="quente"?-1:1).slice(0,5),W=(F||[]).filter(a=>a.prazo&&a.prazo<d).slice(0,5),Q=(E||[]).filter(a=>{const o=new Date(a.inicio);return o>=e&&o<=new Date(e.getTime()+24*3600*1e3)}),P=(y||[]).filter(a=>a.mes===e.getMonth()+1&&a.ano===e.getFullYear()).reduce((a,o)=>a+Number(o.valor||0),0);let B=0,_=0;for(let a=1;a<=6;a++){const o=new Date(e.getFullYear(),e.getMonth()-a,1),z=(y||[]).filter(v=>v.mes===o.getMonth()+1&&v.ano===o.getFullYear()).reduce((v,m)=>v+Number(m.valor||0),0);z>0&&(B+=z,_++)}const j=_?B/_:0,f=j>0?Math.round((P/j-1)*100):0,H=(O||[]).find(a=>a.principal)||(O||[])[0],l=H?(C||[]).find(a=>a.meta_id===H.id):null,h=(R||[]).reduce((a,o)=>a+Number(o.valor||0),0);let $=0;if(l){const a=new Date(l.criado_em),o=(e.getFullYear()-a.getFullYear())*12+(e.getMonth()-a.getMonth()),v=[...l.fases||[]].sort((m,G)=>m.inicio-G.inicio);for(const m of v)m.inicio<=o&&($=Number(m.aporte)||0)}const A=$>0?Math.round(h/$*100):h>0?100:0,p=(b||[]).filter(a=>a.status!=="fechado"&&a.status!=="ativo"?!1:(a.atualizado_em||"").slice(0,10)===s),T=(R||[]).filter(a=>a.data===s),g=(b||[]).filter(a=>(a.criado_em||"").slice(0,10)===s),k=(F||[]).filter(a=>a.prazo&&(a.prazo===d||a.prioridade==="alta")).slice(0,3),w=(E||[]).filter(a=>(a.inicio||"").startsWith(d)),Z=r<6?"Boa madrugada":r<12?"Bom dia":r<18?"Boa tarde":"Boa noite",U=N[Math.floor(e.getDate()%N.length)];i.innerHTML=`
    <div class="bd">
      <!-- HERO -->
      <div class="bd-hero">
        <div class="bd-hero-left">
          <div class="bd-hero-hi">${Z}, Lira ☕</div>
          <div class="bd-hero-date">${aa(e)}, ${e.getDate()} de ${K[e.getMonth()].toLowerCase()}</div>
          <div class="bd-hero-frase">"${U}"</div>
        </div>
        <div class="bd-hero-right">
          <div class="bd-hero-metric">
            <div class="bd-hero-metric-lbl">${l?"Aderência ao plano":"Aportado no mês"}</div>
            <div class="bd-hero-metric-val ${A>=100?"ok":A>=70?"warn":"late"}">${l?A+"%":u(h)}</div>
            ${l?`<div class="bd-hero-metric-sub">${u(h)} de ${u($)}</div>`:""}
          </div>
        </div>
      </div>

      <!-- AÇÃO NECESSÁRIA -->
      ${X({leadsQuentes:I,vencidas:W,reunioes24h:Q})}

      <!-- PULSO -->
      <div class="bd-block">
        <div class="bd-block-tit">📊 Pulso do dia</div>
        <div class="bd-pulso">
          ${D("Faturamento mês",u(P),f!==0?`${f>0?"+":""}${f}% vs média 6m`:`média 6m ${u(j)}`,f>=0?"ok":"warn",()=>"go('faturamento')")}
          ${D("Prospecção pool",L||0,`${Y||0} disparados hoje`,(L||0)>20?"ok":"warn",()=>"go('prospeccao')")}
          ${D("Leads novos 24h",S||0,S>0?"respostas chegando 🔥":"sem tração ainda hoje",S>0?"ok":"muted")}
          ${D("Reuniões hoje",w.length,w.length>0?w.map(a=>q(a.inicio)).join(" · "):"agenda livre",w.length>0?"ok":"muted",()=>"go('agenda')")}
        </div>
      </div>

      <!-- WINS DE ONTEM -->
      ${p.length+T.length+g.length>0?`
      <div class="bd-block">
        <div class="bd-block-tit">🔥 Wins de ontem</div>
        <div class="bd-wins">
          ${p.length?`<div class="bd-win"><div class="bd-win-ico">💼</div><div><div class="bd-win-v">${p.length}</div><div class="bd-win-l">cliente${p.length===1?"":"s"} fechado${p.length===1?"":"s"}</div></div></div>`:""}
          ${T.length?`<div class="bd-win"><div class="bd-win-ico">💰</div><div><div class="bd-win-v">${u(T.reduce((a,o)=>a+Number(o.valor),0))}</div><div class="bd-win-l">aportado</div></div></div>`:""}
          ${g.length?`<div class="bd-win"><div class="bd-win-ico">🌱</div><div><div class="bd-win-v">${g.length}</div><div class="bd-win-l">novo${g.length===1?"":"s"} lead${g.length===1?"":"s"}</div></div></div>`:""}
        </div>
      </div>`:""}

      <!-- TOP 3 FOCO -->
      ${k.length?`
      <div class="bd-block">
        <div class="bd-block-tit">⭐ Top ${k.length} pra hoje</div>
        <div class="bd-focus">
          ${k.map((a,o)=>`
            <div class="bd-focus-row" data-go="projetos">
              <div class="bd-focus-num">${o+1}</div>
              <div class="bd-focus-body">
                <div class="bd-focus-tit">${M(a.titulo||a.descricao||"(sem título)")}</div>
                <div class="bd-focus-sub">${a.prazo?`prazo: ${x(a.prazo)}`:""} ${a.prioridade==="alta"?"· 🔴 alta":""}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>`:`<div class="bd-block">
        <div class="bd-block-tit">⭐ Foco de hoje</div>
        <div class="bd-empty">Sem tarefas pra hoje. <span class="bd-link" data-go="projetos">Adicione uma</span> ou vá pra prospecção.</div>
      </div>`}

    </div>`,i.addEventListener("click",a=>{const o=a.target.closest("[data-go]");o&&V(o.dataset.go)})}catch(e){console.error("[bomdia]",e),i.innerHTML=`<div class="empty" style="padding:40px">Erro carregando briefing: ${e.message}</div>`}}function X({leadsQuentes:i,vencidas:e,reunioes24h:r}){const d=i.length+e.length+r.length;return d?`<div class="bd-acoes">
    <div class="bd-acoes-head">
      <div class="bd-acoes-tit">⚡ Resolver AGORA</div>
      <div class="bd-acoes-count">${d} item${d===1?"":"s"}</div>
    </div>
    <div class="bd-acoes-list">
      ${i.map(t=>{const s=new Date(t.atualizado_em||t.criado_em),n=Math.floor((Date.now()-s.getTime())/36e5);return`<div class="bd-acao" data-go="pipeline">
          <div class="bd-acao-ico q">💬</div>
          <div class="bd-acao-body">
            <div class="bd-acao-tit">${M(t.nome||t.empresa||"(lead)")}${t.temperatura==="quente"?" 🔥":""}</div>
            <div class="bd-acao-sub">esperando resposta há ${n}h · ${t.status}</div>
          </div>
          <div class="bd-acao-cta">→</div>
        </div>`}).join("")}
      ${e.map(t=>{const s=Math.max(1,Math.floor((Date.now()-new Date(t.prazo).getTime())/864e5));return`<div class="bd-acao" data-go="projetos">
          <div class="bd-acao-ico l">📌</div>
          <div class="bd-acao-body">
            <div class="bd-acao-tit">${M(t.titulo||t.descricao||"(tarefa)")}</div>
            <div class="bd-acao-sub">${s}d atrasada · prazo ${x(t.prazo)}</div>
          </div>
          <div class="bd-acao-cta">→</div>
        </div>`}).join("")}
      ${r.map(t=>{const s=new Date(t.inicio),n=Math.round((s.getTime()-Date.now())/6e4),b=n<60?`em ${n}min`:n<1440?`em ${Math.floor(n/60)}h`:`amanhã ${q(t.inicio)}`;return`<div class="bd-acao" data-go="agenda">
          <div class="bd-acao-ico r">📅</div>
          <div class="bd-acao-body">
            <div class="bd-acao-tit">${M(t.titulo||"Reunião")}</div>
            <div class="bd-acao-sub">${b} · ${s.toLocaleDateString("pt-BR")} ${q(t.inicio)}</div>
          </div>
          <div class="bd-acao-cta">→</div>
        </div>`}).join("")}
    </div>
  </div>`:`<div class="bd-clean">
    <div class="bd-clean-ico">✨</div>
    <div class="bd-clean-tit">Tudo em dia</div>
    <div class="bd-clean-sub">Nenhum lead esperando, nenhuma tarefa vencida, nenhuma reunião nas próximas 24h.<br>Bom momento pra atacar prospecção ou trabalhar num projeto profundo.</div>
  </div>`}function D(i,e,r,d,t){const s=t?t():"",n=s?`data-${s.match(/'([^']+)'/)[1]?'go="'+s.match(/'([^']+)'/)[1]+'"':""}`:"";return`<div class="bd-p ${d}" ${n}>
    <div class="bd-p-lbl">${i}</div>
    <div class="bd-p-val">${e}</div>
    <div class="bd-p-sub">${r}</div>
  </div>`}function aa(i){return["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"][i.getDay()]}function q(i){const e=new Date(i);return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function M(i){return String(i||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}export{ta as render};
