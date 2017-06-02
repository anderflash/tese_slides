// import * as katex from "katex";
//import * as PriorityQueue from "js-priority-queue";
import { SlideDeck } from "./slidedeck";
import { ManualSegmentationCanvas } from "./manual-segmentation-canvas";


function fmax(s: IFTNode, i: number): number {
  return Math.max(s.connectivity, s.neighbors[i].connectivity);
}
function fmin(s: IFTNode, i: number): number {
  return Math.min(s.connectivity, s.neighbors[i].connectivity);
}

interface IAtArc {
  to: IAtNode;
  weight: number;
}
interface IAtNode {
  index: number;
  arcs: IAtArc[];
}
interface IFTNode {
  node: IAtNode;
  connectivity: number;
  root: IFTNode;
  predecessor: IFTNode;
  processed: boolean;
  neighbors: IFTNode[];
  inQueue: boolean;
}

interface IFTStep {
  s: IFTNode;
}

type ConnectivityFunc = (s: IFTNode, i: number) => number;

class AtGraph {
  public nodes: IAtNode[];
  constructor(n: number) {
    this.nodes = new Array<IAtNode>(n);
    for (let i = 0; i < n; i++) {
      this.nodes[i] = {index: i, arcs: []};
    }
  }
  public addEdge(n1: number, n2: number, weight: number) {
    this.nodes[n1].arcs.push({to: this.nodes[n2], weight});
  }
}

// class IFT {
//   public nodes: IFTNode[];
//   public queue: PriorityQueue<IFTNode>;
//   public seeds: IFTNode[];
//   public f: ConnectivityFunc;

//   constructor(graph: AtGraph, seeds: number[], f: ConnectivityFunc) {
//     this.nodes = [];
//     this.queue = new PriorityQueue<IFTNode>({ comparator: (a, b) => b.connectivity - a.connectivity});
//     for (let i = 0; i < graph.nodes.length; i++) {
//       // Fill IFT nodes based on Graph nodes
//       this.nodes[i] = {node: graph.nodes[i], connectivity: 0, root: this.nodes[i], predecessor: null, processed: false, neighbors: [], inQueue: false};
//       // Fill neighbors of IFT nodes based on Graph neighbors
//       graph.nodes[i].arcs.forEach((arc) => this.nodes[i].neighbors.push(this.nodes[arc.to.index]));
//     }
//     this.seeds = this.getNodes(seeds);
//     this.f = f;
//   }

//   public reset() {
//     // Reset nodes
//     this.nodes.forEach((node) => {
//       node.connectivity = -Infinity;
//       node.predecessor = null;
//       node.root = null;
//       node.processed = false;
//       node.inQueue = false;
//     });

//     // Reset seeds
//     this.seeds.forEach((seed) => {
//       seed.connectivity = Infinity;
//       this.queue.queue(seed);
//     });
//   }
//   public getNodes(indices: number[]): IFTNode[] {
//     const nodes: IFTNode[] = [];
//     indices.forEach((i) => nodes.push(this.nodes[i]));
//     return nodes;
//   }

//   public step(): IFTStep {
//     const s = this.queue.dequeue();
//     s.processed = true;
//     s.neighbors.forEach((t, i) => {
//       if (!t.processed) {
//         const best = this.f(s, i);
//         if (best > t.connectivity) {
//           t.predecessor = s;
//           t.connectivity = best;
//           t.root = s.root;
//           // Atualizar a fila
//           // this.queue.
//         }
//       }
//     });
//     return {s};
//   }
// }

class GraphCanvas {
  private svg: SVGSVGElement;
  constructor(svg: HTMLElement) {
    this.svg = svg as any;
  }

  public circle(x: number, y: number) {
    // this.svg.
  }
  public addNode(x: number, y: number): SVGCircleElement {
    const node: SVGCircleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    node.classList.add("node");
    node.setAttribute("cx", x + "vmin");
    node.setAttribute("cy", y + "vmin");
    node.setAttribute("r" , 5 + "vmin");
    this.svg.appendChild(node);
    return node;
  }
  public addEdge(n1: SVGCircleElement, n2: SVGCircleElement, group?: SVGGElement): SVGLineElement {
    const edge: SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    edge.classList.add("edge");
    if (group) {
      group.appendChild(edge);
    } else {
      this.svg.appendChild(edge);
    }
    this.updateEdge(edge, n1, n2);

    // Se tiver peso, insere
    return edge;
  }
  public updateEdge(edge: SVGLineElement, n1: SVGCircleElement, n2: SVGCircleElement){
    const x1 = n1.cx.baseVal.value;
    const x2 = n2.cx.baseVal.value;
    const y1 = n1.cy.baseVal.value;
    const y2 = n2.cy.baseVal.value;

    // Obter o angulo
    const angle =  Math.atan2(y2 - y1, x2 - x1);

    // Desenhar
    edge.x1.baseVal.value = x1 + Math.cos(angle) * n1.r.baseVal.value;
    edge.x2.baseVal.value = x2 - Math.cos(angle) * n2.r.baseVal.value;
    edge.y1.baseVal.value = y1 + Math.sin(angle) * n1.r.baseVal.value;
    edge.y2.baseVal.value = y2 - Math.sin(angle) * n2.r.baseVal.value;
  }

  public addArc(n1: SVGCircleElement, n2: SVGCircleElement, bend: number = 8, group?: SVGGElement): SVGPathElement {
    const path: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // const line = this.addEdge(n1, n2, group);

    const x1 = n1.cx.baseVal.value;
    const x2 = n2.cx.baseVal.value;
    const y1 = n1.cy.baseVal.value;
    const y2 = n2.cy.baseVal.value;
    
    // Obter o angulo
    const angle =  Math.atan2(y2 - y1, x2 - x1);

    const x3 = x1 + Math.cos(angle + 0.25) * n1.r.baseVal.value;
    const x4 = x2 - Math.cos(angle - 0.25) * n2.r.baseVal.value;
    const y3 = y1 + Math.sin(angle + 0.25) * n1.r.baseVal.value;
    const y4 = y2 - Math.sin(angle - 0.25) * n2.r.baseVal.value;

    const x5 = x3 + Math.cos(angle) * 16;
    const x6 = x4 - Math.cos(angle) * 16;
    const y5 = y3 + Math.sin(angle) * 16;
    const y6 = y4 - Math.sin(angle) * 16;

    const xv = x2 - x1;
    const yv = y2 - y1;
    const mag = Math.sqrt(xv * xv + yv * yv);

    const xn = xv / mag * bend;
    const yn = yv / mag * bend;

    const xm = (x3 + x4) / 2;
    const ym = (y3 + y4) / 2;

    path.setAttribute("d",
      "M" + x3        + " " + y3        +
      "C" + (xm - yn) + " " + (ym + xn) + ", " +
      " " + (xm - yn) + " " + (ym + xn) + ", " +
      " " + x4        + " " + y4        + "");
    path.classList.add("arc");
    if (group) {
      group.appendChild(path);
    } else {
      this.svg.appendChild(path);
    }
    // path.style.markerEnd = "url(#graph-picture-arrow)";
    return path;
  }

  public addWeight(edge: SVGLineElement, value: string, group?: SVGGElement) {
    const text: SVGTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = value;
    text.classList.add("weight");
    const element: SVGSVGElement = this.svg as any;
    const x = element.createSVGLength();
    const y = element.createSVGLength();
    const xv = edge.x2.baseVal.value - edge.x1.baseVal.value;
    const yv = edge.y2.baseVal.value - edge.y1.baseVal.value;
    const mag = Math.sqrt(xv * xv + yv * yv);
    if (group) {
      group.appendChild(text);
    }else {
      this.svg.appendChild(text);
    }
    const textSize = text.getBBox();
    x.value = (edge.x1.baseVal.value + edge.x2.baseVal.value) / 2 + yv / mag * 16 - textSize.width / 2;
    y.value = (edge.y1.baseVal.value + edge.y2.baseVal.value) / 2 - xv / mag * 16 + textSize.height / 4;

    text.x.baseVal.appendItem(x);
    text.y.baseVal.appendItem(y);
    return text;
  }

