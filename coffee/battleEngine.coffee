class BattleEngine
  constructor:(msgWin, selectDialog)-># {{{
    @state = ""
    @members = []
    @party = []
    @enemy = []
    @targets = []
    @index = 0
    @command = ""
    @commands = []
    @currentCommands = 0
    @turn = 0
    @target = 1
    @game = enchant.Game.instance
    #@lines = []
    #@clearLines()
    @msgWin = msgWin
    @selectDialog = selectDialog# }}}
  update:=># {{{
    switch @state
      when "beforeTurn"
        @beforeTurn()
      when "waitCommand"
        return
      when "selectTarget"
        @selectTarget()
      when "doCommand"
        @doCommand()
      when "waitEffectAnime"
        return
      when "afterAnime"
        @afterAnime()
      when "gameClear"
        @gameClear()
      when "gameOver"
        @gameOver()
      else
        #console.log "else"# }}}
  addMember:(member)=># {{{
    @members.push member
    switch member.side
      when "party"
        @party.push member
      when "enemy"
        @enemy.push member# }}}
  changeState:(state)=># {{{
    @state = state# }}}
  prepare:=># {{{
    @msgWin.setLines(["敵が現れた！<:br>"])
    @changeState("beforeTurn")# }}}
  beforeTurn:=># {{{
    @msgWin.setLines([@members[@turn].name+"のターン。"])
    @msgWin.drawText()
    @changeState("waitCommand")# }}}
  nextTurn:=># {{{
    if @turn >= @members.length - 1
      @turn = 0
      #@nextTarget()
      @currentCommands = 0
      @changeState("doCommand")
    else
      @turn++
      #@msgWin.clearText()
      @msgWin.clearLines()
      @msgWin.drawText()
      @changeState("beforeTurn")
      #@nextTarget()# }}}
  nextTarget:=># {{{
    if @target >= @members.length - 1
      @target = 0
    else
      @target++# }}}
  addCommand:(command)=># {{{
    @command = command
    @targets = []
    switch @command
      when "attack"
        if @members[@turn].side is "party"
          for i in @enemy
            @targets.push i.name
        else
          for i in @party
            @targets.push i.name
        @selectDialog.lines = @targets
        @selectDialog.reSize()
        @selectDialog.index = @index
        @selectDialog.resetSize(@selectDialog.width, @selectDialog.height)
        @selectDialog.drawText()
        @selectDialog.setVisible(true)# }}}
  selectTarget:=># {{{
    index = @selectDialog.getIndex()
    for i, idx in @members
      if i.name is @targets[index]
        @target = idx
        break
    @selectDialog.setIndex(@index)
    @selectDialog.setVisible(false)
    @commands.push({command:@command, turn:@turn, target:@target})
    console.log "addCommand command:#{@command}, turn:#{@turn}, target:#{@target}"
    @nextTurn()# }}}
  clearCommand:=># {{{
    @commands = []# }}}
  commandAttack:(turn, target)=># {{{
    damage = 10
    turn_name = @members[turn].name
    target_name = @members[target].name
    @members[target].damage(damage)
    @msgWin.addText "#{turn_name} が #{target_name} を攻撃！"
    @msgWin.addText "#{target_name} は #{damage} のダメージ！"
    @msgWin.addText "#{target_name} のＨＰは #{@members[target].hp}／#{@members[target].maxHp}"
    @msgWin.drawText()
    #console.log "#{turn_name} attack #{target_name}!"
    #console.log "#{target_name} damaged #{damage}!"
    #console.log "#{target_name}'s hp:#{@members[target].hp}, maxHp:#{@members[target].maxHp}!"# }}}
  doCommand:=># {{{
    @msgWin.clearLines()
    console.log "@commands[#{@currentCommands}]:"+@commands[@currentCommands]
    switch @commands[@currentCommands].command
      when "attack"
        turn = @commands[@currentCommands].turn
        target = @commands[@currentCommands].target
        @changeState("waitEffectAnime")
        @commandAttack(turn, target)
    #for i in @commands# {{{
    #  switch i.command
    #    when "attack"
    #      @commandAttack(i.turn, i.target)
    #    else
    #      return
    #@msgWin.drawText()
    #@clearCommand()
    #if @game.player.hp <= 0
    #  @msgWin.addText "Game Over!"
    #  console.log "Game Over!"
    #  @game.stop()
    #if @game.enemy.hp <= 0
    #  @msgWin.addText "Game Clear!!"
    #  console.log "Game Clear!"
    #  @game.stop()
    #@changeState("beforeTurn")# }}}
    # }}}
  afterAnime:=># {{{
    if @currentCommands >= @commands.length - 1
      @msgWin.clearLines()
      #@beforeTurn()
      @currentCommands = 0
      @clearCommand()
      if @game.player.hp <= 0
        @changeState("gameOver")
      else
        if @game.enemy.hp <= 0
          @changeState("gameClear")
        else
          @changeState("beforeTurn")
    else
      @currentCommands++
      @changeState("doCommand")# }}}
  gameClear:=># {{{
    console.log "Game Clear!"
    @msgWin.clearLines()
    @msgWin.addText("Game Clear!")
    @msgWin.drawText()
    @game.stop()# }}}
  gameOver:=># {{{
    console.log "Game Over!!"
    @msgWin.clearLines()
    @msgWin.addText("Game Over!!")
    @msgWin.drawText()
    @game.stop()# }}}

  #addLine:(line)=># {{{
  #  @lines.push line# }}}
  #getLines:()=># {{{
  #  return @lines# }}}
  #clearLines:()=># {{{
  #  @lines = []# }}}
    
