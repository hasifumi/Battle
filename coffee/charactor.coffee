class Charactor
  constructor:(param)->
    @name = param.name
    @maxHp = param.maxHp
    @side = param.side
    @hp = @maxHp
    @isDead = false
  damage:(value)->
    hp = @hp
    hp -= value
    if hp < 0
      @hp = 0
      @isDead = true
    else
      @hp = hp
  recovery:(value)->
    @hp += value
