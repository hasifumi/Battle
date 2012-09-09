class roundFrame extends Group
  # w:width, h:height, lw:lineWidth(like)
  constructor:(w, h, lw)->
    super()
    sur1 = new Surface(w, h)
    ctx = sur1.context
    ctx.fillStyle = "white"
    ctx.rect(0, 0, w, h)
    ctx.fill()
    sp1 = new Sprite(w, h)
    sp1.image = sur1
    sp1.opacity = 0.4
    @addChild sp1
    sur2 = new Surface(w - lw*2, h - lw*2)
    ctx = sur2.context
    ctx.fillStyle = "#ff8c00"
    ctx.rect(0, 0, w - lw*2, h - lw*2)
    ctx.fill()
    sp2 = new Sprite(w - lw*2, h - lw*2)
    sp2.image = sur2
    sp2.opacity = 0.4
    sp2.x = lw
    sp2.y = lw
    @addChild sp2

class MessageView extends roundFrame
  constructor:(w, h, lw)->
    if w? then @w = w else @w = 310
    if h? then @h = h else @h = 30
    if lw? then @lw = lw else @lw = 2
    super(@w, @h, @lw)
    lbl = new Label("")
    lbl.font = "12px sans-serif"
    lbl.color = "white"
    lbl.x = 5
    lbl.width = 310 - 5*2
    lbl.height = 24
    @addChild lbl
    @setText = (text)->
      lbl.text = text
  setText:(text)->
    @setText text
    
