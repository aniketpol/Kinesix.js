/*

Integral Image

Version: 	0.4
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/IntegralImageForCanvas
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de


Copyright (c) 2011 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/


function integralBlurCanvasRGB( id, top_x, top_y, width, height, radius, iterations)
{
	
	var ii = integralImageFromCanvasRGB( id, top_x,top_y, width, height);
	if ( ii == null ) return;
	var imageData = ii.imageData;
	var pixels    = imageData.pixels;
	var context   = ii.context;
	blurIntegralImageRGB( ii, radius );
	
	while ( --iterations > 0 )
	{
		ii = calculateIntegralImageRGB( pixels, width, height );
		ii.imageData = imageData;
		ii.context = context;
		blurIntegralImageRGB( ii, radius );
	}
	
	//context.putImageData( imageData, top_x, top_y );
	return imageData;
		
}



function updateCanvas( integralImage )
{
	integralImage.context.putImageData( integralImage.imageData, 0, 0 );
}
	
function blurIntegralImageRGB( integralImage, radius )
{
	var dx1,dx2,dy1,dy2,dy,idx1,idx2,idx3,idx4,area;

	var ii = integralImage;
	var width = ii.width;
	var height = ii.height;
	var pixels = ii.pixels;
	var i1 = 0;
	var i2 = 0;
	var r = ii.r;
	var g = ii.g;
	var b = ii.b;
	var iw = width + 1;
	
	for ( var y = 0; y < height; y++ ) {
		dy1 = ( y < radius ? -y : -radius );
		dy2 = ( y >= height - radius ? height - y -1 : radius );
		dy = dy2 - dy1;
		dy1 *= iw;
		dy2 *= iw;
		
		for ( var x = 0; x < width; x++ ) {
			dx1 = ( x < radius ? -x : -radius );
			dx2 = ( x >= width - radius ? width - x - 1: radius );
			
			area = 1 / ((dx2 - dx1) * dy);
			
			dx1 += i1;
			dx2 += i1;
			
			idx1 = dx1+dy1;
			idx2 = dx2+dy2;
			idx3 = dx1+dy2;
			idx4 = dx2+dy1;
			
			pixels[i2++] = (( r[idx1] + r[idx2] - r[idx3] - r[idx4] ) * area ) | 0;
			pixels[i2++] = (( g[idx1] + g[idx2] - g[idx3] - g[idx4] ) * area ) | 0;
			pixels[i2++] = (( b[idx1] + b[idx2] - b[idx3] - b[idx4] ) * area ) | 0;
			i2++
			i1++;
		}
		i1++;
	}
	
}

function integralImageFromImage( imageID, canvasID, includeAlphaChannel )
{
			
 	var img = document.getElementById( imageID );
	var w = img.naturalWidth;
    var h = img.naturalHeight;
       
	var canvas = document.getElementById( canvasID );
      
    canvas.style.width  = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w;
    canvas.height = h;
    
    var context = canvas.getContext("2d");
    context.clearRect( 0, 0, w, h );
    context.drawImage( img, 0, 0 );

	if ( includeAlphaChannel )
	{
		return integralImageFromCanvasRGBA( canvasID, 0, 0, w, h );
	} else {
		return integralImageFromCanvasRGB( canvasID, 0, 0, w, h );
	}
}

function integralImageFromCanvasRGB( id, top_x, top_y, width, height )
{
	var pixelData = getCanvasPixels( id, top_x, top_y, width, height );
	if ( pixelData == null ) return;
	
	var ii = calculateIntegralImageRGB( pixelData.pixels, width, height );
	ii.context = pixelData.context;
	ii.imageData = pixelData.imageData;
	return ii;
}


function getCanvasPixels( canvasID, top_x, top_y, width, height ) 
{
	var result = { id:canvasID, top_x:top_x, top_y:top_y, width:width, height:height };
	result.canvas  = document.getElementById( canvasID );
	result.context = result.canvas.getContext("2d");
	
	try {
	  result.imageData = result.context.getImageData( top_x, top_y, width, height );
	} catch(e) {
	  //throw new Error("unable to access image data: " + e);
	  return null;
	}
	result.pixels = result.imageData.data;
	return result;
}

function calculateIntegralImageRGB( pixels, width, height )
{
	var r = [];
    var g = [];
    var b = [];
	
	var i = 0;
	var j = 0;
	for ( y=0; y < height; y++ )
	{
		rsum = pixels[i++];
		gsum = pixels[i++];
		bsum = pixels[i++];
		i++;
		for ( x = 0; x < width; x++ )
		{
			r[j]   = rsum;
			g[j]   = gsum;
			b[j++] = bsum;
			
			rsum += pixels[i++];
			gsum += pixels[i++];
			bsum += pixels[i++];
			i++;
		}
		
		r[j]   = rsum;
		g[j]   = gsum;
		b[j++] = bsum;
		i-=4;
	}
	
	var j1 =  width + 1;
	var w1 = j1;
	var k = j1 * ( height + 1 );
	var j2 = j1 - w1;
	while ( j1 < k )
	{
		r[j1] += r[j2];
		g[j1] += g[j2];
		b[j1] += b[j2];
		j1++,j2++;
	}
	
	return { r:r, g:g, b:b, width:width, height:height, pixels:pixels };
	
}