
/*This js file contains js code for rendering 3dcube in canvas using Three.js and WebGL
for gui controller dat.gui.js is used
for tracking mouse movement trackballcontrol.js is used 
*/

var cube,rotateAngle;

window.onload=function(){

init();
var angularSpeed = 0.2; 
var lastTime = 0;
isaDown=false;
isdDown=false;
isWDown=false;
isSDown=false;
var rotSpeed = .02; 

target = new THREE.Vector3( 0, 200, 0 );
theta=0;


//variables for transformation
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

//start animation
function animate(){ 
  requestAnimationFrame(animate);
  render();
  update();
}

function render() {
		 
		 
				var x = camera.position.x,
					y = camera.position.y,
					z = camera.position.z;
				angle =camera.viewangle
				
				
 
				/*if (isaDown)
				{ 
				    
					camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
					camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
					
				} else if (isdDown)
				{
					camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
					camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
				
				}else if(isWDown)
				{
					camera.position.y = y * Math.cos(rotSpeed) +z * Math.sin(rotSpeed);
					camera.position.z = z * Math.cos(rotSpeed) - y * math.sin(rotSpeed);
				
				}else if(isSDown){
				
					camera.position.y= y * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
					camera.position.z= z * Math.cos(rotSpeed) + y * math.sin(rotSpeed);
				}*/
    
				camera.lookAt(scene.position);
			   //raycaster = projector.pickingRay( mouse2D.clone(), camera );
				
				camera2.position.copy( camera.position );
				camera2.position.sub( controls.target ); 
				camera2.position.setLength( 500 );
				camera2.lookAt( scene2.position );
				
				
				
				controls.update();	
				renderer.render( scene, camera );
				renderer2.render( scene2, camera2 );

			}
			
			renderfun=render;

//set camera attribute
var width=window.innerWidth-50,
	height=window.innerHeight-50;
	
	
//create webGL renderer
var renderer = new THREE.WebGLRenderer();
renderer.SortObjects=false;
renderer.setSize(width,height);
document.body.appendChild(renderer.domElement);
 
var viewangle=70,
	near=4,
	far=10000;
	

var camera=new THREE.PerspectiveCamera(viewangle,width/height,near,far);
camera.position.set( 1000, 400, 400 );
//camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

//create scene
var scene=new THREE.Scene();

scene.add( new THREE.GridHelper( 500, 100 ) );

var axes = new THREE.AxisHelper(300);
scene.add( axes );


//add control
controls = new THREE.TrackballControls( camera, renderer.domElement );

/*var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif', new THREE.UVMapping(), render );
texture.anisotropy = renderer.getMaxAnisotropy();*/

/*var material = new THREE.MeshNormalMaterial({
  map: THREE.ImageUtils.loadTexture('sample.jpg')
});*/


var material =  new THREE.MeshNormalMaterial( { color:0x33FF33, transparent:true, opacity:1 } );
var geometry=new THREE.CubeGeometry(200,200,200);  
      
cube = new THREE.Mesh(geometry, material);
cube.overdraw = true;
cube.position.set(0,100,0);
scene.add(cube);
	
//cube.rotation.x = Math.PI * 0.1;
//cube.rotation.y = Math.PI * 0.1;
//cube.rotation.z = Math.PI * 0.3;

/*var light = new THREE.PointLight( 0xFFFF00 );
        light.position.set( 10, 0, 10 );
        scene.add( light );*/
//add light
/*var ambientLight = new THREE.AmbientLight(0xFF0000);
scene.add(ambientLight);*/


var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

//second scene for showing original axes

container2 = document.getElementById('AxesContainer');

var CANVAS_WIDTH = 200,
    CANVAS_HEIGHT = 200,
    CAM_DISTANCE = 300;
	
	
// renderer
renderer2 = new THREE.WebGLRenderer();
renderer2.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );
container2.appendChild( renderer2.domElement );

// scene
scene2 = new THREE.Scene();

// camera
camera2 = new THREE.PerspectiveCamera( 50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000 );
camera2.up = camera.up; // important!

// axes
axes2 = new THREE.AxisHelper( 200 );
scene2.add( axes2 );



/*o display controls on the gui
gui = new dat.GUI();
	
	parameters = 
	{
		x: 0, y: 10, z: 0,
		color: "#ff0000", // color (change "#" to "0x")
		opacity: 1, 
		visible: true,
		material: "Phong",
		reset: function() { resetCube() }
	};

	var folder1 = gui.addFolder('Position');
	var cubeX = folder1.add( parameters, 'x' ).min(-400).max(400).step(1).listen();
	var cubeY = folder1.add( parameters, 'y' ).min(0).max(300).step(1).listen();
	var cubeZ = folder1.add( parameters, 'z' ).min(-400).max(400).step(1).listen();
	folder1.open();
	
	
	
	cubeX.onChange(function(value) 
	{   cube.position.x = value;   });
	cubeY.onChange(function(value) 
	{   cube.position.y = value;   });
	cubeZ.onChange(function(value) 
	{   cube.position.z = value;   });
	
	var cubeColor = gui.addColor( parameters, 'color' ).name('Color').listen();
	cubeColor.onChange(function(value) // onFinishChange
	{   cube.material.color.setHex( value.replace("#", "0x") );   });
	
	var cubeOpacity = gui.add( parameters, 'opacity' ).min(0).max(1).step(0.01).name('Opacity').listen();
	cubeOpacity.onChange(function(value)
	{   cube.material.opacity = value;   });
	
	var cubeMaterial = gui.add( parameters, 'material', [ "Basic", "Phong", "Wireframe" ] ).name('Material Type').listen();
	cubeMaterial.onChange(function(value) 
	{   updateCube();   });
	
	
	gui.open();*/
    
	//gui control ends here
	
