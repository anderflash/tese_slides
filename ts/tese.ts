// export interface Animation extends EventTarget {
//   id: DOMStringList;

//              attribute DOMString                id;
//              attribute AnimationEffectReadOnly? effect;
//              attribute AnimationTimeline?       timeline;
//              attribute double?                  startTime;
//              attribute double?                  currentTime;
//              attribute double                   playbackRate;
//     readonly attribute AnimationPlayState       playState;
//     readonly attribute Promise<Animation>       ready;
//     readonly attribute Promise<Animation>       finished;
//              attribute EventHandler             onfinish;
//              attribute EventHandler             oncancel;
//     void cancel ();
//     void finish ();
//     void play ();
//     void pause ();
//     void reverse ();
// };

// export interface Animatable {
//     Animation           animate (object? keyframes,
//                                  optional (unrestricted double or KeyframeAnimationOptions) options);
//     sequence<Animation> getAnimations ();
// };

enum Key{
  LEFT=37,
  UP=38,
  RIGHT=39,
  DOWN=40
};

class Fragment{
  effect;
  constructor(effect){
    this.effect = effect;
  }
}

class SlideDeck{
  fragments:Fragment[];
  animations:any[];
  current:number;

  constructor(fragments:Fragment[]){
    this.fragments = fragments;
    this.current = 0;
    this.animations = [];

    document.addEventListener('keydown', (e) => {
      switch (e.keyCode) {
        case Key.LEFT:
        case Key.UP:
          this.prev();
          break;
        case Key.RIGHT:
        case Key.DOWN:
          this.next();
          break;
        
        default:
          // code...
          break;
      }
    });
    document.addEventListener('keyup', (e) => {

    });
  }
  next(): void {
    if(this.current < this.fragments.length){
      this.animations[this.current] = document.timeline.play(this.fragments[this.current++].effect);
    }
  }
  prev(): void {
    if(this.current > 0)
      this.animations[--this.current].reverse();
  }
}
var cover_title       = document.getElementById('cover-title');
var cover_defense     = document.getElementById('cover-defense');
var cover_author      = document.getElementById('cover-author');
var cover_institution = document.getElementById('cover-institution');
var cover_people      = document.getElementById('cover-people');
var dummy             = document.getElementById('dummy');

// Appear effect

var fx_y         = {transform: 'translateY(0)'};
var fx_x         = {transform: 'translateX(0)'};
var fx_fade_in   = [{opacity:0},{opacity:1}];
var fx_fade_out  = fx_fade_in.slice().reverse();
var fx_down      = [{transform: 'translateY(-10vmin)'},fx_y];
var fx_up        = [{transform: 'translateY( 10vmin)'},fx_y];
var fx_left      = [{transform: 'translateX(-10vmin)'},fx_x];
var fx_right     = [{transform: 'translateX( 10vmin)'},fx_x];
var compose      = (fx2_list) => (fx, i) => Object.assign({},fx,fx2_list[i]);
var fx_down_in   = fx_down.map(compose(fx_fade_in));
var fx_up_in     = fx_up.map(compose(fx_fade_in));
var fx_down_out  = fx_up_in.slice().reverse();
var fx_up_out    = fx_down_in.slice().reverse();
var fx_left_in   = fx_left.map(compose(fx_fade_in));
var fx_left_out  = fx_left.slice().reverse().map(compose(fx_fade_out));
var fx_right_in  = fx_right.map(compose(fx_fade_in));
var fx_right_out = fx_right.slice().reverse().map(compose(fx_fade_out));

var timings = {
  duration: 1000,
  easing: 'ease-in-out',
  fill: 'both'
};


// animation.onfinish = (e) => {
//   animation.reverse();
// };
// console.log(animation); 

// cover_title.animate([
//   { transform: 'scale(1)', opacity: 1, offset: 0 },
//   { transform: 'scale(.5)', opacity: .5, offset: .3 },
//   { transform: 'scale(.667)', opacity: .667, offset: .7875 },
//   { transform: 'scale(.6)', opacity: .6, offset: 1 }
// ],{
//   duration: 700, //milliseconds
//   easing: 'ease-in-out', //'linear', a bezier curve, etc.
//   delay: 10, //milliseconds
//   iterations: Infinity, //or a number
//   direction: 'alternate', //'normal', 'reverse', etc.
//   fill: 'forwards' //'backwards', 'both', 'none', 'auto'
// });
var fragments = [
  new Fragment(
    new GroupEffect([
      new KeyframeEffect(cover_title, fx_down_in, timings),
      new KeyframeEffect(cover_defense    , fx_fade_in, Object.assign({delay:100},timings)),
      new KeyframeEffect(cover_author     , fx_fade_in, Object.assign({delay:400},timings)),
      new KeyframeEffect(cover_institution, fx_fade_in, Object.assign({delay:400},timings)),
      new KeyframeEffect(cover_people     , fx_up_in  , Object.assign({delay:500},timings))
    ])
  ),
  new Fragment(
    new GroupEffect([
      new KeyframeEffect(cover_title      , fx_up_out  , timings),
      new KeyframeEffect(cover_defense    , fx_fade_out, Object.assign({delay:0},timings)),
      new KeyframeEffect(cover_author     , fx_fade_out, Object.assign({delay:0},timings)),
      new KeyframeEffect(cover_institution, fx_fade_out, Object.assign({delay:0},timings)),
      new KeyframeEffect(cover_people     , fx_down_out, Object.assign({delay:0},timings)),
      new KeyframeEffect(dummy            , fx_down_out, Object.assign({delay:1},timings))
    ])
  ),
];
var deck = new SlideDeck(fragments);
deck.next();
//document.timeline.play(new KeyframeEffect(cover_title, [{opacity:0}]),{duration:1000});
