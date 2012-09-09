class BattleEngine
  constructor:->
    @state = "waitCommand"
    @members = []
    @commands = []
    @turn = 0
    @target = 1
  update:->
    switch @state
      when "waitCommand"
        console.log "wait all command"
      when "doCommand"
        console.log "do all command"
        @doCommand()
      else
        console.log "else"
  addMember:(member)->
    @members.push member
  changeState:(state)->
    @state = state
  nextTurn:->
    if @turn >= @members.length
      @turn = 0
      @nextTarget()
      @changeState("doCommand")
    else
      @turn++
      @nextTarget()
  nextTarget:->
    if @target >= @members.length
      @target = 0
    else
      @target++
  addCommand:(command)->
    @commands.push {command:command, turn:@turn, target:@target}
    @nextTurn()
  clearCommand:->
    @commands = []
  commandAttack:(turn, target)->
    damege = 10
    console.log "#{turn} attack #{target}!"
    console.log "#{target} damaged #{damege}!"
    @member.target.damege(damege)
  doCommand:->
    for i in @commands
      switch i.command
        when "attack"
          @commandAttack(i.turn, i.target)
        else
          a = 10
    @clearCommand()
    if @game.player.hp <= 0
      console.log "Game Over!"
      @game.stop()
    if @game.enemy.hp <= 0
      console.log "Game Clear!!"
      @game.stop()
    
