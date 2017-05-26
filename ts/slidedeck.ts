import { ISlideDeckOptions } from "./islidedeckoptions";
export class SlideDeck {
  private positionIndex: number;
  private timeScale: number;
  private positions: number[];
  private options: ISlideDeckOptions;
  constructor(private timeline: TimelineMax, options?: ISlideDeckOptions) {
    this.options       = Object.assign({}, {allowSkip: true, tweenFirst: true, from: 0} as ISlideDeckOptions, options);
    this.positionIndex = 0;
    this.timeScale     = 0;
    console.log(timeline.getChildren(false));
    this.positions     = timeline.getChildren(false).map((tl) => tl.startTime());
    this.positions.push(timeline.duration());
    console.log(this.positions);
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
        default:
      }
    });
  }
  public next() {
    this.tweenTo(this.positionIndex + 1);
  }
  public prev() {
    this.tweenTo(this.positionIndex - 1);
  }
  public seek(i: number): void {
    this.timeline.seek(this.positions[i]);
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
    i = Math.min(Math.max(i, 0), this.positions.length - 1);
    this.positionIndex = i;
    // Tween the "time" (playhead) to the new position using a linear ease.
    // We could have used timeline.tweenTo() if we knew the timeline would always be a TimelineMax,
    // but this code makes it compatible with TimelineLite too.
    console.log(this.positionIndex, this.timeline, this.positions[i], this.timeline.time());
    TweenLite.to(this.timeline, Math.abs(this.positions[i] - this.timeline.time()), {
      ease: Linear.easeNone,
      onComplete: () => this.timeScale = 0,
      time: this.positions[i],
    }).timeScale(this.timeScale);
  }
}
