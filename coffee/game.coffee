enchant()
class BattleTest extends Game
  config:{
    WIDTH: 320,
    HEIGHT: 320,
    FPS: 30,
  }
  constructor:->
    super(@config.WIDTH, @config.HEIGHT)
    @fps = @config.FPS
    @onload = ->
      @player = new Charactor({name:"プレイヤー１", maxHp:100})
      console.log "#{@player.name} create"
      @enemy = new Charactor({name:"敵１", maxHp:50})
      console.log "#{@enemy.name} create"
      @scenes = {}
      @scenes.battle = new BattleScene()

      @replaceScene @scenes.battle
      return
    @start()

window.onload = ->
  new BattleTest

