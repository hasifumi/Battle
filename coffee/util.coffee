#class roundFrame extends Group
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
#
#class MessageView extends roundFrame
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
#    
class UtilFunc
  flg:false
  getTextLength:(text)->
    len = 0
    for i in text
      if @flg
        console.log "i:"+i
      if @isZenkaku(text.charAt(_i))
        len += 2
      else
        len++
    if @flg
      console.log "original: "+text.length
      console.log "escape  : "+len
    return len
  isZenkaku:(char)->
    _char = escape(char)
    if @flg
      console.log "char(all:"+_char
      console.log "charAt(0-1):"+_char.charAt(0)+_char.charAt(1)
    if _char.charAt(0) isnt "%"
      return false
    switch _char.charAt(1)
      when "8", "9", "E", "F", "u"
        return true
      else
        return false

class UtilWindow
  DEFAULT:{
    BORDER_SIZE: 1
    CONTENT_PADDING: 2
    WIDTH: 224
    HEIGHT: 160
    FONT: "14px monospace"
    LINE_HEIGHT: 18
  }
  PROCESS_STAGE:{
    NONE: 0
    PUTTING: 1
    PAGE_WAIT: 2
    PAGE_START: 3
    PAGE_END: 4
    PAGE_EXIT: 5
    MESSAGE_EXIT: 6
    EXIT: 7
  }
  constructor:(x, y, width, height)->
    @x = x
    @y = y
    @width = if width? then width else @DEFAULT.WIDTH
    @height = if height? then height else @DEFAULT.HEIGHT
    @border_size = @DEFAULT.BORDER_SIZE
    @inner_x = 0
    @inner_y = 0
    @inner_width = 0
    @inner_height = 0
    @content_padding = @DEFAULT.CONTENT_PADDING
    @content_x = 0
    @content_y = 0
    @content_width = 0
    @content_height = 0
    @page_line = 0
    @fong = @DEFAULT.FONT
    @line_height = @DEFAULT.LINE_HEIGHT
    @pageList = []
    @process_stage = 0
    @process_count = 0
    @page_index = 0
    @putting_line = 0
    @putting_pos = 0
    @visible = false
    @func = new UtilFunc()
    getX:->
      return @x
    getY:->
      return @y
    getWidth:->
      return @width
    getHeight:->
      return @height
    setSize:(width, height)->
      if width < (@border_size * 2)+(@content_padding * 2) \
      or height < (@border_size * 2) +(@content_padding * 2)
        return false
      @width = width
      @height = height
      @inner_width = @width - (@border_size * 2)
      @inner_height = @height - (@border_size * 2)
      @content_width = @inner_width - (@content_padding * 2)
      @content_height = @inner_height - (@content_padding * 2)
      @page_lines = Math.floor(@content_height / @line_height)
    setPos:(x, y)->
      @x = x
      @y = y
      @inner_x = x + @border_size
      @inner_y = y + @border_size
      @content_x = @inner_x + @content_padding
      @content_y = @inner_y + @content_padding
    show:->
      @visible = true
    hide:->
      @visible = false
    setText:(text, context)=>
      @pageList = []
      line = ''
      lineList = []
      pos = 0
      
      context.font = @font
      while pos < text.length
        page_flag = false
        while pos < text.length and \
        context.measureText(line+text.charAt(pos)).width < @content_width
          if text.indexOf('<:br>', pos) is pos
            pos += 5
            break
          if text.indexOf('<:page>', pos) is pos
            pos += 7
            page_flag = true
            break
          line = line + text.charAt(pos)
          pos++
        lineList.push line
        if page_flag
          lineList.push('\f')
        line = ''

      page_pos = 0
      line_pos = 0
      while line_pos < lineList.length
        @pageList[page_pos] = []
        for i in @page_lines
          if line_pos < lineList.length
            break
          if lineList[line_pos].charAt(0) is "\f"
            line_pos++
            if _i > 0
              break
          else
            @pageList[page_pos].push lineList[line_pos++]
        page_pos++
      @process_stage = @PROCESS_STAGE.PUTTING
      @page_index = 0
      @putting_line = 0
      @putting_pos = 0
          
    #process:(key)=>
    update:(key)=>
      switch @process_stage
        when @PROCES_STAGE.PAGE_START
          if key.getTrigger() is 0
            @putting_line = 0
            @putting_pos = 0
            @process_stage = @PROCESS_STAGE.PUTTING
        when @PROCESS_STAGE.PAGE_END
          if key.getTrigger() is 0
            if @page_index < @pageList.length - 1
              @process_stage = @PROCESS_STAGE.PAGE_EXIT
            else
              @process_stage = @PROCESS_STAGE.MESSAGE_EXIT
        when @PROCESS_STAGE.PAGE_EXIT
          if key.getTrigger() isnt 0
            @page_index++
            @process_stage = @PROCESS_STAGE.PAGE_START
        when @PROCESS_STAGE.MESSAGE_EXIT
          if key.getTrigger() isnt 0
            @process_stage = @PROCESS_STAGE.EXIT
        when @PROCESS_STAGE.PUTTING
          @putting_pos++
          if @putting_pos >= @pageList[@page_index][@putting_line].length
              if @putting_line is @pageList[@page_index].length - 1
                @process_stage = @PROCESS_STAGE.PAGE_END
              else
                @putting_line++
                @putting_pos = 0
           if @process_stage is @PROCESS_STAGE.PUTTING and key.getTrigger() isnt 0
             @process_stage = @PROCESS_STAGE.PAGE_END
      @process_count += 1
      @process_stage = @PROCESS_STAGE.EXIT
    draw:(context)=>
      if @visible is false
        return
      context.fillStyle = '#ffffff'
      context.fillRect(@x, @y, @width, @height)
      context.fillStyle = '#000000'
      context.fillRect(@inner_x, @inner_y, @inner_width, @inner_height)
      context.fillStyle = '#ffffff'
      context.textBaseline = 'top'
      context.font = @font
      switch @process_stage
        when @PROCESS_STAGE.PUTTING
          for i in @putting_line
            context.fillText(@pageList[@page_index][_i], \
            @content_x, @content_y + _i * @line_height)
          context.fillText( \
          @pageList[@page_index][@putting_line].substring(0, @putting_pos), \
          @content_x, @content_y + _i * @line_height)
        when @PROCESS_STAGE.PAGE_END, \
        @PROCESS_STAGE.PAGE_EXIT, \
        @PROCESS_STAGE.MESSAGE_EXIT
          for i in @pageList[@page_index]
            context.fillText(@pageList[@pageList][_i], \
            @content_x, @content_y + _i * @line_height)
      context_center_x = @content_x + (@content_width / 2)
      #if @process_stage is @PROCESS_STAGE.PAGE_EXIT and (@process_count  % 10 ) < 5
      if @process_stage is @PROCESS_STAGE.PAGE_EXIT and \
      (@process_count  % 10 ) < 5
        context.beginPath()
        context.moveTo(context_center_x - 6, @content_y + @content_height - 12)
        context.lineTo(context_center_x + 6, @content_y + @content_height - 12)
        context.lineTo(context_center_x , @content_y + @content_height)
        context.closePath()
        context.fillStyle = '#ffffff'
        context.fill()
      @setSize(@DEFAULT.WIDTH, @DEFAULT.HEIGHT)
      @setPos(0, 0)






      
        








