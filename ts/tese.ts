interface ISlideDeckOptions {
  allowSkip?: boolean;
  tweenFirst?: boolean;
  from?: number;
}
function clone(fx){return Object.assign({}, fx)}

class SlideDeck {
  private positionIndex: number;
  private timeScale: number;
  private positions: number[];
  private options: ISlideDeckOptions;
  constructor(private timeline: TimelineMax, options?: ISlideDeckOptions) {
    this.options       = Object.assign({}, <ISlideDeckOptions> {allowSkip: true, tweenFirst: true, from: 0}, options);
    this.positionIndex = 0;
    this.timeScale     = 0;
    this.positions     = (<TimelineMax[]> timeline.getChildren(false)).map((tl) => tl.startTime());
    this.positions.push(timeline.duration());
    document.addEventListener("keydown", (e) => {
      switch (e.keyCode) {
        // Right, space, enter, down
        case 39: case 40: case 13: case 32:
          this.next();
          break;

        // Left, up, backspace
        case 37: case 38: case 8:
          this.prev();
          break;
      }
    });
  }
  public next() {
    this.tweenTo(this.positionIndex + 1);
  }
  public prev() {
    this.tweenTo(this.positionIndex - 1);
  }
  // Move the playhead to the appropriate position (based on the index)
  public tweenTo(i) {
    if (this.options.allowSkip) {
      this.timeScale++; // speed up if the user keeps pushing the button.
    } else
    if (this.timeScale !== 0) {
      // If the timeScale isn't 0, that means we're mid-tween,
      // and since allowSkip is false, we should ignore the request.
      return;
    } else {
      this.timeScale = 1;
    }
    this.positionIndex = i;
    // Tween the "time" (playhead) to the new position using a linear ease.
    // We could have used timeline.tweenTo() if we knew the timeline would always be a TimelineMax,
    // but this code makes it compatible with TimelineLite too.
    console.log(i);
    console.log(this.positions[i]);
    console.log(this.timeline.time());
    console.log(Math.abs(this.positions[i] - this.timeline.time()));
    TweenLite.to(this.timeline, Math.abs(this.positions[i] - this.timeline.time()), {
      ease: Linear.easeNone,
      onComplete: () => this.timeScale = 0,
      time: this.positions[i],
    }).timeScale(this.timeScale);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {

  // Create all timelines
  let tl: TimelineMax = new TimelineMax();
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
  timelines[0].to("#cover"          , 0, {display:'flex'}  , 0);
  timelines[0].from("#cover .top"   , 0.5, clone(fxDownIn) , 0);
  timelines[0].from("#cover .middle", 0.5, clone(fxFadeIn) , 0.2);
  timelines[0].from("#cover .bottom", 0.5, clone(fxUpIn)   , 0.5);
  tl.add(timelines[0]);

  // Cover -> Segmentation
  timelines[1].to("#cover .top"            , 0.5, clone(fxUpIn)    ,   0);
  timelines[1].to("#cover .middle"         , 0.5, clone(fxFadeIn)  ,   0);
  timelines[1].to("#cover .bottom"         , 0.5, clone(fxDownIn)  ,   0);
  timelines[1].to("#cover"                 ,   0, {display:'none'} , 0.5);
  timelines[1].to("#segmentation"          ,   0, {display:'flex'} , 0.5);
  timelines[1].from("#segmentation header" , 0.5, clone(fxDownIn)  , 0.5);
  tl.add(timelines[1]);

  timelines[2]

  let deck: SlideDeck = new SlideDeck(tl);
  tl.pause(0);


}); 
