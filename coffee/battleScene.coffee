class BattleScene extends Scene
  constructor:->
    super()
    @game = enchant.Game.instance

    uw1 = new UtilWindow(310, 80)
    uw1.x = 5
    uw1.y = 10
    @addChild uw1

    lines = [" ", " ", " ", " "]
    sd1 = new SelectDialog(lines, 0)
    sd1.x = @game.width/2 - @width/2
    sd1.y = @game.height/2 - @height/2
    @addChild sd1
    sd1.setVisible(false)

    @bEngine = new BattleEngine(uw1, sd1)
    @bEngine.addMember(@game.player, "party")
    @bEngine.addMember(@game.enemy, "enemy")
    @bEngine.addMember(@game.enemy2, "enemy")
    uw1.setLines(["敵が現れた！"])
    @addEventListener 'enterframe', ->
      @bEngine.update()
    
    atkBtn = new commandButton(60, 50, "attack", @bEngine)# {{{
    atkBtn.x = 0
    atkBtn.y = 220
    @addChild atkBtn# }}}
    mgcBtn = new commandButton(60, 50, "magic", @bEngine)# {{{
    mgcBtn.x = 60
    mgcBtn.y = 220
    @addChild mgcBtn# }}}
    itmBtn = new commandButton(60, 50, "item", @bEngine)# {{{
    itmBtn.x = 120
    itmBtn.y = 220
    @addChild itmBtn# }}}
    defBtn = new commandButton(60, 50, "defense", @bEngine)# {{{
    defBtn.x = 0
    defBtn.y = 270
    @addChild defBtn# }}}
    runBtn = new commandButton(60, 50, "run", @bEngine)# {{{
    runBtn.x = 60
    runBtn.y = 270
    @addChild runBtn# }}}
    dmyBtn = new commandButton(60, 50, "dummy", @bEngine)# {{{
    dmyBtn.x = 120
    dmyBtn.y = 270
    @addChild dmyBtn# }}}

#    lblAttack =  new Label("Attack")# {{{
#    lblAttack.color = "orange"
#    lblAttack.x = 50
#    lblAttack.y = 50
#    lblAttack.addEventListener 'touchend', =>
#      console.log "lblAttack touched"
#      @bEngine.addCommand("attack")
#      @bEngine.nextTurn()
#    @addChild lblAttack
#
#    lblChange = new Label("Change")
#    lblChange.x = 50
#    lblChange.y = 60
#    lblChange.addEventListener 'touchend', =>
#      if sd1.lines.length is 2
#        lines = ["ああああ", "いい", "ううう", "ええええええええ"]
#      else
#        lines = ["aaa", "bbbbbb"]
#      sd1.lines = lines
#      sd1.reSize()
#      sd1.index = 0
#      sd1.resetSize(sd1.width, sd1.height)
#      sd1.drawText()
#    @addChild lblChange
#
#    lblVisible = new Label("Visible")
#    lblVisible.x = 50
#    lblVisible.y = 70
#    lblVisible.addEventListener 'touchend', =>
#      #sd1.visible = true
#      sd1.setVisible(true)
#    @addChild lblVisible
#
#    lblInvisible = new Label("Invisible")
#    lblInvisible.x = 50
#    lblInvisible.y = 80
#    lblInvisible.addEventListener 'touchend', =>
#      #sd1.visible = false
#      sd1.setVisible(false)
#    @addChild lblInvisible# }}}

class commandButton extends Group
  constructor:(w, h, command, battleEngine)->
    super()
    func = new UtilFunc()
    sp = new Sprite(w, h)
    sur = new Surface(w, h)
    ctx = sur.context
    ctx.fillStyle = "black"
    func.roundRect(ctx, "fill", 0, 0, w, h, 3)
    ctx.strokeStyle = "orange"
    ctx.lineWidth = 2
    func.roundRect(ctx, "stroke", 2, 2, (w - 2*2), (h - 2*2), 3)
    sp.image = sur
    @addChild sp
    lbl = new Label(command)
    wk_sur = new Surface(w, h)
    wk_ctx = wk_sur.context
    wk_ctx.font = '14px fantasy'
    len = wk_ctx.measureText(command).width
    lbl.x = w/2 - len/2
    lbl.y = h/2 - 7
    console.log "len:"+len+", x:"+lbl.x
    lbl.color = "orange"
    lbl.font = '14px fantasy'
    lbl.addEventListener "touchend", =>
      console.log command+" touched"
      battleEngine.addCommand(command)
    @addChild lbl
      

