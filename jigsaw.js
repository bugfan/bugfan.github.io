import  './jigsaw.css'

let w = 310 // canvas宽度
let h = 155 // canvas高度
const l = 42 // 滑块边长
const r = 9 // 滑块半径
const cw = 55
const ch = 55
const cy = h - ch*2 //45
const PI = Math.PI
const API_PATH = '/api/verify'
const L = l + r * 2 + 3 // 滑块实际边长
var cutImg;

function getRandomNumberByRange (start, end) {
  return Math.round(Math.random() * (end - start) + start)
}

function createCanvas (width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function createImg (onload) {
  // var promise = new Promise(resolve => {
  const img = new Image()
  img.crossOrigin = "Anonymous"
  img.onload = onload
  img.onerror = () => {
   img.setSrc(getRandomImgSrc())
  }
  cutImg = new Image()
  cutImg.crossOrigin = "Anonymous"
  cutImg.onload = onload
  cutImg.onerror = () => {
    cutImg.setSrc(getRandomImgSrc())
  }
  img.setSrc = function(src) {
      /*兼容IE*/	
      var xhr;					 
      if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest();
      }else{
        xhr = new ActiveXObject("Microsoft.XMLHTTP")
      }	
      function request(method,path,data){
          //在此之前可以判断下浏览器的版本
          xhr.open(method,path,true);
          xhr.send(data);
          xhr.onreadystatechange=function(){
              if (xhr.readyState==4){
                  if (xhr.status==200){
                      let obj = JSON.parse(xhr.responseText)
                      // console.log("收到的校验信息:", obj);
                      vid = obj.vid
                      randomY = obj.y
                      requestTimeStr = obj.t
                      // document.getElementById('mycaptcha').src = obj.Base + obj.BreakImg;
                      img.src = obj.b + obj.bi;
                      cutImg.src = obj.b + obj.ci 
                  }
              }
          }
      }
      request('get', API_PATH)
  }
  img.setSrc(getRandomImgSrc())
  // })
  // return promise
  return img
}

 // mouse action 
 let slipFifo = new FIFO(10);
 var vid;
 var randomY = 0;
 var requestTimeStr = '';
 var verifyData = {
     flg:false,
     sl:[],
     l:[],
     md:{},
     mu:{},
     ut:0,
     ft:0,
 };
 document.addEventListener('mousemove',function(e){
     if (verifyData.flg) {
         verifyData.l.push({x:e.clientX,y:e.clientY})
     }
     slipFifo.Push({x:e.clientX,y:e.clientY})
 });
 function FIFO(size) {
     var size = 20   //默认20
     if (typeof len ==='number') {
         this.size = len
     }
     var list = []
     this.Push = function(data) {
         if (!data) {
             return false;
         }
         if (list.length >= size) {
             list.pop();
         }
         list.unshift(data)
     }
     this.Data = function(){
         return list
     }
 }
 document.addEventListener('mousedown', function(e){
     verifyData.md = {x:e.clientX, y:e.clientY}
     verifyData.l.length = 0
     verifyData.flg = true
     verifyData.sl = slipFifo.Data()
 });
 document.addEventListener('mouseup', function(e){
     verifyData.mu = {x:e.clientX, y:e.clientY}
     verifyData.flg = false
     verifyData.vid = vid
     verifyData.ut = parseInt((new Date()) - (new Date(requestTimeStr)))
     verifyData.ft = parseInt((new Date()).getTime()/1000)
 })
function createElement (tagName, className) {
  const elment = document.createElement(tagName)
  elment.className = className
  return elment
}

function addClass (tag, className) {
  tag.classList.add(className)
}

function removeClass (tag, className) {
  tag.classList.remove(className)
}

function getRandomImgSrc () {
  return `https://picsum.photos/${w}/${h}/?image=${getRandomNumberByRange(0, 1084)}`
}

function draw (ctx, x, y, operation) {
  // ctx.beginPath()
  // ctx.moveTo(x, y)

  ctx.beginPath();
  // ctx.moveTo(0, 0)
  ctx.rect(0, 0, x, y);
  ctx.closePath();
  // ctx.clip();
  // ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI)
  // ctx.lineTo(x + l, y)
  // ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI)
  // ctx.lineTo(x + l, y + l)
  // ctx.lineTo(x, y + l)
  // ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true)
  // ctx.lineTo(x, y)
  // ctx.lineWidth = 2
  // ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  // ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  // ctx.stroke()
  ctx[operation]()
  ctx.globalCompositeOperation = 'destination-over'
}

function sum (x, y) {
  return x + y
}

function square (x) {
  return x * x
}

class jigsaw {
  constructor ({ el, width = 310, height = 155, onSuccess, onFail, onRefresh }) {
    w = width
    h = height
    el.style.position = 'relative'
    el.style.width = w + 'px'
    Object.assign(el.style, {
      position: 'relative',
      width: w + 'px',
      margin: '0 auto'
    })
    this.el = el
    this.onSuccess = onSuccess
    this.onFail = onFail
    this.onRefresh = onRefresh
  }

  init () {
    this.initDOM()
    this.initImg()
    this.bindEvents()
  }

