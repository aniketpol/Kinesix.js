var hull=function(data,focusdata,dx,dy)
{

//var returnarr=new Array();

var plotBaseLine=function (point1,point2,color) {

	var pt1 = point1;
    var pt2 = point2;
	context.save()
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(pt1[0]+dx,pt1[1]+dy);
    context.lineTo(pt2[0]+dx,pt2[1]+dy);
    context.stroke();
    context.restore();
},

comparePoints=function (p1, p2) {
	if (p1[0] > p2[0])
		return 1;
	if (p1[0] < p2[0])
		return -1;
	if (p1[1] > p2[1])
		return 1;
	if (p1[1] < p2[1])
		return -1;
	return 0;
},
right=function (prev_p, p, p1, p2) {
	var ccw = CCW(p2, p, p1);
	if (ccw == 0) {
		// if entirely collinear and either is on wrong side, return other
		if (prev_p != null && CCW(prev_p,p,p1) == 0) {
			var prev_dist = sqDist(prev_p, p1);
			var curr_dist = sqDist(p, p1);
			if (curr_dist > prev_dist)
				return -1;
			prev_dist = sqDist(prev_p, p2);
			curr_dist = sqDist(p, p2);
			if (curr_dist > prev_dist)
				return 1;
		}
		// pick closer point
		var dist1 = sqDist(p, p1);
		var dist2 = sqDist(p, p2);
		if (dist1 < dist2)
			return 1;
		else
			return -1;
	}
	else
		return ccw;
},


CCW=function (p1, p2, p3) {
	var det = p1[0]*(p2[1]-p3[1])-p2[0]*(p1[1]-p3[1])+p3[0]*(p1[1]-p2[1]);

	if (det < 0)
		return -1;
	else if (det > 0)
		return 1;
	else
		return 0;
},

sqDist=function (p1, p2) {
	var x_dist = p2[0] - p1[0];
	var y_dist = p2[1] - p1[1];
	return x_dist * x_dist + y_dist * y_dist;
},
JarvisMarch=function (pts) {
	if (pts.length == 0)
		return [];
	if (pts.length == 1)
		return [pts[0]];

	// find index of leftmost point
	var point = pts[0];
	for (var i = 1; i < pts.length; i++) {
		if (comparePoints(pts[i], point) < 0)
			point = pts[i];
	}
	var output = [point];

	while (true) {
		point = null;
		for (i = 0; i < pts.length; i++) {
			if (pts[i] == output[output.length-1])
				continue;
			if (point == null) {
				point = pts[i];
				continue;
			}
			if (right(output.length < 2 ? null : output[output.length-2], output[output.length-1], pts[i], point) > 0)
				point = pts[i];
		}
		//returnArray.Push({output[output.length-1],point});
		 //plotBaseLine(output[output.length-1],point,'rgb(180,0,0)');
		if (point == output[0])
			break;
		output.push(point);
	}
	return output;
},


std=function(data){
	var r,g,b,a;
	     r=g=b=a=0;
	
	var len=(data.height*data.width*4),len4=len/4;
	var coredata=data.data;
	for(i=0;i<len;i+=4)
		{
			r+=coredata[i];
			g+=coredata[i+1];
			b+=coredata[i+2];
			//a+=coredata[i+3];
		}
		
		avgR=r/len4;
		avgG=g/len4;
		avgB=b/len4;
		//avgA=a/len4;
		r=g=b=a=0;

	for(i=0;i<len;i+=4)
		{
			r+=((avgR-coredata[i])*(avgR-coredata[i]));
			g+=((avgG-coredata[i+1])*(avgG-coredata[i+1]));
			b+=((avgB-coredata[i+2])*(avgB-coredata[i+2]));
			//a+=((avgA-coredata[i+3])*(avgA-coredata[i+3]));
		}
		
		stdR=Math.sqrt(r/len4);
		stdG=Math.sqrt(g/len4);
		stdB=Math.sqrt(b/len4);
		//stdA=Math.sqrt(a/len4);
		
		redp = Math.floor(avgR+stdR);
		redm = Math.floor(avgR-stdR);
		greenp = Math.floor(avgG+stdG);
		greenm = Math.floor(avgG-stdG);
		bluep = Math.floor(avgB+stdB);
		bluem = Math.floor(avgB-stdB);

		return {redp:redp,redm:redm,greenp:greenp,greenm:greenm,bluep:bluep,bluem:bluem};
},
    DrawHull=function (data1,focusdata)
	{
		var stdarr=std(focusdata);
		var points=new Array();	
		var r,g,b,a;
	    r=g=b=a=0;
		var h=data1.height,w=data1.width;
		var len=(h*w*4),len4=len/4;
		var coredata=data1.data;
		var redm=stdarr.redm,redp=stdarr.redp,greenm=stdarr.greenm,greenp=stdarr.greenp,bluem=stdarr.bluem,bluep=stdarr.bluep;
		i=0;
	for(y=0;y<h;y++)
	{
		for(x=0;x<w;x++)
		{
	    	r=coredata[i];
			g=coredata[i+1];
			b=coredata[i+2];

			if((r>redm && r<redp) && (g>greenm && g<greenp)&& (b>bluem && b<bluep)){
			points.push([x,y]);
			}	
			else{
			coredata[i]=255;
			coredata[i+1]=255;
			coredata[i+2]=255;
			}
			i+=4;
		}
	}	
	j=0;
	output=JarvisMarch(points);
	return output;
	};
	DrawHull(data,focusdata);
	return output;
};

self.addEventListener('message', function(e) {
	var d=e.data;
	var data=hull(d.data,d.focusdata,d.x,d.y);
	self.postMessage(data);
}, false);