//import * as katex from "katex";
import { SlideDeck } from "./slidedeck";

// let clone = (fx) => Object.assign({}, fx);

document.addEventListener("DOMContentLoaded", (event) => {

  katex.render("c = \\pm\\sqrt{a^2 + b^2}", document.getElementById("digital-image-formula"));

  const tl: TimelineMax = new TimelineMax();

  // Criando todas as timelines
  const timelines: TimelineMax[] = new Array<TimelineMax>(50);
  for (let i = 0; i < 50; i++) {
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
  // timelines[c].to("#intro-type-manual", 0.5, {css: {opacity: 0}, ease: Power2.easeInOut}, 0);


  timelines[c].to("#blocks", 0.9, {transform: "translate3d(-130vw, -100vh, -30vmin)", ease: Power2.easeInOut}, 0);
  tl.add(timelines[c++]);

  const deck: SlideDeck = new SlideDeck(tl);
  const cur = 9;
  deck.seek(cur);
  deck.tweenTo(cur + 1);
  tl.pause(0);
});
