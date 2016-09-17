	//var distance, direction, posture,a[700][700],index=0,addx,addy;
	
	var distanceEvent = new CustomEvent
	(
		"distance",
		{
			detail:
			{
				dist: "0",
				angle:"0"
			},
			
			bubbles: true,
			cancelable: true
		}
	);
	
	var directionEvent = new CustomEvent
	(
		"direction",
		{
			detail:
			{
				dir: "0"	//0-none, 1-right, 2-up right, 3-up, 4-up left, 5-left, 6-bottom left, 7-bottom, 8-bottom right
			},
			
			bubbles: true,
			cancelable: true
		}
	);
	
	var postureEvent = new CustomEvent
	(
		"posture",
		{
			detail:
			{
				post: "0"	//0-none, 1-open hand, 2-close hand
			},
			
			bubbles: true,
			cancelable: true
		}
	);
	
	
	/*function getdata(post,pos,x,y)
	{
		if(postureEvent.details.post!=post)
		{
			postureEvent.detail.post=post;
			buttonpost.dispatchEvent(postureEvent);
			a[0][0]=x;
			a[0][1]=y;
			set(x,y);
			return;
		}
		
		index++;
		a[index][0]=x;
		a[index][1]=y;
		tempx+=(a[0][0]-x);
		tempy+=(a[0][1]-y);
		
		if(index>20)
		{
			dirx=0;
			diry=0;
			
			if(tempx>40)
			{
				//direction = directionEvent.detail.dir;
				if(direction==3 || direction==4 || direction==5 || direction==6 || direction==7 || direction==0)
					dirx=1;
			}
			
			else if(temp<-40)
			{
				//direction = directionEvent.detail.dir;
				if(direction==7 || direction==8 || direction==1 || direction==2 || direction==3 || direction==0)
					dirx=-1;
			}
			
			if(tempy<-40)
			{
				//direction = directionEvent.detail.dir;
				if(direction==5 || direction==6 || direction==7 || direction==8 || direction==1 || direction==0)
					diry=1;
			}
				
			else if(tempy>40)
			{
				//direction = directionEvent.detail.dir;
				if(direction==1 || direction==2 || direction==3 || direction==4 || direction==5 || direction==0)
					diry=-1;
			}
				
			if(dirx==1)
			{
				if(diry==1)
					direction=2;
				else if(diry==-1)
					direction=8;
				else
					direction=1;
					
				directionEvent.detail.dir=direction;
				buttondir.dispatchEvent(directionEvent);
			}
			
			else if(dirx==-1)
			{
				if(diry==1)
					direction=4;
				else if(diry==-1)
					direction=6;
				else
					direction=5;
					
				directionEvent.detail.dir=direction;
				buttondir.dispatchEvent(directionEvent);
			}
			
			else if(diry==1)
			{
				direction=3;
				directionEvent.detail.dir=3;
				buttondir.dispatchEvent(directionEvent);
			}
			
			else if(diry==-1)
			{
				direction=7;
				directionEvent.detail.dir=7;
				buttondir.dispatchEvent(directionEvent);
			}
			
			else
			{
				direction=0;
				
				if(directionEvent.detail.dir!=direction)
				{
					directionEvent.detail.dir=0;
					buttondir.dispatchEvent(directionEvent);
				}
			}
			set(0,0);
		}
	}
	
	function set(x,y)
	{
		index=0;
		tempx=x;
		tempy=y;
	}*/