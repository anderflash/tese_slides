var player = document.getElementById('title').animate([
  {transform: 'scale(1)'   , opacity: 1, offset: 0},
  {transform: 'scale(.5)'  , opacity: 1, offset: .3},
  {transform: 'scale(.667)', opacity: 1, offset: .7875},
  {transform: 'scale(.6)'  , opacity: 1, offset: 1}
],{
  duration: 700,
  easing: 'ease-in-out',
  delay: 10,
  iterations: Infinity,
  direction: 'alternate',
  fill: 'forwards'
});