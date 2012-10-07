class BattleEngine
  constructor:(msgWin, selectDialog)->
    @state = "waitCommand"
    @members = []
    @party = []
    @enemy = []
    @commands = []
    @turn = 0
    @target = 1
    @game = enchant.Game.instance
    @lines = []
    @clearLines()
    @msgWin = msgWin
    @selectDialog = selectDialog
  update:=>
    switch @state
      when "waitCommand"
        return
      when "doCommand"
        @doCommand()
      else
        console.log "else"
  addMember:(member, side)=>
    @members.push member
    switch side
      when "party"
        @party.push member
      when "enemy"
        @enemy.push member
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
    @msgWin.addText "#{turn_name} が #{target_name} を攻撃！"
    @msgWin.addText "#{target_name} は #{damage} のダメージ！"
    @msgWin.addText "#{target_name} のＨＰは #{@members[target].hp}／#{@members[target].maxHp}"
    #console.log "#{turn_name} attack #{target_name}!"
    #console.log "#{target_name} damaged #{damage}!"
    #console.log "#{target_name}'s hp:#{@members[target].hp}, maxHp:#{@members[target].maxHp}!"
  doCommand:=>
    @msgWin.clearLines()
    for i in @commands
      switch i.command
        when "attack"
          @commandAttack(i.turn, i.target)
        else
          return
    @msgWin.drawText()
    @clearCommand()
    @changeState("waitCommand")
    if @game.player.hp <= 0
      @msgWin.addText "Game Over!"
      #console.log "Game Over!"
      @game.stop()
    if @game.enemy.hp <= 0
      @msgWin.addText "Game Clear!!"
      #console.log "Game Clear!!"
      @game.stop()
  addLine:(line)=>
    @lines.push line
  getLines:()=>
    return @lines
  clearLines:()=>
    @lines = []
    
