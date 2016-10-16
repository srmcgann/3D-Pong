const currentFrame = function(start){ var _ = start; return function(){ return ++_; }; };

const gameUpdate = currentFrame(0);

f = gameUpdate();
console.log(f);

f = gameUpdate();
console.log(f);

f = gameUpdate();
console.log(f);