//my code for gui

 	/*var gui= new dat.GUI();
	
	var parameters =
	{
	   Translate:function(){ },
	   Rotate:function(){ },
	   Scale:function(){ },
	   select:"...",
	   x:0 ,y:0,z:0,
	   color: "#ff0000", // color (change "#" to "0x")
	   opacity: 1, 
	   visible: true,
	   material: "Phong",

	};
	
	
	var folder3=gui.addFolder('Transform');
	folder3.add(parameters,'Translate');
	folder3.add(parameters,'Rotate');
	folder3.add(parameters,'Scale');
	folder3.open();

	var folder1 = gui.addFolder('Position');
	var cubeX = folder1.add( parameters, 'x' ).min(-400).max(400).step(1).listen();
	var cubeY = folder1.add( parameters, 'y' ).min(-300).max(300).step(1).listen();
	var cubeZ = folder1.add( parameters, 'z' ).min(-400).max(400).step(1).listen();
	folder1.open();
	
	var stringlist=["Cube","World"];
	gui.add(parameters,'select',stringlist).name('Select object:');
	
	cubeX.onChange(function(value) 
	{   cube.position.x = value;   });
	cubeY.onChange(function(value) 
	{   cube.position.y = value;   });
	cubeZ.onChange(function(value) 
	{   cube.position.z = value;   });
	
	var cubeColor = gui.addColor( parameters, 'color' ).name('Color').listen();
	cubeColor.onChange(function(value) // onFinishChange
	{   cube.material.color.setHex( value.replace("#", "0x") );   });
	
	var cubeOpacity = gui.add( parameters, 'opacity' ).min(0).max(1).step(0.01).name('Opacity').listen();
	cubeOpacity.onChange(function(value)
	{   cube.material.opacity = value;   });
	
	var cubeMaterial = gui.add( parameters, 'material', [ "Basic", "Phong", "Wireframe" ] ).name('Material Type').listen();
	cubeMaterial.onChange(function(value) 
	{   updateCube();   });
	

    gui.open();*/
	 animate();

window.addEventListener( 'resize', OnWindowResize, false );

document.addEventListener( 'keydown', onDocumentKeyDown, false );
document.addEventListener( 'keyup', onDocumentKeyUp, false );

document.addEventListener('contextmenu', function(e){e.preventDefault();}, false);
//document.addEventListener('mousedown', toggleOn, false)
//document.addEventListener('mouseup', toggleOff, false)


function OnWindowResize(){

windowhalfx=window.innerWidth;
windowhalfy=window.innerHeight;

camera.aspect = windowhalfx / windowhalfy;
camera.updateProjectionMatrix();
renderer.setSize(windowhalfx, windowhalfy );
}

function updateCube()
{
	var value = parameters.material;
	var newMaterial;
	if (value == "Basic")
		newMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
	else if (value == "Phong")
		newMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );
	else  //(value == "Wireframe")
		newMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
	cube.material = newMaterial;
	
	cube.material.color.setHex( parameters.color.replace("#", "0x") );
	cube.material.opacity = parameters.opacity;  
	cube.material.transparent = true;
	cube.visible = parameters.visible;
	
}


function update()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels per second
	rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
	
	// local coordinates

	// local transformations

	// move forwards/backwards/left/right
	if ( keyboard.pressed("A") )
		cube.translateZ( -moveDistance );
	if ( keyboard.pressed("D") )
		cube.translateZ(  moveDistance );
	if ( keyboard.pressed("W") )
		cube.translateX( -moveDistance );
	if ( keyboard.pressed("S") )
		cube.translateX(  moveDistance );	
	if ( keyboard.pressed("Q") )
		cube.translateY(  moveDistance );	
	if ( keyboard.pressed("E") )
		cube.translateY( -moveDistance );
	if ( keyboard.pressed("F") )
		cube.position.set(0,100,0);
		
	//rotate
	var rotation_matrix = new THREE.Matrix4().identity();
	if ( keyboard.pressed("right") )
		cube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
	if ( keyboard.pressed("left") )
		cube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
	if ( keyboard.pressed("up") )
		cube.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
	if ( keyboard.pressed("down") )
		cube.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
} 

function onDocumentKeyDown( event ) {

				switch( event.keyCode ) {

					case 65: isaDown = true; break;
					case 68: isdDown = true; break;
					case 87: isWDown = true; break;
					case 83: isSDown = true; break;
					
				}

			}

		
			function onDocumentKeyUp( event ) {

				switch( event.keyCode ) {

					case 65: isaDown = false; break;
					case 68: isdDown = false; break;
					case 87: isWDown = false; break;
					case 83: isSDown = false; break;
					
				}
			}

};

