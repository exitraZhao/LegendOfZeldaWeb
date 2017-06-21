
import Sprite = Phaser.Sprite;
var width = 800;
var height = 600;
var player;
var jelly;
var cursors;
var directIndicator = 3;
var attackEmitter;
var hurlSpeed = 300;
var isLinkSightLock = 0;
var swords: Array<SpriteWithState> = [];
var jellys: Array<SpriteWithState> = [];
var jellysMoveSpeed = 40;
var animation_fires: Array<Sprite> = [];
var fire:Sprite;
var starTime = 30;
var standBackSpeed = 24;
var map;
var layer;
var isStab = false;
// var preSword:Sprite;
// 化学状态
enum chemicalStates {
    normal = 1,
    fireCarrying,
    electricCarrying,
    moistureCarrying,
    melting
}
// 化学动作
enum chemicalActions {
    normal = 1,
    burn,
    electric,
    water
}
// 化学材料
enum chemicalMaterial {
    wooden = 1,
    water,
    ice,
    stone
}
// 化学引擎
class ChemicalEngine {
    // 每个化学引擎包含许多状态机
    stateMachines: Array<StateMachine>;
    // 初始化状态机组
    constructor (){
        this.stateMachines = [];
    }
    // 注册状态机（创建Sprite时，将包含的状态机用此方法注册）
    registeStateMachine(stateMachineToReceive:StateMachine){
        this.stateMachines.push(stateMachineToReceive);
    }
    // 轮流检查所有状态机
    checkAllStateMachine(){
        for(let i = 0; i < this.stateMachines.length; i++){
            this.stateMachines[i].checkState();
        }
    }
}
// 全局化学引擎
const globalChemicalEngine = new ChemicalEngine();
// 状态机
class StateMachine {
    sprite:SpriteWithState;
    currentMaterial:chemicalMaterial;
    //当前状态
    currentState:chemicalStates;
    //当前收到的动作
    currentAction:chemicalActions;

    stateCountDown = 15;
    constructor(initState:chemicalStates,initMaterial:chemicalMaterial,sprite:SpriteWithState){
        this.currentState = initState;
        this.currentMaterial = initMaterial;
        this.sprite = sprite;
    }
    checkState(){
        // 状态随当前接收到的动作改变
        if (this.currentState == chemicalStates.normal){
            if (this.currentAction == chemicalActions.burn){
                if (this.currentMaterial == chemicalMaterial.wooden){
                    if (this.stateCountDown > 0){
                        this.stateCountDown -= 1;
                    }else{
                        this.stateChangeTo(chemicalStates.fireCarrying);
                    }

                }else if(this.currentMaterial == chemicalMaterial.ice){
                    this.stateChangeTo(chemicalStates.melting);
                }
            }
        }else if(this.currentState == chemicalStates.melting){
            this.sprite.meltingAnimation();
        }


    }
    //接受化学动作（重叠检查时调用）
    receiveAction(receivedAction:chemicalActions){
        this.currentAction = receivedAction;

    }
    //将状态改变为
    stateChangeTo(targetState:chemicalStates){
        switch (targetState) {
            case chemicalStates.fireCarrying:
               this.sprite.burningAnimation();
            case chemicalStates.melting:
                this.sprite.meltingAnimation();
        }
        this.currentState = targetState;
        // 状态改变后动作清除
        this.currentAction = chemicalActions.normal;
    }

}
// 附带状态机的精灵类
class SpriteWithState extends Sprite {
    stateMachine:StateMachine;
    fireToBeShown:Sprite;
    constructor(game:Phaser.Game,x:number,y:number,image:string,currentState:chemicalStates,material:chemicalMaterial){
        super(game,x,y,image);
        this.stateMachine = new StateMachine(currentState,material,this);
        globalChemicalEngine.registeStateMachine(this.stateMachine);
    }
    burningAnimation(){
        this.fireToBeShown = this.game.add.sprite(0,0,'fire');
        this.fireToBeShown.animations.add('burning',[0, 1, 2, 3], 12, true);
        this.fireToBeShown.animations.play('burning');
        animation_fires.push(this.fireToBeShown);
        this.addChild(this.fireToBeShown);
    }
    meltingAnimation(){
        this.height *= 0.95;
    }
    dead(){
        if (this.fireToBeShown){
            this.fireToBeShown.kill();
        }
    }
}
class AttackEmitter {
    owner:Sprite;
    sword:SpriteWithState;
    swordStab:SpriteWithState = null;
    constructor(owner:Sprite){
        this.owner = owner;
    }
    hurl() {
        // alert('link made a attack!');

        this.sword = this.owner.game.add.existing(new SpriteWithState(this.owner.game,this.owner.x,this.owner.y,'sword',chemicalStates.normal,chemicalMaterial.wooden));
        // this.sword.burningAnimation();
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
    stab(){
        if (this.swordStab != null){

        }else{

            this.swordStab = this.owner.game.add.existing(new SpriteWithState(this.owner.game,0,10,'sword',chemicalStates.normal,chemicalMaterial.wooden));
        }

        // this.sword.burningAnimation();
        this.owner.game.physics.arcade.enable(this.swordStab);
        // this.sword.body.bounce.y = 0.2;
        this.swordStab.body.collideWorldBounds = true;
        if (directIndicator == 1)
        {
            this.swordStab.frame = 3;
            this.owner.frame = 50;
        }
        else if (directIndicator == 2)
        {
            this.swordStab.frame = 0;
            this.owner.frame = 60;
        }
        else if (directIndicator == 3)
        {
            this.swordStab.frame = 1;
            this.owner.frame = 40;
        }
        else if (directIndicator == 4)
        {
            this.swordStab.frame = 2;
            this.owner.frame = 70;
        }
        else
        {
            player.frame = 0;
        }
        swords.push(this.swordStab);
        this.owner.addChild(this.swordStab);
    }
}

// 创建游戏实例
var game = new Phaser.Game(width, height, Phaser.AUTO, '#game', { preload: preload, create: create, update: update });

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
    game.load.spritesheet('fire','resource/img/fireBall.png',28,48);
    game.load.tilemap('desert', 'assets/tilemaps/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/tmw_desert_spacing.png');
    game.load.spritesheet('jelly','resource/img/jellyIce.png',32, 48);
}

