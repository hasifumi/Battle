#class roundFrame extends Group# {{{
#  # w:width, h:height, lw:lineWidth(like)
#  constructor:(w, h, lw)->
#    super()
#    sur1 = new Surface(w, h)
#    ctx = sur1.context
#    ctx.fillStyle = "white"
#    ctx.rect(0, 0, w, h)
#    ctx.fill()
#    sp1 = new Sprite(w, h)
#    sp1.image = sur1
#    sp1.opacity = 0.4
#    @addChild sp1
#    sur2 = new Surface(w - lw*2, h - lw*2)
#    ctx = sur2.context
#    ctx.fillStyle = "#ff8c00"
#    ctx.rect(0, 0, w - lw*2, h - lw*2)
#    ctx.fill()
#    sp2 = new Sprite(w - lw*2, h - lw*2)
#    sp2.image = sur2
#    sp2.opacity = 0.4
#    sp2.x = lw
#    sp2.y = lw
#    @addChild sp2
## }}}
#class MessageView extends roundFrame# {{{
#  constructor:(w, h, lw)->
#    if w? then @w = w else @w = 310
#    if h? then @h = h else @h = 30
#    if lw? then @lw = lw else @lw = 2
#    super(@w, @h, @lw)
#    lbl = new Label("")
#    lbl.font = "12px sans-serif"
#    lbl.color = "white"
#    lbl.x = 5
#    lbl.width = 310 - 5*2
#    lbl.height = 24
#    @addChild lbl
#    @setText = (text)->
#      lbl.text = text
#  setText:(text)->
#    @setText text
#    # }}}
class UtilFunc# {{{
  flg:true
  getTextLength:(text)-># {{{
    len = 0
    for i in text
      if @flg
        #console.log "i:"+i
        aa = "aa"
      if @isZenkaku(text.charAt(_i))
        len += 2
      else
        len++
    if @flg
      aa = "aa"
      #console.log "original: "+text.length
      #console.log "escape  : "+len
    return len# }}}
  isZenkaku:(char)-># {{{
    _char = escape(char)
    if @flg
      aa = "aa"
      #console.log "char(all:"+_char
      #console.log "charAt(0-1):"+_char.charAt(0)+_char.charAt(1)
    if _char.charAt(0) isnt "%"
      return false
    switch _char.charAt(1)
      when "8", "9", "E", "F", "u"
        return true
      else
        return false# }}}
  roundRect:(ctx, method, x, y, w, h, rad)-># {{{
    if !ctx? then return
    if !method? then return
    ctx.beginPath()
    ctx.moveTo(x + rad, y + 0)
    ctx.lineTo(x + w - rad, y + 0)
    ctx.arc(x + w - rad, y + 0 + rad, rad, Math.PI*1.5, 0, false)
    ctx.lineTo(x + w, y + h - rad)
    ctx.arc(x + w - rad, y + h - rad, rad, 0, Math.PI*0.5, false)
    ctx.lineTo(x + rad, y + h)
    ctx.arc(x + rad, y + h - rad, rad, Math.PI*0.5, Math.PI, false)
    ctx.lineTo(x + 0, y + rad)
    ctx.arc(x + rad, y + rad, rad, Math.PI, Math.PI*1.5, false)
    ctx.closePath()
    switch method
      when "fill"
        ctx.fill()
      when "stroke"
        ctx.stroke()# }}}
# }}}
        
