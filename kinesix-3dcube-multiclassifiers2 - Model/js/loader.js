	var smoother = new Smoother(0.85, [0, 0, 0, 0, 0]);
	var $video=document.getElementById('video');
	var $tCanvas = document.getElementById('canvas');
	var $tCtx = $tCanvas.getContext("2d");
	var $fCanvas = document.getElementById('focuscanvas');
	var $fCtx = $fCanvas.getContext("2d");

	var $hullCanvas = document.getElementById('hullcanvas');
	var $hCtx = $hullCanvas.getContext("2d");
	var $trackCanvas = document.getElementById('trackcanvas');
	var $trackCtx = $trackCanvas.getContext("2d");
	var loadx,loady;
	var hullflag=true,vidflag=true,nextframeflag=true,upCount=0;
	var trackX=0,trackY=0,tdx=20,tdy=20,trackW=0,trackH=0;		//tracker variables
	var Xtop=50,Ytop=50,width1=100,height1=100;					//tracker variables
	var hullworker,hullStart;									//hull variables
	var classifiers=[1,2,3,4,5,6,7,8,10,12,13];
	var $glasses=document.getElementById("glasses");
	var fist,palm,finger,loadpost,per1label,per2label,reslabel,currentclass=palmclass,totalcount=0,trackcount=0,vidcount=0;
	var time1 = new Date();
	var time1ms= time1.getTime(time1); //i get the time in ms 
	var errors=0,PrevX=0,PrevY=0,VideoX=0,TrackerX=0,VideoY=0,TrackerY=0;
	
