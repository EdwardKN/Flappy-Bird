(function() {


var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

png_font.setup(document.getElementById("canvas").getContext("2d"));

var player;
var pipeArray = [];
var constants;

var sounds = {
    die:{
        src:"https://gamefiles.s3.eu-north-1.amazonaws.com/die.mp3"
    },
    hit:{
        src:"https://gamefiles.s3.eu-north-1.amazonaws.com/hit.mp3"
    },
    point:{
        src:"https://gamefiles.s3.eu-north-1.amazonaws.com/point.mp3"
    },
    swoosh:{
        src:"https://gamefiles.s3.eu-north-1.amazonaws.com/swoosh.mp3"
    },
    wing:{
        src:"https://gamefiles.s3.eu-north-1.amazonaws.com/wing.mp3"
    },
}

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
        src:["./images/background.png"],
        offset:0
    },
    ground:{
        src:["./images/ground.png"],
        offset:0
    }
};


function preRender(imageObject){
    Object.entries(imageObject).forEach(image => {
        image[1].img = [];
        for(i=0;i<image[1].src.length;i++){
            image[1].img.push(new Image());

            image[1].img[i].src = image[1].src[i];
            c.drawImage(image[1].img[i],0,0)
        }
    });
}

function loadSounds(soundObject){
    Object.entries(soundObject).forEach(sound => {
        sound[1].sound = new Audio(sound[1].src)
    });
}




class Player {
    constructor(x, y, width, height, weight, velocityY, animationSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.weight = weight;
        this.velocityY = velocityY;

        this.color = "black";
        this.dead = false;
        this.points = 0;
        this.angle = 0;

        this.currentAnimationFrame = 0;

        setInterval(() => {
            if (this.dead == false && this.started === true) {
                this.currentAnimationFrame++;
            }
        }, animationSpeed);

        this.draw = function () {
            drawRotatedImage(this.x, this.y, this.width, this.height, images.player.img[this.currentAnimationFrame % images.player.src.length], this.angle);

            c.fillStyle = "black";
            png_font.drawText(`${this.points}`, [canvas.width / 2, 0], "#403340", Math.floor(this.height / 8), null, false);

        };

        this.update = function () {

            if(player.started === true){

                if (this.velocityY < 0) {
                    this.angle = -this.velocityY*2;
                } else {
                    this.angle = -this.velocityY;
                };

                if (this.angle >= 90) {
                    this.angle = 90;
                };

                if (this.started === true && this.y + this.height < canvas.height) {
                    this.velocityY -= constants.gravity / constants.sizeConstant.y;
                    this.y -= this.velocityY * this.weight;
                };
                if (this.y + this.height >= canvas.height - canvas.height/13 - 5) {
                    if(this.dead === false){
                        playSound(sounds.hit.sound)
                    }

                    this.angle = 90;
                    this.y = canvas.height - this.width  - canvas.height/13;
                    this.dead = true;
                    this.started = false;
                };
            }else{

            }
            this.draw();

        };

        this.jump = function () {
            this.started = true;
            if (this.y > canvas.height / 15 && this.dead === false) {
                playSound(sounds.wing.sound);
                this.velocityY = 35;    
                this.y -= this.velocityY * this.weight*2;
            };
            if (this.dead === true && this.y + this.height >= canvas.height - this.width - canvas.height/13) {
                init();
            };
        };

    }
};



