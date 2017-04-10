var tpi = 2*Math.PI

function cmult(a,b,c,d) {
  return [a*c-b*d,a*d+b*c]
}

function dft(time) {
  var ret = []
  var n = time.length
  for (var i = 0 ; i < n ; ++i) {
    var sreal = 0, simag = 0, angle = 0
    for (var j = 0 ; j < n ; ++j) {
      angle = tpi * i * j / n;
      sreal +=  time[j][0] * Math.cos(angle) + time[j][1] * Math.sin(angle);
      simag += -time[j][0] * Math.sin(angle) + time[j][1] * Math.cos(angle);
    }
    ret.push([sreal/n,simag/n,i])
  }
  return ret
}
