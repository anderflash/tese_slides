import { SlideDeck } from "./slidedeck";

let clone = (fx) => Object.assign({}, fx);

document.addEventListener("DOMContentLoaded", (event) => {

  // Create all timelines
  let tl: TimelineMax = new TimelineMax();
  let tl2: TimelineMax;
  let timelines: TimelineMax[] = new Array<TimelineMax>(50);
  for (let i = 0; i < 50; i++) {
    timelines[i] = new TimelineMax();
  }

  // Effects
  let fxFadeIn  = {opacity: 0};
  let fxDown    = {y: "-10vmin"};
  let fxUp      = {y: " 10vmin"};
  let fxLeft    = {x: "-10vmin"};
  let fxRight   = {x: " 10vmin"};
  let fxDownIn  = Object.assign({}, fxFadeIn, fxDown);
  let fxUpIn    = Object.assign({}, fxFadeIn, fxUp);
  let fxLeftIn  = Object.assign({}, fxFadeIn, fxLeft);
  let fxRightIn = Object.assign({}, fxFadeIn, fxRight);

  // -> Cover
  tl2 = timelines[0];
  tl2.to("#cover"          , 0, {display: "flex"}  , 0);
  tl2.from("#cover .top"   , 0.5, clone(fxDownIn) , 0);
  tl2.from("#cover .middle", 0.5, clone(fxFadeIn) , 0.2);
  tl2.from("#cover .bottom", 0.5, clone(fxUpIn)   , 0.5);
  tl.add(tl2);

  // Cover -> Segmentation
  tl2 = timelines[1];
  // out
  tl2.to("#cover .top"            , 0.5, clone(fxUpIn)    ,   0);
  tl2.to("#cover .middle"         , 0.5, clone(fxFadeIn)  ,   0);
  tl2.to("#cover .bottom"         , 0.5, clone(fxDownIn)  ,   0);
  tl2.to("#cover"                 ,   0, {display: "none"}, 0.5);
  // in
  tl2.to("#segmentation"          ,   0, {display: "flex"}, 0.5);
  tl2.to("#segmentation-images"   ,   0, {display: "flex"}, 0.5);
  tl2.from("#segmentation header" , 0.5, clone(fxDownIn)  , 0.5);
  tl2.from("#segmentation-images" , 0.5, clone(fxFadeIn)  , 0.5);
  tl.add(tl2);

  tl2 = timelines[2];
  tl2.to("#segmentation-images"   ,   1, clone(fxFadeIn), 0);
  tl2.to("#segmentation-apps"     ,   0, {display: "flex"}, 0);
  // tl2.from("#segmentation-apps"   ,   1, clone(fxFadeIn), 0.2);
  tl2.from("#segmentation-apps-1" ,   1, clone(fxFadeIn), 0.2);
  tl2.from("#segmentation-apps-2" ,   1, clone(fxFadeIn), 0.6);
  tl2.from("#segmentation-apps-3" ,   1, clone(fxFadeIn), 1);
  tl2.from("#segmentation-apps-4" ,   1, clone(fxFadeIn), 1.4);
  tl2.to("#segmentation-images"   ,   0, {display: "none"}, 1);
  tl.add(tl2);

  let deck: SlideDeck = new SlideDeck(tl);
  let cur = 2;
  deck.seek(cur);
  deck.tweenTo(cur + 1);
  tl.pause(0);
});
