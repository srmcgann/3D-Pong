/*	3D Pong
//	Scott McGann - October 2016
//	s.r.mcgann [at] hotmail.com
*/

function rasterizePoint(x,y,z,vars){

	var p,d;
	x-=vars.camX;
	y-=vars.camY;
	z-=vars.camZ;
	p=Math.atan2(x,z);
	d=Math.sqrt(x*x+z*z);
	x=Math.sin(p-vars.yaw)*d;
	z=Math.cos(p-vars.yaw)*d;
	p=Math.atan2(y,z);
	d=Math.sqrt(y*y+z*z);
	y=Math.sin(p-vars.pitch)*d;
	z=Math.cos(p-vars.pitch)*d;
	var rx1=-1000;
	var ry1=1;
	var rx2=1000;
	var ry2=1;
	var rx3=0;
	var ry3=0;
	var rx4=x;
	var ry4=z;
	var uc=(ry4-ry3)*(rx2-rx1)-(rx4-rx3)*(ry2-ry1);
	if(!uc) return {x:0,y:0,d:-1};
	var ua=((rx4-rx3)*(ry1-ry3)-(ry4-ry3)*(rx1-rx3))/uc;
	var ub=((rx2-rx1)*(ry1-ry3)-(ry2-ry1)*(rx1-rx3))/uc;
	if(!z)z=0.000000001;
	if(ua>0&&ua<1&&ub>0&&ub<1){
		return {
			x:vars.cx+(rx1+ua*(rx2-rx1))*vars.scale,
			y:vars.cy+y/z*vars.scale,
			d:Math.sqrt(x*x+y*y+z*z)
		};
	}else{
		return {
			x:vars.cx+(rx1+ua*(rx2-rx1))*vars.scale,
			y:vars.cy+y/z*vars.scale,
			d:-1
		};
	}
}


function rgb(col){
	
	col += 0.000001;
	var r = parseInt((0.5+Math.sin(col)*0.5)*16);
	var g = parseInt((0.5+Math.cos(col)*0.5)*16);
	var b = parseInt((0.5-Math.sin(col)*0.5)*16);
	return "#"+r.toString(16)+g.toString(16)+b.toString(16);
}


function elevation(x,y,z){

    var dist = Math.sqrt(x*x+y*y+z*z);
    if(dist && z/dist>=-1 && z/dist <=1) return Math.acos(z / dist);
    return 0.00000001;
}


function rotate(vert,pitch,yaw){

	var d=Math.sqrt(vert.y*vert.y+vert.z*vert.z);
	var p=Math.atan2(vert.y,vert.z);
	vert.y=Math.sin(p+pitch)*d;
	vert.z=Math.cos(p+pitch)*d;
	d=Math.sqrt(vert.x*vert.x+vert.z*vert.z);
	p=Math.atan2(vert.x,vert.z);
	vert.x=Math.sin(p+yaw)*d;
	vert.z=Math.cos(p+yaw)*d;
}


function subdivide(shape,subdivisions){
	
	var t=shape.segs.length;
	for(var i=0;i<t;++i){
		var x1=shape.segs[i].a.x;
		var y1=shape.segs[i].a.y;
		var z1=shape.segs[i].a.z;
		var x2=(shape.segs[i].b.x-x1)/subdivisions;
		var y2=(shape.segs[i].b.y-y1)/subdivisions;
		var z2=(shape.segs[i].b.z-z1)/subdivisions;
		shape.segs[i].b.x=x1+x2;
		shape.segs[i].b.y=y1+y2;
		shape.segs[i].b.z=z1+z2;
		var x3=x2;
		var y3=y2;
		var z3=z2;
		for(var k=0;k<subdivisions-1;++k){
			shape.segs.push(new Seg(x1+x2,y1+y2,z1+z2,x1+x2+x3,y1+y2+y3,z1+z2+z3));
			x2+=x3;
			y2+=y3;
			z2+=z3;
		}
	}
}