class UtilWindow extends Sprite
  DEFAULT:{# {{{
    BACKGROUND_COLOR:'black'
    LINE_COLOR:'orange'
    LINE_WIDTH:2
    BORDER:2
    FONT_COLOR:'white'
    FONT:'14px HG丸ｺﾞｼｯｸM-PRO'
    PADDING:3
    RADIUS:8
    LINE_HEIGHT:16
    OPACITY:1.0
    PAGE_MARKER_HEIGHT:10
    PAGE_MARKER_WIDTH:20
  }# }}}
  STATE:{# {{{
    NONE: 0
    PUTTING: 1
    PAGE_WAIT: 2
    PAGE_START: 3
    PAGE_END: 4
    PAGE_EXIT: 5
    MESSAGE_EXIT: 6
    EXIT: 7
  }# }}}
  constructor:(w, h)-># {{{
    super(w, h)
    @resetSize(w, h)
    @state = @STATE.NONE
    @func = new UtilFunc()
    @line_count = 0
    @current_line = 0
    @lines = []
    @skip_count = 0
    @br_flag = 0
    @clearText()
    #@addEventListener 'touchend', =>
    #  @onClick()# }}}
  resetSize:(w, h)=># {{{
    @width = w
    @height = h
    @sur = new Surface(w, h)
    @ctx = @sur.context
    @image = @sur
    @opacity = @DEFAULT.OPACITY
    @content_width = @width - @DEFAULT.BORDER*2 - @DEFAULT.PADDING*2
    @content_height = @height - @DEFAULT.BORDER*2 - @DEFAULT.PADDING*2 - @DEFAULT.PAGE_MARKER_HEIGHT
    @content_lines = Math.floor(@content_height/@DEFAULT.LINE_HEIGHT)# }}}
  clearText:-># {{{
    @ctx.fillStyle = @DEFAULT.BACKGROUND_COLOR
    #@ctx.fillRect(0, 0, @width, @height)
    @func.roundRect(@ctx, "fill", 0, 0, @width, @height, @DEFAULT.RADIUS)
    @ctx.strokeStyle = @DEFAULT.LINE_COLOR
    @ctx.lineWidth = @DEFAULT.LINE_WIDTH
    #@ctx.strokeRect(@DEFAULT.BORDER, @DEFAULT.BORDER, \
    #@width - @DEFAULT.BORDER*2, @height - @DEFAULT.BORDER*2)
    @func.roundRect(@ctx, "stroke", @DEFAULT.BORDER, @DEFAULT.BORDER, \
    @width - @DEFAULT.BORDER*2, @height - @DEFAULT.BORDER*2, @DEFAULT.RADIUS)# }}}
  addText:(text)-># {{{
    chars = ""
    line = ""
    zenkaku_flag = false
    @ctx.font = @DEFAULT.FONT
    for i,idx in text
      if zenkaku_flag
        zenkaku_flag = false
        break
      if @func.isZenkaku(i)
        chars = text[idx]
        zenkaku_flag = true
      else
        chars = i
        zenkaku_flag = false
      if @skip_count isnt 0
        @skip_count--
      else
        if i is "<"
          if text[idx..idx+4] is "<:br>"
            @skip_count = 4
            @br_flag += 1
          if text[idx..idx+6] is "<:page>"
            @skip_count = 6
            @br_flag += @content_lines - (@line_count % @content_lines)
        else
          if @br_flag isnt 0
            cnt = @br_flag
            for j in [0...cnt]
              @lines[@line_count] = line
              @line_count++
              @br_flag--
              line = ""
          line = line+chars
          if @ctx.measureText(line+chars).width > @content_width
            @br_flag += 1
        zenkaku_flag = false
    if line isnt ""
      @lines[@line_count] = line
      @line_count++# }}}
  setLines:(lines)=># {{{
    if !lines?
      return
    for l in lines
      @addText(l)# }}}
  clearLines:()=># {{{
    @line_count = 0
    @current_line = 0
    @lines = []
    @skip_count = 0
    @br_flag = 0# }}}
  drawText:-># {{{
    @clearText()
    @ctx.fillStyle = @DEFAULT.FONT_COLOR
    @ctx.font = @DEFAULT.FONT
    x = @DEFAULT.BORDER+@DEFAULT.PADDING
    y = @DEFAULT.BORDER+@DEFAULT.PADDING+@DEFAULT.LINE_HEIGHT
    for i, idx in @lines[@current_line..(@current_line+@content_lines - 1)]
      @ctx.font = @DEFAULT.FONT
      @ctx.fillText(i, x, y+idx*@DEFAULT.LINE_HEIGHT)
    if @current_line + @content_lines + 1 <= @lines.length
      @current_line += @content_lines
      @drawMarker()
      @state = @STATE.PAGE_END
    else
      @current_line = 0
      @state = @STATE.MESSAGE_EXIT# }}}
  drawMarker:-># {{{
    x1 = Math.floor(@width/2) - @DEFAULT.PAGE_MARKER_WIDTH/2
    x2 = Math.floor(@width/2) + @DEFAULT.PAGE_MARKER_WIDTH/2
    x3 = Math.floor(@width/2)
    y1 = @height - @DEFAULT.BORDER - @DEFAULT.PADDING - (@DEFAULT.PAGE_MARKER_HEIGHT - 2)
    y2 = @height - @DEFAULT.BORDER - @DEFAULT.PADDING - 2
    @ctx.fillStyle = @DEFAULT.FONT_COLOR
    @ctx.beginPath()
    @ctx.moveTo(x1, y1)
    @ctx.lineTo(x2, y1)
    @ctx.lineTo(x3, y2)
    @ctx.closePath()
    @ctx.fill()# }}}
  update:-># {{{
    return# }}}
  onClick:-># {{{
    if @state is @STATE.PAGE_END
      @drawText()# }}}
  setVisible:(value)=># {{{
    @.visible = value# }}}

