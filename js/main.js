// Código para conectar la UI del post3 con la estructura Graph
(function(){
  function el(id){return document.getElementById(id)}

  function formatResult(title, obj){
    let s = title + '\n\n';
    if (obj.order) s += 'Orden: ' + obj.order.join(' -> ') + '\n\n';
    if (obj.distance) {
      s += 'Distancias:\n';
      for (const k of Object.keys(obj.distance)) s += `  ${k}: ${obj.distance[k]}\n`;
      s += '\n';
    }
    if (obj.parent) {
      s += 'Padres:\n';
      for (const k of Object.keys(obj.parent)) s += `  ${k}: ${obj.parent[k]}\n`;
      s += '\n';
    }
    return s;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const controls = document.getElementById('graph-controls');
    if (!controls) return; // no estamos en la página correcta

    const selectStart = el('start-node');
    const btnBfs = el('run-bfs');
    const btnDfs = el('run-dfs');
    const output = el('output');

    // construir grafo ejemplo
    const g = Graph.sampleGraph();

    // poblar el select con nodos
    const nodes = g.nodes();
    selectStart.innerHTML = nodes.map(n => `<option value="${n}">${n}</option>`).join('');

    btnBfs.addEventListener('click', ()=>{
      const start = selectStart.value;
      const res = g.bfs(start);
      output.textContent = formatResult('BFS desde ' + start, res);
    });

    btnDfs.addEventListener('click', ()=>{
      const start = selectStart.value;
      const res = g.dfs(start);
      output.textContent = formatResult('DFS desde ' + start, res);
    });

    // mostrar representaciones
    const adjListEl = el('adj-list');
    const adjMatEl = el('adj-mat');
    if (adjListEl) adjListEl.textContent = JSON.stringify(g.toAdjacencyList(), null, 2);
    if (adjMatEl) {
      const data = g.toAdjacencyMatrix();
      let s = data.nodes.join(' ') + '\n';
      s += data.mat.map(row => row.join(' ')).join('\n');
      adjMatEl.textContent = s;
    }
  });
})();

// ----- Visualización y animación BFS -----
(function(){
  // Sólo ejecutar si estamos en la página que tiene #graph-svg
  function qs(id){return document.getElementById(id)}
  document.addEventListener('DOMContentLoaded', ()=>{
    const svg = qs('graph-svg');
    if (!svg) return;
    const startSelect = qs('start-node');
    const btnStep = qs('step-bfs');
    const btnPlay = qs('play-bfs');
    const btnReset = qs('reset-bfs');
    const queueState = qs('queue-state');
    const actionLog = qs('action-log');

    // reconstruir grafo (coincide con Graph.sampleGraph)
    const g = Graph.sampleGraph();

    // Helpers para manipular estilos
    function highlightNode(id, color){
      const c = qs('node-' + id);
      if (c) c.setAttribute('fill', color);
    }
    function highlightEdge(u,v,color){
      const eid = `edge-${u}-${v}`;
      const e = qs(eid);
      if (e) e.setAttribute('stroke', color);
      else {
        // try reverse
        const rid = `edge-${v}-${u}`;
        const re = qs(rid);
        if (re) re.setAttribute('stroke', color);
      }
    }
    function resetStyles(){
      for (const n of g.nodes()){
        const el = qs('node-' + n);
        if(el) el.setAttribute('fill','#fff');
      }
      const edges = ['A-B','A-C','B-C','B-D','C-D','C-E'];
      edges.forEach(id=>{
        const e = qs('edge-'+id);
        if(e) e.setAttribute('stroke','#bbb');
      });
      queueState.textContent = '';
      actionLog.textContent = '';
    }

    // generar pasos BFS detallados
    function generateBFSSteps(start){
      const steps = [];
      const q = [];
      const visited = new Set();
      const parent = {};

      // enqueue start
      q.push(start);
      steps.push({type:'enqueue', node:start, queue:[...q]});
      visited.add(start);
      steps.push({type:'visit', node:start, queue:[...q]});

      while(q.length){
        const v = q.shift();
        steps.push({type:'dequeue', node:v, queue:[...q]});
        for(const w of g.neighbors(v)){
          steps.push({type:'consider', from:v, to:w, queue:[...q]});
          if(!visited.has(w)){
            visited.add(w);
            parent[w]=v;
            q.push(w);
            steps.push({type:'discover', from:v, to:w, queue:[...q]});
          }
        }
      }
      steps.push({type:'end'});
      return steps;
    }

    // animador
    let steps = [];
    let idx = 0;
    let timer = null;

    function renderQueue(q){
      queueState.textContent = q.join(' <- ');
    }

    function logAction(a){
      actionLog.textContent += JSON.stringify(a) + '\n';
      actionLog.scrollTop = actionLog.scrollHeight;
    }

    function applyStep(s){
      if(!s) return;
      logAction(s);
      if(s.type === 'enqueue'){
        highlightNode(s.node,'#fff7d6');
      } else if(s.type === 'visit'){
        highlightNode(s.node,'#ffd699');
      } else if(s.type === 'dequeue'){
        highlightNode(s.node,'#ffbf80');
      } else if(s.type === 'consider'){
        highlightEdge(s.from,s.to,'#f0b3ff');
      } else if(s.type === 'discover'){
        highlightEdge(s.from,s.to,'#ff6a00');
        highlightNode(s.to,'#fff0f0');
      }
      if(s.queue) renderQueue(s.queue);
    }

    function stepOnce(){
      if(idx >= steps.length) return false;
      const s = steps[idx++];
      applyStep(s);
      return idx < steps.length;
    }

    function play(interval=700){
      if(timer) return;
      timer = setInterval(()=>{
        const cont = stepOnce();
        if(!cont){ clearInterval(timer); timer=null }
      }, interval);
    }

    function reset(){
      if(timer){ clearInterval(timer); timer=null }
      steps = [];
      idx = 0;
      resetStyles();
    }

    // inicializar
    reset();

    btnReset.addEventListener('click', ()=>{
      reset();
    });

    btnStep.addEventListener('click', ()=>{
      if(steps.length === 0){
        const s = startSelect.value || g.nodes()[0];
        steps = generateBFSSteps(s);
        idx = 0;
      }
      stepOnce();
    });

    btnPlay.addEventListener('click', ()=>{
      if(steps.length === 0){
        const s = startSelect.value || g.nodes()[0];
        steps = generateBFSSteps(s);
        idx = 0;
      }
      play(700);
    });
  });
})();
