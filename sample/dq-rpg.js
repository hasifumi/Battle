/// <reference path="../jquery.js" />
/// <reference path="../dq.js" />
/// <reference path="../dq-core.js" />
/// <reference path="../ui/dq-ui.js" />
/// <reference path="dq-rpg-groupbox.js" />

/*
** DQ Retro game UI framework JavaScript library version v0.6.0
**
** Copyright (c) 2009-2010 M., Koji
** Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
**
** Date: 2010-04-01 17:34:21 -0900
** Revision: 0007
**
**/

DQ.L1 = 16;
DQ.L2 = 128;
DQ.LV2 = 142;
DQ.L3 = 288;
DQ.L4 = 304;
DQ.LV_LAZY = 3000;
DQ.OX = 8;
DQ.OY = 7;

DQ.T1 = 16;
DQ.T2 = 48;
DQ.T3 = 128;
DQ.T4 = 288;
DQ.T5 = 350;

DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-lang." + DQ._locale + ".js", "DQ.LOCALE['" + DQ._locale + "']");
DQ.lazyLoad(DQ.subdir + "dq-random.js", "DQ.Random");
DQ.lazyLoad(DQ.subdir + "rpg/dq-event.js", "DQ.Event");
DQ.lazyLoad(DQ.subdir + "rpg/dq-map.js", "DQ.Screen.Map");
DQ.lazyLoad(DQ.subdir + "rpg/dq-map-cvs.js", "DQ.Screen.MapByCanvas");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-chara.js", "DQ.Chara");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-player.js", "DQ.RPG.Player");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-magic.js", "DQ.RPG.Magic");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-item.js", "DQ.RPG.Item");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-groupbox.js", "DQ.RPG.EquipmentBox");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-attack.js", "DQ.RPG.Weapon");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-visual.js", "DQ.RPG.Visual");
DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg-api.js", "DQ.RPG.API");
DQ.lazyLoad(DQ.subdir + "rpg/dq-shop.js", "DQ.RPG.Shop");