function transform(shape,scaleX,scaleY,scaleZ){

	for(var i=0;i<shape.segs.length;++i){
		shape.segs[i].a.x*=scaleX;
		shape.segs[i].a.y*=scaleY;
		shape.segs[i].a.z*=scaleZ;
		shape.segs[i].b.x*=scaleX;
		shape.segs[i].b.y*=scaleY;
		shape.segs[i].b.z*=scaleZ;
	}
}


function loadCube(x,y,z){
	
	var shape={};
	shape.x=x;
	shape.y=y;
	shape.z=z;
	shape.segs=[];
	shape.segs.push(new Seg(-1,-1,-1,1,-1,-1));
	shape.segs.push(new Seg(1,-1,-1,1,1,-1));
	shape.segs.push(new Seg(1,1,-1,-1,1,-1));
	shape.segs.push(new Seg(-1,1,-1,-1,-1,-1));
	shape.segs.push(new Seg(-1,-1,1,1,-1,1));
	shape.segs.push(new Seg(1,-1,1,1,1,1));
	shape.segs.push(new Seg(1,1,1,-1,1,1));
	shape.segs.push(new Seg(-1,1,1,-1,-1,1));
	shape.segs.push(new Seg(-1,-1,-1,-1,-1,1));
	shape.segs.push(new Seg(1,-1,-1,1,-1,1));
	shape.segs.push(new Seg(1,1,-1,1,1,1));
	shape.segs.push(new Seg(-1,1,-1,-1,1,1));
	return shape;
}


function Vert(x,y,z){
	this.x = x;
	this.y = y;
	this.z = z;
}


function Seg(x1,y1,z1,x2,y2,z2){
	this.a = new Vert(x1,y1,z1);
	this.b = new Vert(x2,y2,z2);
	this.dist=0;
}


function sortFunction(a,b){
	return b.dist-a.dist;
}


function rgbArray(col){
	
	col += 0.000001;
	var r = 0.5+Math.sin(col)*0.5;
	var g = 0.5+Math.cos(col)*0.5;
	var b = 0.5-Math.sin(col)*0.5;
	return [r,g,b];
}


function colorString(arr){

	var r = parseInt(arr[0]*15);
	var g = parseInt(arr[1]*15);
	var b = parseInt(arr[2]*15);
	return "#"+r.toString(16)+g.toString(16)+b.toString(16);
}


function interpolateColors(RGB1,RGB2,degree){
	
	var w1=degree;
	var w2=1-w1;
	return colorString([w1*RGB1[0]+w2*RGB2[0],w1*RGB1[1]+w2*RGB2[1],w1*RGB1[2]+w2*RGB2[2]]);
}


function beep(){
	
	var beep=new Audio("beep.mp3");
	beep.volume=0.85;
	beep.play();
}


function playWin(){
	
	var win=new Audio("win.mp3");
	win.volume=0.6;
	win.play();
}


function playLose(){
	
	var lose=new Audio("lose.mp3");
	lose.volume=1;
	lose.play();
}


