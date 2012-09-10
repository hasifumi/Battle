class BattleEngine
  constructor:->
    @state = "waitCommand"
    @members = []
    @commands = []
    @turn = 0
    @target = 1
    @game = enchant.Game.instance
  update:=>
    switch @state
      when "waitCommand"
        #console.log "wait all command"
        return
      when "doCommand"
        #console.log "do all command"
        @doCommand()
      else
        console.log "else"
  addMember:(member)=>
    @members.push member
  changeState:(state)=>
    @state = state
  nextTurn:=>
    if @turn >= @members.length - 1
      @turn = 0
      @nextTarget()
      @changeState("doCommand")
    else
      @turn++
      @nextTarget()
  nextTarget:=>
    if @target >= @members.length - 1
      @target = 0
    else
      @target++
  addCommand:(command)=>
    @commands.push({command:command, turn:@turn, target:@target})
    console.log "addCommand command:#{command}, turn:#{@turn}, target:#{@target}"
    #@nextTurn()
  clearCommand:=>
    @commands = []
  commandAttack:(turn, target)=>
    damage = 10
    turn_name = @members[turn].name
    target_name = @members[target].name
    @members[target].damage(damage)
    console.log "#{turn_name} attack #{target_name}!"
    console.log "#{target_name} damaged #{damage}!"
    console.log "#{target_name}'s hp:#{@members[target].hp}, maxHp:#{@members[target].maxHp}!"
  doCommand:=>
    for i in @commands
      switch i.command
        when "attack"
          @commandAttack(i.turn, i.target)
        else
          return
    @clearCommand()
    @changeState("waitCommand")
    if @game.player.hp <= 0
      console.log "Game Over!"
      @game.stop()
    if @game.enemy.hp <= 0
      console.log "Game Clear!!"
      @game.stop()
    
