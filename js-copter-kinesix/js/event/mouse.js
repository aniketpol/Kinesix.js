	var can, ctx, canX, canY, angle, adegree, mouseIsDown = 0, direct =0 , index = 0, tempx, tempy, p = 0, falsepositive1=0,falsepositive2=0;
	var a1=new Array();
	var a2=new Array();		
	var initflagforgesture=false;
function init()
{
	/*alert("hi");
	document.addEventListener("mousedown", mouseDown, false);
	document.addEventListener("mousemove", mouseXY, false);
	document.addEventListener("touchstart", touchDown, false);
	document.addEventListener("touchmove", touchXY, true);
	document.addEventListener("touchend", touchUp, false);

	document.body.addEventListener("mouseup", mouseUp, false);
	document.body.addEventListener("touchcancel", touchUp, false);
*/


	document.addEventListener("distance", distance, false);
	document.addEventListener("posture", posture, false);
	document.addEventListener("direction", direction, false);
	
	adegree = 180/3.141;
}
/*
function mouseUp() {
	mouseIsDown = 0;
	mouseXY();
}

function touchUp() {
	mouseIsDown = 0;
	// no touch to track, so just show state
	showPos();
}

function mouseDown() {
	mouseIsDown = 1;
	mouseXY();
}

function touchDown() {
	mouseIsDown = 1;
	touchXY();
}

function mouseXY(e) {
	if (!e)
		var e = event;
	canX = e.pageX;
	canY = e.pageY;
	
	if(mouseIsDown)
		showPos(1,1,canX,canY);
		
	else
		showPos(0,1,canX,canY);
}

function touchXY(e) {
	if (!e)
		var e = event;
	e.preventDefault();
	canX = e.targetTouches[0].pageX;
	canY = e.targetTouches[0].pageY;
	
	if(mouseIsDown)
		showPos(1,1,canX,canY);
		
	else
		showPos(0,1,canX,canY);
}*/

function showPos(post,x,y) 
{	
//	console.log("showpos got "+post);
//	alert("ddhi");
	if (initflagforgesture==false)
	{
	//	alert("hi");
		initflagforgesture=true;
		init();
	}
	if(postureEvent.detail.post!=post)
	{
//	console.log("showpos got "+post);
		if(postureEvent.detail.post!=0)
		{
			if(post==1)
				falsepositive1++;
				
			if(post==2)
				falsepositive2++;
				
			if((falsepositive1 + falsepositive2)<10)
			{
				fun();
				return;
			}
		}
		
		falsepositive1=0;
		falsepositive2=0;
		postureEvent.detail.post=post;
		console.log("dispatching "+post);
		document.dispatchEvent(postureEvent);
		
		if(post==0)
		{
			index=0;
			return;
		}
		
		a1[0]=x;
		a2[0]=y;
		index=1;
		return;
	}
	else
	{
	
	}
	
	if(post==0)
		return;
		
	fun(x,y);
}

function fun(x,y)
{
	a1[index]=x;
	a2[index]=y;	
	
	tempx=a1[index]-a1[0];
	tempy=a2[index]-a2[0];
	
	//if(Math.abs(tempx)>50 || Math.abs(tempy)>50)
		//return;
	
	if(Math.abs(tempx)>10 || Math.abs(tempy)>10)
	{
		if(tempx>0)
		{
			if(tempy>=0)		//1 quadrant
			{
				angle=Math.atan(tempy/tempx)*adegree;
				direct=1;
			}
			
			else				//4 quadrant
			{
				angle=Math.atan(tempx/tempy)*adegree*-1;
				direct=10;
			}
		}
		
		else if(tempx<0)
		{
			if(tempy>0)			//2 quadrant
			{
				angle=Math.atan(tempx/tempy)*adegree*-1;
				direct=4;
			}
			
			else				//3 quadrant
			{
				angle=Math.atan(tempy/tempx)*adegree;
				direct=7;
			}
		}
		
		else if(tempy>0)
		{
			angle=0;				//+ve y - axis
			direct=4;
		}
		
		else
		{
			angle=0;				//-ve y - axis
			direct=10;
		}
		
		if(directionEvent.detail.dir!=direct)
		{
			directionEvent.detail.dir=direct;
			document.dispatchEvent(directionEvent);
		}
		
		distanceEvent.detail.angle=angle;
		distanceEvent.detail.dist=Math.sqrt((a1[index]-a1[0])*(a1[index]-a1[0])+(a2[index]-a2[0])*(a2[index]-a2[0]));
		document.dispatchEvent(distanceEvent);
	}
	
	index++;
	
	if(index>10)
	{
		direct=0;
		
			if(directionEvent.detail.dir!=direct)
			{
				directionEvent.detail.dir=direct;
				document.dispatchEvent(directionEvent);
			}
			
			index=0;
			return;
	}
}