function startVideo() {
	
		var video=$video;// = $video.get(0);

		try {
			compatibility.getUserMedia({video: true}, function(stream) {
				try {
					video.src = compatibility.URL.createObjectURL(stream);
				} catch (error) {
					video.src = stream;
				}
				video.play();
				fist=[];
				fist.push(handfist);
				
				finger=[];
				finger.push(handfinger);
				
				palm=[];
				palm.push(handpalm);
				
				per1label=document.getElementById("per1");
				per2label=document.getElementById("per2");
				reslabel=document.getElementById("res");

				hullworker=new  Worker("js/hull.js");
				hullworker.onmessage=hullcallback;
				hullworker.postMessage=hullworker.webkitPostMessage||hullworker.postMessage;
				compatibility.requestAnimationFrame(tick);
			}, function (error) {
				alert("WebRTC not available");
			});
		} catch (error) {
			alert(error);
		}
		}


		var plotBaseLine=function (point1,point2,color) 
		{
			context=$hCtx;

			var pt1 = point1;
			var pt2 = point2;
			context.save();
			context.strokeStyle = color;
			context.beginPath();
			context.moveTo(pt1[0],pt1[1]);
			context.lineTo(pt2[0],pt2[1]);
			context.stroke();
			context.restore();
		}
		
		var hullcallback = function (eventData)
		{
			if(!eventData || eventData.length==0)
			{
				hullflag=true;
				return;
			}
			
			var output=[],percent1,percent2,path;
			output[0]=eventData.data;
			var len=output[0].length;
			var i;
			
			if (!output || len==0)
			{
				hullflag=true;
				return;
			}
			ctx=$hCtx;
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.restore();
			
			
			path=[];
			path[0]=[];
			
			for (i=0;i<len-1;++i)
			{
				plotBaseLine(output[0][i],output[0][i+1],'rgb(180,0,0)');
				path[0][i]={x: output[0][i][0], y: output[0][i][1]};
			}
			plotBaseLine(output[0][i],output[0][0],'rgb(180,0,0)');
			path[0][i]={x: output[0][i][0], y: output[0][i][1]};
			
			if(path[0].length<2)
			{
				hullflag=true;
				return;
			}
			percent1 = shapeContextMatch(fist,path)*100;
			percent2 = shapeContextMatch(palm,path)*100;
			
			if (percent1<60 && percent2<60)
			{
				reslabel.innerHTML+="NONE";
			}
			else
			{
				if (percent2>=60)
				{
					
					reslabel.innerHTML="result = palm";
					loadpost=2;
					currentclass=palmclass;
				}
				else
				{
					reslabel.innerHTML="result = FIST";
					loadpost=1;
					currentclass=fistclass;

				}
			}
			/*if( percent2 > 65 || ( percent2 > 65 && percent1 < 50 ) )
			{
				reslabel.innerHTML="result = palm";
				loadpost=2;
				currentclass=palmclass;
				//showPos(2,loadx/2,loady/2);
			}
				
			else
			{
				if(percent1>65)
				{
					reslabel.innerHTML="result = FIST";
					loadpost=1;
					currentclass=fistclass;
					//showPos(2,loadx/2,loady/2);
				}
					
				else 
				{
					reslabel.innerHTML+="NONE";
					//showPos(0,0,0);
					//loadpost=;
				}
			}*/
			
			//per1label.innerHTML="percent1 = "+percent1+"%";
			;
			
			/*if(loadpost==1)
				per2label.innerHTML="percent2 = "+percent2+"%" +"</br>x: "+loadx+"</br>y: "+loady+"</br>"+"class: FIST CLASS";
				
			else if(loadpost==2)
				per2label.innerHTML="percent2 = "+percent2+"%" +"</br>x: "+loadx+"</br>y: "+loady+"</br>"+"class: FINGER CLASS";*/
			
			hullflag=true;
		}

		var callback =function (coords,context)
		{

			nextframeflag=true;
		
			if (coords[0]){
					
					coords = smoother.smooth(coords[0]);

					var x=coords[0],y=coords[1],width=coords[2],height=coords[3];
					
					
					if(x>200)
						{
						vidflag=true;
						console.log('face');	
						return;
						}
					if(Math.abs((PrevX-x))>50 && PrevX!=0)
					{
					  vidflag=true;
					  console.log('jump');
					  PrevX=0;
					  return;
					}
					
					showPos(loadpost,x,y);

					
					  PrevX=x;
						var div=document.getElementById("list");
						if (vidflag==true)
						{
							vidcount++;
							//console.log("Rect found in video");
							//vidflag=false;

							per1label.innerHTML="x "+ x +"<br>" + " y "+ y ;
							VideoX=x;
							trackW=width+30;
							trackH=height;
							trackX=x-20;
							trackY=y;
							
						}
						else
						{
							trackcount++;
							//console.log("Rect found in tracker!");
							TrackerX=x;
							/*if(Math.abs(VideoX-TrackerX)>50)
							{
								console.log('long jump');
								vidflag=true;
								return;
							}*/
							per2label.innerHTML="x "+ x+"<br>" + " y "+ y;
							trackW=width+20;
							trackH=height+20;
							trackX=x-20;
							trackY=y-20;
						}
						
						totalcount++;
						
						if (totalcount%100==0)
						{
							console.log(vidcount);
							console.log(trackcount);
							
							var time2 = new Date();
							var time2ms= time2.getTime(time2); //i get the time in ms
							var diff=time2ms-time1ms;
							console.log(diff);
							console.log(errors);
							time1=time2;
							time1ms=time1.getTime(time1);
							vidcount=trackcount=errors=0;
	
						}

					data=context.getImageData(trackX,trackY,trackW,trackH);    //put manipulated data on tracker Canvas
					$trackCtx.setTransform(1, 0, 0, 1, 0, 0);
					$trackCtx.clearRect(0, 0, 320,240);
					$trackCtx.restore();

					$trackCtx.putImageData(data,trackX,trackY,0,0,trackW,trackH);
					
				
					var focusdata=$trackCtx.getImageData(trackX+data.width*0.5,trackY+data.height*0.45,data.width*0.15,data.height*0.08);
					
					$fCtx.setTransform(1, 0, 0, 1, 0, 0);
					$fCtx.clearRect(0, 0, $fCtx.canvas.width, $fCtx.canvas.height);
					$fCtx.putImageData(focusdata,0,0);
					$trackCtx.save();

					if (hullflag==true)
					{
						hullflag=false;
						hullworker.postMessage({data:data,focusdata:focusdata,x:x,y:y});
					}
					
					

					} else {
						console.log("no-coords");
						if(currentclass==palmclass)
							currentclass=fistclass;
						else
							currentclass=palmclass;
							
						if (vidflag==false)
							vidflag=true;
						
						showPos(0,0,0);
					}
		}
	
	
		function tick() {
		
			if (hullflag==false)
				upCount++;
			if (upCount>10)
			{
				hullworker.terminate();
				
				hullworker=new  Worker("js/hull.js");
				hullworker.onmessage=hullcallback;
				hullworker.postMessage=hullworker.webkitPostMessage||hullworker.postMessage;
				hullflag=true;
				console.log("<<<ALERT>>> Convex Hull was killed!");
				upCount=0;
			}
			
			
			if (nextframeflag==false)
				return;
			compatibility.requestAnimationFrame(tick);
			var gray,sat,ssat,rsat,canvasWidth,canvasHeight;
			
			if (video.readyState === video.HAVE_ENOUGH_DATA) {
				nextframeflag=false;

				
				if (vidflag==true)
				{
					//console.log("Looking for rect in video!");
					//$(video).objectdetect("all", {scaleMin: 3, scaleFactor: 1.1, classifier: objectdetect.frontalface},callback);
    				var options={scaleMin: 3, scaleFactor: 1.1, classifier:currentclass };
					$tCtx.drawImage($video,0,0,640,480,0,0,320,240);
					canvasWidth=200;
					canvasHeight=$tCtx.canvas.height;
					canvasWidthRatio=1.25;
					canvasHeightRatio=1;
					
					var imageData=$tCtx.getImageData(0,0,canvasWidth,canvasHeight);
					
					gray = runobjectdetect.convertRgbaToGrayscale(imageData.data, gray);
					runobjectdetect.equalizeHistogram(gray);
					sat = runobjectdetect.computeSat(gray, canvasWidth, canvasHeight, sat);
					ssat = runobjectdetect.computeSquaredSat(gray, canvasWidth, canvasHeight, ssat);
					if (options.classifier.tilted) rsat = runobjectdetect.computeRsat(gray, canvasWidth, canvasHeight, rsat);
					
					var rects = runobjectdetect.detectMultiScale(sat, rsat, ssat, undefined, canvasWidth, canvasHeight, options.classifier, options.scaleFactor, options.scaleMin);
					rects = runobjectdetect.groupRectangles(rects, 1).sort(function(rect) {return rect[4];});
					
					for (var i = rects.length - 1; i >= 0; --i) {
						rects[i][0] = (~~(rects[i][0] * canvasWidthRatio))-10;// + canvasWidth;
						rects[i][1] = (~~(rects[i][1] * canvasHeightRatio))+10;// + canvasHeight;
						rects[i][2] = (~~(rects[i][2] * canvasWidthRatio))-20;
						rects[i][3] = ~~(rects[i][3] * canvasHeightRatio);
					}
					callback(rects,$tCtx);
				}
				else
				{
					//$(trackcanvas).objectdetect("all", {scaleMin: 3, scaleFactor: 1.1, classifier: objectdetect.frontalface},callback);
					//var scf=6;
					//if (trackW!=0)
					// scf=320/trackW;

					var options={scaleMin: 3, scaleFactor:1.1 , classifier:currentclass };
					$tCtx.drawImage($video,0,0,640,480,0,0,320,240);
					
					//console.log("Looking for rect in tracker");
					
					//$trackCtx.setTransform(1, 0, 0, 1, 0, 0);
					//$trackCtx.clearRect(0, 0, $trackCtx.canvas.width, $trackCtx.canvas.height);
				
					//$trackCtx.drawImage($tCanvas,trackX,trackY,trackW,trackH,0,0,trackW,trackH);
					
					/*$320Ctx.setTransform(1, 0, 0, 1, 0, 0);
					$320Ctx.clearRect(0, 0, $320Ctx.canvas.width, $320Ctx.canvas.height);
					//$320Ctx.drawImage($trackCanvas,0,0,trackW,trackH,trackX,trackY,trackW,trackH);
					
					//$320Ctx.drawImage(tempcanvas,0,0,tempctx.canvas.width,tempctx.canvas.height,trackX,trackY,tempctx.canvas.width,tempctx.canvas.height);
					
					$320Ctx.drawImage($trackCanvas,0,0,$trackCtx.canvas.width,$trackCtx.canvas.height,trackX,trackY,$trackCtx.canvas.width,$trackCtx.canvas.height);*/
					
					canvasWidth=200;
					canvasHeight=$trackCtx.canvas.height;
					canvasWidthRatio=2;
					canvasHeightRatio=1;
					
					
					//var imageData=$trackCtx.getImageData(0,0,canvasWidth,canvasHeight);
					var imageData=$trackCtx.getImageData(0,0,canvasWidth,canvasHeight);
					
					
					gray = runobjectdetect.convertRgbaToGrayscale(imageData.data, gray);
					runobjectdetect.equalizeHistogram(gray);
					sat = runobjectdetect.computeSat(gray, canvasWidth, canvasHeight, sat);
					ssat = runobjectdetect.computeSquaredSat(gray, canvasWidth, canvasHeight, ssat);
					if (options.classifier.tilted) rsat = runobjectdetect.computeRsat(gray, canvasWidth, canvasHeight, rsat);
					
					var rects = runobjectdetect.detectMultiScale(sat, rsat, ssat, undefined, canvasWidth, canvasHeight, options.classifier, options.scaleFactor, options.scaleMin);
					rects = runobjectdetect.groupRectangles(rects, 1).sort(function(rect) {return rect[4];});
					
					for (var i = rects.length - 1; i >= 0; --i) {
						rects[i][0] = (~~(rects[i][0] * canvasWidthRatio))-10;// + canvasWidth;
						rects[i][1] = (~~(rects[i][1] * canvasHeightRatio))+10;// + canvasHeight;
						rects[i][2] = (~~(rects[i][2] * canvasWidthRatio))-20;
						rects[i][3] = ~~(rects[i][3] * canvasHeightRatio);
					}
					
					callback(rects,$tCtx);
				}
			}
		}
