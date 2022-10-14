var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

png_font.setup(document.getElementById("canvas").getContext("2d"));



var player;
var pipeArray;
var constants;



var images = {
    pipe:{
        src:["./images/pipe.png"]
    },
    pipetip:{
        src:["./images/pipetip.png"]
    },
    player:{
        src:["./images/bird.png","./images/bird2.png"]
    },
    background:{
        src:["./images/background.png"] ,
        offset:0
    },
    ground:{
        src:["./images/ground.png"] ,
        offset:0
    }
};


function preRender(imageObject){
    Object.entries(imageObject).forEach(image => {
        image[1].img = new Image()
        image[1].src.forEach(sorce => {
            image[1].img.src = sorce;
            c.drawImage(image[1].img,0,0)
        })
    });
}



function Player(x,y,width,height,weight,velocityY,animationSpeed){    
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

        this.currentAnimationFrame = 0;

        setInterval(() => {
            if(this.dead == false && this.started === true){
                this.currentAnimationFrame++;
            }
        }, animationSpeed);
        
        this.draw = function(){
            images.player.img.src = images.player.src[this.currentAnimationFrame%images.player.src.length]
            drawRotatedImage(this.x,this.y,this.width,this.height, images.player.img,this.angle);
                                       
            c.fillStyle = "black";
            png_font.drawText(`${this.points}`, [canvas.width/2,0], "#403340", Math.floor(this.height/8), null,  false);

        };

        this.update = function() {

            if(this.velocityY < 0){
                this.angle = -this.velocityY;
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
        drawRotatedImage(canvas.width-this.x,0,this.width,this.heightUpper-this.gapPosition,images.pipe.img,180,true);
        drawRotatedImage(canvas.width-this.x,this.heightUpper-this.gapPosition-canvas.height/9,this.width,canvas.height/8,images.pipetip.img,180,true);

        drawRotatedImage(canvas.width-this.x,canvas.height-this.heightBottom-this.gapPosition,(this.width),this.heightBottom + gapPosition +50,images.pipe.img,0);

        drawRotatedImage(canvas.width-this.x,canvas.height-this.heightBottom-this.gapPosition - canvas.height/100 ,(this.width),canvas.height/8,images.pipetip.img,0);
    };

    this.update = function(){
        this.draw();
        if(player.started === true){
            this.x+=(2+player.points/50)*constants.sizeConstant.x;
            if(this.x > canvas.width/3-player.points*5*constants.sizeConstant.x && this.created === false){
                createPipe(0);
                this.created = true;
            }


            if(detectCollition(player.x,player.y,player.width,player.height,canvas.width-this.x,0,this.width,this.heightUpper-this.gapPosition) ||
            detectCollition(player.x,player.y,player.width,player.height,canvas.width-this.x,canvas.height-this.heightBottom-gapPosition,this.width,this.heightBottom + gapPosition)){
                player.dead = true;
            }
            
            if(detectCollition(player.x-player.width,0,player.width,5,canvas.width-this.x+this.width,0,this.width,5) && this.givenPoint === false){
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

function jump(){
    player.started = true;
    if(player.y > canvas.height/15 && player.dead === false){
        player.velocityY = 32;
    };
    if(player.dead === true && player.y + player.height >= canvas.height-20){
        init();
    };
};

function animate(){
    
    requestAnimationFrame(animate);

    c.clearRect(0,0,canvas.width,canvas.height);


    c.drawImage(images.background.img,images.background.offset%canvas.width/4,0,canvas.width/4,canvas.height);
    c.drawImage(images.background.img,images.background.offset%canvas.width/4 + canvas.width/4 -1,0,canvas.width/4,canvas.height);
    c.drawImage(images.background.img,images.background.offset%canvas.width/4 + canvas.width/2 -2,0,canvas.width/4,canvas.height);
    c.drawImage(images.background.img,images.background.offset%canvas.width/4 + canvas.width - canvas.width/4 -3,0,canvas.width/4,canvas.height);
    c.drawImage(images.background.img,images.background.offset%canvas.width/4 + canvas.width -4   ,0,canvas.width/4,canvas.height);

    c.drawImage(images.ground.img,images.ground.offset%canvas.width/2,canvas.height-canvas.height/5,canvas.width/2,canvas.height/5)
    c.drawImage(images.ground.img,images.ground.offset%canvas.width/2 + canvas.width/2,canvas.height-canvas.height/5,canvas.width/2,canvas.height/5)
    c.drawImage(images.ground.img,images.ground.offset%canvas.width/2 + canvas.width,canvas.height-canvas.height/5,canvas.width/2,canvas.height/5)
    if(player.dead === true){
        pipeArray.forEach(Pipe=> {
            Pipe.draw();
        });
        
    }else{
        pipeArray.forEach(Pipe=> {
            if(Pipe.x<canvas.width+Pipe.width){
                Pipe.update(pipeArray);
            }
        });
        if(player.started === true){
            images.ground.offset -= ((2+player.points/50)*constants.sizeConstant.x)*2;

            images.background.offset -=(1+player.points/20)*constants.sizeConstant.x;
        };
    };
    player.update();
    
};




function init(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    c.imageSmoothingEnabled = false;

    preRender(images);


    pipeArray = [];
    constants = {
        gravity: 2*canvas.height/1000,
        sizeConstant:{
            x:canvas.width/1000,
            y:canvas.height/1000
        }
    };
    player = new Player(canvas.width/10,canvas.height/3,canvas.width/15,canvas.height/10,0.5*constants.sizeConstant.y,0,200);
    createPipe(canvas.width/3);
};
function createPipe(x){
    pipeArray.push(new Pipe(x,0,canvas.width/10,canvas.height/2.9,canvas.height/2.9 ,Math.random()*canvas.height/3-Math.random()*canvas.height/6))
};

window.addEventListener("resize",function(){
    init();
});

window.addEventListener("keyup",function(){
    jump();
});
window.addEventListener("mouseup",function(){
    jump();
});

init();
animate();
