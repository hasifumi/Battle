/// <reference path="../jquery.js" />
/// <reference path="../dq.js" />
/// <reference path="../dq-core.js" />
/// <reference path="../dq-util.js" />
/// <reference path="dq-rpg.js" />
/// <reference path="dq-rpg-command.js" />
/// <reference path="dq-rpg-api.js" />

/*
** DQ Retro game UI framework JavaScript library version v0.6.0
**
** Copyright (c) 2009-2010 M., Koji
** Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
**
** Date: 2010-04-01 17:34:21 -0900
** Revision: 0006
**
**/

DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg.js", "DQ.RPG.InputBox", function () {
    DQ.lazyLoad(DQ.subdir + "dq-core.jp", "DQ.StateBox", function () {

        DQ.RPG.BEMagicBox = dqextend(DQ.Control, function (screen, options) {
            /// <summary>
            /// 魔法選択ボックスを作成します。
            /// </summary>

            options = DQ.options(options, {
                showName: false,
                canSelect: true,
                top: DQ.T1,
                player: null
            });

            this.player = options.player;
            this.onChant = options.chant;
            this.base(screen, $('<div>'));
            this.visible(false);

            this._group = new DQ.StateGroup(screen, [
            {
                name: "magic", options: options
            },
            {
                name: "desc", options: {
                    cls: 'dq-mpdesc',
                    width: '12em',
                    height: '4em',
                    left: DQ.L3,
                    top: options.top,
                    autoClose: false,
                    autoScroll: false,
                    canSelect: false,
                    speed: 0
                }
            },
            {
                name: "mp", options: {
                    width: '7em',
                    height: '3em',
                    cls: 'dq-mp-box',
                    left: DQ.L3,
                    top: options.top + 94,
                    showName: false,
                    canSelect: false,
                    text: "消費ＭＰ"
                }
            }]);

            var me = this, _pos;
            this._group.onSelectedIndexChanged = function (group, sender, pos) {
                _pos = pos;
                var id = me.player.magicIDs[sender.data[pos].orgPos],
                magic = world.magics.catalog[id];
                group.desc.setData([{ text: magic.description}]);
                group.mp.setData([{
                    text: ['<div class="dq-mbox-mp">', magic.MP, "／", me.player.mp(), '</div>'].join('')
                }]);
            }
            this._group.onVisibleChanged = function (group, sender, state) {
                if (!state && sender.name == "magic") {
                    group.hide();
                }
            }
            this._group.onClick = function _group_onClick(group, sender) {
                /// <summary>
                ///   　魔法を使用する
                /// </summary> 
                if (sender.name == "magic") {
                    var player = me.player;
                    var pPos = sender.data[_pos].orgPos;
                    var hide = false;
                    var id = player.magicIDs[pPos];
                    group.focus("magic");
                    if (world.magics.catalog[id].category == DQ.RPG.Magic.Category.Attack) {
                        hide = me.onChant ? me.onChant(me, player, null, player.magicIDs[pPos], pPos) : true;
                    } else {
                        hide = me.onChant ? me.onChant(me, player, player, player.magicIDs[pPos], pPos) : true;
                    }
                    hide && me.hide();
                } else if (sender.name == "to") {
                }
            };

        }, {
            onChant: null,
            setup: function (player) {
                player = (player instanceof DQ.RPG.Creature) ? player : this.player;
                this.player = player;

                var mg = [];
                for (var i = 0; i < player.magicIDs.length; i++) {
                    var magic = world.magics.catalog[player.magicIDs[i]];
                    mg.push({
                        'text': magic.text,
                        'orgPos': i,
                        enabled: magic.type != "party"
                    });
                }
                if (mg.length == 0) {
                    return false;
                }
                this._group.magic.setData(mg);

                return true;
            },
            show: function (player) {
                __dqsuper__(this, "show", arguments);

                this.setup(player);
                this._group.show();
                this._group.focus("magic");
            },
            hide: function () {
                if (!this._visible) {
                    return;
                }
                __dqsuper__(this, "hide", arguments);
                this._group && this._group.hide();
            }
        },
        {});
        DQ.RPG.BEItemBox = dqextend(DQ.Control, function (screen, options) {
            options = DQ.options(options, {
                cls: "dq-item",
                player: null,
                disableNotUse: true
            });
            this.onUse = options.use;
            this.player = options.player;
            this.disableNotUse = options.disableNotUse;

            this.base(screen, $('<div>'));
            this.visible(false);

            this._group = new DQ.StateGroup(screen, [
                {
                    name: "item", options: options
                },
                {
                    name: "cmd", options: {
                        width: '6em', height: 'auto',
                        left: DQ.L1, top: DQ.T3, showName: false, canSelect: true,
                        text: _("Action"),
                        data: [
                            { text: _("Use") },
                            { text: _("Trade") },
                            { text: _("Drop") },
                            { text: _("Return")}]
                    }
                },
                {
                    name: 'to', options: {
                        width: '6em', height: 'auto',
                        left: DQ.L1, top: DQ.T3, showName: false, canSelect: true,
                        text: _("To")
                    }
                },
                {
                    name: "yesno", type: "YesNo", options: {
                        left: DQ.L2, top: DQ.T2
                    }
                }
                ]);


            var me = this, _item, _command, _itemPos;
            this._group.onClick = function (group, sender) {
                if (sender.name == "item") {
                    _item = me.player.items[sender.selectedIndex()];
                    _itemPos = sender.selectedIndex();
                    group.cmd.show();
                } else if (sender.name == "cmd") {
                    _command = sender.selectedIndex();
                    switch (_command) {
                        case 0:
                            var hide = false;
                            if (world.items.catalog[_item.uid].type == "ofence") {
                                //下位に任せる。
                                hide = me.onUse ? me.onUse(me, null, _item, _itemPos) : true;
                            } else if (world.party.length > 1) {
                                me.to.show();
                                //group.focus("to");
                            } else {
                                hide = me.onUse ? me.onUse(me, me.player, me.player, _item, _itemPos) : true;
                            }
                            hide && me.hide();
                            break;
                        case 1:
                            group.to.show();
                            break;
                        case 2:
                            group.yesno.text("捨てる？");
                            group.yesno.show();
                            break;
                        case 3:
                            me.hide();
                    }
                } else if (sender.name == "yesno") {
                    //今のところDropだけなので
                    me.player.dropItem(_item.uid, _item.count);
                    me.setup();
                    group.cmd.hide();
                } else if (sender.name == "to") {
                    var hide = false,
                        to = world.party[sender.selectedIndex()];
                    switch (_command) {
                        case 0:
                            hide = me.onUse && me.onUse(me, to, _item, _itemPos) || true;
                            break;
                        case 1:
                            world.trade(me.player, to, _item);
                            me.update();
                            break;
                    }
                    hide && me.hide();
                }
            }
            this._group.onLeave = function (group, sender) {
            }
        }, {
            onUse: null,
            _selectChanged: function (sender, pos) {
                sender.menuItems[pos].setSubItem(sender.itemCmdBox);
            },
            player: null,
            disableNotUse: false,
            setup: function (player) {
                player = (player instanceof DQ.RPG.Creature) ? player : this.player;
                this.player = player;

                var it = [],
                //names = ["つかうもの", "だいじなもの"],
                ct = world.items.catalog;
                for (var i = 0; i < player.items.length; i++) {
                    var itemInfo = player.items[i],
                    item = ct[itemInfo.uid];

                    if (item) {
                        it.push({
                            text: ['<span class="name">', item.text, '</span><span class="count">', itemInfo.count, '</span>'].join(''),
                            orgPos: i,
                            enabled: item.canUse()
                        });
                    }
                }

                this._group.item.setData(it);
                var member = [];
                for (var i = 0; i < world.party.length; i++) {
                    member.push({ text: world.party[i].name, enabled: world.party[i] != this.player });
                }
                this._group.to.setData(member);

                //交換はパーティーが複数の時だけ
                this._group.cmd.menuItems[1].enabled(world.party.length > 1);
            },
            show: function (player) {
                __dqsuper__(this, "show", arguments);

                this.setup(player);

                this._group.item.show();
                this._group.cmd.hide();
                this._group.to.hide();
            },
            hide: function () {
                if (!this._visible) {
                    return;
                }
                __dqsuper__(this, "hide", arguments);
                this._group && this._group.hide();
            },
            update: function () {
                this.setup();
            }
        });
    });



    DQ.RPG.BEMonsterBox = function (screen, monsters, options) {
        /// <summary>
        /// 戦闘時のモンスターを表示するWindowを管理します。
        /// </summary>
        /// <param name="monsters" type="DQ.Party">
        ///     表示するモンスターの格納されたDQ.Partyを表示
        /// </param>
        /// <param name="background" type="string">
        ///     StateBoxの幅を指定
        /// </param>

        var pname = world.project && world.project.name + "/" || "",
        _option = function (options) {
            options = options || {};
            options.background = pname + (options.background || "images/bg_1.png");
            options.width = options.width || 528;
            options.height = options.height || 240;

            return options;
        }
        options = _option(options);

        this.screen = screen;
        this.monsters = monsters;
        this.width = options.width;
        this.height = options.height;
        this.top = screen.view.top;
        this.left = screen.view.left - 8;
        this.top += 64;
        this.image = $('<img>')
            .attr('src', options.background)
            .css({ 'width': this.width, 'height': this.height - 8 });

        this.client = $('<div>')
        .addClass('dq-monsterbox')
        .append(this.image);
        this.monsBox = $('<div>').addClass("dq-monster").appendTo(this.client);
        this.damage = $('<div>').addClass("dq-monster").appendTo(this.client);
        this.pname = world.project && world.project.name + "/" || "";
        this.magic = new DQ.Image(this.client, {
            aspect: false,
            width: 96,
            height: 96,
            imgWidth: 480,
            imgHeight: 96,
            src: this.pname + "images/magic_10001.png"
        });
        this.window = new DQ.Window(
            screen,
            this.client, {
                'cls': this.cls,
                'top': this.top,
                'left': this.left,
                'width': this.width,
                'height': this.height
            }
        );
        this.window.text('');
        this.pname = world.project && world.project.name + "/" || "";

        this.damage.append($('<img>').attr('src', this.pname + "mon/atack.png")).hide();
        this.damage.css({ 'top': 100, 'left': 216 });
        this.magic.obj.css({ 'top': 64, 'left': 192 });
        this.magic.hide();

    }

    DQ.RPG.BEMonsterBox.prototype = {
        setBackground: function (name) {
            this.image.attr('src', this.pname + name);
        },
        setup: function (monss, callback) {
            this.monsBox.text('');
            if (this.monsImages) {
                for (var i = 0; i < this.monsImages.length; i++) {
                    this.monsImages[i].dispose();
                }
            }
            this.monsImages = [];

            var me = this, count = 0, width = 0, height = 0, total = 0;
            function image_loaded(sender) {
                count++;

                width += sender.width();
                height = Math.max(height, sender.height());

                if (count == total) {
                    world.screen.ly.dispose();
                    me.window.bringToFront(900);
                    me.window.obj.slideDown('slow', callback);
                    var top = Math.floor(120 - height / 2);
                    var left = Math.floor(248 - width / 2);
                    me.monsBox.css({ 'top': top, 'left': left });
                }
            }
            function image_error(sender) {
                throw new Error("Image not found.");
            }
            total = monss.length;
            for (var i = 0; i < monss.length; i++) {
                var mons = this.monsters.find(monss[i]._origin.title);
                var img = new DQ.Image(this.monsBox, {
                    cls: "",
                    src: mons.image,
                    onLoaded: image_loaded,
                    onError: image_error
                });
                this.monsImages.push(img);
                monss[i].img = img;
            }
        },
        show: function (callback) {
            this.window.bringToFront(900);
            this.window.obj.slideDown('slow', callback);
        },
        hide: function () {
            this.window.hide();
        },
        attack: function () {

        },
        fire: function (callback) {
            var me = this;
            this.magic.show().animate({ count: 5, height: 96 });
            me.monsBox.css('margin-left', -10);
            setTimeout(function () {
                me.monsBox.css('margin-left', +10);
                setTimeout(function () {
                    me.monsBox.css('margin-left', 0);
                }, 15.625);
            }, 15.625);
        },
        shake: function (callback) {
            var me = this;
            this.damage.slideDown("fast", function () {
                me.damage.hide();
            });
            var me = this;
            me.monsBox.css('margin-left', -10);
            setTimeout(function () {
                me.monsBox.css('margin-left', +10);
                setTimeout(function () {
                    me.monsBox.css('margin-left', 0);
                }, 15.625);
            }, 15.625);
        },
        update: function () {
        }
    }

    DQ.RPG.BEVisual = function (engine) {
        /// <summary>
        /// 戦闘画面の画面を表示を担当
        /// </summary>
        /// <param name="engine" type="DQ.RPG.BEngine">
        ///     戦闘処理エンジンを指定
        /// </param>

        this._engine = engine;

        //メッセージボックス
        this.messageBox = new DQ.MessageBox(engine.screen, {
            width: '30em',
            height: '4.5em',
            clickImage: '../images/click.gif',
            left: 0,
            top: 302,
            autoClose: false,
            enterKy: 86
        });

        //書割
        this.monsterBox = new DQ.RPG.BEMonsterBox(engine.screen, engine.monsters);

        //コマンド
        this.nameBox = new DQ.StateBox(engine.screen, {
            width: '6em',
            height: '1em',
            left: 16,
            top: 290,
            showName: false,
            canSelect: false
        });
        this.charaBox = new DQ.StateBox(engine.screen, {
            width: '6em',
            height: '3em',
            left: 16,
            top: 332,
            showName: false,
            canSelect: true
        });
        this.chara = new DQ.Chara(this.charaBox, {
            delta: 2 * DQ.QUORITY,
            xoffset: 32,
            yoffset: world.project.charaHeight || 48,
            top: 0,
            left: 32
        });
        this.commandBox = new DQ.StateBox(engine.screen, {
            width: '8em',
            height: '3em',
            left: 112,
            top: 332,
            showName: false,
            canCancel: false,
            canSelect: true
        });
        var me = this;
        this.commandBox.onVisibleChanged = function (sender, state) {
            if (!state) {
                // setTimeout(function () { sender.show(); me.enemyBox.show(); }, 0);
            }
        }
        var data = [
            { text: _("Attack") },
            { text: _("Tool"), enabled: true },
            { text: _("Magic"), enabled: true },
            { text: _("Defence"), enabled: true },
            { text: _("Escape"), enabled: true}];
        if (world.party.length > 1) {
            data.push({ text: _("Cancel"), enabled: false });
        }
        this.commandBox.setData(data, 2);
        this.commandBox.text("");

        //攻撃対象選択
        this.enemyBox = new DQ.StateBox(engine.screen, {
            width: '15em',
            height: '3em',
            cls: 'dq-ebox',
            left: 188 + 48,
            top: 332,
            showName: false,
            canSelect: true,
            cancelNotHide: true
        });
        this.enemyBox.text("");

        //"Attack"を選択したら敵選択
        this.commandBox.menuItems[0].setSubItem(this.enemyBox);

        //道具一覧
        this.itemBox = new DQ.RPG.BEItemBox(engine.screen, {
            width: '16em',
            height: '13em',
            left: DQ.L2,
            top: DQ.T1,
            showName: false,
            canSelect: true
        });

        //"Item"を選択したら、道具選択
        this.commandBox.menuItems[1].setSubItem(this.itemBox);

        this.magicBox = new DQ.RPG.BEMagicBox(engine.screen, {
            width: '9em',
            height: '10em',
            left: DQ.L2 + 8,
            top: DQ.T1,
            showName: false,
            canSelect: true
        });

        this.itemBox.hide();
        this.magicBox.hide();

        //"Magic"を選択したら、魔法選択
        this.commandBox.menuItems[2].setSubItem(this.magicBox);

        this.levelBox = null;
    }

    DQ.RPG.BEVisual.prototype = {
        _setupEbox: function (list) {
            /// <summary>
            /// 対象を選択する
            /// </summary>

            var data = [];
            for (var i = 0; i < list.length; i++) {
                data.push({ enabled: list[i].count > 0,
                    text: [
                '<span class="name">', list[i].name,
                '</span><span class="bar">－</span><span class="count">', list[i].count, '匹</span>'].join('')
                });
            }
            this.enemyBox.setData(data);
        },
        setupStateBox: function (pos) {
            this.magicBox.player = this._engine.party[pos];
            this.itemBox.player = this._engine.party[pos];

            this.commandBox.setData([
            { text: _("Attack") },
            { text: _("Tool"), enabled: this._engine.party[pos].items.length },
            { text: _("Magic"), enabled: this._engine.party[pos].magicIDs.length },
            { text: _("Defence"), enabled: true },
            { text: _("Escape"), enabled: true}], 2);
        },
        update: function (enemyGroup) {
            this._setupEbox(enemyGroup);
            for (var i = 0; i < this._enemy.length; i++) {
                var enemy = this._enemy[i];
                if (enemy.escaped || enemy.isDead()) {
                    debug.writeln(DQ.format("{0}:{1}[{2}, {3}]", i, enemy.name(), enemy.escaped, enemy.isDead()));
                    enemy.img.client.slideDown('slow', $.proxy(enemy.img.hide, enemy.img));
                }
            }
        },
        setup: function (enemy, enemyGroup, levelBox, extMsg) {
            /// <summary>
            /// 戦闘画面を準備、表示します。
            /// まだ、一対一のみにしか対応せず
            /// </summary>

            var me = this;

            //プレイヤーのステータス表示画面を引継ぎます。
            this.levelBox = levelBox;

            //背景と敵のビジュアルを表示
            var tp = world.getTopographyType(this._engine.chip);
            this.monsterBox.setBackground("images/bg_" + tp + ".jpg");
            this.monsterBox.setup(enemy, function () {
                me.monsterBox.show(_monsterBox_show);
            });

            //対戦相手を敵の選択boxへ設定
            this._enemy = enemy;
            this._setupEbox(enemyGroup);

            //アイテムや魔法の選択肢の元となるプレーヤーを設定
            this.setupStateBox(0);
            this.commandBox.onClick = function _bevisual$commandSelect(sender) {
                switch (sender.selectedIndex()) {
                    case 0:
                        me.enemyBox.enabled(true);
                        me._setupEbox(enemyGroup);
                        me.enemyBox.select();
                        break;
                    case 1:
                        me.itemBox.show(me._engine.getCurrentPlayer());
                        break;
                    case 2:
                        me.magicBox.show(me._engine.getCurrentPlayer());
                        break;
                    default:
                        var command = new DQ.RPG.BEngine.Commands[sender.selectedIndex()]();
                        command.from = me._engine.getCurrentPlayer();
                        command.to = me._engine.getCurrentPlayer();
                        me._engine.setCommand(command.from, command);
                        break;
                }
            }

            function _monsterBox_show() {
                me.showMessageBox({ autoClose: true, autoScroll: true, waitLastClick: false });
                //エンカウントした事を説明するメッセージを表示
                var msg = [];
                for (var i = 0; i < enemyGroup.length; i++) {
                    var e = world.monsters.find(enemyGroup[i].name);
                    msg.push(DQ.format("{0} が現れた。", e.text));
                }
                var msgs = [];
                msgs.push(msg.join('\n'));
                extMsg && msgs.concat(extMsg);
                me.messageBox.push(msgs);
                //レベル表示Boxを表示
                me.levelBox.show();

                //メッセージを表示
                me.messageBox.show();
                me.messageBox.autoScroll = false;
                me.messageBox.bringToFront();
                me.messageBox.autoClose = true;
                me.messageBox.waitLastClick = true;

                //メッセージボックス表示完了
                me.messageBox.onVisibleChanged = function () {
                    DQ.RPG.BEngine.StateMachine[me._engine.mode].visibleChange(me._engine);
                }
            }

            var _mPos;
            this.magicBox.onChant = function _magicBox_chant(sender, from, to, id, pos) {
                var magic = world.magics.catalog[id];
                if (magic.MP > from.mp()) {
                    me.messageBox.push("MPが足りません");
                    me.messageBox.autoClose = true;
                    me.messageBox.show();
                    me.messageBox.onVisibleChanged = null;

                    return false;
                }
                var command = new DQ.RPG.BEngine.Commands[me.commandBox.selectedIndex()]();
                command.from = from;
                if (to == null) {
                    _mPos = pos;
                    me.enemyBox.onClick = enemySelect;
                    sender._group.magic.menuItems[pos].setSubItem(me.enemyBox);
                    me.enemyBox.show(true);
                    return false;
                } else {
                    command.to = to;
                }
                command.by = magic;

                me._engine.setCommand(command.from, command);

                return true;
            }

            this.itemBox.onUse = function (sender, from, to, itemInfo, pos) {
                var id = itemInfo.uid;
                var item = world.items.catalog[id];
                var command = new DQ.RPG.BEngine.Commands[me.commandBox.selectedIndex()]();
                command.from = from;
                command.from = to;
                command.by = item;

                if (to == null) {
                    me.enemyBox.onClick = enemySelect;
                    sender.menus[sender.selectedIndex()].setSubMenu(me.enemyBox);
                    me.enemyBox.show(true);
                    return false;
                } else {
                    command.to = from;
                    me._engine.setCommand(command.from, command);
                }

                return true;
            }

            var enemySelect = this.enemyBox.onClick = function _bevisual$enemySelect(sender) {
                /// <summary>
                /// 対象選択完了
                /// </summary>
                sender.enabled(false);
                me.commandBox.menuItems[0].setSubItem(me.enemyBox);

                var id,
                    pos = sender.selectedIndex(),
                    command = new DQ.RPG.BEngine.Commands[me.commandBox.selectedIndex()]();

                command.from = me._engine.getCurrentPlayer();
                command.to = me._engine.enemy[pos];
                switch (me.commandBox.selectedIndex()) {
                    case 0:
                        var eqp = command.from.equipmentIDs(),
                            uid = eqp.weapon.uid == -1 ? 20000 : eqp.weapon.uid;
                        command.by = world.items.catalog[uid];
                        break;
                    case 1:
                        id = me.itemBox.player.items[me.itemBox.selectedIndex()];
                        command.by = world.items.catalog[id];
                        me.itemBox.hide();
                        break;
                    case 2:
                        id = command.from.magicIDs[_mPos];
                        command.by = world.magics.catalog[id];
                        me.magicBox.hide();
                }

                me._engine.setCommand(command.from, command);
            }

            this.enemyBox.onLeave = function () {
                if (me.commandBox.selectedIndex() == 1) {
                    me.itemBox.cmd.focus();
                }
            }
        },
        showMessageBox: function (options) {
            this.messageBox.autoClose = options.autoClose == null ? false : options.autoClose;
            this.messageBox.autoScroll = options.autoScroll == null ? false : options.autoScroll;
            this.messageBox.clear();
            this.messageBox.show();
            this.messageBox.bringToFront(999);
        },
        showCommand: function () {
            this.nameBox.setData([{ text: this._engine.party[0].name}]);
            this.nameBox.show(true);
            this.charaBox.show();
            this.chara.uid(this._engine.party[0].uid);
            this.chara.stand();
            this.chara.show();
            this.commandBox.show(true);
            this.enemyBox.enabled(false);
            this.enemyBox.show();
            this.commandBox.focus();
        },
        hideCommand: function () {
            this.nameBox.hide();
            this.charaBox.hide();
            this.commandBox.hide();
            this.enemyBox.hide();
        },
        effect: function (command, type, sucess, callback) {
            if (command instanceof DQ.RPG.Command.Attack) {
                if (sucess) {
                    var jingle = world.sounds.find('name', 'attack01');
                    if (command.from.friend != command.to.friend) {
                        var me = this;
                        if (!type || type == "shake") {
                            if (command.to.friend) {
                                me.shake();
                            } else {
                                me.monsterBox.shake();
                            }
                        }
                        jingle && world.playJingle2(jingle.src, false, callback);
                    }
                } else {
                    var jingle = world.sounds.find('name', 'attack02');
                    if (jingle) {
                        world.playJingle2(jingle.src, false, null, callback);
                    } else {
                        callback();
                    }
                }
            } else if (command instanceof DQ.RPG.Command.Escape) {
                var jingle = world.sounds.find('name', 'attack03');
                if (jingle) {
                    world.playJingle2(jingle.src, false, null, callback);
                } else {
                    callback();
                }
            } else if (command instanceof DQ.RPG.Command.Magic) {
                var name = "magic02";
                if (command.from.friend != command.to.friend) {
                    //攻撃
                    if (!type || type == "shake") {
                        if (command.to.friend) {
                            this.shake();
                            name = "magic01";
                            world.screen.flashEx("Red", 1, 15.625 * 2, 2, null);
                        } else {
                            name = "magic01";
                            this.monsterBox.fire();
                        }
                    }
                } else {
                    switch (command.by.effect) {
                        case 10001:
                            world.screen.flashEx("Blue", 1, 15.625 * 2, 3, null);
                            break;
                        case 10002:
                            world.screen.flashEx("Red", 1, 15.625 * 2, 2, null);
                            break;
                        case 10003:
                            world.screen.flashEx("White", 1, 15.625 * 2, 3, null);
                            break;
                        case 10004:
                            //ジャンプなど(今は用意していない)
                        default:
                    }
                }
                var jingle = world.sounds.find('name', name);
                if (jingle) {
                    world.playJingle2(jingle.src, false, callback);
                } else {
                    callback();
                }
            } else {
                callback();
            }
        },
        shake: function (callback) {
            /// <summary>
            /// 画面を揺らす効果
            /// </summary>
            this.messageBox.shake(callback);
        },
        hide: function () {
            this.hideCommand();
            this.monsterBox.hide();
            this.messageBox.onVisibleChanged = null;
        }

    }

    DQ.RPG.BE = DQ.RPG.BE || {};
});