function process(vars){

	vars.paddleScale=3+Math.sin(vars.frameNo/6)/10;
	var p, d, t;
	switch(vars.phase){
		case 0:
			p = Math.atan2(vars.camX, vars.camZ);
			d = Math.sqrt(vars.camX * vars.camX + vars.camZ * vars.camZ);
			d-=0.0165;
			t = 0.004+(Math.PI-Math.abs(p))/40;
			vars.camX = Math.sin(p + t) * d;
			vars.camZ = Math.cos(p + t) * d;
			vars.camY = -Math.cos(p/2 + t) * Math.PI *2;
			vars.yaw = Math.PI + p + t;
			vars.pitch = elevation(vars.camX, vars.camZ, vars.camY) - Math.PI / 2;
			if(p+t>=Math.PI-t && p+t<=Math.PI){
				vars.phase++;
				vars.yaw=0;
				vars.pitch=0;
				vars.camX=0;
				vars.camY=0;
				vars.gridAlpha=0;
			}
		break;
		case 1:
			if(vars.backgroundAlpha>0.1){
				vars.backgroundAlpha/=1.02;
				vars.gridAlpha=0;
			}else{
				vars.phase++;
			}
		break;
		case 2:
			vars.gridAlpha=0.05+Math.cos(vars.frameNo/20)/100;
			
			vars.AIX+=Math.min(vars.AISpeed,Math.abs(vars.AIX-vars.ballX))*(vars.AIX<vars.ballX?1:-1);
			vars.AIY+=Math.min(vars.AISpeed,Math.abs(vars.AIY-vars.ballY))*(vars.AIY<vars.ballY?1:-1);
			var reduce=310;
			if(vars.AIX+vars.AIPaddle.width/reduce/vars.paddleScale>vars.courtWidth/2)vars.AIX=vars.courtWidth/2-vars.AIPaddle.width/reduce/vars.paddleScale;
			if(vars.AIX-vars.AIPaddle.width/reduce/vars.paddleScale<-vars.courtWidth/2)vars.AIX=-vars.courtWidth/2+vars.AIPaddle.width/reduce/vars.paddleScale;
			if(vars.AIY+vars.AIPaddle.height/reduce/vars.paddleScale>vars.courtHeight/2)vars.AIY=vars.courtHeight/2-vars.AIPaddle.height/reduce/vars.paddleScale;
			if(vars.AIY-vars.AIPaddle.height/reduce/vars.paddleScale<-vars.courtHeight/2)vars.AIY=-vars.courtHeight/2+vars.AIPaddle.height/reduce/vars.paddleScale;

			if(vars.mx+vars.playerPaddle.width/vars.paddleScale>vars.cx*2)vars.mx=vars.cx*2-vars.playerPaddle.width/vars.paddleScale;
			if(vars.mx-vars.playerPaddle.width/vars.paddleScale<0)vars.mx=vars.playerPaddle.width/vars.paddleScale;
			if(vars.my+vars.playerPaddle.height/vars.paddleScale>vars.cy*2)vars.my=vars.cy*2-vars.playerPaddle.height/vars.paddleScale;
			if(vars.my-vars.playerPaddle.height/vars.paddleScale<0)vars.my=vars.playerPaddle.height/vars.paddleScale;
			
			if(Math.abs(vars.ballX+vars.ballVX)>vars.courtWidth/2-vars.ballRadius)vars.ballVX*=-1;
			if(Math.abs(vars.ballY+vars.ballVY)>vars.courtHeight/2-vars.ballRadius)vars.ballVY*=-1;
			if(Math.abs(vars.ballZ+vars.ballVZ)>vars.courtDepth/2-vars.ballRadius){
				if(vars.ballZ>0){
					d=Math.sqrt((vars.ballX-vars.AIX)*(vars.ballX-vars.AIX)+(vars.ballY-vars.AIY)*(vars.ballY-vars.AIY));
					if(d<0.15*vars.paddleScale){
						vars.ballVZ*=-1;
						p=Math.atan2(vars.ballX-vars.AIX,vars.ballY-vars.AIY);
						vars.ballVX=Math.sin(p)*d/7;
						vars.ballVY=Math.cos(p)*d/7;
						beep();
					}else{
						vars.playerScore++;
						vars.phase=3;
						playWin();
					}
				}else{
					vars.playerX=(vars.mx/vars.cx/2-0.5)*vars.courtWidth;
					vars.playerY=(vars.my/vars.cy/2-0.5)*vars.courtHeight;
					d=Math.sqrt((vars.ballX-vars.playerX)*(vars.ballX-vars.playerX)+(vars.ballY-vars.playerY)*(vars.ballY-vars.playerY));
					if(d<0.2*vars.paddleScale){
						p=Math.atan2(vars.ballX-vars.playerX,vars.ballY-vars.playerY);
						vars.ballVX=Math.sin(p)*d/7;
						vars.ballVY=Math.cos(p)*d/7;
						vars.ballVZ*=-1;
						beep();
					}else{
						vars.AIScore++;
						vars.phase=4;
						playLose();
					}
				}
			}
			vars.ballX+=vars.ballVX;
			vars.ballY+=vars.ballVY;
			vars.ballZ+=vars.ballVZ;
		break;
		case 3: case 4:
			p = Math.atan2(vars.camX, vars.camZ);
			d = Math.sqrt(vars.camX * vars.camX + vars.camZ * vars.camZ);
			t = 0.0055+(Math.PI-Math.abs(p))/25;
			vars.camX = Math.sin(p + t) * d;
			vars.camZ = Math.cos(p + t) * d;
			vars.camY = -Math.cos(p/2 + t) * Math.PI *2;
			vars.yaw = Math.PI + p + t;
			vars.pitch = elevation(vars.camX, vars.camZ, vars.camY) - Math.PI / 2;
			if(p+t>=Math.PI-t && p+t<=Math.PI){
				vars.phase=2;
				vars.yaw=0;
				vars.pitch=0;
				vars.camX=0;
				vars.camY=0;
				vars.gridAlpha=0;
				serveBall(vars);
			}
		break;
	}
}


