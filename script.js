var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

var player;
var pipeArray = [];
var constants;
var deadTimer;

var images = {
    pipe:{
        img:new Image(),
        src:"./images/pipe.png"
    },
    player:{
        img:new Image(),
        src:"./images/bird.png" 
    },
    background:{
        img:new Image(),
        src:"./images/background.png" ,
        offset:0
    }
};

Object.entries(images).forEach(image => {
    image[1].img.src = image[1].src;
});

function init(){
    deadTimer = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    pipeArray = [];
    constants = {
        gravity: 1*canvas.height/1000,
        sizeConstant:{
            x:canvas.width/1000,
            y:canvas.height/1000
        }
    };
    player = new Player(canvas.width/10,canvas.height/3,canvas.width/15,canvas.height/10,0.5* constants.sizeConstant.y,0);
    createPipe();
};
function createPipe(){
    pipeArray.push(new Pipe(0,0,canvas.width/10,canvas.height/2.9,canvas.height/2.9 ,Math.random()*canvas.height/3-Math.random()*canvas.height/6))
};

function Player(x,y,width,height,weight,velocityY){    
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.weight = weight;
        this.velocityY = velocityY;

        this.color = "black";
        this.dead = false;
        this.points = 0;
        this.angle = 45;
        
        this.draw = function(){
            drawRotatedImage(this.x,this.y,this.width,this.height, images.player.img,this.angle);
                                       
            c.fillStyle = "black";
            c.font = "30px Arial";
            c.fillText("Poäng: " +this.points, canvas.width/2-50, 50);
        };

        this.update = function() {
            if(this.velocityY < 0){
                this.angle = -this.velocityY*2;
            }else{
                this.angle = -this.velocityY;
            };
            if(this.angle > 90){
                this.angle = 90;
            };

            if(this.started === true && this.y + this.height < canvas.height){
                this.velocityY -= constants.gravity / constants.sizeConstant.y;
                this.y -= this.velocityY*this.weight;
            };
            if(this.y + this.height > canvas.height -20){
                this.angle = 90;
                this.y = canvas.height-this.width;
            };
            
            this.draw();
            
            if(this.y + this.height >= canvas.height- 20 ){
                
                this.dead = true;
            };
        };
    
};

function drawRotatedImage(x,y,w,h,img,angle,mirrored){
    let degree = angle * Math.PI / 180;
    let middlePoint = {
        x:x+w/2,
        y:y+h/2
    };
    c.save();
    c.translate(middlePoint.x,middlePoint.y);
    c.rotate(degree);
    if(mirrored === true){
        c.scale(-1, 1);
    }

    c.drawImage(img,-w/2,-h/2,w,h);
    c.restore();
}


function Pipe(x,y,width,heightUpper,heightBottom,gapPosition){
    this.x = x;
    this.y = y;
    this.width = width;
    this.heightUpper = heightUpper;
    this.heightBottom = heightBottom;
    this.gapPosition = gapPosition;
    this.created = false;
    this.dead = false;
    this.givenPoint = false;
    this.color = "gray";

    this.draw = function(){    
        drawRotatedImage(canvas.width-this.x,-100,this.width,this.heightUpper-this.gapPosition+100,images.pipe.img,180,true);
        drawRotatedImage(canvas.width-this.x,canvas.height-this.heightBottom-gapPosition,(this.width),this.heightBottom + gapPosition +50,images.pipe.img,0);
    };

    this.update = function(){
        if(this.dead === false && player.started === true){
            this.draw();
            this.x+=(2+player.points/50)*constants.sizeConstant.x;
            if(this.x > canvas.width/3-player.points*5*constants.sizeConstant.x && this.created === false){
                createPipe();
                this.created = true;
            }
            if(this.x>canvas.width+this.width){
                this.dead = true;
            }
            if(detectCollition(player.x,player.y,player.width,player.height,canvas.width-this.x,0,this.width,this.heightUpper-this.gapPosition) ||
            detectCollition(player.x,player.y,player.width,player.height,canvas.width-this.x,canvas.height-this.heightBottom-gapPosition,this.width,this.heightBottom + gapPosition)){
                player.dead = true;
            }
            if(detectCollition(player.x+ player.width/2,0,player.width,5,canvas.width-this.x+this.width/2,0,this.width,5) && this.givenPoint === false){
                this.givenPoint = true;
                player.points++;
            };
        };
    };
};

function detectCollition(x,y,w,h,x2,y2,w2,h2){
    if(x+w>x2 && x<x2+w2 && y+h>y2 && y<y2+h2){
            return true;
        };
};

function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0,canvas.width,canvas.height);
    c.drawImage(images.background.img,images.background.offset%canvas.width,0,canvas.width,canvas.height);
    c.drawImage(images.background.img,images.background.offset%canvas.width + canvas.width-1,0,canvas.width,canvas.height);
    if(player.dead === true){
        deadTimer++;
        pipeArray.forEach(Pipe=> {
            Pipe.draw();
        });
        
    }else{
        pipeArray.forEach(Pipe=> {
            Pipe.update(pipeArray);
        });
        if(player.started === true){
            images.background.offset -=(1+player.points/20)*constants.sizeConstant.x;
        };

    };
    
    player.update();
};


window.addEventListener("keyup",function(event){
    jump();
});
window.addEventListener("mouseup",function(event){
    jump();
});
function jump(){
    player.started = true;
    if(player.y > canvas.height/15 && player.dead === false){
        player.velocityY = 18;
    };
    if(player.dead === true && player.y + player.height >= canvas.height-20){
        init();
    };
};

window.addEventListener("resize",function(){
    init();
});

init();
animate();
