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

    lines = ["aaaa", "bb", "ccc"]
    sd1 = new SelectDialog(lines, 1)
    sd1.x = 50
    sd1.y = 200
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

