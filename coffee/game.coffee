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
      @scenes = {}
      @scenes.battle = new BattleScene()
      @player = new Charactor({name:"player1", maxHp:100})
      console.log "#{@player.name} create"
      @enemy = new Charactor({name:"enemy1", maxHp:50})
      console.log "#{@enemy.name} create"

      @replaceScene @scenes.battle
      return
    @start()

window.onload = ->
  new BattleTest

