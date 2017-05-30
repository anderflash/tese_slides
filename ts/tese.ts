// import * as katex from "katex";
import { SlideDeck } from "./slidedeck";

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
    const x1 = n1.cx.baseVal.value;
    const x2 = n2.cx.baseVal.value;
    const y1 = n1.cy.baseVal.value;
    const y2 = n2.cy.baseVal.value;
    edge.classList.add("edge");

    // Obter o angulo
    const angle =  Math.atan2(y2 - y1, x2 - x1);

    // Desenhar
    edge.x1.baseVal.value = x1 + Math.cos(angle) * n1.r.baseVal.value;
    edge.x2.baseVal.value = x2 - Math.cos(angle) * n2.r.baseVal.value;
    edge.y1.baseVal.value = y1 + Math.sin(angle) * n1.r.baseVal.value;
    edge.y2.baseVal.value = y2 - Math.sin(angle) * n2.r.baseVal.value;
    if (group) {
      group.appendChild(edge);
    } else {
      this.svg.appendChild(edge);
    }
    

    // Se tiver peso, insere
    return edge;
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

  const tl: TimelineMax = new TimelineMax();

  // Criando todas as timelines
  const timelines: TimelineMax[] = new Array<TimelineMax>(70);
  for (let i = 0; i < 70; i++) {
    timelines[i] = new TimelineMax();
  }

  let c: number = 0;
  // Capa -> Segmentação
  timelines[c].to("#blocks", 1.5, {css: {transform: "translate3d(-100vw, 50vh, 0)"}, ease: Power2.easeInOut});
  tl.add(timelines[c++]);

  // Segmentação -> Applicações
  timelines[c].from("#intro-applications", 1.0, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#blocks", 1.0, {css: {transform: "translate3d(-100vw, -20vh, 0)"}, ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Aplicações -> Tipo de segmentação
  timelines[c].from("#intro-type", 1.0, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);
  timelines[c].to("#blocks", 1.0, {transform: "translate3d(-100vw, -100vh, -30vmin)", ease: Power2.easeInOut}, 0);
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
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-130vw, -100vh, -30vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Algumas soluções se baseiam em random walks
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-170vw, -100vh, -30vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#related-rw", 0.9, {opacity: 0}, 0.9);
  tl.add(timelines[c++]);

  // Algumas soluções se baseiam em random walks
  timelines[c].from("#related-superficies", 0.9, {opacity: 0});
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-180vw, -180vh, -30vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Algumas soluções se baseiam em random walks
  timelines[c].from("#related-gc", 0.9, {opacity: 0});
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-240vw, -180vh, -30vmin)", ease: Power2.easeInOut}, 0);
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
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-330vw, -150vh, 20vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  // Conceitos: Imagem Digital (resultado)
  timelines[c].to("#digital-image-arrow", 0.4, {opacity: 0});
  timelines[c].to("#digital-image-coordinate-space", 0.4, {opacity: 0}, 0);
  timelines[c].from("#digital-image-result", 0.4, {opacity: 0}, 0);
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

  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-330vw, -250vh, 20vmin)", ease: Power2.easeInOut}, 0);
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
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-398vw, -498vh, 20vmin)", ease: Power2.easeInOut});
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
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-488vw, -498vh, 20vmin)", ease: Power2.easeInOut});
  timelines[c].from("#graph-connectivity", 0.2, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  // OPSF
  timelines[c].to("#opsf-line1", 1.9, {attr: {x2: 200, y2: 80}, ease: Power0.easeNone}, 0);
  timelines[c].to("#opsf-line2", 1.9, {attr: {x2: 200, y2: 80}, ease: Power0.easeNone}, 0);
  timelines[c].to("#blocks", 1.9, {transform: "translate3d(-508vw, -468vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#opsf", 1, {opacity: 0}, 0.6);

  tl.add(timelines[c++]);

  // IFT
  graphPicture = document.getElementById("ift-steps");
  graphCanvas  = new GraphCanvas(graphPicture);

  // adding nodes
  const nodes: SVGCircleElement[] = [];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      nodes.push(graphCanvas.addNode(x * 16 + 8, y * 16 + 8));
    }
  }

  // adding edges
  const neighbors = [[1, 0], [0, 1]];
  const weights   = [[15, 15], [14, 13], [12, 17], [0, 5],
                     [13, 0] , [16, 4] , [10, 13], [0, 16],
                     [17, 15], [7, 11], [17, 15], [0, 17],
                     [15, 0] , [11, 0], [13, 0], [0, 0]];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      for (let i = 0; i < neighbors.length; i++) {
        const nx = x + neighbors[i][0];
        const ny = y + neighbors[i][1];
        if (nx >= 0 && nx <= 3 && ny >= 0 && ny <= 3) {
          const e = graphCanvas.addEdge(nodes[ny * 4 + nx], nodes[y * 4 + x]);
          graphCanvas.addWeight(e, weights[y * 4 + x][i].toString());
        }
      }
    }
  }

  timelines[c].to("#ift-steps-pictures", 0.9, {attr: {x2: 200, y2: 80}, ease: Power0.easeNone}, 0);
  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-560vw, -510vh, -20vmin)", ease: Power2.easeInOut}, 0);
  timelines[c].from("#ift", 1, {opacity: 0}, 0.6);
  tl.add(timelines[c++]);

  const deck: SlideDeck = new SlideDeck(tl);
  const cur = 50;
  deck.seek(cur);
  deck.tweenTo(cur + 1);
  tl.pause(0);
});
