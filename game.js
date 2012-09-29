(function() {
  var BattleEngine, BattleScene, BattleTest, Charactor, SelectDialog, UtilFunc, UtilWindow,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
        this.player = new Charactor({
          name: "プレイヤー１",
          maxHp: 100
        });
        console.log("" + this.player.name + " create");
        this.enemy = new Charactor({
          name: "敵１",
          maxHp: 50
        });
        console.log("" + this.enemy.name + " create");
        this.scenes = {};
        this.scenes.battle = new BattleScene();
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
      var lblAttack, lines, sd1, uw1,
        _this = this;
      BattleScene.__super__.constructor.call(this);
      this.game = enchant.Game.instance;
      uw1 = new UtilWindow(230, 80);
      uw1.x = 50;
      uw1.y = 100;
      this.addChild(uw1);
      lines = ["aaaa", "bb", "ccc"];
      sd1 = new SelectDialog(lines, 1);
      sd1.x = 50;
      sd1.y = 200;
      this.addChild(sd1);
      this.bEngine = new BattleEngine(uw1);
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

    function BattleEngine(msgWin) {
      this.clearLines = __bind(this.clearLines, this);
      this.getLines = __bind(this.getLines, this);
      this.addLine = __bind(this.addLine, this);
      this.doCommand = __bind(this.doCommand, this);
      this.commandAttack = __bind(this.commandAttack, this);
      this.clearCommand = __bind(this.clearCommand, this);
      this.addCommand = __bind(this.addCommand, this);
      this.nextTarget = __bind(this.nextTarget, this);
      this.nextTurn = __bind(this.nextTurn, this);
      this.changeState = __bind(this.changeState, this);
      this.addMember = __bind(this.addMember, this);
      this.update = __bind(this.update, this);      this.state = "waitCommand";
      this.members = [];
      this.commands = [];
      this.turn = 0;
      this.target = 1;
      this.game = enchant.Game.instance;
      this.lines = [];
      this.clearLines();
      this.msgWin = msgWin;
    }

    BattleEngine.prototype.update = function() {
      switch (this.state) {
        case "waitCommand":
          break;
        case "doCommand":
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
      if (this.turn >= this.members.length - 1) {
        this.turn = 0;
        this.nextTarget();
        return this.changeState("doCommand");
      } else {
        this.turn++;
        return this.nextTarget();
      }
    };

    BattleEngine.prototype.nextTarget = function() {
      if (this.target >= this.members.length - 1) {
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
      return console.log("addCommand command:" + command + ", turn:" + this.turn + ", target:" + this.target);
    };

    BattleEngine.prototype.clearCommand = function() {
      return this.commands = [];
    };

    BattleEngine.prototype.commandAttack = function(turn, target) {
      var damage, target_name, turn_name;
      damage = 10;
      turn_name = this.members[turn].name;
      target_name = this.members[target].name;
      this.members[target].damage(damage);
      this.msgWin.addText("" + turn_name + " が " + target_name + " を攻撃！");
      this.msgWin.addText("" + target_name + " は " + damage + " のダメージ！");
      return this.msgWin.addText("" + target_name + " のＨＰは " + this.members[target].hp + "／" + this.members[target].maxHp);
    };

    BattleEngine.prototype.doCommand = function() {
      var i, _i, _len, _ref;
      this.msgWin.clearLines();
      _ref = this.commands;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        switch (i.command) {
          case "attack":
            this.commandAttack(i.turn, i.target);
            break;
          default:
            return;
        }
      }
      this.msgWin.drawText();
      this.clearCommand();
      this.changeState("waitCommand");
      if (this.game.player.hp <= 0) {
        this.msgWin.addText("Game Over!");
        this.game.stop();
      }
      if (this.game.enemy.hp <= 0) {
        this.msgWin.addText("Game Clear!!");
        return this.game.stop();
      }
    };

    BattleEngine.prototype.addLine = function(line) {
      return this.lines.push(line);
    };

    BattleEngine.prototype.getLines = function() {
      return this.lines;
    };

    BattleEngine.prototype.clearLines = function() {
      return this.lines = [];
    };

    return BattleEngine;

  })();

  UtilFunc = (function() {

    function UtilFunc() {}

    UtilFunc.prototype.flg = true;

    UtilFunc.prototype.getTextLength = function(text) {
      var aa, i, len, _i, _len;
      len = 0;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        i = text[_i];
        if (this.flg) aa = "aa";
        if (this.isZenkaku(text.charAt(_i))) {
          len += 2;
        } else {
          len++;
        }
      }
      if (this.flg) aa = "aa";
      return len;
    };

    UtilFunc.prototype.isZenkaku = function(char) {
      var aa, _char;
      _char = escape(char);
      if (this.flg) aa = "aa";
      if (_char.charAt(0) !== "%") return false;
      switch (_char.charAt(1)) {
        case "8":
        case "9":
        case "E":
        case "F":
        case "u":
          return true;
        default:
          return false;
      }
    };

    return UtilFunc;

  })();

  UtilWindow = (function(_super) {

    __extends(UtilWindow, _super);

    UtilWindow.prototype.DEFAULT = {
      BACKGROUND_COLOR: 'black',
      LINE_COLOR: 'orange',
      BORDER: 2,
      FONT_COLOR: 'white',
      FONT: '14px HG丸ｺﾞｼｯｸM-PRO',
      PADDING: 3,
      LINE_HEIGHT: 16,
      OPACITY: 0.6,
      PAGE_MARKER_HEIGHT: 10,
      PAGE_MARKER_WIDTH: 20
    };

    UtilWindow.prototype.STATE = {
      NONE: 0,
      PUTTING: 1,
      PAGE_WAIT: 2,
      PAGE_START: 3,
      PAGE_END: 4,
      PAGE_EXIT: 5,
      MESSAGE_EXIT: 6,
      EXIT: 7
    };

    function UtilWindow(w, h) {
      this.clearLines = __bind(this.clearLines, this);
      this.setLines = __bind(this.setLines, this);
      var _this = this;
      UtilWindow.__super__.constructor.call(this, w, h);
      this.width = w;
      this.height = h;
      this.sur = new Surface(w, h);
      this.ctx = this.sur.context;
      this.image = this.sur;
      this.opacity = this.DEFAULT.OPACITY;
      this.content_width = this.width - this.DEFAULT.BORDER * 2 - this.DEFAULT.PADDING * 2;
      this.content_height = this.height - this.DEFAULT.BORDER * 2 - this.DEFAULT.PADDING * 2 - this.DEFAULT.PAGE_MARKER_HEIGHT;
      this.content_lines = Math.floor(this.content_height / this.DEFAULT.LINE_HEIGHT);
      this.state = this.STATE.NONE;
      this.func = new UtilFunc();
      this.line_count = 0;
      this.current_line = 0;
      this.lines = [];
      this.skip_count = 0;
      this.br_flag = 0;
      this.clearText();
      this.addEventListener('touchend', function() {
        return _this.onClick();
      });
    }

    UtilWindow.prototype.clearText = function() {
      this.ctx.fillStyle = this.DEFAULT.BACKGROUND_COLOR;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.strokeStyle = this.DEFAULT.LINE_COLOR;
      return this.ctx.strokeRect(this.DEFAULT.BORDER, this.DEFAULT.BORDER, this.width - this.DEFAULT.BORDER * 2, this.height - this.DEFAULT.BORDER * 2);
    };

    UtilWindow.prototype.addText = function(text) {
      var chars, cnt, i, idx, j, line, zenkaku_flag, _len;
      chars = "";
      line = "";
      zenkaku_flag = false;
      this.ctx.font = this.DEFAULT.FONT;
      for (idx = 0, _len = text.length; idx < _len; idx++) {
        i = text[idx];
        if (zenkaku_flag) {
          zenkaku_flag = false;
          break;
        }
        if (this.func.isZenkaku(i)) {
          chars = text[idx];
          zenkaku_flag = true;
        } else {
          chars = i;
          zenkaku_flag = false;
        }
        if (this.skip_count !== 0) {
          this.skip_count--;
        } else {
          if (i === "<") {
            if (text.slice(idx, (idx + 4) + 1 || 9e9) === "<:br>") {
              this.skip_count = 4;
              this.br_flag += 1;
            }
            if (text.slice(idx, (idx + 6) + 1 || 9e9) === "<:page>") {
              this.skip_count = 6;
              this.br_flag += this.content_lines - (this.line_count % this.content_lines);
            }
          } else {
            if (this.br_flag !== 0) {
              cnt = this.br_flag;
              for (j = 0; 0 <= cnt ? j < cnt : j > cnt; 0 <= cnt ? j++ : j--) {
                this.lines[this.line_count] = line;
                this.line_count++;
                this.br_flag--;
                line = "";
              }
            }
            line = line + chars;
            if (this.ctx.measureText(line + chars).width > this.content_width) {
              this.br_flag += 1;
            }
          }
          zenkaku_flag = false;
        }
      }
      if (line !== "") {
        this.lines[this.line_count] = line;
        return this.line_count++;
      }
    };

    UtilWindow.prototype.setLines = function(lines) {
      var l, _i, _len, _results;
      if (!(lines != null)) return;
      _results = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        l = lines[_i];
        _results.push(this.addText(l));
      }
      return _results;
    };

    UtilWindow.prototype.clearLines = function() {
      this.line_count = 0;
      this.current_line = 0;
      this.lines = [];
      this.skip_count = 0;
      return this.br_flag = 0;
    };

    UtilWindow.prototype.drawText = function() {
      var i, idx, x, y, _len, _ref;
      this.clearText();
      this.ctx.fillStyle = this.DEFAULT.FONT_COLOR;
      this.ctx.font = this.DEFAULT.FONT;
      x = this.DEFAULT.BORDER + this.DEFAULT.PADDING;
      y = this.DEFAULT.BORDER + this.DEFAULT.PADDING + this.DEFAULT.LINE_HEIGHT;
      _ref = this.lines.slice(this.current_line, (this.current_line + this.content_lines - 1) + 1 || 9e9);
      for (idx = 0, _len = _ref.length; idx < _len; idx++) {
        i = _ref[idx];
        this.ctx.font = this.DEFAULT.FONT;
        this.ctx.fillText(i, x, y + idx * this.DEFAULT.LINE_HEIGHT);
      }
      if (this.current_line + this.content_lines + 1 <= this.lines.length) {
        this.current_line += this.content_lines;
        this.drawMarker();
        return this.state = this.STATE.PAGE_END;
      } else {
        this.current_line = 0;
        return this.state = this.STATE.MESSAGE_EXIT;
      }
    };

    UtilWindow.prototype.drawMarker = function() {
      var x1, x2, x3, y1, y2;
      x1 = Math.floor(this.width / 2) - this.DEFAULT.PAGE_MARKER_WIDTH / 2;
      x2 = Math.floor(this.width / 2) + this.DEFAULT.PAGE_MARKER_WIDTH / 2;
      x3 = Math.floor(this.width / 2);
      y1 = this.height - this.DEFAULT.BORDER - this.DEFAULT.PADDING - (this.DEFAULT.PAGE_MARKER_HEIGHT - 2);
      y2 = this.height - this.DEFAULT.BORDER - this.DEFAULT.PADDING - 2;
      this.ctx.fillStyle = this.DEFAULT.FONT_COLOR;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y1);
      this.ctx.lineTo(x3, y2);
      this.ctx.closePath();
      return this.ctx.fill();
    };

    UtilWindow.prototype.update = function() {};

    UtilWindow.prototype.onClick = function() {
      if (this.state === this.STATE.PAGE_END) return this.drawText();
    };

    return UtilWindow;

  })(Sprite);

  SelectDialog = (function(_super) {

    __extends(SelectDialog, _super);

    SelectDialog.prototype.DEFAULT1 = {
      SELECTED_COLOR: 'blue',
      SEL_MARKER_WIDTH: 10,
      SEL_MARKER_HEIGHT: 16
    };

    function SelectDialog(lines, index) {
      this.setIndex = __bind(this.setIndex, this);
      this.getIndex = __bind(this.getIndex, this);
      this.detectIndex = __bind(this.detectIndex, this);
      this.max = __bind(this.max, this);
      var _this = this;
      SelectDialog.__super__.constructor.call(this, 10, 10);
      if (lines != null) {
        this.lines = lines;
      } else {
        this.lines = [];
      }
      this.content_width = this.max(this.lines) * 14;
      this.content_height = this.lines.length * this.DEFAULT.LINE_HEIGHT;
      this.width = this.content_width + this.DEFAULT.BORDER * 2 + this.DEFAULT.PADDING * 2 + this.DEFAULT1.SEL_MARKER_WIDTH;
      this.height = this.content_height + this.DEFAULT.BORDER * 2 + this.DEFAULT.PADDING * 2;
      if (index != null) {
        this.index = index;
      } else {
        this.index = 1;
      }
      this.setLines(this.lines);
      this.drawText();
      this.addEventListener('touchend', function(e) {
        return _this.setIndex(_this.detectIndex(e));
      });
    }

    SelectDialog.prototype.max = function(lines) {
      var i, j, len, max, _i, _j, _len, _len2;
      max = 0;
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        i = lines[_i];
        len = 0;
        for (_j = 0, _len2 = i.length; _j < _len2; _j++) {
          j = i[_j];
          if (this.func.isZenkaku(j)) {
            len += 2;
          } else {
            len += 1;
          }
        }
        if (len > max) max = len;
      }
      return max;
    };

    SelectDialog.prototype.detectIndex = function(e) {
      var index, x, y;
      x = e.x - this.x;
      y = e.y - this.y;
      if (x < (this.DEFAULT.BORDER + this.DEFAULT.PADDING) || x > this.width) {
        return this.index;
      }
      if (y < (this.DEFAULT.BORDER + this.DEFAULT.PADDING) || y > this.height) {
        return this.index;
      }
      index = Math.floor(y / this.DEFAULT.LINE_HEIGHT) + 1;
      if ((0 < index && index <= (this.lines.length + 1))) {
        return index;
      } else {
        return this.index;
      }
    };

    SelectDialog.prototype.drawText = function() {
      var i, idx, x, y, _len, _ref;
      this.clearText();
      this.ctx.fillStyle = this.DEFAULT.FONT_COLOR;
      this.ctx.font = this.DEFAULT.FONT;
      x = this.DEFAULT.BORDER + this.DEFAULT.PADDING;
      y = this.DEFAULT.BORDER + this.DEFAULT.PADDING;
      _ref = this.lines;
      for (idx = 0, _len = _ref.length; idx < _len; idx++) {
        i = _ref[idx];
        this.ctx.font = this.DEFAULT.FONT;
        if ((idx + 1) === this.Index) {
          this.ctx.fontStyle = this.DEFAULT1.SELECTED_COLOR;
          this.drawMarker(x, y + idx * this.DEFAULT.LINE_HEIGHT);
        } else {
          this.ctx.fontStyle = this.DEFAULT.FONT_COLOR;
        }
        this.ctx.fillText(i, x + this.DEFAULT1.SEL_MARKER_WIDTH, y + (idx + 1) * this.DEFAULT.LINE_HEIGHT);
      }
      return this.state = this.STATE.PAGE_WAIT;
    };

    SelectDialog.prototype.drawMarker = function(x, y) {
      var x1, x2, y1, y2, y3;
      x1 = x + 2;
      x2 = x + (this.DEFAULT.SEL_MARKER_WIDTH - 2 * 2);
      y1 = y + 2;
      y2 = y + Math.floor(this.DEFAULT.SEL_MARKER_HEIGHT / 2);
      y3 = y + this.DEFAULT.SEL_MARKER_HEIGHT(-2);
      this.ctx.fillStyle = this.DEFAULT.SELECTED_COLOR;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.lineTo(x1, y3);
      this.ctx.closePath();
      return this.ctx.fill();
    };

    SelectDialog.prototype.getIndex = function() {
      return this.index;
    };

    SelectDialog.prototype.setIndex = function(idx) {
      if (this.index !== idx) {
        this.index = idx;
        this.drawText();
        return this.state = this.STATE.MESSAGE_EXIT;
      }
    };

    return SelectDialog;

  })(UtilWindow);

}).call(this);
