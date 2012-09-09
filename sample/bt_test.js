/// <reference path="../../js/jquery.js" />
/// <reference path="../../js/dq.js" />
/// <reference path="../../js/dq-core.js" />
/// <reference path="../../js/ui/dq-ui.js" />
/// <reference path="../../js/rpg/dq-rpg.js" />
/// <reference path="../../js/rpg/dq-battle.js" />
/// <reference path="../../js/rpg/dq-battle-visual.js" />

//DQ.lazyLoad(DQ.subdir + "rpg/dq-rpg.js", "DQ.RPG");
DQ.lazyLoad(DQ.subdir + "ui/dq-listbox.js", "DQ.UI.ListBox");
DQ.lazyLoad(DQ.subdir + "rpg/dq-battle-visual.js", "DQ.RPG.BEMonsterBox");
DQ.lazyLoad(DQ.subdir + "rpg/dq-battle.js", "DQ.RPG.BEEnd");
DQ.afterLoad(function () {

    extention();

    world = new DQ.World();

    world.level = 20;
    world.mons_pos = 3;
    var dat = [];
    dat.push({ id: 1, name: "1" });
    dat.push({ id: 2, name: "2" });
    dat.push({ id: 3, name: "3" });
    dat.push({ id: 4, name: "4" });
    dat.push({ id: 5, name: "5" });
    dat.push({ id: 6, name: "6" });
    dat.push({ id: 10, name: "10" });
    dat.push({ id: 15, name: "15" });
    dat.push({ id: 20, name: "20" });
    dat.push({ id: 29, name: "29" });

    var mdat = [];
    mdat.push({ uid: 10001, name: "スライム" });
    mdat.push({ uid: 10002, name: "スライムベス" });
    mdat.push({ uid: 10003, name: "ドラキー" });
    mdat.push({ uid: 10013, name: "まどうし" });
    mdat.push({ uid: 10016, name: "しりょう" });
    mdat.push({ uid: 10017, name: "メタルスライム" });
    mdat.push({ uid: 10019, name: "リカントマムル" });
    mdat.push({ uid: 10040, name: "竜王変身後" });

    //画面のコントロールを作成
    lbox = new DQ.UI.ComboBox(DQ.page(), {}, 'lbox1');
    lbox.dataSource(dat);
    lbox.valueMember("id");
    lbox.displayMember("name");
    lbox.onSelectedIndexChanged = function (sender) {
        try {
            world.party = [];
            world.level = parseInt(sender.selectedValue());
            player = create_player(world.level);
            world.party.push(player);
            //world.party.push(create_player(world.level + 1));
            //world.party.push(create_player(world.level + 2));
            //world.party.push(create_player(world.level + 3));
            setTimeout(function () {
                world.levleBox.party(world.party);
            }, 0);
        } catch (e) {
            alert(e);
        }
    }

    mbox = new DQ.UI.ComboBox(DQ.page(), {}, 'mbox1');
    mbox.dataSource(mdat);
    mbox.valueMember("uid");
    mbox.displayMember("name");
    mbox.onSelectedIndexChanged = function (sender) {
        world.mons_pos = sender.selectedIndex();
        $('#desc').text(world.monsters.find("uid", mbox.selectedValue()).description);
    }


    //スクリーンを作成
    var sc = world.screen = new DQ.Screen(DQ.page(), 512, 416, 'view');


    //カタログ読み込み
    //レベルカタログ
    function callback() {
        player = create_player(world.level);
        world.party.push(player);
        world.levleBox = new DQ.RPG.LevelBox(sc, {
            player: player,
            party: world.party,
            width: '7em',
            height: 'auto',
            left: 16,
            top: 16
        });
        DQ.chain.push(world.levleBox);

        setTimeout(function () {
            lbox.selectedIndex(6);
            mbox.selectedIndex(3);

            var set = [],
                        catalog = world.sounds.catalog.data || world.sounds.catalog.catalog;
            for (var i = 0; i < catalog.length; i++) {
                var s = catalog[i];
                if (s.jingle) {
                    s.src.name = s.name;
                    set.push(s.src);
                }
            }
            world.soundBox().addRange(set);
        }, 0);
    };

    //カタログ（プロジェクト)ロード
    project = world.project = new DQ.RPG.Project({
        callback: callback
    });
    project.load();

    var party = world.party = new DQ.RPG.Party(); //プレイヤー側パーティ
    var enemy = world.enemy = new DQ.RPG.Party(); //対戦相手のパーティ

    //簡易ステータス表示
    var lvbox = world.levleBox = null;

    //戦闘システム作成
    window.engine = new DQ.RPG.BEngine(sc, world.monsters);

    //インターバルタイマー開始
    DQ.chain.push(engine);
    DQ.fps(16);
    DQ.start();
    //$('#st_btn').removeAttr('disable');
});

