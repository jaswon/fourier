var options = {
  speed: 1/20,
  curveMode: true,
  fadePath: 0,
  sampleRate: 50
}

var keyframes = []
var timer = null, anim = null
var animt = 0
var cx = 0, cy = 0

var cvs = document.querySelector("#circles")
var path = document.querySelector("#path")
var sample = document.querySelector("#sample")
var ctx = cvs.getContext("2d")
var pctx = path.getContext("2d")
var sctx = sample.getContext("2d")

var h = cvs.height
var w = cvs.width

ctx.font = '36px arial'
ctx.textAlign = 'center'
ctx.fillText('Click to draw',w/2,h/2)

ctx.translate(w/2,h/2)
ctx.scale(1,-1)
pctx.translate(w/2,h/2)
pctx.scale(1,-1)
sctx.translate(w/2,h/2)
sctx.scale(1,-1)

function evaluateKeyframes () {
  clearInterval(timer)
  timer = null
  keyframes = dft(keyframes) // compute the discrete fourier transform
  anim = window.setInterval(function() {
    ctx.clearRect(-w/2,-h/2,w,h)
    ctx.save()
    pctx.save()
    // handle path fading
    pctx.save()
    pctx.fillStyle = "rgba(255,255,255,"+options.fadePath+")"
    pctx.fillRect(-w/2,-h/2,w,h)
    pctx.restore()

    ctx.beginPath()
    ctx.moveTo(-w/2,0)
    ctx.lineTo(w/2,0)
    ctx.moveTo(0,h/2)
    ctx.lineTo(0,-h/2)
    ctx.stroke()

    var angle
    for (var i = 0 ; i < keyframes.length; ++i ) {
      var f = (i>keyframes.length/2)?(i-keyframes.length):i
      angle = animt/360*tpi*f
      c = cmult(Math.cos(angle),Math.sin(angle),keyframes[i][0], keyframes[i][1])
      ctx.beginPath()
      ctx.arc(0,0,Math.sqrt(c[0]*c[0]+c[1]*c[1]),0,tpi)
      ctx.stroke()
      ctx.strokeStyle = 'red'
      ctx.beginPath()
      ctx.arc(c[0],c[1],1,0,tpi)
      ctx.stroke()
      ctx.strokeStyle = 'black'
      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.translate(c[0],c[1])
      ctx.lineTo(0,0)
      ctx.stroke()
      pctx.translate(c[0],c[1])
    }
    pctx.strokeStyle = 'red'
    pctx.beginPath()
    pctx.arc(0,0,1,0,tpi)
    pctx.stroke()
    pctx.strokeStyle = 'black'
    ctx.restore()
    pctx.restore()
    animt += options.speed
    if (animt == 360) animt = 0
  },10)
}

cvs.onmousedown = function(e) {
  if (e.which == 1) {
    cx = e.clientX-w/2, cy = h/2-e.clientY
    if (options.curveMode) {
      clearInterval(anim)
      anim = null
      keyframes = []
      ctx.clearRect(-w/2,-h/2,w,h)
      pctx.clearRect(-w/2,-h/2,w,h)
      sctx.clearRect(-w/2,-h/2,w,h)
      timer = window.setInterval(function(){
        keyframes.push([cx,cy])
        sctx.beginPath()
        sctx.arc(cx,cy,3,0,tpi)
        sctx.fill()
      },Math.floor(options.sampleRate))
    } else {
      if (anim == null) {
        keyframes.push([cx,cy])
        sctx.beginPath()
        sctx.arc(cx,cy,3,0,tpi)
        sctx.fill()
      }
    }
  }
}

cvs.onmousemove = function(e) {
  cx = e.clientX-w/2, cy = h/2-e.clientY
}

cvs.onmouseup = function(e) {
  if (e.which == 1) {
    if (options.curveMode) {
      evaluateKeyframes()
    }
  }
}

// ----- HANDLING GUI OPTIONS ------

document.querySelector("#speed-slider").onchange = function(e) {
  options.speed = e.target.valueAsNumber/20
}

document.querySelector("#mode-select").onchange = function(e) {
  options.curveMode = e.target.value == "curve"
  document.querySelector("#curve-controls").hidden = !options.curveMode
  document.querySelector("#point-controls").hidden = options.curveMode
  // reset canvas and loops
  clearInterval(anim)
  anim = null
  clearInterval(timer)
  timer = null
  keyframes = []
  ctx.clearRect(-w/2,-h/2,w,h)
  pctx.clearRect(-w/2,-h/2,w,h)
  sctx.clearRect(-w/2,-h/2,w,h)
}

document.querySelector("#fade-path").onchange = function(e) {
  options.fadePath = e.target.valueAsNumber/10
  pctx.clearRect(-w/2,-h/2,w,h)
}

document.querySelector("#sample-slider").onchange = function(e) {
  options.sampleRate = 1000/Math.pow(10,e.target.valueAsNumber)
}

document.querySelector("#clear-samples").onclick = function(e) {
  clearInterval(anim)
  anim = null
  keyframes = []
  ctx.clearRect(-w/2,-h/2,w,h)
  pctx.clearRect(-w/2,-h/2,w,h)
  sctx.clearRect(-w/2,-h/2,w,h)
}

document.querySelector("#point-fit").onclick = function(e) {
  evaluateKeyframes()
}