function draw(vars){
	
	// draw background
	vars.ctx.globalAlpha=vars.backgroundAlpha;
	var ofy1=-vars.pitch*600;
	var ofy2=75;
	var grad=vars.ctx.createLinearGradient(0,ofy1,0,ofy1+vars.cy+ofy2);
	grad.addColorStop(0,"#128");
	grad.addColorStop(0.5,"#36a");
	grad.addColorStop(1,"#a09f88");
	vars.ctx.fillStyle=grad;
	vars.ctx.fillRect(0,ofy1,vars.cx*2,vars.cy+ofy2);	
	grad=vars.ctx.createLinearGradient(0,ofy1+vars.cy+ofy2,0,ofy1+vars.cy*2);
	grad.addColorStop(0,"#481800");
	grad.addColorStop(0.5,"#340");
	grad.addColorStop(1,"#041");
	vars.ctx.fillStyle=grad;
	vars.ctx.fillRect(0,vars.cy+ofy1+ofy2,vars.cx*2,vars.cy*4);
	
	
	// draw floor grid
	if(!vars.mobile){
		var t=0;
		for(var i=-70;i<70;i+=2){
			for(var j=-70;j<70;j+=2){
				t++;
				var x=i;
				var y=11;
				var z=j;
				var point=rasterizePoint(x,y,z,vars);
				if(point.d!=-1){
					var d=Math.sqrt(x*x+z*z);
					var a=vars.gridAlpha-Math.pow(d/70,2)*vars.gridAlpha;
					if(a>0){
						switch(vars.phase){
							case 0:
								var size=2000/(1+Math.pow(point.d,1.5));
								vars.ctx.fillStyle="#f0f";
							break;
							case 1: case 2: case 3: case 4:
								var size=(Math.cos(Math.sin(t/4+vars.frameNo/10)*Math.PI*2+vars.frameNo/34)*3000+8000)/(1+Math.pow(point.d,1.5));
								vars.ctx.fillStyle=rgb(t/(2+Math.sin(vars.frameNo/100)*1)+vars.frameNo/1);
							break;
						}
						vars.ctx.globalAlpha=a;
						vars.ctx.fillRect(point.x-size/2,point.y-size/2,size,size);					
					}
				}
			}
		}
	}

	// draw scene
	vars.ctx.globalAlpha=0.7;
	var t=0;
	for(var i=0;i<vars.shapes.length;++i){
		vars.shapes[i].segs.sort(sortFunction);
		for(var j=0;j<vars.shapes[i].segs.length;++j){
			t++;
			var x=vars.shapes[i].x+vars.shapes[i].segs[j].a.x;
			var y=vars.shapes[i].y+vars.shapes[i].segs[j].a.y;
			var z=vars.shapes[i].z+vars.shapes[i].segs[j].a.z;
			var pointA=rasterizePoint(x,y,z,vars);
			if(pointA.d != -1){
				x=vars.shapes[i].x+vars.shapes[i].segs[j].b.x;
				y=vars.shapes[i].y+vars.shapes[i].segs[j].b.y;
				z=vars.shapes[i].z+vars.shapes[i].segs[j].b.z;
				var pointB=rasterizePoint(x,y,z,vars);
				if(pointB.d != -1){
					vars.shapes[i].segs[j].dist=(pointA.d+pointB.d)/2;
					switch(vars.phase){
						case 0: vars.ctx.strokeStyle="#8f6"; break;
						case 1:
							vars.ctx.strokeStyle=interpolateColors([0.5,1,0.4],rgbArray(pointB.d+vars.frameNo/5),vars.backgroundAlpha);
						break;
						case 2:
							vars.ctx.strokeStyle=interpolateColors([1,1,1],rgbArray(pointB.d+vars.frameNo/5),0.66+Math.sin(vars.frameNo/35)/3);
						break;
						case 3:
							vars.ctx.strokeStyle=rgb(pointB.d+vars.frameNo/5);
						break;
						case 4:
							vars.ctx.strokeStyle="#f00";
						break;
					}
					vars.ctx.beginPath();
					vars.ctx.lineWidth=1+80/(1+Math.pow(pointB.d,1.5));
					vars.ctx.moveTo(pointA.x,pointA.y);
					vars.ctx.lineTo(pointB.x,pointB.y);
					vars.ctx.stroke();
				}
			}
		}
	}
	
	switch(vars.phase){
		case 0: case 1: break;
		case 2: 
		case 3: case 4:
			vars.ctx.globalAlpha=0.5;
			vars.ctx.lineWidth=1;
			vars.ctx.font="56px Square721";

			vars.ctx.fillStyle="#a00";
			vars.ctx.fillText("CPU: "+vars.AIScore,vars.cx*2-350,60);
			vars.ctx.strokeStyle="#f4f";
			vars.ctx.strokeText("CPU: "+vars.AIScore,vars.cx*2-350,60);

			vars.ctx.fillStyle="#38c";
			vars.ctx.fillText("Human: "+vars.playerScore,120,60);
			vars.ctx.strokeStyle="#fff";
			vars.ctx.strokeText("Human: "+vars.playerScore,120,60);


			vars.ctx.globalAlpha=0.8;
			var point=rasterizePoint(vars.AIX,vars.AIY,vars.courtDepth/2,vars);
			if(point.d!=-1){
				var width=vars.AIPaddle.width/vars.paddleScale/point.d*3.85;
				var height=vars.AIPaddle.height/vars.paddleScale/point.d*3.85;
				vars.ctx.drawImage(vars.AIPaddle,point.x-width/2,point.y-height/2,width,height);
			}

			point=rasterizePoint(vars.ballX,vars.ballY,vars.ballZ,vars);
			if(point.d!=-1){
				var size=vars.ballPic.width/point.d/2;
				vars.ctx.drawImage(vars.ballPic,point.x-size/2,point.y-size/2,size,size);			
			}
			
			if(vars.phase==2){
				var width=vars.playerPaddle.width/vars.paddleScale*2;
				var height=vars.playerPaddle.height/vars.paddleScale*2;
				vars.ctx.drawImage(vars.playerPaddle,vars.mx-width/2,vars.my-height/2,width,height);
			}
		break;
	}
}


