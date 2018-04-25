var tpi = 2*Math.PI

function dft(time) {
  var ret = []
  var n = time.length
  for (var i = -Math.floor(n/2) ; i < n/2 ; ++i) {
  // for (var i = 0 ; i < n ; ++i) {
    ret.push([
      time.reduce(function(acc,next,ind) {
        return Complex.Polar(1/n,-tpi * i * ind / n)['*'](next)['+'](acc)
    },Complex()),i])
  }
  return ret
}
