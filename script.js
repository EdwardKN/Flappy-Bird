var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");



var player;
var pipeArray = [];
var constants;
var deadTimer;

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
    player = new Player(canvas.width/10,canvas.height/3,canvas.width/24,canvas.height/8,0.5*constants.sizeConstant.y,0);
    createPipe();
}
function createPipe(){
    pipeArray.push(new Pipe(0,0,canvas.width/10,canvas.height/2.9,canvas.height/2.9 ,Math.random()*canvas.height/3-Math.random()*canvas.height/6))
}

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
            drawRotatedRectangle(this.x,this.y,this.width,this.height, this.color,this.angle)
                                       
            c.fillStyle = "black";
            c.font = "30px Arial";
            c.fillText("Poäng: " +this.points, canvas.width/2-50, 50);

        };

        this.update = function() {
            if(this.velocityY < 0){
                this.angle = -this.velocityY*2/constants.sizeConstant.y;
            }else{
                this.angle = -this.velocityY/constants.sizeConstant.y;
            }

            if(this.started === true && this.y + this.height < canvas.height){
                this.velocityY -= constants.gravity / constants.sizeConstant.y;
                this.y -= this.velocityY*this.weight / constants.sizeConstant.y;
            }
            if(this.y + this.height > canvas.height){
                this.angle = 90;
            }
            
            
            this.draw();
            
            if(this.y + this.height > canvas.height){
                
                this.dead = true;
            };
        };
    
};

function drawRotatedRectangle(x,y,w,h,color,angle){
    c.fillStyle = color;
    c.beginPath();
    let middlePoint = {
        x:x+w/2,
        y:y+h/2
    };
    let tmp_point;
    tmp_point = rotate_point(x,y,middlePoint.x,middlePoint.y,angle);
    c.lineTo(tmp_point.x , tmp_point.y);
    tmp_point = rotate_point(x+w,y,middlePoint.x,middlePoint.y,angle);
    c.lineTo(tmp_point.x , tmp_point.y);
    tmp_point = rotate_point(x+w,y+h,middlePoint.x,middlePoint.y,angle);
    c.lineTo(tmp_point.x , tmp_point.y);
    tmp_point = rotate_point(x,y+h,middlePoint.x,middlePoint.y,angle);
    c.lineTo(tmp_point.x , tmp_point.y);

    c.fill();
}

function rotate_point(pointX, pointY, originX, originY, angle) {
    angle = angle * Math.PI / 180.0;
    return {
        x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
    };
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
        c.fillStyle = this.color;
        c.fillRect(canvas.width-this.x,0,this.width,this.heightUpper-this.gapPosition);
        c.fillRect(canvas.width-this.x,canvas.height-this.heightBottom-gapPosition,this.width,this.heightBottom + gapPosition);
    };

    this.update = function(){
        if(this.dead === false && player.started === true){
            this.draw();
            this.x+=(2+player.points/20)*constants.sizeConstant.x;
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
            }
        }

    };
}

function detectCollition(x,y,w,h,x2,y2,w2,h2){
    if(x+w>x2 &&
        x<x2+w2 &&
        y+h>y2 &&
        y<y2+h2
        ){
            return true;
        }
}

function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0,canvas.width,canvas.height)

    if(player.dead === true){
        deadTimer++;
        pipeArray.forEach(Pipe=> {
            Pipe.draw();
        });
    }else{
        pipeArray.forEach(Pipe=> {
            Pipe.update(pipeArray);
        });
    }
    
    player.update();

    

    
};

window.addEventListener("keyup",function(event){
    console.log(event.code)
    if(event.code === "Space"){
        player.started = true;
        if(player.y > 0 && player.dead === false){
            player.velocityY = 20*constants.sizeConstant.y;
        }
        if(player.dead === true && player.y + player.height >= canvas.height){
            init();
        }
    }
    
    
})
window.addEventListener("resize",function(){
    init();
})
init();
animate();
