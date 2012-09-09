class BattleScene extends Scene
  constructor:->
    super()
    @backgroundColor = "black"
    @game = enchant.Game.instance
    @bEngine = new BattleEngine()
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