var getStatus = function (player) {
    return [
                { text: ['<span class="dq-sts-label">', 'ちから', '：</span><span  class="dq-sts-value">', player.getState('STR'), '</span>'].join('') },
                { text: ['<span class="dq-sts-label">', 'たいりょく', '：</span><span  class="dq-sts-value">', player.getState('VIT'), '</span>'].join('') },
                { text: ['<span class="dq-sts-label">', 'すばやさ', '：</span><span  class="dq-sts-value">', player.getState('AGI'), '</span>'].join('') },
                { text: ['<span class="dq-sts-label">', 'きようさ', '：</span><span  class="dq-sts-value">', player.getState('DEX'), '</span>'].join('') },
                { text: ['<span class="dq-sts-label">', 'かしこさ', '：</span><span  class="dq-sts-value">', player.getState('WIS'), '</span>'].join('') },
                { text: ['<span class="dq-sts-label">', 'ちえ', '：</span><span  class="dq-sts-value">', player.getState('INT'), '</span>'].join('') },
                { text: ['<span class="dq-sts-label">', 'かっこよさ', '：</span><span  class="dq-sts-value">', player.getState('CHA'), '</span>'].join('') },
                { text: ['<span class="dq-sts-label">', 'つよさ', '：</span><span  class="dq-sts-value">', player.getAttack(), '</span>'].join('') },
                { text: ['<span class="dq-sts-label">', 'まもり', '：</span><span  class="dq-sts-value">', player.getDefence(), '</span>'].join('') }
            ];
};

function start_fight() {
    try {
        var sel_mons = [
            { name: "スライム", count: 1 },
            { name: "スライムベス", count: 1 },
            { name: "ドラキー", count: 1 },
            { name: "まどうし", count: 1 },
            { name: "しりょう", count: 1 },
            { name: "メタルスライム", count: 1 },
            { name: "リカントマムル", count: 1 },
            { name: "竜王変身後", count: 1 },
            { name: "スライム", count: 1}];

        //
        var mons = [sel_mons[world.mons_pos], sel_mons[world.mons_pos+1]];

        //戦闘開始
        var sound = world.sounds.find("name", "battle2");
        setTimeout(function () {
            sound && world.playSound(sound.src);
        }, 0);

        var getCurrent = function (player) {
            var eq = [],
            eqps = player.getEquipmentString();
            eq.push({ 'text': ['<span class="dq-exp-label">' + _('Weapon') + '：</span><span class="dq-exp-value">', eqps[2], '</span>'].join('') });
            eq.push({ 'text': ['<span class="dq-exp-label">' + _('Armor') + '：</span><span class="dq-exp-value">', eqps[1], '</span>'].join('') });
            eq.push({ 'text': ['<span class="dq-exp-label">' + _('Shield') + '：</span><span class="dq-exp-value">', eqps[5], '</span>'].join('') });
            eq.push({ 'text': ['<span class="dq-exp-label">' + _('Accesary') + '：</span><span class="dq-exp-value">', eqps[6], '</span>'].join('') });

            return eq;
        };

        var stBox = new DQ.StateBox(world.screen, {
            cls: "dq-sts-box",
            left: '16em',
            top: '0em',
            width: '8em',
            canSelect: false,
            cancelNotHide: true,
            text: world.party[0].name
        }),
    enBox = new DQ.StateBox(world.screen, {
        cls: "dq-sts-box",
        left: '24em',
        top: '0em',
        width: '8em',
        canSelect: false,
        cancelNotHide: true,
        text: mons[0].name
    }),
    eqBox = new DQ.StateBox(world.screen, {
        left: '0em',
        top: '12em',
        width: '11em',
        canSelect: false,
        showName: true,
        text: "現在の装備"
    });

        stBox.setData(getStatus(world.party[0]));
        stBox.show();
        var mo = world.monsters.create(mons[0].name);
        enBox.setData(getStatus(mo));
        enBox.show();
        eqBox.setData(getCurrent(world.party[0]));
        eqBox.show();
        //$('#st_btn').attr('disabled', 'disabled');
        lbox.enabled(false);
        mbox.enabled(false);
        if (world.party[0].isDead()) {
            world.level = lbox.selectedValue();
            player = create_player(world.level);
            world.party = [];
            world.party.push(player);
            setTimeout(function () {
                world.levleBox.party(world.party);
            }, 0);
        }
        engine.setup(world.party, mons, world.levleBox, function (engine, state) {
            if (state == DQ.RPG.BEngine.State.BattleEnd) {
                //$('#st_btn').removeAttr('disable');
                lbox.enabled(true);
                mbox.enabled(true);
                stBox.hide();
                stBox.dispose();
                enBox.hide();
                enBox.dispose();
                eqBox.hide();
                eqBox.dispose();

                world._bgSound.pause();

                var reward = world.getReward(this.enemy);
                var msg = [];

                if (engine.party.length == 0) {
                    msg.push(DQ.format("{0} は、逃げ出した。", world.party[0].name));
                } else {
                    msg.push(DQ.format("敵をやっつけた。"));
                    world.shareReward(world.party, reward, msg);
                    //レベル判定
                    world.levelUp(world.party, msg);
                }

                if (msg.length) {
                    engine.visual.messageBox.push(msg);
                    engine.visual.messageBox.show();
                }
            }
        });
    }
    catch (e) {
        alert(e);
    }
}