DQ.lazyLoad(DQ.subdir + "dq-core.js", "DQ.Window", function () {

    if (window.console == undefined) {
        console = {}
        console.profile = function () {
        }
        console.profileEnd = function () {
        }
    }

    //++ RPG向けに追加
    DQ.World.prototype.party = null;
    DQ.World.prototype.dungeon = false;
    DQ.World.prototype.levelBox = null;

    //サブエンジン
    DQ.World.prototype.battle = null;
    DQ.World.prototype.shop = null;

    DQ.World.prototype.project = null;

    //カタログ
    DQ.World.prototype.events = null;
    DQ.World.prototype.items = null;
    DQ.World.prototype.levels = null;
    DQ.World.prototype.magics = null;
    DQ.World.prototype.maps = null;
    DQ.World.prototype.messages = null;
    DQ.World.prototype.monsters = null;
    DQ.World.prototype.shops = null;
    DQ.World.prototype.sounds = null;
    DQ.World.prototype.statuses = null;

    DQ.RPG = DQ.RPG || {};
    DQ.RPG.DamageProperty = {
        Unknown: 0,
        Pysical: 1, Magic: 2, Fire: 3, Water: 4, Erth: 5, Wind: 6,
        Sander: 7,
        Light: 8,
        Dark: 9,
        Swamp: 10,
        Baria: 11
    }

    DQ.RPG.Project = function (options) {
        ///<summary>
        /// RPG用プロジェクトを作成
        ///</summary>

        options = DQ.options(options, {
            name: "default",
            url: null,
            callback: null,
            plane: false,
            npcHeight: 48,
            charaHeight: 48
        });

        this.onLoaded = options.callback;
        this.name = options.name;
        this.plane = options.plane;
        if (options.url) {
            for (var nm in options.url) {
                if (!options.url.isOwnProperty(nm)) {
                    continue;
                }

                this.url[nm] = options.url[nm];
            }
        }
    };

    DQ.RPG.Project.prototype = {
        plane: false,
        url: {
            events: "data/event.txt",
            messages: "data/message.ja.txt",
            levels: "data/level.txt",
            items: "data/item.txt",
            magics: "data/magic.txt",
            maps: "data/maps.txt",
            monsters: "data/monster.txt",
            monsterGroups: "data/monster_group.txt",
            shops: "data/shop.txt",
            statuses: "data/status.txt",
            sounds: "data/sound.txt"
        },
        onLoaded: null,
        load: function (url) {
            /// <summary>
            /// プロジェクトデーターを読み込みます。
            /// </summary>
            /// <param name="url" type="object">
            /// ロードするURLのリストを指定（option)
            /// </param>

            if (url) {
                for (var nm in url) {
                    if (!url.hasOwnProperty(nm)) {
                        continue;
                    }

                    this.url[nm] = url[nm];
                }
            }
            var count = 0,
                me = this, allSuccess = true;
            function callback(success) {
                if (!success) {
                    allSuccess = false;
                }
                count++;
                count == (11 + 1) && me.onLoaded && me.onLoaded(allSuccess);
            }

            var pre = "";
            if (this.name) {
                pre = this.name + "/";
            }
            var _project = new DQ.Catalog({ url: pre + 'data/project.txt', callback: function () {
                callback();
                for (var nm in _project.catalog.data[0]) {
                    me[nm] = _project.catalog.data[0][nm];
                }
            }
            });
            //イベント作成
            if (this.plane) {
                world.events = new DQ.Catalog({ url: pre + this.url.events, callback: callback });
            } else {
                world.events = new DQ.EventCatalog({ url: pre + this.url.events, callback: callback });
            }

            //モンスターカタログを作成
            if (this.plane) {
                world.monsters = new DQ.Catalog({ url: pre + this.url.monsters, callback: callback });
            } else {
                world.monsters = new DQ.RPG.MonsterCatalog({ url: pre + this.url.monsters, callback: callback });
            }

            //モンスターグループカタログを作成
            world.monsterGroups = new DQ.Catalog({ url: pre + this.url.monsterGroups, callback: callback });

            //魔法カタログ
            if (this.plane) {
                world.magics = new DQ.Catalog({ url: pre + this.url.magics, callback: callback });
            } else {
                world.magics = new DQ.RPG.MagicCatalog({ url: pre + this.url.magics, callback: callback });
            }

            //アイテムカタログ
            if (this.plane) {
                world.items = new DQ.Catalog({ url: pre + this.url.items, callback: callback });
            } else {
                world.items = new DQ.RPG.ItemCatalog({ url: pre + this.url.items, callback: callback });
            }

            //レベルカタログ
            world.levels = new DQ.Catalog({ url: pre + this.url.levels, callback: callback });

            //サウンドカタログ
            world.sounds = new DQ.Catalog({ url: pre + this.url.sounds, callback: callback });

            //お店カタログ
            if (this.plane) {
                world.shops = new DQ.Catalog({ url: pre + this.url.shops, callback: callback });
            } else {
                world.shops = new DQ.RPG.ShopInfoCatalog({ url: pre + this.url.shops, callback: callback });
            }

            //マップカタログ
            if (this.plane) {
                world.maps = new DQ.Catalog({ url: pre + this.url.maps, callback: callback });
            } else {
                world.maps = new DQ.MapCatalog({ url: pre + this.url.maps, callback: callback });
            }

            //メッセージカタログ
            world.messages = new DQ.Catalog({ url: pre + this.url.messages, callback: callback });

            //状態カタログ
            world.statuses = new DQ.Catalog({ url: pre + this.url.statuses, callback: callback });
        }
    }

    //--

    //
    //コマンド
    //
    DQ.World.prototype.showMessage = function (message, name, callback) {
        /// <summary>
        /// メッセージを表示する
        /// </summary>
        this.screen.showMessage(message, name, callback);
    }

    DQ.RPG.Party = dqextend(Array, function (base) {
        ///<summary>
        /// プレイヤーおよびモンスターのパーティを保有します。
        ///</summary>
        if (base) {
            for (var i = 0; i < base.length; i++) {
                this.push(base[i]);
            }
        }
        this.flag = [];
        for (var i = 0; i < 32; i++) {
            this.flag.push(false);
        }
        //隊列
        this._line = [];
        this.temporary = new DQ.Chain(this);
    },
    {
        temporary: null,
        G: 0,
        flag: [],
        _line: [],
        line: function (value) {
            if (!arguments.length) {
                if (this.length != this._line.length) {
                    for (var p = 0; p < this.length; p++) {
                        for (var i = 0; i < this._line.length; i++) {
                            if (this[p].name == this._line[i].name) {
                                break;
                            }
                        }
                        if (i == this._line.length) {
                            this._line.push(this[p]);
                        }
                    }
                }
                return this._line;
            }
            this._line = value;
        },
        friend: true,
        remove: function (object) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == object) {
                    this.splice(i, 1);
                    break;
                }
            }
        },
        eachFrom: function (command, from, exit) {
            if (!this.length) {
                return false;
            }
            var result = true;
            for (var i = 0; i < this.length; i++) {
                if (!from[command].apply(from, [this[i]])) {
                    result = false;
                    if (exit) {
                        return false;
                    }
                }
            }
            return result;
        },
        each: function (command, to, exit) {
            if (!this.length) {
                return false;
            }
            var result = true;
            if (typeof command == "function") {
                for (var i = 0; i < this.length; i++) {
                    if (!command.apply(this[i], [to])) {
                        result = false;
                        if (exit) {
                            return false;
                        }
                    }
                }
            } else {
                for (var i = 0; i < this.length; i++) {
                    if (!this[i][command].apply(this[i], [to])) {
                        result = false;
                        if (exit) {
                            return false;
                        }
                    }
                }
            }
            return result;
        },
        any: function (command, to) {
            if (!this.length) {
                return false;
            }
            if (typeof command == "function") {
                for (var i = 0; i < this.length; i++) {
                    if (command.apply(this[i], [to])) {
                        return true;
                    }
                }
            } else {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][command].apply(this[i], [to])) {
                        return true;
                    }
                }
            }
            return false;
        },
        totalDestruction: function () {
            ///<summary>
            /// 全員死亡したかどうかを判定します。
            ///</summary>
            return this.each(function () {
                return this.isDead();
            }, null, true);
        },
        totalDestructionForEnemy: function () {
            ///<summary>
            /// 全員死亡したかどうかを判定します。
            ///</summary>
            for (var i = 0; i < this.length; i++) {
                if (!this[i].isDead() && !this[i].escaped) {
                    return false;
                }
            }

            return true;
        },
        toArray: function () {
            var d = [];
            for (var i = 0; i < this.length; i++) {
                d.push(this[i]);
            }

            return d;
        },
        hasState: function (uid) {
            for (var i = 0; i < this.temporary.length; i++) {
                if (this.temporary[i].uid == uid) {
                    return true;
                }
            }
            return false;
        },
        update: function (reason) {
            /// <summary>
            /// 状態を更新します。
            /// </summary>

            //状態を更新
            var res = this.temporary.or("update", reason);

            //期限切れの状態は取り除く
            for (var i = this.temporary.length - 1; i >= 0; i--) {
                this.temporary[i].isExpire() && this.temporary.remove(i);
            }
            return res;
        }
    });

    DQ.RPG.Party.FlagPos = { Torch: 0, Holy: 1 };

    DQ.RPG.LevelBox = dqextend(DQ.StateBox, function (screen, options) {
        /// <summary>
        /// 簡易レベル表示ボックスを作成します。
        /// </summary>
        options = DQ.options(options, {
            cls: "dq-lv-box",
            showName: false,
            canselect: false,
            player: null,
            party: null,
            zIndex: 999
        });
        if (options.party == null) {
            throw new Error("DQ.RPG.LevelBox.constractor:: party is not specified.");
        }
        this.player = options.player;
        this.party(options.party);
        this.base(screen, options);
        this.zIndex = options.zIndex;
        this.setup();
    }, {
        dqid: "DQ.RPG.LevelBox",
        _party: null,
        party: function (value) {
            if (!arguments.length) {
                return this._party;
            }
            this._party = value;
            this.column = this._party == null ? 1 : this._party.length;
            this.setup();
            var me = this;
            setTimeout(function () {
                me.update();
            }, 0);
        },
        battle: false,
        _cd: 0,
        update: function () {
            this._cd++;
            if (this._cd < 2 || this._slideUp) {
                return;
            }
            this._cd = 0;
            if (this.status.length != world.party.length) {
                this.setup();
            }
            var me = this,
                toStringShort = function (player) {
                    return [
                    { displayName: _("HP"), 'text': '<span class="name">' + _("HP") + '</span><span class="value">' + player.hp() + '</span>' },
                    { displayName: _("MP"), 'text': '<span class="name">' + _("MP") + '</span><span class="value">' + player.mp() + '</span>' },
                    { displayName: _("LV"), 'text': '<span class="name">' + _("LV") + '</span><span class="value">' + player.LV + '</span>'}];
                },
            party_toStringShort = function (party) {
                var hp = [], mp = [], lv = [];
                for (var i = 0; i < party.length; i++) {
                    var deg = party[i].hp() * 100 / party[i].maxHP(),
                    color = deg == 0 ? "Red" : (deg < 10 ? "Orange" : (deg < 30 ? "Yellow" : "White"));
                    color = ' style="color: ' + color + '" ';

                    hp.push({ displayName: _("HP"), 'text': '<span class="name"' + color + '>' + _("HP") + '</span><span class="value"' + color + '>' + party[i].hp() + '</span>' });
                    mp.push({ displayName: _("MP"), 'text': '<span class="name"' + color + '>' + _("MP") + '</span><span class="value"' + color + '>' + party[i].mp() + '</span>' });
                    !me.battle && lv.push({ displayName: _("LV"), 'text': '<span class="name"' + color + '>' + _("LV") + '</span><span class="value"' + color + '>' + party[i].LV + '</span>' });
                }
                return hp.concat(mp, lv);
            },
            party_genName = function (party) {
                var name = [];
                name.push('<table class="dq-lv-title"><tbody><tr>');
                for (var i = 0; i < party.length; i++) {
                    name.push('<td>' + party[i].name + '</td>');
                }
                name.push('</tr></tbody></table>');
                return name.join('');
            }
            for (var i = 0; i < this._party.length; i++) {
                if (this._party[i].entryBattle) {
                    //continue;
                }
                var hasStatus = false;
                if (this._party[i].temporary.length) {
                    var t = this._party[i].temporary;
                    for (var j = 0; j < t.length; j++) {
                        if (!t[j].good) {
                            hasStatus = true;
                            this.status[i].text(t[j].name);
                        }
                    }
                }
                !hasStatus && this.status[i].text('');
            }
            this.width(7 * this._party.length + 'em');
            this.setData(party_toStringShort(this._party), this._party.length);
            this.text(party_genName(this._party));
        },
        setup: function () {
            if (this.status) {
                for (var i = 0; i < this.status.length; i++) {
                    this.status[i].remove();
                }
                $('.dq-lv-status', this.obj).remove();
            }
            this.status = [];
            var t_t = $('<table>').addClass('dq-lv-status').css('left', '8px').appendTo(this.obj);
            var t_b = $('<tbody>').appendTo(t_t);
            var t_r = $('<tr>').appendTo(t_b);
            for (var i = 0; i < this._party.length; i++) {
                this.status.push($('<td>').appendTo(t_r));

            }
        }
    });

    DQ.RPG.InputBox = dqextend(DQ.Window, function (parent, options) {
        /// <summary>
        /// 状態やコマンドを表示するWindowを作成します。
        /// </summary>
        /// <param name="parent" type="DQ.Control">
        ///     StateBoxのコンテナとなるscreenオブジェクトを指定
        /// </param>
        /// <param name="options" type="object">
        ///     メニューのオプションを指定
        /// </param>
        options = DQ.options(options, {
            top: parent.obj.height() / 2,
            left: parent.obj.width() / 2,
            cls: "",
            text: _("Player Name"),
            label: _("Enter your name"),
            width: '10em'
        });

        var me = this;

        this.top = options.top;
        this.left = options.left;
        this.cls = options.cls;
        this.data = [];

        var tg = $('<div>').addClass('dq-inputbox');
        this.base(parent, tg, { top: this.top, left: this.left, width: options.width, height: '7em', text: options.text });
        this.client = tg;

        $('<div>').addClass("text").appendTo(tg).text(options.label);
        this._input = $('<input>').attr({ tabIndex: "1", type: "text" }).appendTo(tg);

        var b = $('<button>').addClass("dq-button")
            .css({
                'border-width': '1px',
                'position': "static",
                'width': "4em",
                height: "2em",
                'margin-right': "1em",
                'text-align': "center",
                'margin-top': "5px",
                'float': "right"
            })
            .appendTo(tg).text(_("Done"));
        this._button = b; // new DQ.UI.Button(this, { text: _("Done"), tabIndex: 2, custom: true }, b);
        this.show();

        var me = this;
        this._button.bind('click', function inputBox$click(sender, e) {
            var res = true;
            me.onClick && (res = me.onClick(me, e));
            res && me.hide();
        });
        this._input.focus();
    }, {
        dqid: "DQ.RPG.InputBox",
        dispose: function () {
            this.client.remove();
        },
        onClick: null,
        value: function () {
            return this._input[0].value;
        }
    });

    DQ.RPG.MessageCatalog = function (options) {
        /// <summary>
        ///     メッセージのカタログを管理
        /// </summary>

        options = DQ.options(options, {
            url: "data/message.txt",
            callback: null
        });

        this.onLoaded = options.callback;
        this.url = options.url;
        arguments.length && this.load(this.url);
    }

    DQ.RPG.MessageCatalog.prototype = {
        catalog: [],
        onLoaded: function () { },
        load: function (url) {
            var me = this;
            DQ.loadCatalog(url, function (data) {
                try {
                    eval('var s=' + data);
                } catch (e) {
                    me.onLoaded && me.onLoaded(me, false);
                    throw new Error(DQ.format("DQ.RPG.MessageCatalog.load: format error.({0})", +e.message));
                }
                me._data = s.catalog || s.data;
                me.version = s.version;
                me.catalog = new Array();
                for (var i = 0; i < me._data.length; i++) {
                    me.catalog[me._data[i].uid] = me._data[i];
                }
                me.onLoaded && me.onLoaded.apply(me);
            });
        },
        find: function (uid) {
            var c = this.catalog;
            for (var nm in c) {
                if (c.hasOwnProperty(nm) && c[nm].uid == uid) {
                    return c[nm];
                }
            }
            return null;
        }
    }

    DQ.RPG.Icon = function () {
    }
    DQ.RPG.Icon.getBackground = function (x, y) {
        return "transparent URL(" + world.project.name + "/images/icon24.png) " + -24 * x + "px " + -24 * y + "px";
    }
});
