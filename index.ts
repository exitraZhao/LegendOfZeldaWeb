
import Sprite = Phaser.Sprite;
var width = 800;
var height = 600;
var player;
var cursors;
var directIndicator = 3;
var attackEmitter;
var hurlSpeed = 300;
var isLinkSightLock = 0;
var swords: Array<Sprite> = [];
// var preSword:Sprite;

class AttackEmitter {
    owner:Sprite;
    sword:Sprite;
    constructor(owner:Sprite){
        this.owner = owner;
    }
    hurl() {
        // alert('link made a attack!');

        this.sword = this.owner.game.add.sprite(this.owner.x,this.owner.y,'sword');
        // preSword = sword;
        // sword = this.sword;
        this.owner.game.physics.arcade.enable(this.sword);
        this.sword.body.bounce.y = 0.2;
        this.sword.body.collideWorldBounds = true;
        if (directIndicator == 1)
        {
            this.sword.frame = 3;
            this.sword.body.velocity.x = -hurlSpeed;
        }
        else if (directIndicator == 2)
        {
            this.sword.frame = 0;
            this.sword.body.velocity.y = -hurlSpeed;
        }
        else if (directIndicator == 3)
        {
            this.sword.frame = 1;
            this.sword.body.velocity.y = hurlSpeed;
        }
        else if (directIndicator == 4)
        {
            this.sword.frame = 2;
            this.sword.body.velocity.x = hurlSpeed;
        }
        else
        {
            player.frame = 0;
        }


        swords.push(this.sword);

    }
}

// 创建游戏实例
var game = new Phaser.Game(800, 600, Phaser.AUTO, '#game', { preload: preload, create: create, update: update });

function layoutHeart(){
    var heartNum = player.health;
    for(let i = 0; i < player.maxHealth; i++){
        var heart = game.add.sprite(game.world.x + 10 + i*20, game.world.y + 15,'heart');
        if(i < heartNum)
        {
            heart.frame = 0;
        }
        else
        {
            heart.frame = 4;
        }
    }

    console.log(i)

}

function preload() {
    // 设置背景为黑色
    game.stage.backgroundColor = '#000000';
    // 加载游戏资源
    game.load.spritesheet('link', 'resource/img/linkSheet.png', 32, 32);
    game.load.audio('bgMusic', 'resource/music/MenuSelect.mp3');
    game.load.image('bgImage','resource/img/masterSword.png');
    game.load.spritesheet('sword','resource/img/sword.png',32, 32);
    game.load.spritesheet('heart','resource/img/heart.png',22, 16);
}

function create() {
    // // 添加背景
    // var bg = game.add.image(0, 0, 'bgImage');
    // bg.width = game.world.width;
    // bg.height = game.world.height;
    // var bgMusic = game.add.audio('bgMusic');
    // bgMusic.loopFull();
    // // 添加标题
    // var title = game.add.text(game.world.centerX, game.world.height*0.40, 'Legend of Zelda', {
    //     fontSize: '40px',
    //     fontWeight: 'bold',
    //     fill: '#f2eedc'
    // });
    // title.anchor.setTo(0.5, 0.5);
    // // 添加提示
    // var remind = game.add.text(game.world.centerX, game.world.height*0.75, 'press to start', {
    //     fontSize: '20px',
    //     fill: '#ebf2ed'
    // });
    // remind.anchor.setTo(0.5, 0.5);

    game.stage.backgroundColor = '#f2eb97';

    player = game.add.sprite(game.world.centerX, game.world.height*0.40,'link');
    attackEmitter = new AttackEmitter(player);
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;

    // game.input.onTap.add(function() {
    //     game.state.start('play');
    // });
    player.maxHealth = 10;
    player.health = player.maxHealth;
    layoutHeart();
    player.animations.add('back', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 8, true);
    player.animations.add('left', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8, true);
    player.animations.add('forward',[20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 8, true);
    player.animations.add('right',[30, 31, 32, 33, 34, 35, 36, 37, 38, 39], 8, true);

    this.game.input.keyboard.onDownCallback = function(e) {
        if(e.keyCode == 32){
            attackEmitter.hurl();
        }
        else if(e.keyCode == 88){
            isLinkSightLock = 1;
        }
    }
    this.game.input.keyboard.onUpCallback = function (e) {
        if(e.keyCode == 88){
            isLinkSightLock = 0;
        }
    }
}

function update() {
    if(swords){
        game.physics.arcade.collide(swords,swords);
        game.physics.arcade.collide(player,swords);
    }

    cursors = game.input.keyboard.createCursorKeys();
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    function animationFollowDirection(){
        if (directIndicator == 1)
        {
            player.animations.play('left');
        }
        else if (directIndicator == 2)
        {
            player.animations.play('forward');
        }
        else if (directIndicator == 3)
        {
            player.animations.play('back');
        }
        else if (directIndicator == 4)
        {
            player.animations.play('right');
        }
        else
        {
            player.animations.play('back');
        }
    }
    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;
        player.body.velocity.y = 0;

        if (isLinkSightLock)
        {

        }
        else {
            directIndicator = 1;
        }
        animationFollowDirection();
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
        player.body.velocity.y = -150;
        player.body.velocity.x = 0;
        if (isLinkSightLock)
        {

        }
        else {
            directIndicator = 2;
        }
        animationFollowDirection();
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        player.body.velocity.y = 150;
        player.body.velocity.x = 0;

        if (isLinkSightLock)
        {

        }
        else {
            directIndicator = 3;
        }
        animationFollowDirection();
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;
        player.body.velocity.y = 0;

        if (isLinkSightLock)
        {

        }
        else {
            directIndicator = 4;
        }
        animationFollowDirection();
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (directIndicator == 1)
        {
            player.frame = 10;
        }
        else if (directIndicator == 2)
        {
            player.frame = 20;
        }
        else if (directIndicator == 3)
        {
            player.frame = 0;
        }
        else if (directIndicator == 4)
        {
            player.frame = 30;
        }
        else
        {
            player.frame = 0;
        }
    }


    //  Allow the player to jump if they are touching the ground.
    // if (cursors.up.isDown && player.body.touching.down && hitPlatform)
    // {
    //     player.body.velocity.y = -350;
    // }
}
// 定义场景



// 启动游戏
// game.state.start('preload');