function create() {

    game.stage.backgroundColor = '#f2eb97';

    // game.input.onTap.add(function() {
    //     game.state.start('play');
    // });

    // set map
    map = game.add.tilemap('desert');

    map.addTilesetImage('Desert', 'tiles');

    layer = map.createLayer('Ground');

    layer.resizeWorld();

    player = game.add.sprite(game.world.centerX, game.world.height*0.50,'link');

    //生成一个jelly
    for (let i = 0; i < 30; i++){
        jelly = game.add.existing(new SpriteWithState(game,game.world.centerX - productRandomNumber(-80,80), game.world.height*0.30 - productRandomNumber(-80,80),'jelly',chemicalStates.normal,chemicalMaterial.ice))
        jellys.push(jelly);
        game.physics.arcade.enable(jelly);
        jelly.body.collideWorldBounds = true;
        jelly.animations.add('move',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 8,true);
        jelly.animations.add('dead',[26,25,24,23,22,21,20,19,18,17,16], 8,true);
        jelly.health = 900;
    }
    //
    attackEmitter = new AttackEmitter(player);
    console.log(player);
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;


    game.camera.follow(player);

    game.input.onDown.add(fillTiles, this);
    // set map end
    player.maxHealth = 10;
    player.health = player.maxHealth;
    layoutHeart();
    player.animations.add('back', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 8, true);
    player.animations.add('left', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8, true);
    player.animations.add('forward',[20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 8, true);
    player.animations.add('right',[30, 31, 32, 33, 34, 35, 36, 37, 38, 39], 8, true);
    player.animations.add('backStab', [40, 41, 42, 43, 44, 45, 46, 47], 8, true);
    player.animations.add('leftStab', [50, 51, 52, 53, 54, 55, 56, 57], 8, true);
    player.animations.add('forwardStab',[60, 61, 62, 63, 64, 65, 66, 67], 8, true);
    player.animations.add('rightStab',[70, 71, 72, 73, 74, 75, 76, 77], 8, true);
    player.animations.add('hurt',[0,10,20,30],8,true);

    fire = game.add.sprite(game.world.centerX,game.world.centerY+30,'fire');
    fire.animations.add('burning',[0, 1, 2, 3], 12, true);
    fire.animations.play('burning');
    game.physics.arcade.enable(fire);

    this.game.input.keyboard.onDownCallback = function(e) {
        // alert(e.keyCode);
        if(e.keyCode == 32){
            attackEmitter.hurl();
        }
        else if(e.keyCode == 88){
            isLinkSightLock = 1;
        }
        else if(e.keyCode == 67){
            if(isStab){
                attackEmitter.swordStab.kill();
                attackEmitter.swordStab = null;
                isLinkSightLock = 0;
                isStab = false;
            }else{
                isLinkSightLock = 1;
                attackEmitter.stab();
                isStab = true;
            }
        }
    }
    this.game.input.keyboard.onUpCallback = function (e) {
        if(e.keyCode == 88){
            isLinkSightLock = 0;
        }
    }

    cursors = game.input.keyboard.createCursorKeys();
}

function fillTiles() {

    map.fill(31, layer.getTileX(player.x), layer.getTileY(player.y), 8, 8);

}


function update() {

    if(starTime == 0){
    }else{
        starTime -= 1;
    }

    if(swords){
        // game.physics.arcade.collide(swords,swords);
        game.physics.arcade.collide(player,swords);
        // game.physics.arcade.collide(jellys,jellys);
        game.physics.arcade.overlap(fire, swords, meetWithFire, null, this);
        game.physics.arcade.overlap(fire, jellys,meetWithFire, null, this);
        game.physics.arcade.overlap(jellys,jellys,jellyMeetWithJelly,null,this);
        game.physics.arcade.overlap(swords,swords, meetWithSwords, null, this);
        game.physics.arcade.overlap(player,fire, heroGetHurt, null, this);
        game.physics.arcade.overlap(jellys,swords,jellysGetHurt,null,this);
        game.physics.arcade.overlap(player,jellys, heroGetHurt, null, this);
    }

    globalChemicalEngine.checkAllStateMachine();
    checkJelllyLife();
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

    for (let i = 0; i < jellys.length; i++){
        if (jellys[i].health > 0){
            jellys[i].animations.play('move');
            let distance = Math.sqrt((jellys[i].x - player.x)*(jellys[i].x - player.x) + (jellys[i].y - player.y)*(jellys[i].y - player.y));
            let distanceX = Math.sqrt((jellys[i].x - player.x)*(jellys[i].x - player.x));
            let distanceY = Math.sqrt((jellys[i].y - player.y)*(jellys[i].y - player.y));
            if (distance < 1000){
                if (jellys[i].x < player.x){
                    if (jellys[i].y < player.y){
                        jellys[i].body.velocity.y = Math.sqrt(jellysMoveSpeed * jellysMoveSpeed /((distanceX/distanceY)*(distanceX/distanceY) + 1))*(productRandomNumber(0.7,1));
                        jellys[i].body.velocity.x = jellys[i].body.velocity.y * distanceX/distanceY*(productRandomNumber(0.7,1));
                    }else{
                        jellys[i].body.velocity.y = -Math.sqrt(jellysMoveSpeed * jellysMoveSpeed /((distanceX/distanceY)*(distanceX/distanceY) + 1))*(productRandomNumber(0.7,1));
                        jellys[i].body.velocity.x = -jellys[i].body.velocity.y * distanceX/distanceY*(productRandomNumber(0.7,1));
                    }
                }else{
                    if (jellys[i].y < player.y){
                        jellys[i].body.velocity.y = Math.sqrt(jellysMoveSpeed * jellysMoveSpeed /((distanceX/distanceY)*(distanceX/distanceY) + 1))*(productRandomNumber(0.7,1));
                        jellys[i].body.velocity.x = -jellys[i].body.velocity.y * distanceX/distanceY*(productRandomNumber(0.7,1));
                    }else{
                        jellys[i].body.velocity.y = -Math.sqrt(jellysMoveSpeed * jellysMoveSpeed /((distanceX/distanceY)*(distanceX/distanceY) + 1))*(productRandomNumber(0.7,1));
                        jellys[i].body.velocity.x = jellys[i].body.velocity.y * distanceX/distanceY*(productRandomNumber(0.7,1));
                    }
                }

            }
        }else{
            jellys[i].body.velocity.x = 0;
            jellys[i].body.velocity.y = 0;
        }

    }
    //  Allow the player to jump if they are touching the ground.
    // if (cursors.up.isDown && player.body.touching.down && hitPlatform)
    // {
    //     player.body.velocity.y = -350;
    // }
}
function meetWithFire(fire, swords) {
    swords.stateMachine.receiveAction(chemicalActions.burn);
    // alert('sword meet with fire');
}
function meetWithSwords(host, guest) {
    if (guest.stateMachine.currentState == chemicalStates.fireCarrying) {
        host.stateMachine.receiveAction(chemicalActions.burn);
    }
    // alert('sword meet with fire');
}
function jellysGetHurt(jellys,swords){
    if (swords.stateMachine.currentState == chemicalStates.fireCarrying){
        jellys.stateMachine.receiveAction(chemicalActions.burn);
    }
    jellys.health -= 8;
}
function heroGetHurt(player,fire){
    if (starTime == 0){
        player.health -= 1;
        layoutHeart();
        starTime = 30;
        if (directIndicator == 1)
        {
            player.x += standBackSpeed;
        }
        else if (directIndicator == 2)
        {
            player.y += standBackSpeed;
        }
        else if (directIndicator == 3)
        {
            player.y -= standBackSpeed;
        }
        else if (directIndicator == 4)
        {
            player.x -= standBackSpeed;
        }
        player.animations.play('hurt');
    }else {

    }
}
function checkJelllyLife(){
    for (let i = 0 ; i < jellys.length; i++){
        // alert(jellys[i].health);
        if (jellys[i].health <= 0){
            jellys[i].dead();
            jellys[i].animations.play('dead',null,false,true);

        }else{
            if (jellys[i].stateMachine.currentState == chemicalStates.fireCarrying){
                jellys[i].health -= 3;
            }
        }

    }
}
function jellyMeetWithJelly(jellyOne,jellyTwo){
    if (jellyOne.stateMachine.currentState == chemicalStates.fireCarrying){
        jellyTwo.stateMachine.receiveAction(chemicalActions.burn);
    }
}
// 定义场景
function productRandomNumber(from:number,to:number){
    let offset = to-from;
    return (from + offset*Math.random());
}


// 启动游戏
// game.state.start('preload');
