// Estructura de datos Graph en JavaScript (adjacency list) con BFS y DFS
class Graph {
  constructor(directed = false) {
    this.directed = directed;
    this.adj = new Map(); // node -> [{node, weight}, ...]
  }

  addNode(v) {
    if (!this.adj.has(v)) this.adj.set(v, []);
  }

  addEdge(u, v, weight = 1) {
    this.addNode(u);
    this.addNode(v);
    this.adj.get(u).push({ node: v, weight });
    if (!this.directed) this.adj.get(v).push({ node: u, weight });
  }

  neighbors(v) {
    return (this.adj.get(v) || []).map(x => x.node);
  }

  nodes() {
    return Array.from(this.adj.keys());
  }

  toAdjacencyList() {
    const obj = {};
    for (const [k, arr] of this.adj.entries()) {
      obj[k] = arr.map(x => x.node);
    }
    return obj;
  }

  toAdjacencyMatrix() {
    const nodes = this.nodes();
    const idx = Object.create(null);
    nodes.forEach((n, i) => (idx[n] = i));
    const N = nodes.length;
    const mat = Array.from({ length: N }, () => Array(N).fill(0));
    for (const [u, arr] of this.adj.entries()) {
      for (const e of arr) {
        const i = idx[u];
        const j = idx[e.node];
        mat[i][j] = e.weight || 1;
      }
    }
    return { nodes, mat };
  }

  bfs(start) {
    if (!this.adj.has(start)) return { order: [], distance: {}, parent: {} };
    const q = [];
    const visited = new Set();
    const parent = Object.create(null);
    const distance = Object.create(null);
    q.push(start);
    visited.add(start);
    distance[start] = 0;
    const order = [];
    while (q.length) {
      const v = q.shift();
      order.push(v);
      for (const w of this.neighbors(v)) {
        if (!visited.has(w)) {
          visited.add(w);
          parent[w] = v;
          distance[w] = distance[v] + 1;
          q.push(w);
        }
      }
    }
    return { order, distance, parent };
  }

  dfs(start) {
    if (!this.adj.has(start)) return { order: [], parent: {} };
    const visited = new Set();
    const parent = Object.create(null);
    const order = [];
    const self = this;
    (function visit(v) {
      visited.add(v);
      order.push(v);
      for (const w of self.neighbors(v)) {
        if (!visited.has(w)) {
          parent[w] = v;
          visit(w);
        }
      }
    })(start);
    return { order, parent };
  }

  static sampleGraph() {
    // Crea el grafo ejemplo usado en los posts: A-B, A-C, B-C, B-D, C-D, C-E
    const g = new Graph(false);
    g.addEdge('A', 'B');
    g.addEdge('A', 'C');
    g.addEdge('B', 'C');
    g.addEdge('B', 'D');
    g.addEdge('C', 'D');
    g.addEdge('C', 'E');
    return g;
  }
}

// Exponer en window para uso en páginas estáticas
if (typeof window !== 'undefined') window.Graph = Graph;

