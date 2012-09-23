// Generated by CoffeeScript 1.3.3
(function() {
  var BattleEngine, BattleScene, BattleTest, Charactor, UtilFunc, UtilWindow, UtilWindow_old,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
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
          name: "player1",
          maxHp: 100
        });
        console.log("" + this.player.name + " create");
        this.enemy = new Charactor({
          name: "enemy1",
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
      var lblAttack, uw1,
        _this = this;
      BattleScene.__super__.constructor.call(this);
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
      uw1 = new UtilWindow(230, 80);
      uw1.x = 50;
      uw1.y = 100;
      this.addChild(uw1);
    }

    return BattleScene;

  })(Scene);

  BattleEngine = (function() {

    function BattleEngine() {
      this.doCommand = __bind(this.doCommand, this);

      this.commandAttack = __bind(this.commandAttack, this);

      this.clearCommand = __bind(this.clearCommand, this);

      this.addCommand = __bind(this.addCommand, this);

      this.nextTarget = __bind(this.nextTarget, this);

      this.nextTurn = __bind(this.nextTurn, this);

      this.changeState = __bind(this.changeState, this);

      this.addMember = __bind(this.addMember, this);

      this.update = __bind(this.update, this);
      this.state = "waitCommand";
      this.members = [];
      this.commands = [];
      this.turn = 0;
      this.target = 1;
      this.game = enchant.Game.instance;
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
      console.log("" + turn_name + " attack " + target_name + "!");
      console.log("" + target_name + " damaged " + damage + "!");
      return console.log("" + target_name + "'s hp:" + this.members[target].hp + ", maxHp:" + this.members[target].maxHp + "!");
    };

    BattleEngine.prototype.doCommand = function() {
      var i, _i, _len, _ref;
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
      this.clearCommand();
      this.changeState("waitCommand");
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

  UtilFunc = (function() {

    function UtilFunc() {}

    UtilFunc.prototype.flg = true;

    UtilFunc.prototype.getTextLength = function(text) {
      var i, len, _i, _len;
      len = 0;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        i = text[_i];
        if (this.flg) {
          console.log("i:" + i);
        }
        if (this.isZenkaku(text.charAt(_i))) {
          len += 2;
        } else {
          len++;
        }
      }
      if (this.flg) {
        console.log("original: " + text.length);
        console.log("escape  : " + len);
      }
      return len;
    };

    UtilFunc.prototype.isZenkaku = function(char) {
      var _char;
      _char = escape(char);
      if (this.flg) {
        console.log("char(all:" + _char);
        console.log("charAt(0-1):" + _char.charAt(0) + _char.charAt(1));
      }
      if (_char.charAt(0) !== "%") {
        return false;
      }
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
      FONT: '14px monospace',
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
      console.log("content_width:" + this.content_width + ", height:" + this.content_height + ", lines:" + this.content_lines);
      this.state = this.STATE.NONE;
      this.func = new UtilFunc();
      this.line_count = 0;
      this.current_line = 0;
      this.lines = [];
      this.skip_count = 0;
      this.br_flag = 0;
      this.clearText();
      this.addText("Monsters appeared!");
      this.addText("<:br>Monster1 attacked Player1!");
      this.addText("<:br>モンスターが現れた！");
      this.addText("<:br>モンスター１がプレイヤー１を攻撃！");
      this.addText("<:br>Monster2がPlayer2を攻撃！");
      this.drawText();
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
      var chars, cnt, i, idx, j, line, zenkaku_flag, _i, _j, _len;
      chars = "";
      line = "";
      zenkaku_flag = false;
      this.ctx.font = this.DEFAULT.FONT;
      console.log("text:" + text);
      for (idx = _i = 0, _len = text.length; _i < _len; idx = ++_i) {
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
        console.log("line:" + line + ", chars:" + chars + ", width:" + this.ctx.measureText(line + i).width + ", skip_count:" + this.skip_count + ", @br_flag:" + this.br_flag + ", zenkaku_flag:" + zenkaku_flag);
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
              console.log("@content_lines - (@line_count % @content_lines):" + (this.content_lines - (this.line_count % this.content_lines)));
              this.br_flag += this.content_lines - (this.line_count % this.content_lines);
            }
          } else {
            if (this.br_flag !== 0) {
              cnt = this.br_flag;
              for (j = _j = 0; 0 <= cnt ? _j < cnt : _j > cnt; j = 0 <= cnt ? ++_j : --_j) {
                this.lines[this.line_count] = line;
                console.log(("@lines[" + this.line_count + "]:") + this.lines[this.line_count]);
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
        console.log(("@lines[" + this.line_count + "]:") + this.lines[this.line_count] + ", @lines.length:" + this.lines.length);
        return this.line_count++;
      }
    };

    UtilWindow.prototype.drawText = function() {
      var i, idx, x, y, _i, _len, _ref;
      this.clearText();
      this.ctx.fillStyle = this.DEFAULT.FONT_COLOR;
      this.ctx.font = this.DEFAULT.FONT;
      x = this.DEFAULT.BORDER + this.DEFAULT.PADDING;
      y = this.DEFAULT.BORDER + this.DEFAULT.PADDING + this.DEFAULT.LINE_HEIGHT;
      _ref = this.lines.slice(this.current_line, (this.current_line + this.content_lines - 1) + 1 || 9e9);
      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
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
      if (this.state === this.STATE.PAGE_END) {
        return this.drawText();
      }
    };

    return UtilWindow;

  })(Sprite);

  UtilWindow_old = (function() {

    UtilWindow_old.prototype.DEFAULT = {
      BORDER_SIZE: 1,
      CONTENT_PADDING: 2,
      WIDTH: 224,
      HEIGHT: 160,
      FONT: "14px monospace",
      LINE_HEIGHT: 18
    };

    UtilWindow_old.prototype.PROCESS_STAGE = {
      NONE: 0,
      PUTTING: 1,
      PAGE_WAIT: 2,
      PAGE_START: 3,
      PAGE_END: 4,
      PAGE_EXIT: 5,
      MESSAGE_EXIT: 6,
      EXIT: 7
    };

    function UtilWindow_old(x, y, width, height) {
      var _this = this;
      this.x = x;
      this.y = y;
      this.width = width != null ? width : this.DEFAULT.WIDTH;
      this.height = height != null ? height : this.DEFAULT.HEIGHT;
      this.border_size = this.DEFAULT.BORDER_SIZE;
      this.inner_x = 0;
      this.inner_y = 0;
      this.inner_width = 0;
      this.inner_height = 0;
      this.content_padding = this.DEFAULT.CONTENT_PADDING;
      this.content_x = 0;
      this.content_y = 0;
      this.content_width = 0;
      this.content_height = 0;
      this.page_line = 0;
      this.fong = this.DEFAULT.FONT;
      this.line_height = this.DEFAULT.LINE_HEIGHT;
      this.pageList = [];
      this.process_stage = 0;
      this.process_count = 0;
      this.page_index = 0;
      this.putting_line = 0;
      this.putting_pos = 0;
      this.visible = false;
      this.func = new UtilFunc();
      ({
        getX: function() {
          return this.x;
        },
        getY: function() {
          return this.y;
        },
        getWidth: function() {
          return this.width;
        },
        getHeight: function() {
          return this.height;
        },
        setSize: function(width, height) {
          if (width < (this.border_size * 2) + (this.content_padding * 2) || height < (this.border_size * 2)(+(this.content_padding * 2))) {
            return false;
          }
          this.width = width;
          this.height = height;
          this.inner_width = this.width - (this.border_size * 2);
          this.inner_height = this.height - (this.border_size * 2);
          this.content_width = this.inner_width - (this.content_padding * 2);
          this.content_height = this.inner_height - (this.content_padding * 2);
          return this.page_lines = Math.floor(this.content_height / this.line_height);
        },
        setPos: function(x, y) {
          this.x = x;
          this.y = y;
          this.inner_x = x + this.border_size;
          this.inner_y = y + this.border_size;
          this.content_x = this.inner_x + this.content_padding;
          return this.content_y = this.inner_y + this.content_padding;
        },
        show: function() {
          return this.visible = true;
        },
        hide: function() {
          return this.visible = false;
        },
        setText: function(text, context) {
          var i, line, lineList, line_pos, page_flag, page_pos, pos, _i, _len, _ref;
          _this.pageList = [];
          line = '';
          lineList = [];
          pos = 0;
          context.font = _this.font;
          while (pos < text.length) {
            page_flag = false;
            while (pos < text.length && context.measureText(line + text.charAt(pos)).width < _this.content_width) {
              if (text.indexOf('<:br>', pos) === pos) {
                pos += 5;
                break;
              }
              if (text.indexOf('<:page>', pos) === pos) {
                pos += 7;
                page_flag = true;
                break;
              }
              line = line + text.charAt(pos);
              pos++;
            }
            lineList.push(line);
            if (page_flag) {
              lineList.push('\f');
            }
            line = '';
          }
          page_pos = 0;
          line_pos = 0;
          while (line_pos < lineList.length) {
            _this.pageList[page_pos] = [];
            _ref = _this.page_lines;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              if (line_pos < lineList.length) {
                break;
              }
              if (lineList[line_pos].charAt(0) === "\f") {
                line_pos++;
                if (_i > 0) {
                  break;
                }
              } else {
                _this.pageList[page_pos].push(lineList[line_pos++]);
              }
            }
            page_pos++;
          }
          _this.process_stage = _this.PROCESS_STAGE.PUTTING;
          _this.page_index = 0;
          _this.putting_line = 0;
          return _this.putting_pos = 0;
        },
        update: function(key) {
          switch (_this.process_stage) {
            case _this.PROCES_STAGE.PAGE_START:
              if (key.getTrigger() === 0) {
                _this.putting_line = 0;
                _this.putting_pos = 0;
                _this.process_stage = _this.PROCESS_STAGE.PUTTING;
              }
              break;
            case _this.PROCESS_STAGE.PAGE_END:
              if (key.getTrigger() === 0) {
                if (_this.page_index < _this.pageList.length - 1) {
                  _this.process_stage = _this.PROCESS_STAGE.PAGE_EXIT;
                } else {
                  _this.process_stage = _this.PROCESS_STAGE.MESSAGE_EXIT;
                }
              }
              break;
            case _this.PROCESS_STAGE.PAGE_EXIT:
              if (key.getTrigger() !== 0) {
                _this.page_index++;
                _this.process_stage = _this.PROCESS_STAGE.PAGE_START;
              }
              break;
            case _this.PROCESS_STAGE.MESSAGE_EXIT:
              if (key.getTrigger() !== 0) {
                _this.process_stage = _this.PROCESS_STAGE.EXIT;
              }
              break;
            case _this.PROCESS_STAGE.PUTTING:
              _this.putting_pos++;
              if (_this.putting_pos >= _this.pageList[_this.page_index][_this.putting_line].length) {
                if (_this.putting_line === _this.pageList[_this.page_index].length - 1) {
                  _this.process_stage = _this.PROCESS_STAGE.PAGE_END;
                } else {
                  _this.putting_line++;
                  _this.putting_pos = 0;
                }
              }
              if (_this.process_stage === _this.PROCESS_STAGE.PUTTING && key.getTrigger() !== 0) {
                _this.process_stage = _this.PROCESS_STAGE.PAGE_END;
              }
          }
          _this.process_count += 1;
          return _this.process_stage = _this.PROCESS_STAGE.EXIT;
        },
        draw: function(context) {
          var context_center_x, i, _i, _j, _len, _len1, _ref, _ref1;
          if (_this.visible === false) {
            return;
          }
          context.fillStyle = '#ffffff';
          context.fillRect(_this.x, _this.y, _this.width, _this.height);
          context.fillStyle = '#000000';
          context.fillRect(_this.inner_x, _this.inner_y, _this.inner_width, _this.inner_height);
          context.fillStyle = '#ffffff';
          context.textBaseline = 'top';
          context.font = _this.font;
          switch (_this.process_stage) {
            case _this.PROCESS_STAGE.PUTTING:
              _ref = _this.putting_line;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                context.fillText(_this.pageList[_this.page_index][_i], _this.content_x, _this.content_y + _i * _this.line_height);
              }
              context.fillText(_this.pageList[_this.page_index][_this.putting_line].substring(0, _this.putting_pos), _this.content_x, _this.content_y + _i * _this.line_height);
              break;
            case _this.PROCESS_STAGE.PAGE_END:
            case _this.PROCESS_STAGE.PAGE_EXIT:
            case _this.PROCESS_STAGE.MESSAGE_EXIT:
              _ref1 = _this.pageList[_this.page_index];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                i = _ref1[_j];
                context.fillText(_this.pageList[_this.pageList][_i], _this.content_x, _this.content_y + _i * _this.line_height);
              }
          }
          context_center_x = _this.content_x + (_this.content_width / 2);
          if (_this.process_stage === _this.PROCESS_STAGE.PAGE_EXIT && (_this.process_count % 10) < 5) {
            context.beginPath();
            context.moveTo(context_center_x - 6, _this.content_y + _this.content_height - 12);
            context.lineTo(context_center_x + 6, _this.content_y + _this.content_height - 12);
            context.lineTo(context_center_x, _this.content_y + _this.content_height);
            context.closePath();
            context.fillStyle = '#ffffff';
            context.fill();
          }
          _this.setSize(_this.DEFAULT.WIDTH, _this.DEFAULT.HEIGHT);
          return _this.setPos(0, 0);
        }
      });
    }

    return UtilWindow_old;

  })();

}).call(this);