class Pipe {
    constructor(x, y, width, heightUpper, heightBottom, gapPosition) {
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

        this.draw = function () {
            drawRotatedImage(canvas.width - this.x, 0, this.width, this.heightUpper - this.gapPosition, images.pipe.img[0], 180, true);
            drawRotatedImage(canvas.width - this.x, this.heightUpper - this.gapPosition - canvas.height / 9, this.width, canvas.height / 8, images.pipetip.img[0], 180, true);

            drawRotatedImage(canvas.width - this.x, canvas.height - this.heightBottom - this.gapPosition, (this.width), this.heightBottom + gapPosition - canvas.height/10, images.pipe.img[0], 0);


            drawRotatedImage(canvas.width - this.x, canvas.height - this.heightBottom - this.gapPosition - canvas.height / 100, (this.width), canvas.height / 8, images.pipetip.img[0], 0);
        };

        this.update = function () {
            this.draw();
            if (player.started === true) {
                this.x += (5 + player.points / 50) * constants.sizeConstant.x;
                if (this.x > canvas.width / 3 - player.points * 5 * constants.sizeConstant.x && this.created === false) {
                    createPipe(0);
                    this.created = true;
                }


                if (detectCollition(player.x, player.y, player.width, player.height, canvas.width - this.x, 0, this.width, this.heightUpper - this.gapPosition) ||
                    detectCollition(player.x, player.y, player.width, player.height, canvas.width - this.x, canvas.height - this.heightBottom - gapPosition, this.width, this.heightBottom + gapPosition)) {
                    if(player.dead === false){
                        player.velocityY = 20;

                        playSound(sounds.hit.sound)
                        setTimeout(() => {
                            playSound(sounds.die.sound)
                        }, 350);
                    }
                    player.dead = true;
                    

                }

                if (detectCollition(player.x - player.width/2, 0, player.width, 5, canvas.width - this.x + this.width, 0, this.width, 5) && this.givenPoint === false) {
                    this.givenPoint = true;
                    player.points++;
                    playSound(sounds.point.sound)
                };
            };
        };
    }
};

function detectCollition(x,y,w,h,x2,y2,w2,h2){
    if(x+w>x2 && x<x2+w2 && y+h>y2 && y<y2+h2){
            return true;
        };
};

function playSound(sound){
    let myClonedAudio = sound.cloneNode();
    myClonedAudio.play();
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
    c.drawImage(img,Math.floor(-w/2),Math.floor(-h/2),Math.floor(w),Math.floor(h));
    c.restore();
}

function drawBackground(){
    c.drawImage(images.background.img[0],images.background.offset%canvas.width/2,-canvas.height/1.5,canvas.width/2,canvas.height*2);
    c.drawImage(images.background.img[0],images.background.offset%canvas.width/2 + canvas.width/2 -1,-canvas.height/1.5,canvas.width/2,canvas.height*2);
    c.drawImage(images.background.img[0],images.background.offset%canvas.width/2 + canvas.width -2,-canvas.height/1.5,canvas.width/2,canvas.height*2);


    c.drawImage(images.ground.img[0],images.ground.offset%canvas.width,canvas.height-canvas.height/10,canvas.width/1,canvas.height/2);
    c.drawImage(images.ground.img[0],images.ground.offset%canvas.width + canvas.width,canvas.height-canvas.height/10,canvas.width/1,canvas.height/2);
}

function animate(){
    
    requestAnimationFrame(animate);

    c.clearRect(0,0,canvas.width,canvas.height);
    
    drawBackground()

    if(player.dead === true){
        pipeArray.forEach(Pipe=> {
            if(Pipe.x<canvas.width+Pipe.width){
                Pipe.draw();
            }
        });
        
    }else{
        pipeArray.forEach(Pipe=> {
            if(Pipe.x<canvas.width+Pipe.width){
                Pipe.update(pipeArray);
            }
        });
        if(player.started === true){
            images.ground.offset -= ((2+player.points/50)*constants.sizeConstant.x);

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

    constants = {
        gravity: 2*canvas.height/1000,
        sizeConstant:{
            x:canvas.width/1000,
            y:canvas.height/1000
        }
    };
    pipeArray = [];

    createPipe(canvas.width/3);
    player = new Player(canvas.width/10,canvas.height/3,canvas.width/15,canvas.height/10,0.5*constants.sizeConstant.y,0,200);
};
function createPipe(x){
    pipeArray.push(new Pipe(x,0,canvas.width/10,canvas.height/2.9,canvas.height/2.9 ,Math.random()*canvas.height/3-Math.random()*canvas.height/6))
};


window.addEventListener("resize",function(){
    init();

});

window.addEventListener("keyup",function(){
    player.jump();
});
window.addEventListener("mouseup",function(){
    player.jump();
});

init();
loadSounds(sounds);
animate();

})();
