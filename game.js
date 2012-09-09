(function() {
  var BattleEngine, BattleScene, BattleTest, Charactor,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  enchant();

  BattleTest = (function(_super) {

    __extends(BattleTest, _super);

    BattleTest.prototype.config = {
      WIDTH: 320,
      HEIGHT: 320,
      FPS: 30
    };

    function BattleTest() {
      BattleTest.__super__.constructor.call(this, this.config.WIDTH, this.config.HEIGHT);
      this.fps = this.config.FPS;
      this.onload = function() {
        this.scenes = {};
        this.scenes.battle = new BattleScene();
        this.player = new Charactor({
          name: "player1",
          maxHp: 100
        });
        console.log("" + this.player.name + " create");
        this.enemy = new Charactor({
          name: "enemy1",
          maxHp: 50
        });
        console.log("" + this.enemy.name + " create");
        this.replaceScene(this.scenes.battle);
      };
      this.start();
    }

    return BattleTest;

  })(Game);

  window.onload = function() {
    return new BattleTest;
  };

  Charactor = (function() {

    function Charactor(param) {
      this.name = param.name;
      this.maxHp = param.maxHp;
      this.hp = this.maxHp;
      this.isDead = false;
    }

    Charactor.prototype.damage = function(value) {
      var hp;
      hp = this.hp;
      hp -= value;
      if (hp < 0) {
        this.hp = 0;
        return this.isDead = true;
      } else {
        return this.hp = hp;
      }
    };

    Charactor.prototype.recovery = function(value) {
      return this.hp += value;
    };

    return Charactor;

  })();

  BattleScene = (function(_super) {

    __extends(BattleScene, _super);

    function BattleScene() {
      var lblAttack,
        _this = this;
      BattleScene.__super__.constructor.call(this);
      this.backgroundColor = "black";
      this.game = enchant.Game.instance;
      this.bEngine = new BattleEngine();
      this.bEngine.addMember(this.game.player);
      this.bEngine.addMember(this.game.enemy);
      lblAttack = new Label("Attack");
      lblAttack.color = "orange";
      lblAttack.x = 50;
      lblAttack.y = 50;
      lblAttack.addEventListener('touchend', function() {
        console.log("lblAttack touched");
        _this.bEngine.addCommand("attack");
        return _this.bEngine.nextTurn();
      });
      this.addEventListener('enterframe', function() {
        return this.bEngine.update();
      });
      this.addChild(lblAttack);
    }

    return BattleScene;

  })(Scene);

  BattleEngine = (function() {

    function BattleEngine() {
      this.state = "waitCommand";
      this.members = [];
      this.commands = [];
      this.turn = 0;
      this.target = 1;
    }

    BattleEngine.prototype.update = function() {
      switch (this.state) {
        case "waitCommand":
          break;
        case "doCommand":
          console.log("do all command");
          return this.doCommand();
        default:
          return console.log("else");
      }
    };

    BattleEngine.prototype.addMember = function(member) {
      return this.members.push(member);
    };

    BattleEngine.prototype.changeState = function(state) {
      return this.state = state;
    };

    BattleEngine.prototype.nextTurn = function() {
      if (this.turn >= this.members.length) {
        this.turn = 0;
        this.nextTarget();
        return this.changeState("doCommand");
      } else {
        this.turn++;
        return this.nextTarget();
      }
    };

    BattleEngine.prototype.nextTarget = function() {
      if (this.target >= this.members.length) {
        return this.target = 0;
      } else {
        return this.target++;
      }
    };

    BattleEngine.prototype.addCommand = function(command) {
      this.commands.push({
        command: command,
        turn: this.turn,
        target: this.target
      });
      return this.nextTurn();
    };

    BattleEngine.prototype.clearCommand = function() {
      return this.commands = [];
    };

    BattleEngine.prototype.commandAttack = function(turn, target) {
      var damege;
      damege = 10;
      console.log("" + turn + " attack " + target + "!");
      console.log("" + target + " damaged " + damege + "!");
      return this.member.target.damege(damege);
    };

    BattleEngine.prototype.doCommand = function() {
      var a, i, _i, _len, _ref;
      _ref = this.commands;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        switch (i.command) {
          case "attack":
            this.commandAttack(i.turn, i.target);
            break;
          default:
            a = 10;
        }
      }
      this.clearCommand();
      if (this.game.player.hp <= 0) {
        console.log("Game Over!");
        this.game.stop();
      }
      if (this.game.enemy.hp <= 0) {
        console.log("Game Clear!!");
        return this.game.stop();
      }
    };

    return BattleEngine;

  })();

}).call(this);