function loadCourt(vars){
	
	vars.shapes.push(loadCube(0,0,0));
	var scaleX=vars.canvas.width/vars.scale;
	var scaleY=vars.canvas.height/vars.scale;
	var scaleZ=4;
	transform(vars.shapes[vars.shapes.length-1],scaleX,scaleY,scaleZ);
	vars.courtWidth *= scaleX*2;
	vars.courtHeight *= scaleY*2;
	vars.courtDepth *= scaleZ*2;
	subdivide(vars.shapes[vars.shapes.length-1],50);
}

function serveBall(vars){
	
	vars.AIX=0;
	vars.AIY=0;
	vars.ballX=0;
	vars.ballY=0;
	vars.ballZ=0;
	vars.ballVX=0.025-Math.random()*0.05;
	vars.ballVY=0.025-Math.random()*0.05;
	vars.ballVZ=0.1;
}


function mobileCheck() {
 
 var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}


var add = (function () { var _ = 0; return function () {return _++;}; })();


function frame(vars) {
	
	if(vars === undefined){
		document.querySelector("#startButtonDiv").style.display="none";
		document.body.style.background="#000";
		var vars={};
		vars.canvas = document.querySelector("#canvas");
		vars.ctx = vars.canvas.getContext("2d");
		vars.canvas.width = 1366;
		vars.canvas.height = 768;
		vars.canvas.addEventListener("mousemove", function(e){
			var rect = canvas.getBoundingClientRect();
			vars.mx = Math.round((e.clientX-rect.left)/(rect.right-rect.left)*canvas.width);
			vars.my = Math.round((e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height);				
		}, true);
		vars.canvas.addEventListener("touchstart", function(e){
			e.preventDefault();
			var rect = canvas.getBoundingClientRect();
			vars.mx = Math.round((e.changedTouches[0].pageX-rect.left)/(rect.right-rect.left)*canvas.width);
			vars.my = Math.round((e.changedTouches[0].pageY-rect.top)/(rect.bottom-rect.top)*canvas.height);				
		}, true);
		vars.canvas.addEventListener("touchmove", function(e){
			e.preventDefault();
			var rect = canvas.getBoundingClientRect();
			vars.mx = Math.round((e.changedTouches[0].pageX-rect.left)/(rect.right-rect.left)*canvas.width);
			vars.my = Math.round((e.changedTouches[0].pageY-rect.top)/(rect.bottom-rect.top)*canvas.height);				
		}, true);
		vars.frameNo=0;
		vars.camX = 0;
		vars.camY = 0;
		vars.camZ = -10;
		vars.pitch = 0;
		vars.yaw = 0;
		vars.mx=0;
		vars.my=0;
		vars.cx=vars.canvas.width/2;
		vars.cy=vars.canvas.height/2;
		vars.scale=600;
		vars.shapes=[];
		vars.phase=0;
		vars.backgroundAlpha=1;
		vars.gridAlpha=0.25;
		vars.courtWidth=1;
		vars.courtHeight=1;
		vars.courtDepth=1;
		vars.ballX=0;
		vars.ballY=0;
		vars.ballZ=0;
		vars.ballVX=0;
		vars.ballVY=0;
		vars.ballVZ=0;
		serveBall(vars);
		vars.ballRadius=0.1;
		vars.AIX=0;
		vars.AIY=0;
		vars.AISpeed=0.035;
		vars.paddleScale=3.25;
		vars.AIScore=0;
		vars.playerScore=0;
		vars.mobile=mobileCheck();
		vars.AIPaddle=new Image();
		vars.AIPaddle.src="orange_paddle.png";
		vars.playerPaddle=new Image();
		vars.playerPaddle.src="blue_paddle.png";
		vars.ballPic=new Image();
		vars.ballPic.src="ball.png";
		vars.soundtrack=new Audio("soundtrack.mp3");
		vars.soundtrack.volume=.35;
		vars.soundtrack.play();
		vars.soundtrack.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
		var temp=[new Audio("beep.mp3"),new Audio("win.mp3"),new Audio("lose.mp3")];
		loadCourt(vars);
	}
	
	vars.frameNo=add();
	requestAnimationFrame(function() {
	  frame(vars);
	});

	vars.ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	process(vars);
	draw(vars);
}

document.querySelector("#start").addEventListener("click", function(){ frame(); });
