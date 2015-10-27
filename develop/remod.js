(function () {
	
	var app = angular.module('remod', [
		'ngAnimate',
		'ui.bootstrap',
		'ui.router',
		'angularFileUpload'
	]);
	
	app.run = function($rootScope) {
		$rootScope.$on("$stateChangeError", console.log.bind(console));
	};
	
	app.factory('remodSession', ['$rootScope', '$http', '$filter', '$timeout', '$interval', '$modal',
		function ($rootScope, $http, $filter, $timeout, $interval, $modal) {
			
			function defclass(prototype) {
				var constructor = prototype.constructor;
				constructor.prototype = prototype;
				return constructor;
			};
			var NaiveNeuron = defclass({
				name : "",
				group: "",
				id : null,
				obj3d : new THREE.Object3D(),
				sections : new Array(),
				sectionIDs : new Array(),
				selectedSections: new Array(),
				historyState: "before",
				constructor : function(){
					name = "";
					id = null;
					obj3d = new THREE.Object3D();
					sections = new Array();
					sectionIDs = new Array();
					selectedSections = new Array();
				},
				id2idx: function(id){
					return this.sectionIDs.indexOf(id);
				},
				idx2id: function(idx){
					return this.sectionIDs[idx];
				},
				sectionIdExists : function(sid){
					var i;
					if (this.sectionIDs.length==0){
						//if this is the very first segment being added:
						this.sections[0] = new Array();
						this.sectionIDs[0] = sid;
						return 0;
					} else {
						//for all existing sectionIDs:
						for ( i = 0 ; i < this.sectionIDs.length ; i++ ){
							if (sid == this.sectionIDs[i]){
								//if encountered before, return idx:
								return i;
							}
						}
					}
					// if not push to array:
					this.sections[i] = new Array();
					this.sectionIDs[i] = sid;
					return i;
				},
				push_segment_to_section : function (newSectionLine, sid) {
					//push new Line to corrresponding section Array:
					this.sections[this.sectionIdExists(sid)].push(newSectionLine);
					//and to obj3d:
					this.obj3d.add(newSectionLine);
				},
				remove_all_segments: function(){
					//remove segments and geometry:
					for (var i = (this.obj3d.children.length-1) ; i >= 0 ; i-- ){
						this.obj3d.remove(this.obj3d.children[i]);
					}
				}
			});
			var Viewport = defclass({
				height: 0,
				width: 0,
				camera: 0,
				canvas: 0,
				scene: 0,
				animationID: 0,
				debug: 0,
				controls: 0,
				viewUpdating: false,
			//	Define the constructor function
				constructor: function (FOV,minclip, maxclip,debug) {
					var _this = this;
					//hardcoded footer height!! SSS
					this.height = window.innerHeight - (34 + $('.navbar').height());//$(document).find("#mainView").height();
					this.width = window.innerWidth;//$(document).find("#mainView").width();
					this.debug = debug;
					this.camera = new THREE.PerspectiveCamera(FOV, this.width / this.height, minclip, maxclip);
					this.camera.position.set(0, 0, 500);
					//this.controls = new THREE.TrackballControls(this.camera, this.canvas.domElement);
					//Fetch intact the THREE.trackbackControlls; to make it sleeker. SSS
					this.MyControls = function ( object, domElement ) {
					
						var _this = this;
						var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM: 4, TOUCH_PAN: 5 };
					
						this.object = object;
						this.domElement = ( domElement !== undefined ) ? domElement : document;
					
						// API
					
						this.enabled = true;
						this.drag = false; //SSS
						this.screen = { left: 0, top: 0, width: 0, height: 0 };
					
						this.rotateSpeed = 1.0;
						this.zoomSpeed = 1.2;
						this.panSpeed = 0.3;
					
						this.noRotate = false;
						this.noZoom = false;
						this.noPan = false;
						this.noRoll = false;
						this.lockY = false; //SSS
					
						this.staticMoving = false;
						this.dynamicDampingFactor = 0.2;
					
						this.minDistance = 0;
						this.maxDistance = Infinity;
					
						this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];
					
						// internals
					
						this.target = new THREE.Vector3();
					
						var EPS = 0.000001;
					
						var lastPosition = new THREE.Vector3();
					
						var _state = STATE.NONE,
						_prevState = STATE.NONE,
					
						_eye = new THREE.Vector3(),
					
						_rotateStart = new THREE.Vector3(),
						_rotateEnd = new THREE.Vector3(),
					
						_zoomStart = new THREE.Vector2(),
						_zoomEnd = new THREE.Vector2(),
					
						_touchZoomDistanceStart = 0,
						_touchZoomDistanceEnd = 0,
					
						_panStart = new THREE.Vector2(),
						_panEnd = new THREE.Vector2();
					
						// for reset
					
						this.target0 = this.target.clone();
						this.position0 = this.object.position.clone();
						this.up0 = this.object.up.clone();
					
						// events
					
						var changeEvent = { type: 'change' };
						var startEvent = { type: 'start'};
						var endEvent = { type: 'end'};
					
					
						// methods
					
						this.handleResize = function () {
					
							if ( this.domElement === document ) {
					
								this.screen.left = 0;
								this.screen.top = 0;
								this.screen.width = window.innerWidth;
								this.screen.height = window.innerHeight;
					
							} else {
					
								var box = this.domElement.getBoundingClientRect();
								// adjustments come from similar code in the jquery offset() function
								var d = this.domElement.ownerDocument.documentElement;
								this.screen.left = box.left + window.pageXOffset - d.clientLeft;
								this.screen.top = box.top + window.pageYOffset - d.clientTop;
								this.screen.width = box.width;
								this.screen.height = box.height;
					
							}
					
						};
					
						this.handleEvent = function ( event ) {
					
							if ( typeof this[ event.type ] == 'function' ) {
					
								this[ event.type ]( event );
					
							}
					
						};
					
						this.getMouseOnScreen = function ( pageX, pageY, vector ) {
					
							return vector.set(
								( pageX - _this.screen.left ) / _this.screen.width,
								( pageY - _this.screen.top ) / _this.screen.height
							);
					
						};
					
						this.getMouseProjectionOnBall = (function(){
					
							var objectUp = new THREE.Vector3(),
								mouseOnBall = new THREE.Vector3();
					
					
							return function ( pageX, pageY, projection ) {
					
								mouseOnBall.set(
									( pageX - _this.screen.width * 0.5 - _this.screen.left ) / (_this.screen.width*.5),
									( _this.screen.height * 0.5 + _this.screen.top - pageY ) / (_this.screen.height*.5),
									0.0
								);
					
								var length = mouseOnBall.length();
					
								if ( _this.noRoll ) {
					
									if ( length < Math.SQRT1_2 ) {
					
										mouseOnBall.z = Math.sqrt( 1.0 - length*length );
					
									} else {
					
										mouseOnBall.z = .5 / length;
										
									}
					
								} else if ( length > 1.0 ) {
					
									mouseOnBall.normalize();
					
								} else {
					
									mouseOnBall.z = Math.sqrt( 1.0 - length * length );
					
								}
					
								_eye.copy( _this.object.position ).sub( _this.target );
					
								projection.copy( _this.object.up ).setLength( mouseOnBall.y )
								projection.add( objectUp.copy( _this.object.up ).cross( _eye ).setLength( mouseOnBall.x ) );
								projection.add( _eye.setLength( mouseOnBall.z ) );
					
								return projection;
							}
					
						}());
					
						this.rotateCamera = (function(){
					
							var axis = new THREE.Vector3(),
								quaternion = new THREE.Quaternion();
					
					
							return function () {
					
								var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );
					
								if ( angle ) {
					
									axis.crossVectors( _rotateStart, _rotateEnd ).normalize();
					
									angle *= _this.rotateSpeed;
					
									quaternion.setFromAxisAngle( axis, -angle );
					
									_eye.applyQuaternion( quaternion );
									_this.object.up.applyQuaternion( quaternion );
					
									_rotateEnd.applyQuaternion( quaternion );
					
									if ( _this.staticMoving ) {
					
										_rotateStart.copy( _rotateEnd );
					
									} else {
					
										quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
										_rotateStart.applyQuaternion( quaternion );
					
									}
					
								}
							}
					
						}());
					
						this.zoomCamera = function () {
					
							if ( _state === STATE.TOUCH_ZOOM ) {
					
								var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
								_touchZoomDistanceStart = _touchZoomDistanceEnd;
								_eye.multiplyScalar( factor );
					
							} else {
					
								var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;
					
								if ( factor !== 1.0 && factor > 0.0 ) {
					
									_eye.multiplyScalar( factor );
					
									if ( _this.staticMoving ) {
					
										_zoomStart.copy( _zoomEnd );
					
									} else {
					
										_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;
					
									}
					
								}
					
							}
					
						};
					
						this.panCamera = (function(){
					
							var mouseChange = new THREE.Vector2(),
								objectUp = new THREE.Vector3(),
								pan = new THREE.Vector3();
					
							return function () {
					
								mouseChange.copy( _panEnd ).sub( _panStart );
					
								if ( mouseChange.lengthSq() ) {
					
									mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );
					
									pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
									pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );
					
									_this.object.position.add( pan );
									_this.target.add( pan );
					
									if ( _this.staticMoving ) {
					
										_panStart.copy( _panEnd );
					
									} else {
					
										_panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );
					
									}
					
								}
							}
					
						}());
					
						this.checkDistances = function () {
					
							if ( !_this.noZoom || !_this.noPan ) {
					
								if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {
					
									_this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );
					
								}
					
								if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {
					
									_this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );
					
								}
					
							}
					
						};
					
						this.update = function () {
					
							_eye.subVectors( _this.object.position, _this.target );
					
							if ( !_this.noRotate ) {
								if(_this.lockY){_rotateStart.y=0;_rotateEnd.y=0;} //SSS
								_this.rotateCamera();
					
							}
					
							if ( !_this.noZoom ) {
					
								_this.zoomCamera();
					
							}
					
							if ( !_this.noPan ) {
					
								_this.panCamera();
					
							}
					
							_this.object.position.addVectors( _this.target, _eye );
					
							_this.checkDistances();
					
							_this.object.lookAt( _this.target );
					
							if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {
					
								_this.dispatchEvent( changeEvent );
					
								lastPosition.copy( _this.object.position );
					
							}
					
						};
					
						this.reset = function () {
					
							_state = STATE.NONE;
							_prevState = STATE.NONE;
					
							_this.target.copy( _this.target0 );
							_this.object.position.copy( _this.position0 );
							_this.object.up.copy( _this.up0 );
					
							_eye.subVectors( _this.object.position, _this.target );
					
							_this.object.lookAt( _this.target );
					
							_this.dispatchEvent( changeEvent );
					
							lastPosition.copy( _this.object.position );
					
						};
					
						// listeners (some made methods by SSS)
					
						function keydown( event ) {
					
							if ( _this.enabled === false ) return;
					
							window.removeEventListener( 'keydown', keydown );
					
							_prevState = _state;
					
							if ( _state !== STATE.NONE ) {
					
								return;
					
							} else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {
					
								_state = STATE.ROTATE;
					
							} else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {
					
								_state = STATE.ZOOM;
					
							} else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan ) {
					
								_state = STATE.PAN;
					
							}
					
						}
					
						function keyup( event ) {
					
							if ( _this.enabled === false ) return;
					
							_state = _prevState;
					
							window.addEventListener( 'keydown', keydown, false );
					
						}
					//SSS make method
						this.mousedown = function( event ) {
					
							if ( _this.enabled === false ) return;
							_this.drag = false;console.log("mousedown (drag=false)");console.log(event);
					
							event.preventDefault();
							event.stopPropagation();
					
							if ( _state === STATE.NONE ) {
					
								_state = event.button;
					
							}
					
							if ( _state === STATE.ROTATE && !_this.noRotate ) {
					
								_this.getMouseProjectionOnBall( event.pageX, event.pageY, _rotateStart );
								_rotateEnd.copy(_rotateStart)
					
							} else if ( _state === STATE.ZOOM && !_this.noZoom ) {
					
								_this.getMouseOnScreen( event.pageX, event.pageY, _zoomStart );
								_zoomEnd.copy(_zoomStart);
					
							} else if ( _state === STATE.PAN && !_this.noPan ) {
					
								_this.getMouseOnScreen( event.pageX, event.pageY, _panStart );
								_panEnd.copy(_panStart)
					
							}
					/* //SSS
							document.addEventListener( 'mousemove', mousemove, false ); //SSS
							document.addEventListener( 'mouseup', mouseup, false ); //SSS */
							_this.dispatchEvent( startEvent );
							
						}
					//SSS make method
						this.mousemove = function( event ) {
					
							if ( _this.enabled === false ) return;
							_this.drag = true;console.log("mousemove (drag=true)");
					
							event.preventDefault();
							event.stopPropagation();
					
							if ( _state === STATE.ROTATE && !_this.noRotate ) {
					
								_this.getMouseProjectionOnBall( event.pageX, event.pageY, _rotateEnd );
					
							} else if ( _state === STATE.ZOOM && !_this.noZoom ) {
					
								_this.getMouseOnScreen( event.pageX, event.pageY, _zoomEnd );
					
							} else if ( _state === STATE.PAN && !_this.noPan ) {
					
								_this.getMouseOnScreen( event.pageX, event.pageY, _panEnd );
					
							}
					
						}
					//SSS make method
						this.mouseup = function( event ) {
					
							if ( _this.enabled === false ) return;
							//Trouble with mouse events: mouse move fires even if not moving:
							//Temprorary fix by checking mose movement to determine drag:
							//if ( (event.movementX != 0) && (event.movenetY != 0) ){
								//_this.drag = true;console.log("mousemove (drag=true)");console.log(event);
							//}
							
							
							event.preventDefault();
							event.stopPropagation();
					
							_state = STATE.NONE;
					
							//document.removeEventListener( 'mousemove', mousemove ); //SSS
							//document.removeEventListener( 'mouseup', mouseup ); //SSS
							_this.dispatchEvent( endEvent );
							
							//console.log("MyControls: mouseup drag");
							if ( !_this.drag ){
								console.log("MyControls: mouseup no drag");
								//mainView Must be created first (I guess):
								var session = angular.element("#mainView").scope().session;
								var mouseray = session.mainView.mouseProject(event);
								var secIdx = session.mainView.getSectionClosestToRay(session.activeMorphology, mouseray);
								//console.log(session.morphologies[0]);
								if (secIdx !== null){
									//if a new dendrite is selected add it to list and highlight it:
									session.mainView.toggleHighlightSection(session.activeMorphology,secIdx);
								} else {
									session.mainView.removeAllHighlight(session.activeMorphology);
								}
							}
					
						}
					//SSS make method
						this.mousewheel = function( event ) {
					
							if ( _this.enabled === false ) return;
					
							event.preventDefault();
							event.stopPropagation();
					
							var delta = 0;
					
							if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
					
								delta = event.wheelDelta / 40;
					
							} else if ( event.detail ) { // Firefox
					
								delta = - event.detail / 3;
					
							}
					
							_zoomStart.y += delta * 0.01;
							_this.dispatchEvent( startEvent );
							_this.dispatchEvent( endEvent );
					
						}
					
						function touchstart( event ) {
					
							if ( _this.enabled === false ) return;
					
							switch ( event.touches.length ) {
					
								case 1:
									_state = STATE.TOUCH_ROTATE;
									_rotateEnd.copy( _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateStart ));
									break;
					
								case 2:
									_state = STATE.TOUCH_ZOOM;
									var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
									var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
									_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );
									break;
					
								case 3:
									_state = STATE.TOUCH_PAN;
									_panEnd.copy( _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panStart ));
									break;
					
								default:
									_state = STATE.NONE;
					
							}
							_this.dispatchEvent( startEvent );
					
					
						}
					
						function touchmove( event ) {
					
							if ( _this.enabled === false ) return;
					
							event.preventDefault();
							event.stopPropagation();
					
							switch ( event.touches.length ) {
					
								case 1:
									_this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateEnd );
									break;
					
								case 2:
									var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
									var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
									_touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy )
									break;
					
								case 3:
									_this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panEnd );
									break;
					
								default:
									_state = STATE.NONE;
					
							}
					
						}
					
						function touchend( event ) {
					
							if ( _this.enabled === false ) return;
					
							switch ( event.touches.length ) {
					
								case 1:
									_rotateStart.copy( _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _rotateEnd ));
									break;
					
								case 2:
									_touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
									break;
					
								case 3:
									_panStart.copy( _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, _panEnd ));
									break;
					
							}
					
							_state = STATE.NONE;
							_this.dispatchEvent( endEvent );
					
						}
					/* //SSS
						this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
					
						this.domElement.addEventListener( 'mousedown', mousedown, false );
					
						this.domElement.addEventListener( 'mousewheel', mousewheel, false );
						this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox
					
						this.domElement.addEventListener( 'touchstart', touchstart, false );
						this.domElement.addEventListener( 'touchend', touchend, false );
						this.domElement.addEventListener( 'touchmove', touchmove, false );
					*/
						//window.addEventListener( 'keydown', keydown, false );
						//window.addEventListener( 'keyup', keyup, false );
					
						this.handleResize();
					
						// force an update at start
						this.update();
					
					};
					this.MyControls.prototype = Object.create( THREE.EventDispatcher.prototype );
					this.controls = new this.MyControls(this.camera, this.canvas.domElement);
					this.canvas = new THREE.CanvasRenderer();
					this.canvas.setSize(this.width, this.height);
					this.canvas.setClearColor(0xf0f0f0);
					this.canvas.clear();
					this.scene = new THREE.Scene();
					this.cameraRay = new THREE.Object3D();
   					this.RayGeometry = new THREE.Geometry();
					   //Morphology colors:
					this.highlightColor = 0x990000;
					this.drawColor = 0x3E50D7;
					   //Mouse controls:
					this.targetRotation = 0;
					this.targetRotationOnMouseDown = 0;
		
					this.mouseX = 0;
					this.mouseXOnMouseDown = 0;
		
					this.windowHalfX = window.innerWidth / 2;
					this.windowHalfY = window.innerHeight / 2;
					
					//mouse click/select
					
					this.mouseNDCs = new THREE.Vector2();
					this.raycaster = new THREE.Raycaster();
					this.mouseray = null;
					//ray PointOnPlane but not ON plane :)
					this.raypop = new THREE.Vector3();
					this.cameraRay = new THREE.Object3D();
					this.RayGeometry = new THREE.Geometry();
					this.viewUpdating = false;
				}, //Viewport constructor end.
				// Create the projected ray from mouse pop to camera origin:
				mouseProject: function(event){
					var _this = angular.element("#mainView").scope().session.mainView;
					//We need the NDC but for the camera only! Not to be fooled by
					//the magnificent and spacious browser window:
					//Remove from the event coordinates the necessary stuff.
					var cameraOffset = $("#mainView").offset();
					//console.log("Offset is: "+cameraOffset.top+" left "+cameraOffset.left);
					//Get Normalized Device Coordinates (between -1, 1):
					_this.mouseNDCs.x = ( (event.clientX - cameraOffset.left) / _this.canvas.domElement.width ) * 2 - 1;
					_this.mouseNDCs.y = - ( (event.clientY - cameraOffset.top) / _this.canvas.domElement.height ) * 2 + 1;
					
					// update the picking ray with the camera and mouse position	
					_this.raycaster.setFromCamera( _this.mouseNDCs, _this.camera );
					
					
					_this.raypop = new THREE.Vector3(_this.raycaster.ray.direction.x, _this.raycaster.ray.direction.y, _this.raycaster.ray.direction.z);
					_this.raypop.multiplyScalar(1000);
					_this.raypop.add(_this.raycaster.ray.origin);
					
					//start and end points of mouse click ray:			
					_this.mouseray = {
						R0:_this.raycaster.ray.origin,
						R1:_this.raypop
					};
					
					if (false) {
						console.log("ORIGIN X=" + _this.raycaster.ray.origin.x + " Y= " + _this.raycaster.ray.origin.y + " Z= " + _this.raycaster.ray.origin.z);
						console.log("Direction X=" + _this.raycaster.ray.direction.x + " Y= " + _this.raycaster.ray.direction.y + " Z= " + _this.raycaster.ray.direction.z);
						console.log("END X=" + _this.raypop.x + " Y= " + _this.raypop.y + " Z= " + _this.raypop.z);
						if (true) {
							console.log("Scene has "+_this.scene.children.length+" children.");
							for (var i = (_this.scene.children.length-1) ; i > 0  ;  i-- ){
								if (_this.scene.children[i].name == "mouseray"){
									console.log("Removing children with name "+_this.scene.children[i].name);
									delete _this.scene.remove(_this.scene.children[i]);
									console.log("Now scene has "+_this.scene.children.length+" children.");
								}
							}
						}
						//giati xalousan to this.mouseray ta extra vertices???? SSS
						_this.RayGeometry.vertices = new Array();
						_this.RayGeometry.vertices.push(
								_this.raycaster.ray.origin,
								_this.raypop
						);
				
						_this.cameraRay.add(new THREE.Line(_this.RayGeometry, new THREE.LineBasicMaterial({
							color: 0x005251,
							linewidth: 2
						})
						));
						_this.cameraRay.name = "mouseray";
						_this.scene.add(_this.cameraRay);
						
						//render();
					}
					return _this.mouseray;
				},
				getSectionClosestToRay: function(morphology, ray) {
					//It would be better to project the segments in 2d and then
					//getting the distances between selection and segment.
					//The implemented approach makes user prone to perspective 
					//misses when selecting... SSS 
					//if (this.debug) { console.log("DEBUG: Getting Section closest to Ray..."); }
					var minDistanceFromSegment = Infinity;
					var selectedSection;
					//for each section id added (# of dendritic branch)
					for (var sec = 0 ; sec < morphology.sectionIDs.length ; sec++){
						//for each segmend of this section:
						for (var seg = 0 ; seg < morphology.sections[sec].length ; seg++){
							//console.log(morphology.sections[sec]);
							var segDist = this.distanceBetweenSegments(
									morphology.sections[sec][seg].geometry.vertices[0],
									morphology.sections[sec][seg].geometry.vertices[1],
									ray.R0,
									ray.R1
							);
							if (minDistanceFromSegment > segDist){
								minDistanceFromSegment = segDist;
								selectedSection = sec; 
							}
						}
					}
					
					//if (this.debug) { console.log("DEBUG: Min dist from segment is: " + minDistanceFromSegment); }
					//if (this.debug) { console.log("DEBUG: Selected section is: " + morphology.sectionIDs[selectedSection]); }
				
					//If no section is close enough, retern NULL:
					//Due to perspective, this threshold is dependend on distance
					//to target. So is essentially very large just in case. 
					if (minDistanceFromSegment > 50){
						selectedSection = null;
					}
				
					//return section INDEX that is closer to projected ray:
					//Section INDEX is local, section ID (arbitrary) is stored in sectionIDs
					return selectedSection;
				},
				distanceBetweenSegments: function(S0, S1, R0, R1) {
					//console.log("mainView.debug: distanceBetweenSegments: " + S0.x + S0.y + S0.z + S1.x + S1.y + S1.z + R0.x + R0.y + R0.z + R1.x + R1.y + R1.z);
					//console.log("mainView.debug: distanceBetweenSegments: ");
					var ray0 = new THREE.Vector3(R0.x, R0.y, R0.z);
					var ray1 = new THREE.Vector3(R1.x, R1.y, R1.z);
					var seg0 = new THREE.Vector3(S0.x, S0.y, S0.z);
					var seg1 = new THREE.Vector3(S1.x, S1.y, S1.z);
				
					var u = new THREE.Vector3();
					var v = new THREE.Vector3();
					var w = new THREE.Vector3();
					var a, b, c, d, e, D, sc, tc;
					var tempV1 = new THREE.Vector3();
					var tempV2 = new THREE.Vector3();
					var tempV3 = new THREE.Vector3();
					var sc, sN, sD;       // sc = sN / sD, default sD = D >= 0
					var tc, tN, tD;       // tc = tN / tD, default tD = D >= 0
					var SMALL_NUM = 0.0001;
					var dP = new THREE.Vector3();
				
					u = seg1.sub(seg0);
					v = ray1.sub(ray0);
					w = seg0.sub(ray0);
				
					a = u.dot(u);
					b = u.dot(v);
					c = v.dot(v);
					d = u.dot(w);
					e = v.dot(w);
					//tempV1.multiplyVectors(a,c);
					//tempV2.multiplyVectors(b,b);
					//D = tempV1.sub(tempV2);
					D = (a * c) - (b * b);
					sD = D;
					tD = D;
				
					//if(mainView.debug){console.log("Vector a X=" + a.x + " Y="+a.y+" Z="+a.z);}
					//if(mainView.debug){console.log("VAR D=" + D );}
				
					// compute the line parameters of the two closest points
					if (D < SMALL_NUM) { // the lines are almost parallel
						sN = 0.0;         // force using point P0 on segment S1
						sD = 1.0;         // to prevent possible division by 0.0 later
						tN = e;
						tD = c;
					}
					else {                 // get the closest points on the infinite lines
						sN = (b * e - c * d);
						tN = (a * e - b * d);
						if (sN < 0.0) {        // sc < 0 => the s=0 edge is visible
							sN = 0.0;
							tN = e;
							tD = c;
						}
						else if (sN > sD) {  // sc > 1  => the s=1 edge is visible
							sN = sD;
							tN = e + b;
							tD = c;
						}
					}
				
					if (tN < 0.0) {            // tc < 0 => the t=0 edge is visible
						tN = 0.0;
						// recompute sc for this edge
						if (-d < 0.0)
							sN = 0.0;
						else if (-d > a)
							sN = sD;
						else {
							sN = -d;
							sD = a;
						}
					}
					else if (tN > tD) {      // tc > 1  => the t=1 edge is visible
						tN = tD;
						// recompute sc for this edge
						if ((-d + b) < 0.0)
							sN = 0;
						else if ((-d + b) > a)
							sN = sD;
						else {
							sN = (-d + b);
							sD = a;
						}
					}
					// finally do the division to get sc and tc
					sc = (Math.abs(sN) < SMALL_NUM ? 0.0 : sN / sD);
					tc = (Math.abs(tN) < SMALL_NUM ? 0.0 : tN / tD);
					//if(mainView.debug){console.log("VAR sc=" + sc );}
					//if(mainView.debug){console.log("difference of the two closest points: " + sc.x);}
					// get the difference of the two closest points
					//dP = w + (sc * u) - (tc * v);  // =  S1(sc) - S2(tc)
					dP = u.multiplyScalar(sc).sub(v.multiplyScalar(tc));
					//if(!isNaN(dP.x)){console.log("Vector dP X=" + dP.x + " Y="+dP.y+" Z="+dP.z);}
					//if(mainView.debug){console.log("mainView.debug: Dist vector: " + dP.x);}
					dP.add(w);
				
					//dP.normalize();
				
					//if(!isNaN(dP.x)){console.log("Vector dP X=" + dP.x + " Y="+dP.y+" Z="+dP.z);}
					//if(!isNaN(dP.x)){console.log("Vector DISTANCE X=" + dP.length());}
				
					return dP.length();	// return the closest distance
					//return dP.normalize().length();   // return the closest distance
				},
				toggleHighlightSection: function(morphology,secIdx){
					//ATTENTION input is sec IDX not ID!
					//check if section is selected previously:
					var color;
					//In order to return the sec ID for further remodelling
					//Push to selected sections the ID and NOT the IDX!
					var idx = morphology.selectedSections.indexOf(morphology.idx2id(secIdx));
					if (idx >= 0 ){
						color = this.drawColor;
						morphology.selectedSections.splice(idx,1);
					} else {
						color = this.highlightColor;
						morphology.selectedSections.push(morphology.idx2id(secIdx));
					}
					console.log(morphology.selectedSections);
					/*var color = this.drawColor;
					if (morphology.sections[secIdx][0].material.color.getHex() == this.drawColor){
						color = this.highlightColor;
					}*/
					for (var i = 0 ; i < morphology.sections[secIdx].length ; i++){
						morphology.sections[secIdx][i].material.color.setHex(color);
						//morphology.sections[secIdx][i].material.linewidth *= 10;
					}
				},
				removeAllHighlight: function(morphology){
					for (var sec = 0 ; sec < morphology.selectedSections.length ; sec++){
						for (var seg = 0 ; seg < morphology.sections[morphology.selectedSections[sec]].length ; seg++){
							morphology.sections[morphology.selectedSections[sec]][seg].material.color.setHex(this.drawColor);
							//morphology.sections[sec][seg].material.linewidth /= 10;
						}
					}
					morphology.selectedSections = new Array();
					/*for (var sec = 0 ; sec < morphology.sections.length ; sec++){
						if (morphology.sections[sec][0].material.color !== this.drawColor){
							for (var seg = 0 ; seg < morphology.sections[sec].length ; seg++){
								morphology.sections[sec][seg].material.color.setHex(this.drawColor);
								//morphology.sections[sec][seg].material.linewidth /= 10;
							}
						}
					}*/
				},
				//Define viewport resize behaviour:
				onWindowResize: function() {
					//this is a thicky part. To refactor this. SSS
					var _this = angular.element("#mainView").scope().session.mainView;
					_this.height = window.innerHeight - (34 + $('.navbar').height());//$(document).find("#mainView").height();
					_this.width = window.innerWidth;//$(document).find("#mainView").width();
					_this.camera.aspect = _this.width / _this.height;
					_this.camera.updateProjectionMatrix();
					_this.canvas.setSize(_this.width, _this.height);
				},
				toggleLockY: function (){
					if (this.controls.lockY){
						this.controls.lockY = false;
					} else {
						this.controls.lockY = true;
					}
				},
				viewUpdates: function(){
					var _this = this;
					return _this.viewUpdating;
				},
				setViewUpdate: function(b){
					var _this = this;
					_this.viewUpdating = b;
					console.log("viewUpdating set to " + _this.viewUpdating);
				},
				drawCell: function() {
					//Update position and render:
					//The old way: move the neuron around:
					//c.obj3d.rotation.y += ( this.targetRotation - c.obj3d.rotation.y ) * 0.05;

					//The new way move the camera arround:
					//Change to trackbalalControls due to ease:
					this.controls.update();
					
					this.canvas.render(this.scene, this.camera);
				}
			
			});
			var remodSession = {
				phpid: null,
				setphpid: function(id){
					var _this = this;
					_this.phpid = id;
					console.log("php id set to:" + _this.phpid);
				},
				inputExtendModel : 0,
				inputDiameterModel : 0,
				radioExtendModel : 'percent',
				radioDiameterModel : 'percent',
				isActive : false,
				activateSession : function(){
					this.isActive = true;
				},
				deactivateSession : function(){
					this.isActive = false;
				},
				//Create session viewport:
				mainView : new Viewport(70, 0.1, 1000000, 1),
				morphologies : new Array(),
				activeMorphology: null,//new NaiveNeuron(), //SSS
				stdout: "Python output.\n",
				runRemodParams : null,
				getType: function(){
					return "compare";
				},
				resetRunRemodParams: function(){
					var _this = this;
					_this.runRemodParams = {
						//General structure to invoce remodeling python script:
						Compare: 0,
						Action: 0,
						names: new Array(),
						groupa: "", 
						groupb: "",
						groupaDir: "",
						groupbDir: "", //only the postfix not the entire path!
						who_variable: "",
						who_random_variable: "",
						who_manual_variable: "none",
						what_variable: "",
						extend_variable: "none",
						extend_variable_num: "none",
						diameter_variable: "none",
						diameter_variable_num: "none"
					};
				},
				getRunRemodParams: function(){
					var _this = this;
					return _this.runRemodParams;
				},
				togglesetWhoVariable: function(v){
					var _this = this;
					if ( _this.runRemodParams.who_variable.localeCompare(v) != 0 ){
						_this.runRemodParams.who_variable = v;
					} else {
						_this.runRemodParams.who_variable = "who_manual";
					}
				},
				setWhoRandomVariable: function(v){
					var _this = this;
					//Random percentage ( 'none' | 0 )
					_this.runRemodParams.who_random_variable = v;
				},
				setWhoManualVariable: function(){
					var _this = this;
					//gets the selected dendrites from list:
					_this.runRemodParams.who_manual_variable = 'none';
					if(_this.activeMorphology.selectedSections.length){
						_this.runRemodParams.who_manual_variable = '';
						for(var i = 0 ; i < _this.activeMorphology.selectedSections.length ; i++){
							if( i == (_this.activeMorphology.selectedSections.length-1) ){
								_this.runRemodParams.who_manual_variable = _this.runRemodParams.who_manual_variable + _this.activeMorphology.selectedSections[i];
							} else {
								_this.runRemodParams.who_manual_variable = _this.runRemodParams.who_manual_variable + _this.activeMorphology.selectedSections[i] + ",";
							}
							
						}
					}
				},
				setWhatVariable: function(v){
					var _this = this;
					_this.runRemodParams.what_variable = v;
				},
				setExtendVariable: function(v){
					var _this = this;
					_this.runRemodParams.extend_variable = v;
				},
				setExtendVariableNum: function(v){
					var _this = this;
					_this.runRemodParams.extend_variable_num = v;
				},
				setDiameterVariable: function(v){
					var _this = this;
					_this.runRemodParams.diameter_variable = v;
				},
				setDiameterVariableNum: function(v){
					var _this = this;
					_this.runRemodParams.diameter_variable_num = v;
				},
				remodAction: function(){
					var _this = this;
					//perform remod action on active morphology only!
					//Get everything tidy and clean in a JSON object:
					/*
					//Argument list for second_run.py
					1) directory
					2) morphology name (absolute path)
					3) who_ variable (eg'who_random_all')
					4) random percentage (none | 0)
					5) manual selection list (token ',' | none)
					6) Action (5 actions in total)
					7) Action unit
					8) Action amount
					9) Diameter unit
					10) Diameter amount
					*/
					
					/*
					_this.resetRunRemodParams(); //reset to default:
					_this.getRunRemodParams().Compare = 0; //set only one action to true; else undefined behaviour!
					_this.getRunRemodParams().Action = 1;
					_this.getRunRemodParams().who_variable
					_this.getRunRemodParams().who_random_variable
					_this.getRunRemodParams().who_manual_variable = _this.setWhoManualVariable(); //get live selected dendrites
					_this.getRunRemodParams().what_variable
					_this.getRunRemodParams().extend_variable
					_this.getRunRemodParams().extend_variable_num
					_this.getRunRemodParams().diameter_variable
					_this.getRunRemodParams().diameter_variable_num
					*/
					_this.getRunRemodParams().Compare = 0;
					_this.getRunRemodParams().Action = 1;
					_this.setExtendVariableNum(_this.inputExtendModel);
					_this.setDiameterVariableNum(_this.inputDiameterModel);
					_this.setWhoManualVariable(); //get live selected dendrites
					_this.setWhoRandomVariable('none');
					_this.getRunRemodParams().extend_variable = _this.radioExtendModel;
					_this.getRunRemodParams().diameter_variable = _this.radioDiameterModel;
					//Get name of all morphologies for application of remodeling action:
					//names are in an array and let php parse the JSON:
					_this.getRunRemodParams().names.length = 0;
					for (var i = 0 ; i < _this.morphologies.length ; i++){
						_this.getRunRemodParams().names.push(_this.morphologies[i]);
					}
					/*_this.getRunRemodParams().names = '';
					for (var i = 0 ; i < _this.morphologies.length ; i++){
						_this.getRunRemodParams().names += _this.morphologies[i] + ",";
					}*/
					//cache var for JSON:
					var orgJSON = _this.getRunRemodParams();
					var JSONobj = JSON.stringify(orgJSON);
					console.log("about to call remodeling action with params:");
					console.log(JSONobj);
					$http.post("run_remod.php",JSONobj).then(function(){
						//when remodeling action is completed, load the new neuron
						//Sub condition of partial condition of other condition:
						if(orgJSON.Action){
							_this.loadMorphology(orgJSON.names,'after');
						}
						console.log("Success in running remodeling action!");
					}, function(){
						console.log("HTTP.GET ERROR in running remodeling action!");
					});
				},
				pauseMainView : false,
				getMorphologiesOfGroup: function(s){
					var _this = this;
					var groupArray = new Array();
					for (var i = 0 ; i < _this.morphologies.length ; i++){
						//console.log("SLICE IS: "+_this.morphologies[i].slice(0,6)+" compared to: "+s+" and the result is: "+( _this.morphologies[i].slice(0,6).localeCompare(s) == 0));
						if( _this.morphologies[i].slice(0,6).localeCompare(s) == 0){
							groupArray.push(_this.morphologies[i]);
						}
					}
					return groupArray;
				},
				uploadModeIsMultiple : function(){
					return this.uploadMultiple;
				},
				uploadMultiple : false,
				startSession: function ($scope){
					var _this = this;
					console.log("_this is:");
					console.log(this);
					console.log("$scope is:");
					console.log($scope);
					//starts new session:
					_this.activateSession();
					_this.stdout = "Starting new session.\n";
					//get php session id:
					$http.get("reset_remod_session.php").then(function(response){
						var jsonResponse = response.data;
						_this.setphpid(jsonResponse.output.sessionId);
						//this.phpid = jsonResponse.output.sessionId;
						console.log(jsonResponse);
						//by default opens the upload modal for the user to provide files:
						_this.openUploaderModal();
						//Clear active neuron:
						_this.deleteMorphology();
						//Reset morph names: (more decent way?) //SSS
						_this.morphologies = new Array();
						//Uploader handles the rest (uploader.onCompleteAll)
						console.log("Current Session restarted!");
					}, function(){
						console.log("ERROR in restarting Session!");
					});
					
				},
				endSession: function(){
					var _this = this;
					console.log("Terminating session!");
					_this.deleteMorphology();
					_this.morphologies = new Array();
					//http.get na sbisei ta panta!
					$http.get("reset_remod_session.php").then(function(){
						console.log("Current Session deleted!");
					}, function(){
						console.log("ERROR in ending Session!");
					});
					_this.deactivateSession();
				},
				toggleSession: function(){
					//if session is deactivated, start new session, if not end it:
					if( this.isActive ){
						this.endSession();
					} else {
						this.startSession();
					}
				},
				stdoutUpdate: function(output){
						console.log(output);
						this.stdout = this.stdout.concat(output);
				},
				//Modal Controller:
				openUploaderModal: function(){
					//$broadcast is as fast as emit in newer angular:
					$rootScope.$broadcast('openModalRequest');console.log('openUploaderModal');
				},
				closeUploaderModal: function($modalInstance){
					$rootScope.$broadcast('closeModalRequest');
				},
				/*modal: {
					animationsEnabled : true,
					open : function (size) {
						var modalInstance = $modal.open({
							animation: this.animationsEnabled,
							templateUrl: 'myModalContent.html',
							controller: 'ModalInstanceCtrl',
							size: size,
							resolve: {
								items: function () {
								return {};
								}
							}
						});
						modalInstance.result.then(function (selectedItem) {
						//$scope.selected = selectedItem;
						}, function () {
						//$log.info('Modal dismissed at: ' + new Date());
						});
					}
				}*/
				executePython : function (morphArray, doCompare) {
					var _this = this;
					console.log("queue length as seen by python is: ")
					console.log(morphArray.length);
					//morphArray is uploader queue
					//Generate parameter string for python:
					
					/*for (var i = 0 ; i < this.getNoOfMorphologies() ; i++){
						remodParams = this.getMorphologyByIdx(i).name + " ";
					}*/
					//Get everything tidy and clean in a JSON object that is used across:
					/*var remodParams = "";
					var runRemodParams = {
						Compare: 0,
						names: new Array(),
						groupa: "", 
						groupb: "",
						groupaDir: "",
						groupbDir: "" //only the postfix not the entire path!
					};*/
					_this.resetRunRemodParams(); //reset to default:
					
					
					if(doCompare){
						_this.getRunRemodParams().Compare = 1;
						_this.getRunRemodParams().groupaDir = "groupa";
						_this.getRunRemodParams().groupbDir = "groupb";
						for (var i = 0 ; i < morphArray.length ; i++){
							console.log("comparing " + morphArray[i].file.name.slice(0,5) + " and groupa, is: " );
							//console.log(morphArray[i].file.name.slice(0,6).localeCompare("groupa") == 0);
							if( morphArray[i].file.name.slice(0,6).localeCompare("groupa") == 0 ){
								_this.getRunRemodParams().groupa = _this.getRunRemodParams().groupa.concat(morphArray[i].file.name + " ");
							} 
							if( morphArray[i].file.name.slice(0,6).localeCompare("groupb") == 0 ){
								_this.getRunRemodParams().groupb = _this.getRunRemodParams().groupb.concat(morphArray[i].file.name + " ");
							}
						}
						
					} else {
						_this.getRunRemodParams().Compare = 0;
						_this.getRunRemodParams().names.length = 0;
						for (var i = 0 ; i < morphArray.length ; i++){
							_this.getRunRemodParams().names.push(morphArray[i].file.name);
							//runRemodParams.names = runRemodParams.names.concat(morphArray[i].file.name + ",");
						}
					}
					
					var orgJSON = _this.getRunRemodParams();
					var JSONobj = JSON.stringify(orgJSON);
					console.log("about to call python with params:");
					console.log(JSONobj);
					$http.post("run_remod.php",JSONobj).then(function(){
						console.log("Success in calling Python!");
					}, function(){
						console.log("HTTP.GET ERROR!");
					});
					
					/* //Old method...
					//if handling files normally, do each file:
					for (var i = 0 ; i < morphArray.length ; i++){
						remodParams = remodParams.concat(morphArray[i].file.name + " ");
					}
					console.log("executing python with: " + remodParams);
					$http.get("run_remod.php?runParams=" + remodParams).then(function(){
						console.log("Success in calling Python!");
					}, function(){
						console.log("HTTP.GET ERROR!");
					});
					*/
					
					/*$.ajax({
						url:"init_remod_session.php?runParams=" + remodParams,
						complete: function (response) {
							$('#output').html(response.responseText);
						},
						error: function () {
							$('#output').html('Bummer: there was an error!');
						}
					});*/
					return ;
				},
				/*getMorphologyByIdx: function(idx){
					return this.morphologies[idx];
				},
				getMorphologyByName: function(name){
					for (var i = 0 ; i < this.getNoOfMorphologies() ; i++){
						if (this.getMorphologyByIdx(i).name.localeCompare(name) == 0){
							return this.getMorphologyByIdx(i);
						}
					}
					return null;
				},
				setMorphology: function(morphology){
					this.morphologies.push(morphology); 
				},
				getNoOfMorphologies: function(){
					return this.morphologies.length;
				},
				getLastMorphology: function(){
					return this.morphologies[this.getNoOfMorphologies()-1];
				},*/
				addMorphology: function(name){
					this.morphologies.push(name);
				},
				availableMorphologies: function(){
					return this.morphologies;
				},
				deleteMorphology: function(){
					//if IS null must be sure that the segments are removed also!
					if (this.activeMorphology != null){
						this.activeMorphology.remove_all_segments();
						this.activeMorphology = null;
					}
				},
				loadMorphology: function(name,historyState){
					var _this = this;
					//allo name allo filename!
					//Only one current morphology! SSS
					var rqst = "load_morphology.php?name=" + name + "&historyState=" + historyState ;
					console.log(rqst);
					console.log("Quering morphology " + name + " from the backend...");
					//show spinner in view
					//is there a better way of getting the mainView?
					var session = angular.element("#mainView").scope().session;
					session.mainView.setViewUpdate(true);
					$http.get(rqst).then(function(response){
						var JsonResponse = response.data;
						if (JsonResponse.output.errorMsg.length){
							console.log(" :( Loading morphology from server failed with error: " + JsonResponse.output.errorMsg);
						} else {
							console.log("Quering morphology returns!");
						}
						var jForm = JSON.parse(JsonResponse.output.command);
						//Do not store morphologies locally:
						_this.deleteMorphology();
						//Parse array to naive neuron:
						_this.activeMorphology = new NaiveNeuron();
						_this.activeMorphology.name = JsonResponse.output.name;
						_this.activeMorphology.group = JsonResponse.output.group;
						_this.activeMorphology.historyState = historyState;
						var material,geometry,line;
						//get origin and transpose vector:
						var origin = new THREE.Vector3( 0,0,0 );
						var soma = new THREE.Vector3( jForm[0][1],jForm[0][2],jForm[0][3] );
						var transpose = origin.sub(soma);
						for (var i = 0 ; i < jForm.length ; i ++){
							material = new THREE.LineBasicMaterial({color: _this.mainView.drawColor,linewidth: jForm[i][7]});
							geometry = new THREE.Geometry();
							geometry.vertices.push(	new THREE.Vector3( jForm[i][1],jForm[i][2],jForm[i][3] ).add(transpose), new THREE.Vector3( jForm[i][4],jForm[i][5],jForm[i][6] ).add(transpose) );
							line = new THREE.Line(geometry, material);
							_this.activeMorphology.push_segment_to_section( line , jForm[i][0]);
						}
						//na 3exwrisw tis morphologies pou fetch apo aftes pou render!! SSS
						//_this.setMorphology(_this.morphology);
						//erndering the activeMorphology must be inside the complete() of http.get!
						//render the activeMorphology:
						
						_this.updateMorphologyOnView();
						//hide loading spinner:
						session.mainView.setViewUpdate(false);
					}, function(){
						//If morphology is not found on server or other error.
						console.log("HTTP.GET ERROR!");
					});

					return ;
				},
				morphologyWithNameIsActive: function(n,hs){
					//Returns false if not and 'before' of 'after' if in each state:
					if( this.activeMorphology ){
						if( this.activeMorphology.name.localeCompare(n) == 0 ){
							if (this.activeMorphology.historyState.localeCompare(hs)==0){
								return true;
							} else {
								return false;
							}
							
						} else {
							return false;
						}
					}					
				},
				updateMorphologyOnView: function(name){
					var _this = this;
					
					console.log("updateMorphologyOnView with name: " + _this.activeMorphology.name + "...");
					//Clear scene and add selected morphology for visualization:
					for (var i = (_this.mainView.scene.children.length-1) ; i >= 0 ; i--){
						console.log("Removing sceneChild with name: " + _this.mainView.scene.children[i].name );
						//this.mainView.scene.children.remove(this.mainView.scene.children[i]);
						_this.mainView.scene.children = new Array();
					}
					
					_this.mainView.scene.add(_this.activeMorphology.obj3d);
					
					console.log("Morphology with name :" + _this.activeMorphology.name +" on view updated!");
					return;
				},
				stdoutIntervalUpdate: function(){
					var _this = this;
					$interval(function(){
						$http.get("query_stdout.php").then(function(response){
							var JsonResponse = response.data;
							if (JsonResponse.output.errorMsg.length){
								console.log(" :( Quering stdout from server failed with error: " + JsonResponse.output.errorMsg);
							} else {
								//console.log("Querying stdout from PHP with contents:");
								//console.log(JsonResponse.output.stdout);
							}
							//if ( (typeof a) == "string"){
								//Update the console correctly:
								_this.stdout = _this.stdout.concat(JsonResponse.output.stdout);
							//}
							//scroll to bottom of console:
							var objDiv = document.getElementsByClassName("terminal");
							objDiv.scrollTop = objDiv.scrollHeight;
						}, function(){
							console.log("HTTP.GET ERROR!");
						});
					},2000);
				},
				
			};
			
		return remodSession;
	}]);
	
	app.config(function($stateProvider, $urlRouterProvider) {
	// For any unmatched url, redirect to /state1
	$urlRouterProvider.otherwise("/#");
	// Now set up the states
	$stateProvider
		.state('remod', {
		url: "/",
		templateUrl: "remod.html",
		controller: 'remodController'
		})
		.state('statistics', {
		url: "/statistics",
		templateUrl: "statistics.html",
		controller: 'statisticsController'
		});
	});
	
	app.controller('statisticsController', function($http, $scope, $timeout, $interval, remodSession){
		$scope.session = remodSession;
		$scope.activeStatisticsMorphology = "";
		$scope.statMorphologies = new Array();
		$scope.isActiveStatisticsMorphology = function(name){
			//console.log("ISactive stats morphology "+name+" is "+($scope.activeStatisticsMorphology.localeCompare(name) == 0));
			//console.log("active stats morph is: "+$scope.activeStatisticsMorphology);
			return ($scope.activeStatisticsMorphology.localeCompare(name) == 0);
		};
		$scope.makeActiveStatisticsMorphology = function(name){
			$scope.activeStatisticsMorphology = name;
		};
		$scope.statFileNames = new Array();
		$scope.getTxtFiles = function(){
			var tmp = new Array();
			var remains;
			for (var i = 0 ; i < $scope.statFileNames.length ; i++){
				if( $scope.statFileNames[i].slice(-3).localeCompare('txt') == 0 ){
					remains = $scope.statFileNames[i].split("/");
					tmp.push(remains[remains.length-1]);
				}
			}
			return tmp;
		};
		$scope.getTxtFilesNoPrefix = function(){
			var tmp = new Array();
			var remains;
			for (var i = 0 ; i < $scope.statFileNames.length ; i++){
				if( $scope.statFileNames[i].slice(-3).localeCompare('txt') == 0 ){
					remains = $scope.statFileNames[i].split("/");
					//name.length + 1 for the underscore:
					tmp.push(remains[remains.length-1].slice($scope.activeStatisticsMorphology.length+1));
				}
			}
			return tmp;
		};
		$scope.getSvgFiles = function(){
			var tmp = new Array();
			var remains;
			for (var i = 0 ; i < $scope.statFileNames.length ; i++){
				if( $scope.statFileNames[i].slice(-3).localeCompare('svg') == 0 ){
					remains = $scope.statFileNames[i].split("/");
					tmp.push(remains[remains.length-1]);
				}
			}
			return tmp;
		};
		$scope.loadNeuronStats = function(){
			//load statistics for the selected neurons:
			
		};
		$scope.loadStatistics = function(name){
			//Request statistics for a specific morphology from the backend:
			var rqst = "query_statistics.php?name=" + name;
			console.log(rqst);
			$http.get(rqst).then(function(response){
				var JsonResponse = response.data;
				console.log("Statistics' files fetched successfully!");
				$scope.statFileNames.length = 0;
				for (var i = 0 ; i < JsonResponse.output.statFileNames.length ; i++){
					$scope.statFileNames.push(JsonResponse.output.statFileNames[i]);
				}
				$scope.makeActiveStatisticsMorphology(name);
				console.log("Active stats morph updated to "+$scope.activeStatisticsMorphology);
			}, function(){
				console.log("ERROR in fetching statistics!");
			});
			return;
		};
		//wait for partial to be instansiated:
		$scope.$on('$viewContentLoaded', function() {
			//pause main view animation and interactivity to save memory:
			$scope.session.pauseMainView = true;
			//Update available morphologies, adding the 'Average' morphology also:
			$scope.statMorphologies.length = 0;
			for (var i = 0 ; i < $scope.session.morphologies.length ; i++){
				console.log("pushing name from session "+$scope.session.morphologies[i]);
				$scope.statMorphologies.push($scope.session.morphologies[i]);
			}
			if($scope.session.morphologies.length>1){$scope.statMorphologies.push("average");}
			console.log($scope.statMorphologies);
			//request the filenames array from backend for a specific morphology:
			$scope.loadStatistics($scope.session.activeMorphology.name);
			/*$http.get("query_statistics.php").then(function(response){
				var JsonResponse = response.data;
				console.log(JsonResponse.output.statFileNames);
				console.log("Statistics' files fetched successfully!");
				$scope.session.statFileNames = JsonResponse.output.statFileNames;
				//Remove the session id fromjavascript! SSS
				//for (var i = 0 ; i < JsonResponse.output.statFileNames.length ; i++){
				//	var tmp = JsonResponse.output.statFileNames[i].split("/");
				//	$scope.session.statFileNames.push(tmp[tmp.length-1]);
				//}
				
			}, function(){
				console.log("ERROR in fetching statistics!");
			});
			*/
		});
		
	});
	
	app.controller('remodController', function($http, $scope, $timeout, $interval, remodSession){
		$scope.session = remodSession;
		
		//handle radio buttons:
		
		$scope.setRadioExtendModelPercent = function(){
			$scope.session.radioExtendModel = 'percent';
			$scope.radioExtendModelMode = true;
		}
		$scope.setRadioExtendModelMicron = function(){
			$scope.session.radioExtendModel = 'micrometers';
			$scope.radioExtendModelMode = false;
		}
		$scope.setRadioDiameterModelPercent = function(){
			$scope.session.radioDiameterModel = 'percent';
			$scope.radioDiameterModelMode = true;
		}
		$scope.setRadioDiameterModelMicron = function(){
			$scope.session.radioDiameterModel = 'micrometers';
			$scope.radioDiameterModelMode = false;
		}
		
		//Input na to kanw meta:
		//$scope.session.inputExtendModel = 0;
		//$scope.session.inputDiameterModel = 0;
		
		
		$scope.isActiveAction = function(v){
			if ($scope.session.runRemodParams.what_variable.localeCompare(v) == 0){
				return true;
			}
			return false;
		}
		
		$scope.isActiveTarget = function(v){
			if ($scope.session.runRemodParams.who_variable.localeCompare(v) == 0){
				return true;
			}
			return false;
		}
		
		
		//wait for partial to be instansiated:
		$scope.$on('$viewContentLoaded', function() {
			//initialize controls controler poutana ta ekana:
			$scope.session.resetRunRemodParams(); //reset to default:
			$scope.session.radioExtendModel = 'percent';
			$scope.radioExtendModelMode = true; //first selection
			$scope.session.radioDiameterModel = 'percent';
			$scope.radioDiameterModelMode = true; //first selection
//			$scope.whatAction = 'shrink';
			$scope.session.setWhatVariable('shrink');
			$scope.session.inputExtendModel = 0;
			$scope.session.inputDiameterModel = 0;
			//$scope.session.runRemodParams.what_variable = 'shrink';
			
			//un pause main view:
			$scope.session.pauseMainView = false;
			//wait for render:
			console.log("REMOD TIMEOUT FUNCTION!");
			//Create the main viewport:
			//console.log($('.canvas-holder'));
			$('.canvas-holder').append( $scope.session.mainView.canvas.domElement );
			//document.body.appendChild( container );
			//container.appendChild( $scope.session.mainView.canvas.domElement );
			$('canvas').attr('id', 'mainView');
			
			//is there a more elegant way to do that?
			//var theview = angular.element("#mainView").scope().session.mainView;
			//$scope.viewUpdates = theview.viewUpdates();
			
			//console.log("DOC READY $viewContentLoaded");
			//$('canvas').on('mousedown', $scope.blah);
			
			//var targetArea = document.getElementById("navigator");
			//console.log(targetArea);
			//targetArea.addEventListener( 'mousedown', $scope.blah, false ); //SSS

			//console.log("DOC READY $viewContentLoaded");
			//$('canvas').on('mousedown', $scope.blah);
			/*
			var noviewEl = document.getElementById("noview");
			console.log(noviewEl);
			noviewEl.addEventListener( 'mousedown', $scope.noview, false ); //SSS
			var uiviewEl = document.getElementById("uiview");
			console.log(uiviewEl);
			uiviewEl.addEventListener( 'mousedown', $scope.uiview, false ); //SSS
			*/
			//It seems like if the event function is not available, the eventlistener is not created!
			//window.addEventListener( 'mousedown', $scope.blah, false ); //SSS
			//var targetArea = document.getElementById("navigator");
			//console.log(targetArea);
			//targetArea.addEventListener( 'mousedown', $scope.session.mainView.controls.mousedown, false );
			//targetArea.addEventListener( 'mousedown', $scope.blah, false ); //SSS
			//$('#navigator').on('mousedown', $scope.session.mainView.controls.mousedown);
			//Bottom line: den blepei to function mesa sta controls me tin kamia KAI den kanei register ta clicks genika
			//mesa sto mainView. na to koita3w argotera.. SSS
			
			//SSS otan to function einai undefined o eventListener den mpainei!
			var uiViewCanvasEl = document.getElementById("ui-view-canvas");
			uiViewCanvasEl.addEventListener( 'mousemove', $scope.session.mainView.controls.mousemove, false ); //SSS
			uiViewCanvasEl.addEventListener( 'mouseup', $scope.session.mainView.controls.mouseup, false ); //SSS
			uiViewCanvasEl.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
			uiViewCanvasEl.addEventListener( 'mousedown', $scope.session.mainView.controls.mousedown, false );
			uiViewCanvasEl.addEventListener( 'mousewheel', $scope.session.mainView.controls.mousewheel, false );
			uiViewCanvasEl.addEventListener( 'DOMMouseScroll', $scope.session.mainView.controls.mousewheel, false ); // firefox
			uiViewCanvasEl.addEventListener( 'touchstart', $scope.session.mainView.controls.touchstart, false );
			uiViewCanvasEl.addEventListener( 'touchend', $scope.session.mainView.controls.touchend, false );
			uiViewCanvasEl.addEventListener( 'touchmove', $scope.session.mainView.controls.touchmove, false );
			
			window.addEventListener( 'resize', $scope.session.mainView.onWindowResize, false ); //needed for canvas
			

			//Load demo morphology:
			if ( !$scope.session.activeMorphology ){
				//in demo neuron before flag is of no use
				$scope.session.loadMorphology("demo",'before');
			} else {
				$scope.session.loadMorphology($scope.session.activeMorphology.name,'before');
			}
		
			//Begin listening for python output:
			$scope.session.stdoutIntervalUpdate();
			requestAnimationFrame(draw);
			
			$scope.session.resetRunRemodParams();
			//resize once, after ui-view has rendered:
			$scope.session.mainView.onWindowResize();
		});

		var draw = function () {
			//pause to save performance; also memoory leak???? SSS
			if ( !$scope.session.pauseMainView ){
				updateModel('seconds', function(scope){
					requestAnimationFrame(draw);
				});
			}
		};
		function updateModel(scope, callback){
			$scope.$apply(function(sc){
				$scope.session.mainView.drawCell();
				callback(sc);
			});
		};

	});
	
	//Seems necessary:
	app.controller('globalController', function($scope, $timeout, $interval, remodSession){
		$scope.session = remodSession;

	});
	
	app.controller('footerController', ['$scope', 'remodSession', function($scope, remodSession){
		$scope.session = remodSession;
		$scope.collapsed = true;
		$scope.isCollapsed = function(){
			return $scope.collapsed;
		}
		$scope.toggleCollapsed = function(){
			$scope.collapsed = !$scope.collapsed;
			$scope.session.mainView.onWindowResize();
			return $scope.collapsed;
		}
	}]);
	
	app.controller('modalUpload', ['$scope', '$modal', 'remodSession', function($scope, $modal, remodSession){
		$scope.session = remodSession;
		$scope.items = ['item1', 'item2', 'item3'];
		$scope.animationsEnabled = true;
		$scope.$on('openModalRequest', function(){
			console.log("request recieved!");
			var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			size: "xl",
			resolve: {
				items: function () {
				return $scope.items;
				}
			}
			});
			modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
			}, function () {
			//$log.info('Modal dismissed at: ' + new Date());
			});
		});
		$scope.toggleAnimation = function () {
			$scope.animationsEnabled = !$scope.animationsEnabled;
		};
	}]);
	
	/*app.directive('morphologiespanel', ['$timeout', 'remodSession', function ( $timeout, remodSession ) {
		return {
			restrict: 'A',
			controller: function () {
				//$scope.session = remodSession;
				//$scope.type = "compare";
			},
			templateURL: {},
			compile: function(scope, element, attrs){
				//$timeout(function(){
					console.log("INSIDE LINK FUNCTION");
					console.log(element);
					console.log(scope);
					element.append('<div ng-include="\'' + scope.session.getType() + '-template.html\'"></div>');
				//});
				
			}
		};
	}]);*/
	
	app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {
		$scope.items = items;
		$scope.selected = {
			item: $scope.items[0]
		};
		$scope.$on('closeModalRequest', function(){
			$modalInstance.close($scope.selected.item);
		});
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	});
	
	//Why the remodSession needs to be injected(?) twise? whereas in global controller results to error?
	app.controller('UpController', ['$rootScope', '$scope', 'FileUploader', 'remodSession', function($rootScope, $scope, FileUploader, remodSession) {
		$scope.session = remodSession;
		$scope.uploadMultiple = false;
		$scope.uploadModeIsMultiple = function(){
			return $scope.uploadMultiple;
		}
		$scope.setSingleUploadMode = function(){
			$scope.uploadMultiple = false;
			$scope.session.uploadMultiple = false;
		}
		$scope.setMultipleUploadMode = function(){
			$scope.uploadMultiple = true;
			$scope.session.uploadMultiple = true;
		}
		console.log("Upcontroller session is:");
		console.log($scope.session);
        var uploader = $scope.uploader = new FileUploader({
            url: 'upload.php'
        });
		
		uploader.emit2Terminal = function(str){
			$rootScope.$broadcast('uploaderEmit2Terminal', {stdout: {output: str} });
		}
		
        // FILTERS
		uploader.filters.push({
			name: 'isSWC',
			fn: function(item, options){
				var valid = 0;
				if ( (item.name.length - 4) == (item.name.toLowerCase().indexOf(".swc")) ){valid = 1};
				return valid;
			}
		});
		uploader.filters.push({
			name: 'isHOC',
			fn: function(item, options){
				var valid = 0;
				if ( (item.name.length - 4) == (item.name.toLowerCase().indexOf(".hoc")) ){valid = 1};
				return valid;
			}
		});

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
		//Concatenate alias and filename
        uploader.onAfterAddingFile = function(fileItem) {
			//Changing names interfere with php. Better create two wells and put then tidly inside...
			/*if ($scope.uploadModeIsMultiple()){
				//if uploading multiple files, include which group alias!
				fileItem.file.name = "("+fileItem.alias+") " + fileItem.file.name;
			}*/
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
			//to handle it more robustly: SSS
			if ($scope.uploadModeIsMultiple()){
				//if uploading multiple files, include which group alias!
				item.file.name = item.alias.concat(item.file.name);
			}
			item.alias = "morphology";
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
			$scope.session.stdoutUpdate("Uploading "+this.queue.length+" file(s) completed!\n");
			if ($scope.uploadModeIsMultiple()){
				$scope.session.stdoutUpdate("User is performing a comparison!\n");
			}
					
			//Add morphologies names to global controller:
				
			//close the upload modal:

			//when all morphologies are uploaded and in session:
			//first run python to generate .txt files:
			//also python should be called synchronously!
			//give to python the morphologies giati ta kaname poutana edw..
			$scope.session.stdoutUpdate("Running remodeling...\n");
			$scope.session.executePython(this.queue,$scope.uploadModeIsMultiple());
			
			//Then load morphologies to angular:
			for (var i = 0 ; i < this.queue.length ; i++){
				//get morphology name, not filename. All files should be:
				//'name_neuron.txt'
				var name = this.queue[i].file.name;
				name = name.slice(0,-4);
				//push morphology name into session:
				$scope.session.addMorphology(name);
				
				
				//morphology.name = this.queue[i].file.name;
				//morphology.group = "";
				//$scope.session.setMorphology(morphology);
				console.log("Pushing morphology " + this.queue[i].file.name + " to session!");
			}
			
			//After adding all morphologies request the first morphology to plot it:
			//pass before to load the before state of the file:
			$scope.session.loadMorphology(this.queue[0].file.name.slice(0,-4),'before');
			//$scope.session.loadMorphology($scope.session.getLastMorphology().name);

			
			//Initiate new Session:
			$scope.session.activateSession();
			
			//Close the Uploader Moadal:
			$scope.session.closeUploaderModal();
			
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);
    }]);
	
/*
app.directive('morphologiespanel', ['$scope', function ($scope) {
		return {
			restrict: 'A',
			controller: function () {
				//debugger;
				$scope.blah = "blah";
				$scope.$parent.$parent.blah = "blah!";
				$scope.morphologies = [1, 2];

				$scope.selectedMorphology = $scope.morphologies[0];
				$scope.setSelectedMorphology = function (morphology) {
					$scope.selectedMorphology = morphology;
					console.log('selected morphology set to ' + morphology.name);
				};
				$scope.isActive = function (morphology) {
					if ($scope.selectedMorphology.id == morphology.id) {
						return "active";
					} else {
						return "";
					}
				};
			},
			link: function (scope, element, attrs) {
				//check if active session...
				$timeout(function () {
					console.log("angular is link");
					//console.log("Morphologies length is: " + $scope.morphologies.length + ".");
				});
			}
		};
	}]);
*/

})();