function extention() {
    //何たら用スペシャル実装
    DQ.RPG.State.Roto = function (owner) {
        this.owner = owner;
    }
    DQ.RPG.State.Roto.prototype = {
        isExpire: function () {
            return false;
        },
        canAction: function () {
            return true;
        },
        enter: function () {
        },
        leave: function () {
        },
        update: function () {
        },
        isAvoid: function (type, reason) {
            if (type == DQ.RPG.DamageProperty.Swamp) {
                return true;
            }

            return false;
        },
        gainDamage: function (type, damage) {
            switch (type) {
                case DQ.RPG.DamageProperty.Magic:
                case DQ.RPG.DamageProperty.Fire:
                    return Math.floor(damage * 2 / 3) + 1;
                case DQ.RPG.DamageProperty.Swamp:
                    return 0;
            }
            return damage;
        }
    }
    DQ.RPG.State.table.push({ type: null, uid: 10009, strategy: DQ.RPG.State.Roto });

    //ロトの鎧
    DQ.RPG.Item.Roto = dqextend(DQ.RPG.ItemStg, function (owner) {
        this.base(owner);
    }, {
        equip: function (to) {
            to.temporary.push(new DQ.RPG.State(world.statuses.find("uid", 10009)));
        },
        remove: function (from) {
            for (var i = 0; i < from.temporary.length; i++) {
                if (from.temporary[i].uid == 10009) {
                    from.temporary.remove(i);
                    break;
                }
            }
        }
    });
    DQ.RPG.Item.table.push({ type: null, uid: 30007, strategy: DQ.RPG.Item.Roto });
}
function create_player(level) {
    if (!world.levels.catalog) {
        return;
    }
    var player = new DQ.RPG.Player("ななし-" + level, world.levels.find('uid', 10001).levels[level - 1]);
    player.G = 32767;
    player.uid = world.party.length + 10001;
    var items = [
                { uid: 10001, count: 1 },
                { uid: 10002, count: 1 },
                { uid: 10003, count: 1 },
                { uid: 10004, count: 1 },
                { uid: 10005, count: 1 },
                { uid: 10006, count: 1 },
                { uid: 10007, count: 1 },
                { uid: 20001, count: 1 },
                { uid: 30001, count: 1 }
            ];
    for (var i = 0; i < items.length; i++) {
        player.items.push(items[i]);
    }
    if (world.level >= 20) {
        player.setEquipments([-1, 30007, 20007, -1, -1, 40003, 50001]);
    } else {
        player.setEquipments([-1, 30001, 20001, -1, -1, -1, -1]);
    }

    return player;
}
