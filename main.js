var options = {
  speed: .5,
  sampleMode: "input",
  fadePath: 0,
  sampleRate: 50,
  compression: 0,
  paused: false
}

var example = "0 1\n0.5 1.6\n2 2\n2.75 1\n1 -1\n0 -2\n-1 -1\n-2.75 1\n-2 2\n-0.5 1.6"

var keyframes = []
var timer = null, anim = null
var animt = 0
var cx = 0, cy = 0
var scale = 5

var cvs = document.querySelector("#circles")
var path = document.querySelector("#path")
var sample = document.querySelector("#sample")
var ctx = cvs.getContext("2d")
var pctx = path.getContext("2d")
var sctx = sample.getContext("2d")

var h = cvs.height
var w = cvs.width

ctx.translate(w/2,h/2)
ctx.scale(1,-1)
pctx.translate(w/2,h/2)
pctx.scale(1,-1)
sctx.translate(w/2,h/2)
sctx.scale(1,-1)
pctx.imageSmoothingEnabled = false;
reset()

function circle(c, x, y, r, color, fill) {
  c.save()
  c.strokeStyle = color
  c.beginPath()
  c.arc(x,y,r,0,tpi)
  fill?c.fill():c.stroke()
  c.restore()
}

function grid(c) {
  c.save()
  c.font = '15px sans-serif';
  c.scale(1,-1)
  var text = c.measureText("5")
  c.fillText("5",w/2-10-text.width*1.2/2, 15 )
  text = c.measureText("-5")
  c.fillText("-5",text.width*1.2/2-w/2, 15 )
  text = c.measureText("5i")
  c.fillText("5i",text.width*1.2/2, 15-h/2 )
  text = c.measureText("-5i")
  c.fillText("-5i",text.width*1.2/2, h/2-8 )
  c.restore()
  c.beginPath()
  for (var i = -w/2 ; i < w/2 ; i += w/(scale*2)) {
    c.moveTo(i,h/2)
    c.lineTo(i,-h/2)
  }
  for (var i = -h/2 ; i < h/2 ; i += h/(scale*2)) {
    c.moveTo(-w/2,i)
    c.lineTo(w/2,i)
  }
  c.lineWidth = .5
  c.strokeStyle = 'rgba(0,0,0,.5)'
  c.stroke()
  c.beginPath()
  c.moveTo(0,h/2)
  c.lineTo(0,-h/2)
  c.moveTo(-w/2,0)
  c.lineTo(w/2,0)
  c.lineWidth = 1
  c.strokeStyle = 'black'
  c.stroke()
}

function clear() {
  ctx.clearRect(-w/2,-h/2,w,h)
  grid(ctx)
  pctx.clearRect(-w/2,-h/2,w,h)
  sctx.clearRect(-w/2,-h/2,w,h)
}

function reset() {
  clearInterval(anim)
  anim = null
  clearInterval(timer)
  timer = null
  keyframes = []
  clear()
}

function evaluateKeyframes () {
  var compSlider = document.querySelector("#comp-sider")
  compSlider.max = keyframes.length-2
  compSlider.value = 0
  options.compression = 0
  clearInterval(timer)
  timer = null
  keyframes = dft(keyframes).sort(function(a,b) {
    return b[0]*b[0]+b[1]*b[1]-a[0]*a[0]-a[1]*a[1]
  })
  anim = window.setInterval(function() {
    ctx.clearRect(-w/2,-h/2,w,h)
    grid(ctx)
    ctx.save()
    pctx.save()
    // handle path fading
    pctx.save()
    pctx.fillStyle = "rgba(255,255,255,"+options.fadePath+")"
    pctx.fillRect(-w/2,-h/2,w,h)
    pctx.restore()

    var angle
    for (var i = 0 ; i < keyframes.length-options.compression; ++i ) {
      var f = keyframes[i][2]
      angle = animt/360*tpi*((f>keyframes.length/2)?(f-keyframes.length):f)
      // angle = animt/360*tpi*i
      c = cmult(Math.cos(angle),Math.sin(angle),keyframes[i][0], keyframes[i][1])
      circle(ctx, 0, 0, Math.sqrt(c[0]*c[0]+c[1]*c[1]), 'black', false)
      circle(ctx, c[0], c[1], 1, 'red', false)
      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.translate(c[0],c[1])
      ctx.lineTo(0,0)
      ctx.stroke()
      pctx.translate(c[0],c[1])
    }
    circle(pctx, 0, 0, .5, 'red', false)
    ctx.restore()
    pctx.restore()
    if (!options.paused) {
      animt += options.speed
      if (animt > 360) animt -= 360
    }
  },10)
}

