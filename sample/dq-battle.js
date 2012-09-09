/// <reference path="../jquery.js" />
/// <reference path="../dq.js" />
/// <reference path="../dq-core.js" />
/// <reference path="dq-rpg.js" />
/// <reference path="dq-battle-visual.js" />

/*
* DQ Retro game UI framework JavaScript library version v0.6.0
*
* Copyright (c) 2009-2010 M., Koji
* Licensed under the MIT License: (http://www.opensource.org/licenses/mit-license.php)
*
* Date: 2010-04-01 17:34:21 -0900
* Revision: 0005
*/

DQ.lazyLoad(DQ.subdir + "rpg/dq-battle-visual.js", "DQ.RPG.BE");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg.js", "DQ.RPG.InputBox", function () {

    DQ.RPG.BEngine = function (screen, monsters) {
        /// <summary>
        /// 戦闘モードエンジン
        /// </summary>

        this.screen = screen;
        this.monsters = monsters;
        this.visual = new DQ.RPG.BEVisual(this);
    }

    //戦闘システム種別
    DQ.RPG.BEngine.Type = { Turn: 0, RTS: 1 }

    //状態遷移の状態
    DQ.RPG.BEngine.Mode = {}

    //開始
    DQ.RPG.BEngine.Mode.Start = {}
    DQ.RPG.BEngine.Mode.Start.visibleChange = function (engine) {
        if (engine.visual.messageBox.visible()) {
            return;
        }
        engine.current = 0;
        if (engine.suspend) {
            //敵の先制攻撃もしくは、全自動ならいきなり戦闘開始
            if (engine.checkReady()) {
                engine.visual.hideCommand();
                engine.visual.showMessageBox({ autoClose: false, autoScroll: false });
                return;
            }
        }
        engine.visual.showCommand();
    }
    DQ.RPG.BEngine.Mode.Start.getText = function (engine, list) {
        return DQ.format("{0}  と遭遇しました。", list[0].name);
    }

    //ターン終了
    DQ.RPG.BEngine.Mode.TurnEnd = {}
    DQ.RPG.BEngine.Mode.TurnEnd.visibleChange = function (engine) {
        if (engine.visual.messageBox.visible()) {
            return;
        }
        engine.callback && engine.callback(engine, DQ.RPG.BEngine.State.TurnEnd);

        engine.allcast = [];
        for (var i = 0; i < engine.cast_party.length; i++) {
            engine.allcast.push(engine.cast_party[i]);
        }
        for (var i = 0; i < engine.cast_enemy.length; i++) {
            var cast = engine.cast_enemy[i];
            if (cast.isDead() || cast.escaped) {
                continue;
            }
            engine.allcast.push(cast);
        }

        for (var i = 0; i < engine.cast_enemy.length; i++) {
            if (engine.cast_enemy[i]._origin.AI != 3) {
                engine.setCommand(engine.cast_enemy[i], engine.cast_enemy[i].think());
            }
        }

        //移動できなければコマンド選択をスキップする必要がある
        var showCommand = false;
        for (var i = 0; i < engine.allcast.length; i++) {
            if (!engine.allcast[i] instanceof DQ.RPG.BEngine.Player) {
                continue;
            }
            if (!engine.allcast[i].canAction()) {
                var command = new DQ.RPG.Command.Nothing();
                command.from = engine.allcast[i]._origin;
                command.to = engine.allcast[i]._origin;
                engine.setCommand(engine.allcast[i], command);
                break;
            } else {
                showCommand = true;
            }
        }
        engine.preemptive = false;
        engine.current = 0;
        showCommand && engine.visual.showCommand();
    }
    DQ.RPG.BEngine.Mode.TurnEnd.getText = function (engine, list) {
        return "";
    }

    //戦闘終了
    DQ.RPG.BEngine.Mode.BattleEnd = {}
    DQ.RPG.BEngine.Mode.BattleEnd.visibleChange = function (engine) {
        if (engine.visual.messageBox.visible()) {
            return;
        }
        engine.callback && engine.callback(engine, DQ.RPG.BEngine.State.BattleEnd);

        engine.visual.messageBox.nowait(false);
        engine.hide();
    }
    DQ.RPG.BEngine.Mode.BattleEnd.getText = function (engine, list) {
        return "終わった";
    }

    //状態リスト
    DQ.RPG.BEngine.StateMachine = [DQ.RPG.BEngine.Mode.Start, null, DQ.RPG.BEngine.Mode.TurnEnd, DQ.RPG.BEngine.Mode.BattleEnd];

    //状態列挙
    DQ.RPG.BEngine.State = { Start: 0, Command: 1, TurnEnd: 2, BattleEnd: 3 }

    DQ.RPG.BEngine.prototype = {
        chip: -1,
        allcast: [],
        battle: false,
        enemy: null,
        party: [],
        monss: [],
        visual: null,
        onDone: function () { },
        suspend: true,
        blocking: false,
        type: DQ.RPG.BEngine.Type.Turn,
        timeLag: 0,
        at_compare: function (o1, o2) {
            var o1d = o1.isDead() ||
                (o1._command instanceof DQ.RPG.Command.Nothing),
                o2d = o2.isDead() ||
                (o2._command instanceof DQ.RPG.Command.Nothing);
            if (o1d && !o2d) {
                return 1;
            }
            if (!o1d && o2d) {
                return -1;
            }

            return o2.AGI - o1.AGI;
        },
        hide: function () {
            this.visual.hide();
            this.battle = false;
            var reason = []
            this.party.each("update", reason);
        },
        setup: function (party, enemyList, lvbox, callback) {
            this.battle = true;
            var me = this;
            world.screen.flash(function () {
                me._setup.apply(me, [party, enemyList, lvbox, callback]);
                return false;
            });
        },
        _setup: function (party, enemyList, lvbox, callback) {
            /// <summary>
            /// 戦いの場を設置する
            /// </summary>
            ///<param name="party" type="Array">
            /// DQ.RPG.Playのリストを含む配列を指定
            ///</param>
            ///<param name="enemyList" type="Array">
            /// 対戦相手のリストを含む配列を指定
            ///</param>
            ///<param name="lvbox" type="Array">
            /// DQ.RPG.LevelBoxを含む配列を指定
            ///</param>
            ///<param name="callback" type="function">
            /// setupが完了した場合に呼び出されるコールバックを指定
            ///</param>

            //開始
            this.battle = true;
            this.blocking = false;
            this.party = new DQ.RPG.Party();
            for (var i = 0; i < party.length; i++) {
                if (party[i].entryBattle) { //パーティのメンバーでも戦闘に参加しないNPCなどを除外する
                    this.party.push(party[i]);
                }
            }
            this.monss = enemyList;
            this.callback = callback;
            this.lvbox = lvbox;
            this.lvbox.battle = true; //戦闘時モード

            //ターン方式ならサスペンド
            this.suspend = this.type == DQ.RPG.BEngine.Type.Turn ? true : false;

            var me = this,
                en = this.enemy = new DQ.RPG.Party();

            this.enemyGroup = [];

            for (var i = 0; i < enemyList.length; i++) {
                var mo = this.monsters.find("text", enemyList[i].name);
                //対戦相手一覧情報を作成
                var count = !enemyList[i].count == null ? 1 : enemyList[i].count;
                this.enemyGroup.push({ id: enemyList[i].name, name: mo.text, count: count });
                if (count == 0) {
                    var mo = this.monsters.create(enemyList[i].name);
                    mo.itemCatalog = world.items.catalog;
                    mo.ePos = this.enemyGroup[i];
                    mo.hp(0);
                    en.push(mo);
                }
                for (var j = 0; j < count; j++) {
                    var mo = this.monsters.create(enemyList[i].name);
                    mo.itemCatalog = world.items.catalog;
                    mo.name = j == 0 ? mo.name : mo.name + "-" + (j - 1);
                    mo.ePos = this.enemyGroup[i];
                    en.push(mo);
                }
            }

            //当事者全員のリストを作成する
            this.allcast = [];
            var pre_me = false, pre_en = false, msg = [];
            if (world.preemptiveAttack(party[0], en[0])) {
                //自分
                msg.push(DQ.format("{0} はまだこちらに気づいていない", en[0].name));
                pre_me = true;
            } else if (world.preemptiveAttack(en[0], party[0])) {
                msg.push(DQ.format("{0} がこちらが身構える前に襲ってきた", en[0].name));
                pre_en = true;
            }
            this.cast_party = [];
            this.cast_enemy = [];
            for (var i = 0; i < this.party.length; i++) {
                var cast = new DQ.RPG.BEngine.Player(this, this.party[i]);
                this.cast_party.push(cast);
                !pre_en && this.allcast.push(cast);
            }
            for (var i = 0; i < en.length; i++) {
                var cast = new DQ.RPG.BEngine.Enemy(this, en[i]);
                this.cast_enemy.push(cast);
                !pre_me && this.allcast.push(cast);
            }

            this.preemptive = pre_me;
            //状態を戦闘開始へ
            this.mode = DQ.RPG.BEngine.State.Start;

            //ビジュアルを表示
            this.visual.setup(this.cast_enemy, this.enemyGroup, lvbox, msg);

            //コマンドの実行順位を決定
            this.type == DQ.RPG.BEngine.Type.Turn && this.allcast.sort(this.at_compare);
            this.preDate = new Date();
            var me = this;
            this.visual.messageBox.onTextComplete = function () {
                me.visual.update(me.enemyGroup);
            }

            //戦闘中のメッセージは常にnowait
            this.visual.messageBox.nowait(true);

            this.callback && this.callback(this);
        },
        getCurrentPlayer: function () {
            return this.party[this.current];
        },
        setCommand: function (player, command) {
            /// <summary>
            /// プレイヤー（対戦相手）にコマンドを設定します。
            /// </summary>
            /// <param name="player" type="DQ.RPG.BEngine.Creature">
            /// コマンドをセットするプレイヤーを指定
            /// </param>
            /// <param name="command" type="DQ.RPG.Command">
            /// 実行するコマンドを指定
            /// </param>

            if (player instanceof DQ.RPG.BEngine.Creature) {
                player.command(command);
            } else {
                for (var i = 0; i < this.allcast.length; i++) {
                    if (this.allcast[i]._origin == player) {
                        this.allcast[i].command(command);
                        break;
                    }
                }
            }
            var msg = [];
            command.enter(this, msg);

            for (var i = this.current + 1; i < this.party.length; i++) {
                if (this.party[i].canAction()) {
                    this.current = i;
                    this.visual.nameBox.setData([{ text: this.party[i].name}]);
                    this.visual.chara.uid(this.party[i].uid);
                    break;
                }
            }

            //全員が準備入力完了ならサスペンドを解除
            if (this.suspend == true && this.type == DQ.RPG.BEngine.Type.Turn) {
                if (this.checkReady()) {
                    this.visual.hideCommand();
                    this.visual.showMessageBox({ autoClose: false, autoScroll: false });
                }
            }
        },
        checkReady: function () {
            for (var i = 0; i < this.allcast.length; i++) {
                if (!this.allcast[i].ready()) {
                    this.visual.commandBox.focus();
                    return false;
                }
                if (this.allcast[i].isDead()) {
                    continue;
                }
            }
            //行動順番用の速度を設定
            for (var i = 0; i < this.allcast.length; i++) {
                this.allcast[i].AGI = world.getBattleAGI(this.allcast[i]._origin);
            }
            this.allcast.sort(this.at_compare);
            //攻撃までのタイムラグを設定する
            var count = 0;
            for (var i = 0; i < this.allcast.length; i++) {
                if (this.allcast[i].isDead()) {
                    continue;
                }
                this.allcast[i]._timeLag = 32 + 2000 * count;
                debug.writeln(DQ.format("{0}:{1} AGI:{2}, Lag:{3}",
                        count, this.allcast[i]._origin.name, this.allcast[i].AGI,
                        this.allcast[i]._timeLag));
                count++;
            }

            //全員、準備完了
            this.elapse = 0;
            this.suspend = false;

            return true;
        },
        trigger: function (command, text) {
            /// <summary>
            /// 指定されたコマンドを実行する
            /// </summary>
            /// <param name="command" type="DQ.RPG.Command">
            /// 実行するコマンドを指定
            /// </param>

            //debug.writeln(command.getText());
            //data.push(command.getText());


            var result = command.trigger(this, text), me = this;

            this.blocking = true;
            this.visual.effect(command, "", result, function () {
                me.blocking = false;

                return true;
            });

            if (command.to && command.to.isDead()) {
                if (command.to.friend) {
                    text.push(command.to.name + "は気絶した。");
                } else {
                    text.push(command.to.name + "を倒した。");
                    command.to.ePos.count--;
                }
            }
            if (result && !command.from.friend && command.command == "escape") {
                command.from.ePos.count--;
            }
            return result;
        },
        update: function () {
            ///<summary>
            /// インターバルタイマーごとの状況を更新する。
            ///</summary>

            //タイマーの精度が安定しないので実時間からラグを調整
            this.timeLag = new Date() - this.preDate;
            this.preDate = new Date();
            if (!this.battle || this.suspend || this.blocking) {
                //非戦闘、サスペンド中、もしくはエフェクト処理(ブロックキング中）なら実行しない
                return;
            }

            this.elapse += this.timeLag;

            var suspend = true;
            //全員がやるべきことを終えたら再びサスペンドへ
            for (var i = 0; i < this.allcast.length; i++) {
                suspend = this.allcast[i].update(this.allcast) == false ? false : suspend;
                //いずれかのチームが全滅したら戦闘終了、そうでなければターン終了
                if (this.party.totalDestruction() || this.enemy.totalDestructionForEnemy()) {
                    suspend = true;
                    break;
                }
            }

            if (suspend) {
                //いずれかのチームが全滅したら戦闘終了、そうでなければターン終了
                this.mode = (this.party.totalDestruction() || this.enemy.totalDestructionForEnemy()) ? DQ.RPG.BEngine.State.BattleEnd : DQ.RPG.BEngine.State.TurnEnd;

                if (this.mode == DQ.RPG.BEngine.State.TurnEnd) {
                    this.visual.messageBox.waitClick = false;
                }
                //ここで戦闘完了時の状態更新を実施するかどうか
                if (this.mode == DQ.RPG.BEngine.State.BattleEnd) {
                    this.lvbox.battle = false;
                }
            }

            //全作業完了かつターン制ならサスペンドする
            this.suspend = this.type == DQ.RPG.BEngine.Type.Turn ? suspend : false;
            if (this.suspend) {
                this.visual.messageBox.autoClose = true;
            }

        }
    }

    DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-command.js", "DQ.RPG.Command.Attack", function () {
        DQ.lazyLoad(DQ.subdir + "rpg/dq-battle.js", "DQ.RPG.BEngine", function () {
            DQ.RPG.BEngine.Commands = [DQ.RPG.Command.Attack, DQ.RPG.Command.Tool, DQ.RPG.Command.Magic, DQ.RPG.Command.Defence, DQ.RPG.Command.Escape, DQ.RPG.Command.Nothing];
        });
    });

    DQ.RPG.BEngine.Creature = function (engine, player) {
        ///<summary>
        /// DQ.RPG.Creatureをラップし、戦闘用のAgentを作成する
        ///</summary>
        ///<param name="engine" type="DQ.RPG.BEngine">
        /// 場となるDQ.RPG.BEngineを指定
        ///</param>
        ///<param name="player" type="DQ.RPG.Creature">
        /// 元になるDQ.RPG.Creatureを指定
        ///</param>
        this._engine = engine;
        this._origin = player;
        this._command = null;

        //味方なら手動
        this._auto = player.firend ? false : true;
    }
    DQ.RPG.BEngine.Creature.prototype = {
        _engine: null,
        _myTurn: false,
        _auto: false,
        _command: null,
        _origin: null,
        _timeLag: 0,
        canAction: function (reason) {
            return this._origin.canAction(reason);
        },
        canAttack: function (reason) {
            return this._origin.canAttack(reason);
        },
        canChant: function (reason) {
            return this._origin.canChant(reason);
        },
        getState: function (nm) {
            return this._origin.getState(nm);
        },
        name: function () {
            return this._origin.name;
        },
        isDead: function () {
            return this._origin.isDead();
        },
        isDone: function () {
            return this._timeLag <= 0;
        },
        ready: function () {
            return true;
        },
        getTo: function (allcast, by) {
            ///<summary>
            /// 対象を決定
            ///</summary>

            //仮なので超簡易
            var engine = this._engine;
            if (by && by.type == "heal") {
                var cast = this._origin.friend ? engine.cast_party : engine.cast_enemy;
                for (var i = 0; i < cast.length; i++) {
                    if (!cast[i].isDead() && cast[i]._origin.friend == this._origin.friend) {
                        return cast[i];
                    }
                }
            } else {
                var cast = this._origin.friend ? engine.cast_enemy : engine.cast_party;
                for (var i = 0; i < cast.length; i++) {
                    if (cast[i] == this) {
                        continue;
                    }
                    if (!cast[i].isDead() && cast[i]._origin.friend != this._origin.friend) {
                        return cast[i];
                    }
                }
            }
            throw new Error("DQ.RPG.BEngine.Creature: error getTo() failed.");
        },
        think: function () {
            var cmd = new DQ.RPG.Command.Attack();
            //誰が
            cmd.from = this._origin;
            //誰を
            cmd.to = this.getTo()._origin;
            //何で
            cmd.by = new DQ.RPG.Weapon();

            return cmd.to ? cmd : null;
        },
        update: function (allcast) {

            //自分の時間が過ぎているか死んでいるなら終了
            if (this._timeLag <= 0 || this._origin.isDead()) {
                return true;
            }
            //debug.writeln(DQ.format("{0} : {1} -= {2}", this._origin.name, this._timeLag, this._engine.timeLag));
            this._timeLag -= this._engine.timeLag;
            this._myTurn = this._timeLag <= 0;

            if (this._myTurn) {
                debug.writeln(DQ.format("{0} command start({1}).", this._origin.name, this._engine.elapse));
                //自動戦闘なら行動を決定する
                var reason = [];
                if (this._auto && !this._command) {
                    if (!this.canAction(reason)) {
                        //行動不能
                        this._command = new DQ.RPG.Command.Nothing();
                        this._command.from = this._origin;
                        this._command.to = this._origin;
                    } else {
                        this._command = this.think();
                    }
                } else {
                    if (!this.canAction(reason)) {
                        //行動不能
                        this._command = new DQ.RPG.Command.Nothing();
                        this._command.from = this._origin;
                        this._command.to = this._origin;
                    }
                }
                var visual = this._engine.visual;
                //コマンドがあれば実行（マニュアルなら事前に登録してあるはず）
                if (this._command) {
                    visual.showMessageBox({ autoScroll: true, autoClose: false });
                    if (this._command.to.isDead() || this._command.to.escaped) {
                        visual.messageBox.push(DQ.format("{0} は既にいない", this._command.to.name));
                    } else {
                        var text = [];
                        this._engine.trigger(this._command, text);
                        text.length && visual.messageBox.push(text);

                    }
                    //自分のターン終了後の状態更新
                    var reason = [];
                    !this._origin.isDead() && this._origin.update(reason);
                    reason.length && visual.messageBox.push(reason);
                }
                this._command = null;
                this.preDate = new Date(); //コマンド
                return true;
            }
            return false;
        },
        command: function (value) {
            if (!arguments.length) {
                return this._command;
            }
            this._command = value;
        }
    }

    DQ.RPG.BEngine.Player = dqextend(DQ.RPG.BEngine.Creature, function (engine, p) {
        this.base(engine, p);
        this._auto = false;
    }, {
        ready: function () {
            return this._command ? true : false;
        },
        setup: function () {
        }
    });

    DQ.RPG.BEngine.Enemy = dqextend(DQ.RPG.BEngine.Creature, function (engine, p) {
        this.base(engine, p);
    }, {
        escaped: false,
        think: function (allcast) {
            var cmd = world.monsterAI(this._origin, this._engine.party, this._engine.enemy);

            //誰が
            cmd.from = this._origin;
            //誰を
            cmd.to = this.getTo(allcast, cmd.by)._origin;

            return cmd.to ? cmd : null;
        },
        setup: function () {
        }
    });

    DQ.RPG.BEEnd = {};

});