class SelectDialog extends UtilWindow
  DEFAULT1:{# {{{
    OPACITY:1.0
    SELECTED_COLOR:'yellow'
    SEL_MARKER_WIDTH:10
    SEL_MARKER_HEIGHT:16
  }# }}}
  constructor:(lines, index)-># {{{
    super(10, 10)
    if lines?
      @lines = lines
    else
      @lines = []
    wk_sur = new Surface(10, 10)
    @wk_ctx = wk_sur.context
    #@content_width = @max(@lines) + @DEFAULT.PADDING
    #@content_height = @lines.length * @DEFAULT.LINE_HEIGHT
    #@width = @content_width + @DEFAULT.BORDER*2 + @DEFAULT.PADDING*2 + @DEFAULT1.SEL_MARKER_WIDTH
    #@height = @content_height + @DEFAULT.BORDER*2 + @DEFAULT.PADDING*2
    @reSize()
    @resetSize(@width, @height)
    if index?
      @index = index
    else
      @index = 0
    @setLines(@lines)
    @drawText()
    @addEventListener 'touchend', (e)=>
      @setIndex(@detectIndex(e))# }}}
  reSize:()=># {{{
    @content_width = @max(@lines) + @DEFAULT.PADDING
    @content_height = @lines.length * @DEFAULT.LINE_HEIGHT
    @width = @content_width + @DEFAULT.BORDER*2 + @DEFAULT.PADDING*2 + @DEFAULT1.SEL_MARKER_WIDTH
    @height = @content_height + @DEFAULT.BORDER*2 + @DEFAULT.PADDING*2# }}}
  max:(lines)=># {{{
    max = 0
    for i in lines
      @wk_ctx.font = @DEFAULT.FONT
      len = @wk_ctx.measureText(i).width
      if len > max
        max = len
    return max# }}}
  detectIndex:(e)=># {{{
    x = e.x - @x
    y = e.y - @y
    #console.log "e.y:"+Math.floor(e.y)+", y:"+Math.floor(y)+", y/@DEFAULT.LINE_HEIGHT:"+Math.floor(y/@DEFAULT.LINE_HEIGHT)
    if x  < (@DEFAULT.BORDER + @DEFAULT.PADDING) or  x > @width
      return @index
    if y  < (@DEFAULT.BORDER + @DEFAULT.PADDING) or  y > @height
      return @index
    index = Math.floor((y - @DEFAULT.BORDER - @DEFAULT.PADDING)/@DEFAULT.LINE_HEIGHT)
    if 0 <= index < (@lines.length)
      return index
    else
      return @index# }}}
  drawText:=># {{{
    @clearText()
    @ctx.fillStyle = @DEFAULT.FONT_COLOR
    @ctx.font = @DEFAULT.FONT
    x = @DEFAULT.BORDER+@DEFAULT.PADDING
    y = @DEFAULT.BORDER+@DEFAULT.PADDING
    for i, idx in @lines
      @ctx.font = @DEFAULT.FONT
      if idx is @index
        @ctx.fillStyle = @DEFAULT1.SELECTED_COLOR
        @drawMarker(x, y+idx*@DEFAULT.LINE_HEIGHT)
      else
        @ctx.fillStyle = @DEFAULT.FONT_COLOR
      @ctx.fillText(i, x+@DEFAULT1.SEL_MARKER_WIDTH, y+(idx+1)*@DEFAULT.LINE_HEIGHT - 2)
    @state = @STATE.PAGE_WAIT# }}}
  drawMarker:(x, y)=># {{{
    x1 = x + 2
    x2 = x + (@DEFAULT1.SEL_MARKER_WIDTH - 2*2)
    y1 = y + 2
    y2 = y + Math.floor(@DEFAULT1.SEL_MARKER_HEIGHT/2)
    y3 = y + @DEFAULT1.SEL_MARKER_HEIGHT - 2
    @ctx.fillStyle = @DEFAULT1.SELECTED_COLOR
    @ctx.beginPath()
    @ctx.moveTo(x1, y1)
    @ctx.lineTo(x2, y2)
    @ctx.lineTo(x1, y3)
    @ctx.closePath()
    @ctx.fill()# }}}
  getIndex:=># {{{
    return @index# }}}
  setIndex:(idx)=># {{{
    if @index isnt idx
      @index = idx
      @drawText()
      @state = @STATE.MESSAGE_EXIT# }}}
      