  public addArcWeight(edge: SVGPathElement, value: string, group?: SVGGElement) {
    const text: SVGTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = value;
    text.classList.add("weight");
    const element: SVGSVGElement = this.svg as any;
    const x = element.createSVGLength();
    const y = element.createSVGLength();

    const totalPathLength = edge.getTotalLength();
    const step = totalPathLength / 100;
    const xs: number = 0;
    const ys: number = 0;
    const p1 = edge.getPointAtLength(0);
    const p2 = edge.getPointAtLength(totalPathLength);
    const xv = p2.x - p1.x;
    const yv = p2.y - p1.y;
    const mag = Math.sqrt(xv * xv + yv * yv);
    if (group) {
      group.appendChild(text);
    }else {
      this.svg.appendChild(text);
    }
    const textSize = text.getBBox();
    x.value = (p1.x + p2.x) / 2 - yv / mag * 16 - textSize.width / 2;
    y.value = (p1.y + p2.y) / 2 + xv / mag * 16 + textSize.height / 4;

    text.x.baseVal.appendItem(x);
    text.y.baseVal.appendItem(y);
    return text;
  }
}

// let clone = (fx) => Object.assign({}, fx);

document.addEventListener("DOMContentLoaded", (event) => {

  katex.render("I: \\mathcal{I}\\rightarrow\\mathcal{V}", document.getElementById("digital-image-formula"));
  katex.render("\\mathcal{I}\\subset\\mathbb{Z}^n", document.getElementById("digital-image-formula-coordinate"));
  katex.render("\\mathcal{V}\\subset\\mathbb{Z}^m", document.getElementById("digital-image-formula-color"));

  katex.render("G = (\\xmlClass{graph-formula-vertices}{V},\\xmlClass{graph-formula-arcs}{E},\\xmlClass{graph-formula-weight}{\\omega})", document.getElementById("graph-formula"));
  katex.render("G^T = (\\xmlClass{graph-formula-vertices}{V},\\xmlClass{graph-formula-arcs}{E^T},\\xmlClass{graph-formula-weight}{\\omega^T})", document.getElementById("graph-formula-reversed"));
  katex.render("E\\subset V\\times V", document.getElementById("graph-formula-arc"));
  katex.render("\\omega: E\\rightarrow \\mathbb{R}", document.getElementById("graph-formula-omega"));

  katex.render("\\mathcal{O} = \\{v\\in V: L(v) = l_o\\}", document.getElementById("graph-segmentation-formula"));
  katex.render("\\mathcal{C}(\\mathcal{O})=\\{\\langle s,t\\rangle\\in E: s\\in \\mathcal{O}\\text{ e } t\\notin\\mathcal{O}\\}", document.getElementById("cut-formula"));
  katex.render("\\mathcal{X}=\\{\\mathcal{O}_1, \\mathcal{O}_2,\\ldots\\}", document.getElementById("family-formula"));
  katex.render("\\varepsilon:\\mathcal{X}\\rightarrow\\mathbb{R}", document.getElementById("energy-formula"));
  katex.render("\\varepsilon_\\infty(\\mathcal{O}) = \\max_{\\langle s,t\\rangle\\in\\mathcal{C}(\\mathcal{O})}\\omega(\\langle s,t\\rangle)", document.getElementById("energy-formula2"));
  katex.render("\\mathcal{X}(\\mathcal{S}_o, \\mathcal{S}_b) = \\{\\mathcal{O}\\in \\mathcal{X}:\\mathcal{S}_o\\subseteq\\mathcal{O}\\subseteq V\\setminus\\mathcal{O}\\}", document.getElementById("seed-formula"));
  katex.render("DCC_G(s) = \\{t \\in V: \\exists\\pi_{s\\leadsto t}\\in \\Pi(G)\\}", document.getElementById("dcc-formula"));
  katex.render("SCC_G(s) = \\{t \\in V: t\\in DCC_G(s) \\text{ e } s\\in DCC_G(t)\\}", document.getElementById("scc-formula"));
  katex.render("f:\\Pi\\rightarrow\\mathbb{R}", document.getElementById("connectivity-formula"));
  katex.render("f(\\pi_t)\\geq f(\\pi'_t), \\forall\\pi'_t\\in\\Pi_t", document.getElementById("connectivity-optimum-formula"));
  katex.render("\\forall t\\in V, \\pi_t^{Pr}", document.getElementById("opsf-formula"));
  katex.render("Pr", document.getElementById("floresta-formula"));
  katex.render("\\ldots", document.getElementById("family-etcetera"));
  katex.render("f(\\pi_a)", document.getElementById("opsf-subpath-conn-formula"));
  katex.render("a", document.getElementById("opsf-subpath-conn-formula-before"));
  katex.render("f^\\male(\\langle t\\rangle) = \\begin{cases}\\infty & \\text{ se } t \\in \\mathcal{S}_o \\cup \\mathcal{S}_b \\\\-\\infty & \\text{c.c}\\end{cases}", document.getElementById("oift-formula"));
  katex.render("f^\\male(\\pi_{r\\leadsto s}\\cdot\\langle s,t\\rangle) = \\begin{cases}\\min\\{f^\\male(\\pi_{r\\leadsto s}), \\xmlClass{oift-tie-zone}{2\\times} \\omega(\\langle s,t\\rangle)\\} & \\text{se } r \\in \\mathcal{S}_o \\\\\\min\\{f^\\male(\\pi_{r\\leadsto s}), \\xmlClass{oift-tie-zone}{2\\times} \\omega(\\langle \\xmlClass{oift-reversed}{t,s}\\rangle) \\xmlClass{oift-tie-zone}{+ 1}\\} & \\text{c.c}\\end{cases}", document.getElementById("oift-formula2"));
  katex.render("\\varepsilon_\\infty", document.getElementById("oift-formula-energy"));
  katex.render("\\varepsilon^\\downarrow_\\infty=\\min_{\\mathcal{O}\\in\\mathcal{X}(\\mathcal{S}_o,\\mathcal{S}_b)}\\{\\varepsilon_\\infty(\\mathcal{O})\\}", document.getElementById("oift-formula-energy2"));

  const sosb: string = "\\mathcal{S}_o,\\mathcal{S}_b";
  const sbso: string = "\\mathcal{S}_b,\\mathcal{S}_o";
  const sisb: string = "\\{s_i\\},\\mathcal{S}_b";
  const xinf: string = "\\mathcal{X}^\\downarrow_\\infty";
  const xinfsosb: string = xinf + "(" + sosb + ")";
  const xinfsisb: string = xinf + "(" + sisb + ")";
  const obj: string = "\\mathcal{O}";
  const xsosb: string = "\\mathcal{X}(" + sosb + ")";
  const einf: string = "\\varepsilon_\\infty";
  const einfdown: string = einf + "^\\downarrow";
  const aorfc: string = "\\mathcal{A}_{ORFC}";
  const norfc: string = "\\mathcal{N}_{ORFC}";
  const aorfcsosb: string = aorfc + "(" + sosb + ")";
  const aorfcsisb: string = aorfc + "(" + sisb + ")";
  const norfcsisb: string = norfc + "(" + sisb + ")";
  const norfcsosb: string = norfc + "(" + sosb + ")";
  const norfcsbso: string = norfc + "(" + sbso + ")";
  const fminr: string = "f_{min}^\\longleftarrow";
  const s1sb: string = "\\{s_1\\}, \\mathcal{S}_b";

  katex.render(xinfsosb + " = \\{" + obj + " \\in " + xsosb + ": " + einf + "(" + obj + ") = " + einfdown + "\\}", document.getElementById("oift-formula-energy3"));
  katex.render("\\mathcal{A}_{OIFT}(\\mathcal{S}_o,\\mathcal{S}_b) \\in \\mathcal{X}^\\downarrow_\\infty(\\mathcal{S}_o,\\mathcal{S}_b)", document.getElementById("oift-formula-energy4"));

  katex.render(aorfcsosb + " = \\underset{s_i\\in\\mathcal{S}_o}{\\bigcup} \\left(" + aorfcsisb + " = \\underset{\\mathcal{O}\\in" + xinfsisb + "}{\\arg\\min} |\\mathcal{O}| \\right)", document.getElementById("orfc-formula"));
  katex.render("\\begin{aligned}f_{min}^\\longleftarrow(\\langle t\\rangle) &= \\begin{cases}\\infty & \\text{se } t \\in \\mathcal{S}_b \\\\ -\\infty & \\text{c.c.} \\end{cases} \\\\ f_{min}^\\longleftarrow(\\pi_s\\cdot\\langle s,t\\rangle) &=\\min\\{f_{min}^\\longleftarrow(\\pi_s),\\omega(\\langle t,s\\rangle)\\}\\end{aligned}", document.getElementById("orfc-formula2"));  
  katex.render(aorfcsisb, document.getElementById("orfc-algo-title"));
  katex.render("C_{opt}",document.getElementById("orfc-algo-conn"));
  katex.render(fminr,document.getElementById("orfc-algo-fmin"));
  katex.render("G_{>}",document.getElementById("orfc-algo-gm1"));
  katex.render("G = (V, E, \\omega)",document.getElementById("orfc-algo-g"));
  katex.render("E'=\\{\\langle s,t\\rangle \\in E:\\omega(\\langle s,t\\rangle) > C_{opt}(s_i)\\}",document.getElementById("orfc-algo-el"));
  katex.render("DCC_{G_{>}}(s_i)", document.getElementById("orfc-algo-dcc"));
  katex.render(einf,document.getElementById("orfc-energy-formula"));
  katex.render(aorfcsosb + " \\in " + xinfsosb,document.getElementById("orfc-energy2"));
  katex.render("s_1 \\equiv s_2",document.getElementById("seed-robustness-equivalence-formula"));
  katex.render("[s] = \\{t \\in A(\\{s\\},\\mathcal{S}_b): s\\equiv t\\}",document.getElementById("equivalence-class-formula"));
  katex.render("\\mathcal{N}(\\{s\\},\\mathcal{S}_b) = [s]", document.getElementById("core-formula"));
  katex.render("A_{ORFC}(" + sosb + ") \\subseteq A_{OIFT}(" + sosb + ")", document.getElementById("seed-robustness-relation-formula"));
  katex.render("A_{ORFC}(" + s1sb + ") = N_{OIFT}(" + s1sb + ")", document.getElementById("aorfc-noift-formula"));
  katex.render("N_{ORFC}(" + s1sb + ") = N_{OIFT}(" + s1sb + ")", document.getElementById("noift-norfc-formula"));
  katex.render("N_{CoH(ORFC)}(" + s1sb + ") = N_{OIFT}(" + s1sb + ")", document.getElementById("ncoh-noift-formula"));
  katex.render("N_{ORFC}(" + sisb + ") \\subseteq N_{CoH(ORFC)}(" + sisb + ") \\subseteq N_{OIFT}(" + sisb + ")", document.getElementById("norfc-ncoh-noift-formula"));
  katex.render("RC = \\frac{\\lvert\\mathcal{N}("+sosb+")\\rvert}{\\lvert A("+sosb+")\\rvert}", document.getElementById("robustness-coefficient-formula"));
  katex.render("\\begin{aligned}D(\\mathcal{O}, \\mathcal{G}) &= \\frac{2\\times|\\mathcal{O} \\cap \\mathcal{G}|}{|\\mathcal{O}|+|\\mathcal{G}|} = \\frac{2\\times|\\mathcal{O}\\cap\\mathcal{G}|}{|\\mathcal{O}\\cup\\mathcal{G}|+|\\mathcal{O}\\cap\\mathcal{G}|} \\\\ &= \\frac{2\\times |VP|}{2\\times|VP|+|FP|+|FN|}\\end{aligned}", document.getElementById("dice-formula"));
  
  
  katex.render(aorfcsisb, document.getElementById("norfc-ncoh-noift-algo-title"));
  katex.render("C_{opt}",document.getElementById("norfc-ncoh-noift-algo-conn"));
  katex.render(fminr,document.getElementById("norfc-ncoh-noift-algo-fmin"));
  katex.render("G_{>}",document.getElementById("norfc-ncoh-noift-algo-gm1"));
  katex.render("G = (V, E, \\omega)",document.getElementById("norfc-ncoh-noift-algo-g"));
  katex.render("E'=\\{\\langle s,t\\rangle \\in E:\\xmlClass{norfc-ncoh-noift-algo-greater}{\\omega(\\langle s,t\\rangle) > C_{opt}(s_i)}\\}",document.getElementById("norfc-ncoh-noift-algo-el"));
  katex.render("DCC_{G_{>}}(s_i)", document.getElementById("norfc-ncoh-noift-algo-dcc"));

  katex.render(norfcsisb, document.getElementById("orfc-core-algo-title"));
  katex.render("C_{opt}",document.getElementById("orfc-core-algo-conn"));
  katex.render(fminr,document.getElementById("orfc-core-algo-fmin"));
  katex.render("G_{>}",document.getElementById("orfc-core-algo-gm1"));
  katex.render("G = (V, E, \\omega)",document.getElementById("orfc-core-algo-g"));
  katex.render("E'=\\{\\langle s,t\\rangle \\in E:\\xmlClass{orfc-core-algo-greater}{\\omega(\\langle s,t\\rangle) > \\xmlClass{orfc-core-algo-energy2}{C_{opt}(s_i)}}\\xmlClass{orfc-core-algo-energy}{\\wedge C_{opt}(s) = C_{opt}(t) = C_{opt}(s_i)}\\}",document.getElementById("orfc-core-algo-el"));
  katex.render("SCC_{G_{>}}(s_i)", document.getElementById("orfc-core-algo-dcc"));
  
  katex.render(norfcsosb, document.getElementById("orfc-core-all-algo-title"));
  katex.render("C_{opt}",document.getElementById("orfc-core-all-algo-conn"));
  katex.render(fminr,document.getElementById("orfc-core-all-algo-fmin"));
  katex.render("G_{>}",document.getElementById("orfc-core-all-algo-gm1"));
  katex.render("G = (V, E, \\omega)",document.getElementById("orfc-core-all-algo-g"));
  katex.render("E'=\\{\\langle s,t\\rangle \\in E:\\xmlClass{orfc-core-all-algo-greater}{\\omega(\\langle s,t\\rangle) > C_{opt}(s)}\\wedge C_{opt}(s) = C_{opt}(t)\\}",document.getElementById("orfc-core-all-algo-el"));
  katex.render("ORFC_{Core} + GC", document.getElementById("hybrid-formula"));
  katex.render("\\varepsilon_1(\\mathcal{O}) = \\sum_{\\langle s,t\\rangle \\in \\mathcal{C}(\\mathcal{O})}{\\omega(\\langle s,t\\rangle)}", document.getElementById("gc-energy-formula"));
  katex.render("A_{ORFC_{Core}} + GC(" + sosb + ")", document.getElementById("hybrid-algo-title"));
  katex.render("\\mathcal{S_o}' \\leftarrow " + norfcsosb, document.getElementById("hybrid-algo-1"));
  katex.render("\\mathcal{S_b}' \\leftarrow " + norfcsbso, document.getElementById("hybrid-algo-2"));
  katex.render("A_{GC}(\\mathcal{S_o}',\\mathcal{S_b}')", document.getElementById("hybrid-algo-3"));

  katex.render("G", document.getElementById("hybrid-algo-1-fim"));
  katex.render("G^T", document.getElementById("hybrid-algo-2-fim"));
  katex.render("G", document.getElementById("hybrid-algo-3-fim"));
  katex.render("\\mathcal{N}_2\\propto\\mathcal{N}_1",document.getElementById("redundancy-symbol"));
  katex.render("t\\in DCC_{G_{>}}(s)\\Rightarrow t\\propto s?",document.getElementById("redundancy-symbol-2"));
  katex.render("t\\in DCC_{G_>}(s) \\wedge C_{opt}(t) \\geq C_{opt}(s)\\implies \\mathcal{N}_{ORFC}(\\{t\\},\\mathcal{S}_b) \\propto \\mathcal{N}_{ORFC}(\\{s\\},\\mathcal{S}_b)",document.getElementById("redundancy-symbol-3"));
  katex.render("\\omega(\\langle\\mathcal{N}_s, \\mathcal{N}_t\\rangle) > C_{opt}(s)\\wedge C_{opt}(t)\\geq C_{opt}(s)",document.getElementById("redundancy-symbol-4"));
  katex.render(`\\begin{aligned}
  f_D(\\pi_t=\\langle t \\rangle) &= \\begin{cases}
    0, & \\text{ se } t\\in \\mathcal{S}\\\\
    +\\infty,& \\text{c.c}\\end{cases} \\\\
  f_D(\\pi_{r\\leadsto s}\\cdot \\langle s,t \\rangle) &= f_D(\\pi_{r\\leadsto s})\\text{ } + (\\lVert I(t) - I(r)\\rVert\\cdot\\alpha)^\\beta + d_{euc}(s,t)
  \\end{aligned}
  `, document.getElementById("ift-slic-f"));

  katex.render("\\gamma=3",document.getElementById("ift-slic-gamma-3"));
  katex.render("\\gamma=4",document.getElementById("ift-slic-gamma-4"));
  katex.render(`
  \\begin{aligned}
  f_D'(\\pi_t=\\langle t \\rangle) &= \\begin{cases}
    0, & \\text{ se } t\\in \\mathcal{S}\\\\
    +\\infty,& \\text{c.c}\\end{cases} \\\\
  f_D'(\\pi_{r\\leadsto s}\\cdot \\langle s,t \\rangle) &= f_D'(\\pi_{r\\leadsto s})\\text{ } + (\\lVert I(t) - I(r)\\rVert\\cdot\\alpha\\cdot\\gamma^{B(r,t)}+\\gamma^{B(r,t)})^\\beta + d_{euc}(s,t)
  \\end{aligned}
  `,document.getElementById("ift-slic-fdprime"));
  katex.render(`
    B(r,t) = |B(r) - B(t)|
  `, document.getElementById("ift-slic-binary"));
  // katex.render("SCC_{G_{>}}(s_i)", document.getElementById("orfc-core-all-algo-dcc"));
  
  // Carregar segmentação manual
  // let manualSegImage = new Image();
  // let manualSegCanvas: ManualSegmentationCanvas;
  // manualSegImage.addEventListener("load", function() {
  //   manualSegCanvas = new ManualSegmentationCanvas("intro-type-manual-canvas");
  //   manualSegCanvas.image = manualSegImage;
  // });
  // manualSegImage.src = "assets/3D.png";

  const tl: TimelineMax = new TimelineMax();

  // Criando todas as timelines
  const nslides: number = 200;
  const timelines: TimelineMax[] = new Array<TimelineMax>(nslides);
  for (let i = 0; i < nslides; i++) {
    timelines[i] = new TimelineMax();
  }

  let c: number = 0;
  // Capa -> Segmentação
  timelines[c].to("#blocks", 1.5, {css: {transform: "translate3d(-100vw, 50vh, 0)"}, ease: Power2.easeInOut});
  tl.add(timelines[c++]);

  timelines[c].to("#intro-segmentation-original", 0.5, {transform: "translateX(15.5vw)", ease: Power2.easeInOut},0);
  timelines[c].to("#intro-segmentation-original", 0.5, {opacity: 0}, 0.5);
  timelines[c].to("#intro-segmentation-mask"    , 0.5, {transform: "translateX(-15.5vw)", ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-segmentation-mask"    , 0.5, {opacity: 0}, 0);
  timelines[c].from("#intro-segmentation-result", 0.5, {opacity: 0}, 0.5);
  
  tl.add(timelines[c++]);

  // Segmentação -> Applicações
  timelines[c].from("#intro-applications", 1.0, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#blocks", 1.0, {css: {transform: "translate3d(-100vw, -20vh, 0)"}, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Aplicações -> Tipo de segmentação
  timelines[c].from("#intro-type", 1.0, {css: {opacity: 0}, ease: Power2.easeInOut, onComplete: () => {
    // manualSegCanvas.reset();
    // manualSegCanvas.start();
  }}, 0);
  timelines[c].to("#blocks", 1.0, {transform: "translate3d(-100vw, -120vh, -30vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Aparecer Segmentação Interativa
  timelines[c].from("#intro-type-interactive", 1.0, {css: {opacity: 0}, ease: Power2.easeInOut});
  tl.add(timelines[c++]);

  // Destacar Segmentação Automática
  timelines[c].to("#intro-type-interactive", 0.5, {css: {opacity: 0.3}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-manual", 0.5, {css: {opacity: 0.3}, ease: Power2.easeInOut}, 0);
  timelines[c].from("#intro-type-automatic-fix", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  
  tl.add(timelines[c++]);

  // Segmentação Automática: Descartar
  timelines[c].to("#intro-type-automatic-result", 1.0, {css: {transform: "translateX(-10vmin)", opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].from("#intro-type-automatic-result2", 1.0, {css: {transform: "translateX(10vmin)", opacity: 0}, ease: Power2.easeInOut}, 0.3);
  tl.add(timelines[c++]);

  // Destacar Segmentação Manual
  timelines[c].to("#intro-type-manual"     , 0.5, {css: {opacity: 1.0}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-interactive", 0.5, {css: {opacity: 0.3}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-automatic"  , 0.5, {css: {opacity: 0.3}, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Destacar Segmentação Interativa
  timelines[c].to("#intro-type-manual"     , 0.5, {css: {opacity: 0.3}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-interactive", 0.5, {css: {opacity: 1.0}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-automatic"  , 0.5, {css: {opacity: 0.3}, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Mas não temos o histórico
  timelines[c].to("#intro-type-interactive-seeds", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // No interativo...
  timelines[c].to("#intro-type-interactive-seeds", 0.5, {css: {opacity: 1}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-automatic-fix", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].from("#intro-type-interactive-continue", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // ...podemos salvar e continuar sessões
  timelines[c].to("#intro-type-interactive-save", 0.5, {transform: "translateX(45vw)", opacity: 1, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-interactive", 0.5, {transform: "translateX(30vw)", ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-interactive-seeds", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // ...em ambos os casos, devemos estimar o histórico
  timelines[c].to("#intro-type-interactive-save", 0.5, {transform: "translateX(42vw)", opacity: 0, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-interactive", 0.5, {transform: "translateX(42vw)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#intro-type-interactive .right", 0.5, {opacity: 0, ease: Power2.easeInOut}, 0);
  timelines[c].from("#intro-type-interactive .left", 0.5, {transform: "translateX(5vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-interactive-seeds", 0.5, {css: {opacity: 1}, ease: Power2.easeInOut}, 0);
  timelines[c].from("#intro-type-edit", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].from("#intro-type-reverse", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-automatic", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#intro-type-interactive-continue", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-130vw, -120vh, -30vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Algumas soluções se baseiam em random walks
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-170vw, -100vh, -30vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#related-rw", 0.9, {opacity: 0}, 0.9);
  tl.add(timelines[c++]);

  // Algumas soluções se baseiam em superfícies
  timelines[c].from("#related-superficies", 0.9, {opacity: 0});
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-188vw, -210vh, 0vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Algumas soluções se baseiam em graph cut
  timelines[c].from("#related-gc", 0.9, {opacity: 0});
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-228vw, -210vh, 0vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Interface
  timelines[c].from("#related-hci", 0.5, {opacity: 0});
  tl.add(timelines[c++]);

  // IFT
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-240vw, -110vh, -30vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#related-ift", 0.5, {opacity: 0}, 0.9);
  tl.add(timelines[c++]);

  // Usuário Robô
  timelines[c].from("#related-user-robot", 0.9, {opacity: 0});
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-320vw, -110vh, -30vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Conceitos: Imagem Digital (função)
  timelines[c].from("#digital-image", 0.9, {opacity: 0});
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-330vw, -170vh, 20vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Conceitos: Imagem Digital (resultado)
  timelines[c].to("#digital-image-arrow", 0.4, {opacity: 0});
  timelines[c].to("#digital-image-coordinate-space", 0.4, {opacity: 0}, 0);
  timelines[c].from("#digital-image-result", 0.4, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  // Conceitos: Imagem Digital (3D)
  timelines[c].from("#digital-image-3d", 0.4, {opacity: 0}, 0);
  timelines[c].to("#digital-image-result", 0.4, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  // Conceitos: Grafos
  let graphPicture: HTMLElement = document.getElementById("graph-picture");
  const graphPictureEdges: SVGGElement = document.querySelector("#graph-picture .edges") as any;
  const graphPictureEdgesWeights: SVGGElement = document.querySelector("#graph-picture .edges-weights") as any;
  const graphPictureArcs: SVGGElement = document.querySelector("#graph-picture .arcs") as any;
  const graphPictureArcsWeights: SVGGElement = document.querySelector("#graph-picture .arcs-weights") as any;
  const graphPictureArcsReversed: SVGGElement = document.querySelector("#graph-picture .arcs-reversed") as any;
  const graphPictureArcsWeightsReversed: SVGGElement = document.querySelector("#graph-picture .arcs-weights-reversed") as any;
  let graphCanvas = new GraphCanvas(graphPicture);
  const n1 = graphCanvas.addNode(6 , 6);
  const n2 = graphCanvas.addNode(26, 16);
  const n3 = graphCanvas.addNode(46, 8);
  const n4 = graphCanvas.addNode(32, 32);
  const n5 = graphCanvas.addNode(13, 28);
  // [n1,n2,n3,n4,n5].forEach(n => n.classList.add)
  let e1 = graphCanvas.addEdge(n1, n2, graphPictureEdges);
  let e2 = graphCanvas.addEdge(n2, n5, graphPictureEdges);
  let e3 = graphCanvas.addEdge(n5, n1, graphPictureEdges);
  let e4 = graphCanvas.addEdge(n2, n4, graphPictureEdges);
  let e5 = graphCanvas.addEdge(n3, n4, graphPictureEdges);

  graphCanvas.addWeight(e1, "10", graphPictureEdgesWeights);
  graphCanvas.addWeight(e2, "8", graphPictureEdgesWeights);
  graphCanvas.addWeight(e3, "7", graphPictureEdgesWeights);
  graphCanvas.addWeight(e4, "5", graphPictureEdgesWeights);
  graphCanvas.addWeight(e5, "7", graphPictureEdgesWeights);

  // Adicionando arcos direcionados
  let a1 = graphCanvas.addArc(n2, n1, 10, graphPictureArcs);
  let a2 = graphCanvas.addArc(n2, n5, 10, graphPictureArcs);
  let a3 = graphCanvas.addArc(n5, n1, 10, graphPictureArcs);
  let a4 = graphCanvas.addArc(n2, n4, 10, graphPictureArcs);
  let a5 = graphCanvas.addArc(n3, n4, 10, graphPictureArcs);
  let a6 = graphCanvas.addArc(n4, n3, 10, graphPictureArcs);

  graphCanvas.addArcWeight(a1, "10", graphPictureArcsWeights);
  graphCanvas.addArcWeight(a2, "8", graphPictureArcsWeights);
  graphCanvas.addArcWeight(a3, "7", graphPictureArcsWeights);
  graphCanvas.addArcWeight(a4, "5", graphPictureArcsWeights);
  graphCanvas.addArcWeight(a5, "7", graphPictureArcsWeights);
  graphCanvas.addArcWeight(a6, "4", graphPictureArcsWeights);

  // Adicionando arcos reversos
  a1 = graphCanvas.addArc(n1, n2, 10, graphPictureArcsReversed);
  a2 = graphCanvas.addArc(n5, n2, 10, graphPictureArcsReversed);
  a3 = graphCanvas.addArc(n1, n5, 10, graphPictureArcsReversed);
  a4 = graphCanvas.addArc(n4, n2, 10, graphPictureArcsReversed);
  a5 = graphCanvas.addArc(n4, n3, 10, graphPictureArcsReversed);
  a6 = graphCanvas.addArc(n3, n4, 10, graphPictureArcsReversed);

  graphCanvas.addArcWeight(a1, "10", graphPictureArcsWeightsReversed);
  graphCanvas.addArcWeight(a2, "8", graphPictureArcsWeightsReversed);
  graphCanvas.addArcWeight(a3, "7", graphPictureArcsWeightsReversed);
  graphCanvas.addArcWeight(a4, "5", graphPictureArcsWeightsReversed);
  graphCanvas.addArcWeight(a5, "7", graphPictureArcsWeightsReversed);
  graphCanvas.addArcWeight(a6, "4", graphPictureArcsWeightsReversed);


  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-430vw, -150vh, 20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#graph", 0.4, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  // Conceitos: Grafos (vertices)
  timelines[c].from("#graph-picture .node", 0.4, {opacity: 0}, 0);
  timelines[c].to(".mord.graph-formula-vertices", 0.4, {opacity: 1}, 0);
  tl.add(timelines[c++]);

  // Conceitos: Grafos (arestas)
  timelines[c].from("#graph-picture .edge", 0.4, {opacity: 0}, 0);
  timelines[c].to(".mord.graph-formula-arcs", 0.4, {opacity: 1}, 0);
  timelines[c].from("#graph-formula-arc", 0.4, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  // Conceitos: Grafos (pesos)
  timelines[c].from("#graph-picture .weight", 0.4, {opacity: 0}, 0);
  timelines[c].to(".mord.graph-formula-weight", 0.4, {opacity: 1}, 0);
  timelines[c].from("#graph-formula-omega", 0.4, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  // Conceitos: Grafos (não orientado)
  timelines[c].to("#graph-picture .edges", 0.4, {opacity: 0}, 0);
  timelines[c].to("#graph-picture .edges-weights", 0.4, {opacity: 0}, 0);
  timelines[c].from("#graph-picture .arcs", 0.4, {opacity: 0}, 0);
  timelines[c].from("#graph-picture .arcs-weights", 0.4, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#graph-picture .arcs", 0.4, {opacity: 0}, 0);
  timelines[c].to("#graph-picture .arcs-weights", 0.4, {opacity: 0}, 0);
  timelines[c].from("#graph-picture .arcs-weights-reversed", 0.4, {opacity: 0}, 0);
  timelines[c].from("#graph-picture .arcs-reversed", 0.4, {opacity: 0}, 0);
  timelines[c].from("#graph-formula-reversed", 0.4, {opacity: 0}, 0);
  timelines[c].to("#graph-formula", 0.4, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  // Graph Adjacency
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-330vw, -270vh, 20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#graph-adjacency", 0.4, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#adj4", 0.4, {opacity: 0}, 0.3);
  timelines[c].from("#adj8", 0.4, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#adj8", 0.4, {opacity: 0}, 0.3);
  timelines[c].from("#adj6", 0.4, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#adj6", 0.4, {opacity: 0}, 0.3);
  timelines[c].from("#adj18", 0.4, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#adj18", 0.4, {opacity: 0}, 0.3);
  timelines[c].from("#adj26", 0.4, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-430vw, -250vh, 20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#image-graph", 0.4, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  // Graph Segmentation Image
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-430vw, -350vh, 20vmin)", ease: Power2.easeInOut}, 0);
  //timelines[c].to("#image-graph", 0.4, {opacity: 0}, 0.3);
  timelines[c].from("#graph-segmentation", 0.4, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  // Graph Partition
  timelines[c].from("#graph-segmentation-object", 0.4, {opacity: 0}, 0);
  timelines[c].from("#graph-segmentation-formula", 0.4, {opacity: 0}, 0);
  timelines[c].to("#graph-segmentation-bitmap", 0.4, {opacity: 0}, 0);
  timelines[c].from("#graph-segmentation-object2", 0.4, {opacity: 0}, 0);
  timelines[c].to("#graph-segmentation-bitmap2", 0.4, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  // Cut
  timelines[c].from("#cut1", 0.2, {opacity: 0}, 0.0);
  timelines[c].from("#cut2", 0.2, {opacity: 0}, 0.0);
  timelines[c].from("#cut-title", 0.2, {opacity: 0}, 0);
  timelines[c].from("#cut-formula", 0.2, {opacity: 0}, 0);
  timelines[c].to("#graph-segmentation-title", 0.2, {opacity: 0}, 0.1);
  timelines[c].to("#graph-segmentation-formula", 0.2, {opacity: 0}, 0.1);
  timelines[c].to("#graph-segmentation-object", 0.2, {opacity: 0}, 1);
  timelines[c].to("#graph-segmentation-object2", 0.2, {opacity: 0}, 1);
  tl.add(timelines[c++]);

  // Family
  timelines[c].from("#family-title", 0.4, {opacity: 0}, 0);
  timelines[c].to("#cut-title", 0.4, {opacity: 0}, 0);
  timelines[c].to("#graph-segmentation-imgs", 0.9, {transform: "scale(0.5,0.5) translateX(-10vw)", ease: Power2.easeInOut}, 0);
  timelines[c].to("#cut-formula", 0.2, {opacity: 0}, 0);
  timelines[c].from("#family-formula", 0.2, {opacity: 0}, 0);
  timelines[c].from("#graph-segmentation-imgs3", 0.2, {opacity: 0}, 0.5);
  tl.add(timelines[c++]);

  // Energy
  timelines[c].from("#energy-title", 0.4, {opacity: 0}, 0);
  timelines[c].from("#energy-formula", 0.2, {opacity: 0}, 0);
  timelines[c].from("#energy-formula2", 0.2, {opacity: 0}, 0);
  timelines[c].to("#family-title", 0.4, {opacity: 0}, 0);
  timelines[c].to("#family-formula", 0.2, {opacity: 0}, 0);
  timelines[c].to("#graph-segmentation-imgs", 0.9, {transform: "translateY(5vw)", ease: Power2.easeInOut}, 0);
  timelines[c].to("#graph-segmentation-imgs3", 0.2, {opacity: 0}, 0);

  tl.add(timelines[c++]);

  // Seed
  timelines[c].to("#energy-title", 0.4, {opacity: 0}, 0);
  timelines[c].to("#energy-formula", 0.2, {opacity: 0}, 0);
  timelines[c].to("#energy-formula2", 0.2, {opacity: 0}, 0);
  timelines[c].from("#seed-title", 0.4, {opacity: 0}, 0);
  timelines[c].from("#seed-formula", 0.2, {opacity: 0}, 0);
  timelines[c].from("#seed1", 0.2, {opacity: 0}, 0);
  timelines[c].from("#seed2", 0.2, {opacity: 0}, 0);
  timelines[c].to("#cut1", 0.2, {opacity: 0}, 0.2);
  timelines[c].to("#cut2", 0.2, {opacity: 0}, 0.2);

  tl.add(timelines[c++]);

  // Caminho
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-360vw, -390vh, 20vmin)", ease: Power2.easeInOut});
  timelines[c].from("#graph-path", 0.2, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  // Mapa de Predecessores
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-400vw, -430vh, 20vmin)", ease: Power2.easeInOut});
  timelines[c].from("#graph-predecessor", 0.2, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  // Floresta Geradora
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-450vw, -430vh, 20vmin)", ease: Power2.easeInOut});
  timelines[c].from("#graph-spanning", 0.2, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  // Components
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-398vw, -518vh, 20vmin)", ease: Power2.easeInOut});
  timelines[c].from("#graph-component", 0.2, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  // Tarjan Step 1
  timelines[c].from("#tarjan-step1", 0.2, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  // Tarjan Step 2
  timelines[c].from("#tarjan-step2", 0.2, {opacity: 0}, 0);
  timelines[c].to("#tarjan-step1", 0.2, {opacity: 0}, 0.1);
  tl.add(timelines[c++]);
  // Tarjan Step 3
  timelines[c].from("#tarjan-step3", 0.2, {opacity: 0}, 0);
  timelines[c].to("#tarjan-step2", 0.2, {opacity: 0}, 0.1);
  tl.add(timelines[c++]);
  // Tarjan Step 4
  timelines[c].from("#tarjan-step4", 0.2, {opacity: 0}, 0);
  timelines[c].to("#tarjan-step3", 0.2, {opacity: 0}, 0.1);
  tl.add(timelines[c++]);
  // Tarjan Step 5
  timelines[c].from("#tarjan-step5", 0.2, {opacity: 0}, 0);
  timelines[c].to("#tarjan-step4", 0.2, {opacity: 0}, 0.1);
  tl.add(timelines[c++]);
  // Tarjan Step 6
  timelines[c].from("#tarjan-step6", 0.2, {opacity: 0}, 0);
  timelines[c].to("#tarjan-step5", 0.2, {opacity: 0}, 0.1);
  tl.add(timelines[c++]);

  // Connectivity
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-488vw, -518vh, 20vmin)", ease: Power2.easeInOut});
  timelines[c].from("#graph-connectivity", 0.2, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  // Optimum Connectivity
  timelines[c].from("#graph-connectivity-optimum-path", 0.2, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  // OPSF
  graphCanvas = new GraphCanvas(document.getElementById("opsf-dynamic"));
  let n: SVGCircleElement[] = [];
  let e: SVGLineElement[] = [];

  n.push(graphCanvas.addNode(10, 20)); n[0].id = "opsf-n1";
  n.push(graphCanvas.addNode(25, 20)); n[1].id = "opsf-n2";
  n.push(graphCanvas.addNode(40, 20)); n[2].id = "opsf-n3";
  n.push(graphCanvas.addNode(55, 10)); n[3].id = "opsf-n4";
  n.push(graphCanvas.addNode(55, 30)); n[4].id = "opsf-n5";
  e.push(graphCanvas.addEdge(n[0], n[1])); e[0].id = "opsf-e1";
  e.push(graphCanvas.addEdge(n[1], n[2])); e[1].id = "opsf-e2";
  e.push(graphCanvas.addEdge(n[2], n[3])); e[2].id = "opsf-e3";
  e.push(graphCanvas.addEdge(n[2], n[4])); e[3].id = "opsf-e4";
  
  timelines[c].to("#opsf-line1", 1.9, {attr: {x2: 200, y2: 80}, ease: Power0.easeNone}, 0);
  timelines[c].to("#opsf-line2", 1.9, {attr: {x2: 200, y2: 80}, ease: Power0.easeNone}, 0);
  timelines[c].to("#blocks", 1.9, {transform: "translate3d(-508vw, -468vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#opsf", 1, {opacity: 0}, 0.6);

  tl.add(timelines[c++]);

  // Dynamic Programming
  timelines[c].from("#opsf-smooth", 0.2, {opacity: 0}, 0);
  timelines[c].from("#opsf-dynamic", 0.2, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  let n12Intersected: boolean = false;
  timelines[c].to("#opsf-n1", 0.4, {attr: {cx: "40vmin"}, onUpdate: () => {
    graphCanvas.updateEdge(e[0], n[0], n[1]);
  }, ease: Power0.easeNone}, 0);
  timelines[c].to("#opsf-n2", 0.4, {attr: {cx: "40vmin"}, onUpdate: () => {
    graphCanvas.updateEdge(e[0], n[0], n[1]);
    graphCanvas.updateEdge(e[1], n[1], n[2]);
  }, ease: Power0.easeNone}, 0);
  let l1: SVGLineElement = document.getElementById("opsf-conn1") as any;
  let l2: SVGLineElement = document.getElementById("opsf-conn2") as any;
  let ex = e[2].x2.baseVal.value;
  let ey = e[2].y2.baseVal.value;
  l1.x1.baseVal.value = e[2].x1.baseVal.value;
  l1.x2.baseVal.value = e[2].x1.baseVal.value;
  l1.y1.baseVal.value = e[2].y1.baseVal.value;
  l1.y2.baseVal.value = e[2].y1.baseVal.value;

  l2.x1.baseVal.value = e[3].x1.baseVal.value;
  l2.x2.baseVal.value = e[3].x1.baseVal.value;
  l2.y1.baseVal.value = e[3].y1.baseVal.value;
  l2.y2.baseVal.value = e[3].y1.baseVal.value;
  console.log(e[2].x1.baseVal.value);
  console.log(e[2].y1.baseVal.value);
  console.log(e[2].x2.baseVal.value);
  console.log(e[2].y2.baseVal.value);

  timelines[c].from("#opsf-subpath-conn-formula", 0.2, {opacity: 0, ease: Power0.easeNone}, 0.2);
  timelines[c].to("#opsf-e1", 0.2, {opacity: 0, ease: Power0.easeNone}, 0);
  timelines[c].to("#opsf-e2", 0.2, {opacity: 0, ease: Power0.easeNone}, 0);
  timelines[c].to("#opsf-e3", 0.5, {css: {stroke: "red"}}, 0.8);
  timelines[c].to("#opsf-e4", 0.5, {css: {stroke: "red"}}, 0.8);
  timelines[c].to("#opsf-conn1", 0.5, {attr: {x2: ex, y2: ey}}, 0.8);
  timelines[c].to("#opsf-conn2", 0.5, {attr: {x2: e[3].x2.baseVal.value, y2: e[3].y2.baseVal.value}}, 0.8);
  timelines[c].to("#opsf-n1", 0.5, {opacity: 0}, 0.2);
  timelines[c].to("#opsf-n2", 0.5, {opacity: 0}, 0.2);
  timelines[c].to("#opsf-n3", 0.5, {css: {stroke: "red"}}, 0.2);
  //timelines[c].to("#opsf-subpath-conn-formula-before", 0.2, {opacity: 0}, 0.2);
  
  tl.add(timelines[c++]);



  // IFT
  // graphPicture = document.getElementById("ift-steps");
  // graphCanvas  = new GraphCanvas(graphPicture);

  // // adding nodes
  // let offsetx = 8;
  // let offsety = 30;
  // const nodes: SVGCircleElement[] = [];
  // for (let y = 0; y < 4; y++) {
  //   for (let x = 0; x < 4; x++) {
  //     nodes.push(graphCanvas.addNode(x * 16 + offsetx, y * 16 + offsety));
  //   }
  // }

  // // adding edges
  // const neighbors = [[1, 0], [0, 1]];
  // const weights   = [[15, 15], [14, 13], [12, 17], [0, 5],
  //                    [13, 0] , [16, 4] , [10, 13], [0, 16],
  //                    [17, 15], [7, 11], [17, 15], [0, 17],
  //                    [15, 0] , [11, 0], [13, 0], [0, 0]];

  // for (let y = 0; y < 4; y++) {
  //   for (let x = 0; x < 4; x++) {
  //     for (let i = 0; i < neighbors.length; i++) {
  //       const nx = x + neighbors[i][0];
  //       const ny = y + neighbors[i][1];
  //       if (nx >= 0 && nx <= 3 && ny >= 0 && ny <= 3) {
  //         const e = graphCanvas.addEdge(nodes[ny * 4 + nx], nodes[y * 4 + x]);
  //         graphCanvas.addWeight(e, weights[y * 4 + x][i].toString());
  //       }
  //     }
  //   }
  // }

  // timelines[c].to("#ift-steps-pictures", 0.9, {attr: {x2: 200, y2: 80}, ease: Power0.easeNone}, 0);
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-630vw, -510vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#ift", 1, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  for (let i = 0; i < 15; i++) {
    timelines[c].from("#ift-step-" + (i + 2), 0.5, {opacity: 0}, 0);
    timelines[c].to("#ift-step-" + (i + 1), 0.5, {opacity: 0}, 0.2);
    tl.add(timelines[c++]);
  }

  timelines[c].to("#blocks", 0.6, {transform: "translate3d(-680vw, -510vh, 60vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#border-polarity", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  timelines[c].to("#blocks", 0.6, {transform: "translate3d(-680vw, -550vh, 60vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#shape-constraints", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  timelines[c].to("#blocks", 0.6, {transform: "translate3d(-680vw, -590vh, 60vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#connectedness", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // OIFT
  timelines[c].to("#blocks", 0.8, {transform: "translate3d(-810vw, -550vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#oift", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // OIFT tie zones
  timelines[c].to(".mord.oift-tie-zone, .mbin.oift-tie-zone", 0.4, {color: "red"}, 0);
  tl.add(timelines[c++]);
  // OIFT reversed arcs
  timelines[c].to(".mord.oift-tie-zone, .mbin.oift-tie-zone", 0.4, {color: "black"}, 0);
  timelines[c].to(".mord.oift-reversed, .mbin.oift-reversed", 0.4, {color: "red"}, 0);
  tl.add(timelines[c++]);

  // OIFT energy
  timelines[c].to(".mord.oift-reversed, .mbin.oift-reversed", 0.4, {color: "black"}, 0);
  timelines[c].from("#oift-formula-energy2", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // OIFT energy
  // timelines[c].to("#oift-formula-energy2", 0.4, {opacity: 0}, 0.2);
  timelines[c].from("#oift-formula-energy3", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // OIFT energy
  // timelines[c].to("#oift-formula-energy3", 0.4, {opacity: 0}, 0.2);
  timelines[c].from("#oift-formula-energy4", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // ORFC
  timelines[c].to("#blocks", 0.6, {transform: "translate3d(-810vw, -620vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#orfc", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  timelines[c].from("#orfc-formula2", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // 
  timelines[c].from("#orfc-algo", 0.4, {opacity: 0}, 0.2);
  timelines[c].to("#blocks", 0.6, {transform: "translate3d(-810vw, -630vh, -20vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  timelines[c].from("#orfc-step-1", 0.5, {opacity: 0}, 0.2);
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-810vw, -680vh, -20vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  timelines[c].from("#orfc-algo-highlight", 0.5, {opacity: 0}, 0);
  for (let i = 0; i < 3; i++) {
    timelines[c].from("#orfc-step-" + (i + 2), 0.5, {opacity: 0}, 0);
    timelines[c].to("#orfc-step-" + (i + 1), 0.5, {opacity: 0}, 0.2);
    timelines[c].to("#orfc-algo-highlight", 0.5, {transform: "translateY(" + ((i + 1) * 6.8 - 2) + "vh)"}, 0);
    tl.add(timelines[c++]);
  }

  timelines[c].from("#orfc-energy", 0.4, {opacity: 0}, 0.2);
  timelines[c].from("#orfc-energy2", 0.4, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // Diferença entre OIFT e ORFC
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-810vw, -780vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#oift-orfc-difference", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].from("#oift-orfc-other", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].from("#seed-robustness-relation-formula", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);


  // Seed Robustness
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-940vw, -680vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#seed-robustness", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  // Seed Equivalence 2
  timelines[c].from("#seed-robustness-equivalence-2", 0.5, {opacity: 0}, 0);
  timelines[c].to("#seed-robustness-equivalence-1", 0.5, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // Seed Equivalence 3
  timelines[c].from("#seed-robustness-equivalence-3", 0.5, {opacity: 0}, 0);
  timelines[c].to("#seed-robustness-equivalence-2", 0.5, {opacity: 0}, 0.2);
  tl.add(timelines[c++]);

  // Equivalence Class
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-940vw, -680vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#seed-robustness-classes", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  // Equivalence Class
  timelines[c].from(".seed-robustness-core", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  // Equivalence Class
  timelines[c].from("#equivalence-class-n", 0.5, {opacity: 0}, 0.3);
  timelines[c].to("#equivalence-class-1", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);
  


  // AORFC NOIFT
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-940vw, -720vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#seed-robustness-aorfc-noift", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);
  timelines[c].from("#aorfc-noift-pic-2", 0.5, {opacity: 0});
  tl.add(timelines[c++]);
  timelines[c].from("#aorfc-noift-pic-3", 0.5, {opacity: 0});
  tl.add(timelines[c++]);

  
  // NORFC NOIFT
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-940vw, -780vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#seed-robustness-noift-norfc", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);
  timelines[c].from("#noift-norfc-pic-2", 0.5, {opacity: 0});
  tl.add(timelines[c++]);
  timelines[c].from("#noift-norfc-pic-3", 0.5, {opacity: 0});
  tl.add(timelines[c++]);
  timelines[c].from("#noift-norfc-pic-4", 0.5, {opacity: 0});
  tl.add(timelines[c++]);
  timelines[c].from("#noift-norfc-pic-5", 0.5, {opacity: 0});
  tl.add(timelines[c++]);

  // NCOH NOIFT
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-940vw, -850vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#seed-robustness-ncoh-noift", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);
  timelines[c].from("#ncoh-noift-pic-2", 0.5, {opacity: 0});
  tl.add(timelines[c++]);
  timelines[c].from("#ncoh-noift-pic-3", 0.5, {opacity: 0});
  tl.add(timelines[c++]);
  timelines[c].from("#ncoh-noift-pic-4", 0.5, {opacity: 0});
  tl.add(timelines[c++]);
  timelines[c].from("#ncoh-noift-pic-5", 0.5, {opacity: 0});
  tl.add(timelines[c++]);

  // Proof
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-940vw, -980vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#seed-robustness-norfc-ncoh-noift", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);
  timelines[c].from("#norfc-ncoh-noift-algo", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  timelines[c].from("#norfc-noift-proof1", 0.5, {opacity: 0});
  tl.add(timelines[c++]);
  timelines[c].to(".mord.norfc-ncoh-noift-algo-greater, .mbin.norfc-ncoh-noift-algo-greater, .mopen.norfc-ncoh-noift-algo-greater, .mpunct.norfc-ncoh-noift-algo-greater, .mrel.norfc-ncoh-noift-algo-greater, .mclose.norfc-ncoh-noift-algo-greater", 0.5, {color:"red"}, 0);
  tl.add(timelines[c++]);
  timelines[c].to("#norfc-noift-proof1", 0.5, {opacity: 0}, 0.2);
  timelines[c].from("#norfc-noift-proof2", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  timelines[c].to("#norfc-noift-proof2", 0.5, {opacity: 0}, 0.2);
  timelines[c].from("#norfc-noift-proof3", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  timelines[c].to("#norfc-noift-proof3", 0.5, {opacity: 0}, 0.2);
  timelines[c].from("#norfc-noift-proof4", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  timelines[c].to("#norfc-noift-proof4", 0.5, {opacity: 0}, 0.2);
  timelines[c].from("#norfc-noift-proof5", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  // timelines[c].to("#norfc-noift-proof3", 0.5, {opacity: 0},0.2);
  // timelines[c].from("#norfc-noift-proof4", 0.5, {opacity: 0},0);
  // tl.add(timelines[c++]);

  // ORFC-CORE
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1063vw, -978vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#orfc-core", 0.9, {opacity: 0, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  timelines[c].to(".mord.orfc-core-algo-energy2, .mopen.orfc-core-algo-energy2, .mclose.orfc-core-algo-energy2", 0.9, {color: "red", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1063vw, -898vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#orfc-core-example", 0.9, {opacity: 0, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // OIFT-CORE
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1163vw, -978vh, 0vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // OIFT-CORE RAG
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1223vw, -978vh, 0vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  timelines[c].from("#oift-core-rag-pic-2", 0.4, {opacity: 0, ease: Power2.easeInOut}, 0);
  timelines[c].to("#oift-core-rag-pic-1", 0.4, {opacity: 0, ease: Power2.easeInOut}, 0.2);
  tl.add(timelines[c++]);
  timelines[c].from("#oift-core-rag-pic-3", 0.4, {opacity: 0, ease: Power2.easeInOut}, 0);
  timelines[c].to("#oift-core-rag-pic-2", 0.4, {opacity: 0, ease: Power2.easeInOut}, 0.2);
  tl.add(timelines[c++]);
  timelines[c].from("#oift-core-rag-pic-4", 0.4, {opacity: 0, ease: Power2.easeInOut}, 0);
  timelines[c].to("#oift-core-rag-pic-3", 0.4, {opacity: 0, ease: Power2.easeInOut}, 0.2);
  tl.add(timelines[c++]);

  // Robustness Coefficient
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1223vw, -878vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#robustness-coefficient", 0.9, {opacity: 0, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  timelines[c].from("#dice", 0.9, {opacity: 0, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1325vw, -780vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#hybrid", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#hybrid-info", 0.5, {opacity: 0}, 0.3);
  timelines[c].from("#hybrid-algo", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#hybrid-algo", 0.5, {opacity: 0}, 0.3);
  timelines[c].from("#hybrid-pictures", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  // Reparação de Segmentações
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1325vw, -880vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#segmentation-repair", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);
  timelines[c].to("#segmentation-repair-brain", 0.5, {opacity: 0}, 0);
  timelines[c].from("#segmentation-repair-car", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  timelines[c].to("#segmentation-repair-car", 0.5, {opacity: 0}, 0);
  timelines[c].from("#segmentation-repair-talus", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  timelines[c].to("#segmentation-repair-talus", 0.5, {opacity: 0}, 0);
  timelines[c].from("#segmentation-repair-talus2", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  timelines[c].to("#segmentation-repair-talus2", 0.5, {opacity: 0}, 0);
  timelines[c].from("#segmentation-repair-chart", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  // timelines[c].to("#segmentation-repair-wrist", 0.5, {opacity: 0}, 0);
  // timelines[c].from("#segmentation-repair-chart", 0.5, {opacity: 0}, 0);
  // tl.add(timelines[c++]);

  // Análise de Redundância
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1040vw, -460vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#redundancy-analysis", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#redundancy-1", 0.5, {opacity: 0}, 0);
  timelines[c].from("#redundancy-2", 0.5, {opacity: 0}, 0);
  
  tl.add(timelines[c++]);

  timelines[c].to("#redundancy-2", 0.5, {opacity: 0}, 0);
  timelines[c].from("#redundancy-3", 0.5, {opacity: 0}, 0);
  timelines[c].from("#redundancy-symbol-2", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#redundancy-3", 0.5, {opacity: 0}, 0);
  timelines[c].from("#redundancy-4", 0.5, {opacity: 0}, 0);
  timelines[c].from("#redundancy-symbol-3", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#redundancy-4", 0.5, {opacity: 0}, 0);
  timelines[c].from("#redundancy-5", 0.5, {opacity: 0}, 0);
  timelines[c].from("#redundancy-symbol-4", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);


  // IFT-SLIC
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1040vw, -560vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#ift-slic", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  timelines[c].to("#ift-slic-step-1", 0.5, {opacity: 0}, 0);
  timelines[c].from("#ift-slic-step-2", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#ift-slic-step-2", 0.5, {opacity: 0}, 0);
  timelines[c].from("#ift-slic-step-3", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#ift-slic-step-3", 0.5, {opacity: 0}, 0);
  timelines[c].from("#ift-slic-step-4", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#ift-slic-step-4", 0.5, {opacity: 0}, 0);
  timelines[c].from("#ift-slic-step-5", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);


  timelines[c].to("#ift-slic-step-5", 0.5, {opacity: 0}, 0);
  timelines[c].from("#ift-slic-step-6", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#ift-slic-step-6", 0.5, {opacity: 0}, 0);
  timelines[c].from("#ift-slic-step-7", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);
  
  timelines[c].to("#ift-slic-step-7", 0.5, {opacity: 0}, 0);
  timelines[c].from("#ift-slic-step-8", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  timelines[c].to("#ift-slic-step-8", 0.5, {opacity: 0}, 0);
  timelines[c].from("#ift-slic-step-9", 0.5, {opacity: 0}, 0);
  tl.add(timelines[c++]);

  // Publicações
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1140vw, -560vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#publications", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);

  // Thanks
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-1140vw, -660vh, 0vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#thanks", 0.5, {opacity: 0}, 0.3);
  tl.add(timelines[c++]);


  const deck: SlideDeck = new SlideDeck(tl);
  const cur = 148;
  deck.seek(cur);
  deck.tweenTo(cur + 1);
  tl.pause(0);
});