cvs.onmousedown = function(e) {
  if (e.which == 1) {
    cx = e.clientX-10-w/2, cy = h/2-e.clientY+10
    switch (options.sampleMode) {
      case "curve":
        reset()
        timer = window.setInterval(function(){
          keyframes.push([cx,cy])
          circle(sctx, cx, cy, 3, 'black', true)
        },Math.floor(options.sampleRate))
        break
      case "point":
        if (anim == null) {
          keyframes.push([cx,cy])
          circle(sctx, cx, cy, 3, 'black', true)
        }
        break
      default: break
    }
  }
}

cvs.onmousemove = function(e) {
  cx = e.clientX-10-w/2, cy = h/2-e.clientY+10
}

cvs.onmouseup = function(e) {
  if (e.which == 1) {
    if (options.sampleMode == "curve") {
      evaluateKeyframes()
    }
  }
}

cvs.onmouseout = function(e) {
  if (options.sampleMode == "curve" && timer) {
    evaluateKeyframes()
  }
}

// ----- HANDLING GUI OPTIONS ------

document.querySelector("#speed-slider").onchange = function(e) {
  options.speed = e.target.valueAsNumber/20
}

document.querySelector("#step-back").onmousedown = function(e) {
  animt -= options.speed
  if (animt < 0) animt += 360
}

document.querySelector("#step-forward").onmousedown = function(e) {
  animt += options.speed
  if (animt > 360) animt -= 360
}

document.querySelector("#play-pause").onclick = function(e) {
  options.paused ^= true
  e.target.innerHTML = options.paused?"resume":"pause"
  document.querySelector("#step-back").disabled = !options.paused
  document.querySelector("#step-forward").disabled = !options.paused
}

document.querySelector("#comp-sider").onchange = function(e) {
  options.compression = e.target.valueAsNumber
  pctx.clearRect(-w/2,-h/2,w,h)
}

document.querySelector("#mode-select").onchange = function(e) {
  options.sampleMode = e.target.value
  var controls = ["curve","point","input"]
  controls.forEach(function(i) { document.querySelector("#"+i+"-controls").hidden = options.sampleMode != i })
  if (options.sampleMode == "input") {
    document.querySelector("#sample-data").value = example
  }
  reset()
}

document.querySelector("#fade-path").onchange = function(e) {
  options.fadePath = e.target.valueAsNumber/10
  pctx.clearRect(-w/2,-h/2,w,h)
}

document.querySelector("#sample-slider").onchange = function(e) {
  options.sampleRate = 1000/Math.pow(10,e.target.valueAsNumber)
}

document.querySelector("#clear-samples").onclick = reset
document.querySelector("#point-fit").onclick = evaluateKeyframes
document.querySelector("#input-fit").onclick = function () {
  reset()
  keyframes = document.querySelector("#sample-data").value
    .replace(/[^0-9\-\. \n]/gim,"")
    .trim()
    .split("\n")
    .map(function(s) {
      return s.split(" ").map(function(e) {
        return Number(e)/scale/2*w
      })
    })
  keyframes.forEach(function(e) {
    circle(sctx, e[0], e[1], 3, 'black', true)
  })
  evaluateKeyframes()
}

// initialize
document.querySelector("#sample-data").value = example
