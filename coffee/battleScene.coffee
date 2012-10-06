class BattleScene extends Scene
  constructor:->
    super()
    #@backgroundColor = "black"
    @game = enchant.Game.instance

    uw1 = new UtilWindow(230, 80)
    uw1.x = 50
    uw1.y = 100
    @addChild uw1
    #lines = ["aaa", "bbb", "ccc"]
    #uw1.setLines(lines)
    #uw1.drawText()

    lines = ["ああああ", "いい", "ううう", "ええええええええ"]
    sd1 = new SelectDialog(lines, 0)
    sd1.x = 50
    sd1.y = 100
    @addChild sd1

    @bEngine = new BattleEngine(uw1)
    @bEngine.addMember(@game.player)
    @bEngine.addMember(@game.enemy)
    lblAttack =  new Label("Attack")
    lblAttack.color = "orange"
    lblAttack.x = 50
    lblAttack.y = 50
    lblAttack.addEventListener 'touchend', =>
      console.log "lblAttack touched"
      @bEngine.addCommand("attack")
      @bEngine.nextTurn()
    @addEventListener 'enterframe', ->
      @bEngine.update()
    @addChild lblAttack

    lblChange = new Label("Change")
    lblChange.x = 50
    lblChange.y = 60
    lblChange.addEventListener 'touchend', =>
      if sd1.lines.length is 2
        lines = ["ああああ", "いい", "ううう", "ええええええええ"]
      else
        lines = ["aaa", "bbbbbb"]
      sd1.lines = lines
      sd1.reSize()
      sd1.index = 0
      sd1.resetSize(sd1.width, sd1.height)
      sd1.drawText()
    @addChild lblChange

    lblVisible = new Label("Visible")
    lblVisible.x = 50
    lblVisible.y = 70
    lblVisible.addEventListener 'touchend', =>
      #sd1.visible = true
      sd1.setVisible(true)
    @addChild lblVisible

    lblInvisible = new Label("Invisible")
    lblInvisible.x = 50
    lblInvisible.y = 80
    lblInvisible.addEventListener 'touchend', =>
      #sd1.visible = false
      sd1.setVisible(false)
    @addChild lblInvisible