  initDOM () {
    const canvas = createCanvas(w, h) // 画布
    const block = canvas.cloneNode(true) // 滑块
    const sliderContainer = createElement('div', 'sliderContainer')
    sliderContainer.style.width = w + 'px'
    const refreshIcon = createElement('div', 'refreshIcon')
    const sliderMask = createElement('div', 'sliderMask')
    const slider = createElement('div', 'slider')
    const sliderIcon = createElement('span', 'sliderIcon')
    const text = createElement('span', 'sliderText')

    block.className = 'block'
    text.innerHTML = '向右滑动填充拼图'

    const el = this.el
    el.appendChild(canvas)
    el.appendChild(refreshIcon)
    el.appendChild(block)
    slider.appendChild(sliderIcon)
    sliderMask.appendChild(slider)
    sliderContainer.appendChild(sliderMask)
    sliderContainer.appendChild(text)
    el.appendChild(sliderContainer)

    Object.assign(this, {
      canvas,
      block,
      sliderContainer,
      refreshIcon,
      slider,
      sliderMask,
      sliderIcon,
      text,
      canvasCtx: canvas.getContext('2d'),
      blockCtx: block.getContext('2d')
    })
  }

  initImg () {
    const img = createImg(() => {
      this.draw()
      this.blockCtx.drawImage(cutImg, 0, 0, cw, ch)
      this.canvasCtx.drawImage(img, 0, 0, w, h)
      // const y = this.y - r * 2 - 1
      const ImageData = this.blockCtx.getImageData(0,0,cw,ch)

      this.block.width = L
      this.blockCtx.putImageData(ImageData, 0, randomY) //这里改过
    })
    this.img = img
  }

  draw () {
    // 随机创建滑块的位置
    // this.x = getRandomNumberByRange(L + 10, w - (L + 10))
    // this.y = getRandomNumberByRange(10 + r * 2, h - (L + 10))
    // draw(this.canvasCtx, this.x, this.y, 'fill')
    draw(this.blockCtx, cw, ch, 'clip')
  }

  clean () {
    this.canvasCtx.clearRect(0, 0, w, h)
    this.blockCtx.clearRect(0, 0, w, h)
    this.block.width = w
  }

  bindEvents () {
    this.el.onselectstart = () => false
    this.refreshIcon.onclick = () => {
      this.reset()
      typeof this.onRefresh === 'function' && this.onRefresh()
    }

    let originX, originY, trail = [], isMouseDown = false

    const handleDragStart = function (e) {
      originX = e.clientX || e.touches[0].clientX
      originY = e.clientY || e.touches[0].clientY
      isMouseDown = true
    }

    const handleDragMove = (e) => {
      if (!isMouseDown) return false
      const eventX = e.clientX || e.touches[0].clientX
      const eventY = e.clientY || e.touches[0].clientY
      const moveX = eventX - originX
      const moveY = eventY - originY
      if (moveX < 0 || moveX + 38 >= w) return false
      this.slider.style.left = moveX + 'px'
      const blockLeft = (w - 40 - 20) / (w - 40) * moveX
      let puz = false
      if (((e.clientX || e.touches[0].clientX) -originX) >20 && ((e.clientX || e.touches[0].clientX) -originX) < 35) {
        // if (!puz){
        //   this.block.style.left = blockLeft + 100 + 'px'
        //   puz = true
        // }
      }else{
        this.block.style.left = blockLeft + 'px'
      }

      addClass(this.sliderContainer, 'sliderContainer_active')
      this.sliderMask.style.width = moveX + 'px'
      trail.push(moveY)
    }

    const handleDragEnd = (e) => {
      if (!isMouseDown) return false
      isMouseDown = false
      const eventX = e.clientX || e.changedTouches[0].clientX
      if (eventX === originX) return false
      removeClass(this.sliderContainer, 'sliderContainer_active')
      this.trail = trail
      
      var sr = function(method,path,data,_this){
        //在此之前可以判断下浏览器的版本
        var xhr=new XMLHttpRequest();
        xhr.open(method,path,true);
        console.log('test:', data)
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange=function(){
            if (xhr.readyState==4){
                if (xhr.status==200 || xhr.status==201){
                    let obj = JSON.parse(xhr.responseText)
                    console.log("收到的验证结果:", obj);
                    // const { spliced, verified } = _this.verify()
                    if (obj.Ok) {
                      if (obj.Ok) {
                        addClass(_this.sliderContainer, 'sliderContainer_success')
                        typeof _this.onSuccess === 'function' && _this.onSuccess()
                      } else {
                        addClass(_this.sliderContainer, 'sliderContainer_fail')
                        _this.text.innerHTML = '请再试一次'
                        _this.reset()
                      }
                    } else {
                      addClass(_this.sliderContainer, 'sliderContainer_fail')
                      typeof _this.onFail === 'function' && _this.onFail()
                      setTimeout(() => {
                        _this.reset()
                      }, 1000)
                    }
                }
            }
        }
      }

      // 拖动完了，发送请求
      // console.log('发送的校验信息:', verifyData)
      sr('post',API_PATH,verifyData,this)
    }
    this.slider.addEventListener('mousedown', handleDragStart)
    this.slider.addEventListener('touchstart', handleDragStart)
    this.block.addEventListener('mousedown', handleDragStart)
    this.block.addEventListener('touchstart', handleDragStart)
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('touchmove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)
  }

  verify () {
    const arr = this.trail // 拖动时y轴的移动距离
    const average = arr.reduce(sum) / arr.length
    const deviations = arr.map(x => x - average)
    const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length)
    const left = parseInt(this.block.style.left)
    return {
      spliced: Math.abs(left - this.x) < 10,
      verified: stddev !== 0, // 简单验证拖动轨迹，为零时表示Y轴上下没有波动，可能非人为操作
    }
  }

  reset () {
    this.sliderContainer.className = 'sliderContainer'
    this.slider.style.left = 0
    this.block.style.left = 0
    this.sliderMask.style.width = 0
    this.clean()
    // this.img.setSrc(getRandomImgSrc())
    this.initImg()
  }
}

window.jigsaw = {
  init: function (opts) {
    return new jigsaw(opts).init()
  }
}
