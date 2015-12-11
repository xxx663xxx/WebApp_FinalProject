'use strict';

(function(exports) {
	
	var PresentLayer = function(){
		this.canvas = null; //this.presentCanvas
		this.context = null; //this.presentContext
		this.ongoingTouches = new Array();
		
		//Settings
		this.currentTool = "Pencil"; //"PickColor", "FillColor", "Rect", "Arc", "Line", "Pencil", "Text", "Open"
		//this.lastClick = 0;
		
		//Undo, Redo
		this.rawCanvasStack = new Array();
		this.currentStep = 0;
		
		//openfile
		this.openImage = null;
		this.zoomRatio = 1;
		
		//Stroke Color Settings
		this.sColor = "#2E95EF";
		this.tempSColor = "#2E95EF";
		this.sRRange = null;
		this.sGRange = null;
		this.sBRange = null;
		this.sIcon = null;
		
		//Fill Color Settings
		this.fColor = "#ffa500";
		this.tempFColor = "#ffa500";
		this.fRRange = null;
		this.fGRange = null;
		this.fBRange = null;
		this.fIcon = null;
		
		//Pick Color Settings
		this.pickFill = true;
		this.pickStroke = true;
		
		//Shape Settings
		this.strokeWidth = 1;//HTML default 
		this.fill = false;
		this.shapeStartX = 0;
		this.shapeStartY = 0;
		this.tempCanvas = null;//temporary space
		this.skipCount = 0;
		
		//Line Settings ,HTML default 
		this.lineWidth = 4;
		this.lineCap = "butt";
		this.lineJoin = "milter";
		this.miterLimit = 10;
		
		//test resize
		this.rawCanvas = null;
		this.presentX = 0;
		this.presentY = 0;
		this.presentRatio = 1;
		
		//test tcp
		this.resizeButton = null;
		this.connect = false;
		this.serverSocket = null;
		this.connectSocket = null;
	};
	
	PresentLayer.prototype={
		
		handleStart(evt){
			
			evt.preventDefault();
			console.log("touchstart.");
			
			var ctx = this.canvas.getContext("2d");
			var touches = evt.changedTouches;
			
			switch(this.currentTool){
				case "Pencil":
					for (var i = 0; i < touches.length; i++) {
						this.ongoingTouches.push(this.copyTouch(touches[i]));
					}	
				break;
				
				case "Line":
					for (var i = 0; i < touches.length; i++) {
						this.ongoingTouches.push(this.copyTouch(touches[i]));
						//store original canvas
						var imgData = new Image();
						imgData.src = this.canvas.toDataURL("image/png");
						//console.log(imgData);
						this.tempCanvas = imgData;
						//record start coordinate
						this.shapeStartX = touches[i].pageX - this.canvas.offsetLeft;
						this.shapeStartY = touches[i].pageY - this.canvas.offsetTop;
					}
					//console.log("start: (" + this.shapeStartX + "," + this.shapeStartY + ")");
				break;
				
				case "Rect":
					for (var i = 0; i < touches.length; i++) {
						this.ongoingTouches.push(this.copyTouch(touches[i]));
						//store original canvas
						var imgData = new Image();
						imgData.src = this.canvas.toDataURL("image/png");
						//console.log(imgData);
						this.tempCanvas = imgData;
						//record start coordinate
						this.shapeStartX = touches[i].pageX - this.canvas.offsetLeft;
						this.shapeStartY = touches[i].pageY - this.canvas.offsetTop;
					}
					//console.log("start: (" + this.shapeStartX + "," + this.shapeStartY + ")");
				break;
				
				case "Arc":
					for (var i = 0; i < touches.length; i++) {
						this.ongoingTouches.push(this.copyTouch(touches[i]));
						//store original canvas
						var imgData = new Image();
						imgData.src = this.canvas.toDataURL("image/png");
						//console.log(imgData);
						this.tempCanvas = imgData;
						//record start coordinate
						this.shapeStartX = touches[i].pageX - this.canvas.offsetLeft;
						this.shapeStartY = touches[i].pageY - this.canvas.offsetTop;
					}
					//console.log("start: (" + this.shapeStartX + "," + this.shapeStartY + ")");
				break;
				
				case "PickColor":
					for (var i = 0; i < touches.length; i++) {
						this.ongoingTouches.push(this.copyTouch(touches[i]));
						
						var imgd = ctx.getImageData(touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop, 1, 1);
						var pix = imgd.data;
						
						var R = parseInt(pix[0]).toString(16);
						var G = parseInt(pix[1]).toString(16);
						var B = parseInt(pix[2]).toString(16);
						if(R.length < 2) R = "0" + R;
						if(G.length < 2) G = "0" + G;
						if(B.length < 2) B = "0" + B;
				
						var pickedColor = "#" + R + G + B;
						if(this.pickStroke == true){
							this.sColor = pickedColor
							this.sIcon.style.color = this.sColor;
							console.log("Stroke Color Saved");
						} 
						if(this.pickFill == true){
							this.fColor = pickedColor;
							this.fIcon.style.color = this.fColor;
							console.log("Fill Color Saved");
						} 
						
						console.log("pickedColor: " + pickedColor);
					}	
				break;
				
				case "Open":
					for (var i = 0; i < touches.length; i++) {
						this.ongoingTouches.push(this.copyTouch(touches[i]));
						//store original canvas
						var imgData = new Image();
						imgData.src = this.canvas.toDataURL("image/png");
						//console.log(imgData);
						this.tempCanvas = imgData;
						//draw opened image						
						ctx.drawImage(this.openImage, touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop,
														this.openImage.width*this.zoomRatio, this.openImage.height*this.zoomRatio);
						//this.shapeStartX = touches[i].pageX - this.canvas.offsetLeft;
						//this.shapeStartY = touches[i].pageY - this.canvas.offsetTop;
					}
				break;
				
				case "Fill":
				break;
				
				default:
				break;
			}
		},
		
		fill(x, y){
			//TODO: Fix this function!
			console.log("fill");			
			// Get the CanvasPixelArray from the given coordinates and dimensions.
			var ctx = this.canvas.getContext("2d");
			var imgd = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pix = imgd.data;

			var pixI = (y-1)*this.canvas.width + x;
			
			// Loop over each pixel and invert the color.
			for (var i = 0, n = pix.length; i < n; i += 4) {
				pix[i  ] = 255 - pix[i  ]; // red
				pix[i+1] = 255 - pix[i+1]; // green
				pix[i+2] = 255 - pix[i+2]; // blue
				// i+3 is alpha (the fourth element)
			}
		},
		
		handleMove(evt) {
			evt.preventDefault();
			var ctx = this.canvas.getContext("2d");
			var touches = evt.changedTouches;
			
			//console.log("onMove");
			switch(this.currentTool){
				case "Pencil":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							//console.log("continuing touch "+idx);
							ctx.beginPath();
							//console.log("ctx.moveTo(" + this.ongoingTouches[idx].pageX + ", " + this.ongoingTouches[idx].pageY + ");");
							ctx.moveTo(this.ongoingTouches[idx].pageX - this.canvas.offsetLeft, this.ongoingTouches[idx].pageY - this.canvas.offsetTop);
							//console.log("ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");");
							ctx.lineTo(touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop);
							ctx.lineWidth = this.lineWidth;
							ctx.strokeStyle = this.sColor;
							ctx.lineCap = this.lineCap;
							ctx.lineJoin = this.lineJoin;
							ctx.stroke();
					
							//line smoothing
							ctx.beginPath();
							ctx.arc(touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop, this.lineWidth/2, 0, 2 * Math.PI, false);  // a circle at the start
							ctx.fillStyle = this.sColor;
							ctx.fill();

							this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));  // swap in the new touch record
						} else {
							//console.log("can't figure out which touch to continue");
						}
					}
				break;
				
				case "Line":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							ctx.drawImage(this.tempCanvas,0,0);
							//console.log(this.tempCanvas + "\n" + idx);
								
							//draw new Line
							var shapeEndX = touches[i].pageX - this.canvas.offsetLeft;
							var shapeEndY = touches[i].pageY - this.canvas.offsetTop;
								
							ctx.beginPath();
							ctx.moveTo(this.shapeStartX, this.shapeStartY);
							ctx.lineTo(shapeEndX, shapeEndY);
							ctx.lineWidth = this.lineWidth;
							ctx.strokeStyle = this.sColor;
							ctx.lineCap = this.lineCap;
							ctx.lineJoin = this.lineJoin;
							ctx.stroke();
							
							this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));  // swap in the new touch record
						}
					}
				break;
				
				case "Rect":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							console.log(performance.now() - this.skipCount);
							if(performance.now() - this.skipCount > 40){
								//restore canvas to original state
								ctx.drawImage(this.tempCanvas,0,0);
								//console.log(this.tempCanvas);
								
								//draw new shape
								var shapeEndX = touches[i].pageX - this.canvas.offsetLeft;
								var shapeEndY = touches[i].pageY - this.canvas.offsetTop;
								var shapeStartX = this.shapeStartX;
								var shapeStartY = this.shapeStartY;
								var width = 0;
								var height = 0;
								if(shapeEndX < shapeStartX){
									width = shapeStartX - shapeEndX;
									shapeStartX = shapeEndX;
								}else{
									width = shapeEndX - shapeStartX;
								}
								if(shapeEndY < shapeStartY){
									height = shapeStartY - shapeEndY;
									shapeStartY = shapeEndY;
								}else{
									height = shapeEndY - shapeStartY;
								}	
							
								ctx.beginPath();
								ctx.rect(shapeStartX, shapeStartY, width, height);
								ctx.lineWidth = this.strokeWidth;
								ctx.strokeStyle = this.sColor;
								ctx.stroke();
								if(this.fill == true){
									ctx.fillStyle = this.fColor;
									ctx.fill();
								}
								/*console.log("move: (" + (touches[i].pageX - this.canvas.offsetLeft) + "," +
														(touches[i].pageY - this.canvas.offsetTop) + ")");
								console.log("dimesion: (" + shapeStartX + "," + shapeStartY + "," +
															width + "," + height + ")");*/
															
								this.skipCount = performance.now();
							}
							
							this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));  // swap in the new touch record
						}
					}
				break;
				
				case "Arc":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							//restore canvas to original state
							ctx.drawImage(this.tempCanvas,0,0);
							//draw new circle
							var shapeEndX = touches[i].pageX - this.canvas.offsetLeft;
							var shapeEndY = touches[i].pageY - this.canvas.offsetTop;
							var radius = 0;
							
							var xTemp = (shapeEndX - this.shapeStartX) * (shapeEndX - this.shapeStartX);
							var yTemp = (shapeEndY - this.shapeStartY) * (shapeEndY - this.shapeStartY);
							radius = Math.sqrt(xTemp + yTemp);
							
							ctx.beginPath();
							ctx.arc(this.shapeStartX, this.shapeStartY, radius, 0, 2*Math.PI, false);
							ctx.lineWidth = this.strokeWidth;
							ctx.strokeStyle = this.sColor;
							ctx.stroke();
							if(this.fill == true){
								ctx.fillStyle = this.fColor;
								ctx.fill();
							}
							
							this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));  // swap in the new touch record
						}
					}
				break;
				
				case "PickColor":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {							
							this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));  // swap in the new touch record
						}
					}
				break;
				
				case "Open":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							console.log(performance.now() - this.skipCount);
							if(performance.now() - this.skipCount > 40){
								//restore canvas to original state
								ctx.drawImage(this.tempCanvas,0,0);
								
								//draw new Image
								ctx.drawImage(this.openImage, touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop,
														this.openImage.width*this.zoomRatio, this.openImage.height*this.zoomRatio);
															
								this.skipCount = performance.now();
							}
							
							this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));  // swap in the new touch record
						}
					}
				break;
				
				default:
				break;
			}
		},
		
		handleEnd(evt) {
			evt.preventDefault();
			var ctx = this.canvas.getContext("2d");
			var touches = evt.changedTouches;
			
			console.log("touchEnd");
			switch(this.currentTool){
				case "Pencil":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							ctx.lineWidth = this.lineWidth;
							ctx.fillStyle = this.sColor;
							ctx.beginPath();
							ctx.moveTo(this.ongoingTouches[idx].pageX - this.canvas.offsetLeft, this.ongoingTouches[idx].pageY - this.canvas.offsetTop);
							ctx.lineTo(touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop);
							ctx.lineCap = this.lineCap;
							ctx.lineJoin = this.lineJoin;
							ctx.stroke();
							
							this.ongoingTouches.splice(idx, 1);  // remove it; we're done
						}
					}
				break;
				
				case "Line":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							//restore canvas to original state
							ctx.drawImage(this.tempCanvas,0,0);
							//console.log(this.tempCanvas);
							
							//draw new Line
							var shapeEndX = touches[i].pageX - this.canvas.offsetLeft;
							var shapeEndY = touches[i].pageY - this.canvas.offsetTop;
							
							ctx.moveTo(this.shapeStartX, this.shapeStartY);
							ctx.lineTo(shapeEndX, shapeEndY);
							ctx.lineWidth = this.lineWidth;
							ctx.strokeStyle = this.sColor;
							ctx.lineCap = this.lineCap;
							ctx.lineJoin = this.lineJoin;
							ctx.stroke();
								
							/*console.log("move: (" + (touches[i].pageX - this.canvas.offsetLeft) + "," +
														(touches[i].pageY - this.canvas.offsetTop) + ")");
							console.log("dimesion: (" + shapeStartX + "," + shapeStartY + "," +
															width + "," + height + ")");*/
							
							this.ongoingTouches.splice(idx, 1);  // remove it; we're done
						}
					}
				break;
				
				case "Rect":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							//restore canvas to original state
							ctx.drawImage(this.tempCanvas,0,0);
							//console.log(imgData);
							
							//draw new rect
							var shapeEndX = touches[i].pageX - this.canvas.offsetLeft;
							var shapeEndY = touches[i].pageY - this.canvas.offsetTop;
							var width = 0;
							var height = 0;
							if(shapeEndX < this.shapeStartX){
								width = this.shapeStartX - shapeEndX;
								this.shapeStartX = shapeEndX;
							}else{
								width = shapeEndX - this.shapeStartX;
							}
							if(shapeEndY < this.shapeStartY){
								height = this.shapeStartY - shapeEndY;
								this.shapeStartY = shapeEndY;
							}else{
								height = shapeEndY - this.shapeStartY;
							}
							
							ctx.beginPath();
							ctx.rect(this.shapeStartX, this.shapeStartY, width, height);
							ctx.lineWidth = this.strokeWidth;
							ctx.strokeStyle = this.sColor;
							ctx.stroke();
							if(this.fill == true){
								ctx.fillStyle = this.fColor;
								ctx.fill();
							}
							/*console.log("end: (" + (touches[i].pageX - this.canvas.offsetLeft) + "," +
												   (touches[i].pageY - this.canvas.offsetTop) + ")");
							console.log("dimesion: (" + this.shapeStartX + "," + this.shapeStartY + "," +
										width + "," + height + ")");*/
												   
							this.ongoingTouches.splice(idx, 1);  // remove it; we're done
						}
					}
				break;
				
				case "Arc":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							//restore canvas to original state
							ctx.drawImage(this.tempCanvas,0,0);
							//draw new circle
							var shapeEndX = touches[i].pageX - this.canvas.offsetLeft;
							var shapeEndY = touches[i].pageY - this.canvas.offsetTop;
							var radius = 0;
							
							var xTemp = (shapeEndX - this.shapeStartX) * (shapeEndX - this.shapeStartX);
							var yTemp = (shapeEndY - this.shapeStartY) * (shapeEndY - this.shapeStartY);
							radius = Math.sqrt(xTemp + yTemp);
							
							ctx.beginPath();
							ctx.arc(this.shapeStartX, this.shapeStartY, radius, 0, 2*Math.PI, false);
							ctx.lineWidth = this.strokeWidth;
							ctx.strokeStyle = this.sColor;
							ctx.stroke();
							if(this.fill == true){
								ctx.fillStyle = this.fColor;
								ctx.fill();
							}
							/*console.log("end: (" + (touches[i].pageX - this.canvas.offsetLeft) + "," +
												   (touches[i].pageY - this.canvas.offsetTop) + ")");
							console.log("dimesion: (" + this.shapeStartX + "," + this.shapeStartY + "," +
										width + "," + height + ")");*/
												   
							this.ongoingTouches.splice(idx, 1);  // remove it; we're done
						}
					}
				break;
				
				case "PickColor":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {							
							this.ongoingTouches.splice(idx, 1);  // remove it; we're done
						}
					}
					return;
				break;
				
				case "Open":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							//restore canvas to original state
							ctx.drawImage(this.tempCanvas,0,0);
							//console.log(this.tempCanvas);
							
							//draw new Image
							//ctx.drawImage(this.openImage, touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop);
							ctx.drawImage(this.openImage, touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop,
														this.openImage.width*this.zoomRatio, this.openImage.height*this.zoomRatio);
														
							/*console.log("move: (" + (touches[i].pageX - this.canvas.offsetLeft) + "," +
														(touches[i].pageY - this.canvas.offsetTop) + ")");
							console.log("dimesion: (" + shapeStartX + "," + shapeStartY + "," +
															width + "," + height + ")");*/
							
							this.ongoingTouches.splice(idx, 1);  // remove it; we're done
						}
					}
				break;
				
				case "Fill":
					for (var i = 0; i < touches.length; i++) {
						this.fill(touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop); 
					}
				break;
				
				default: 
				break;
			}			
			
			//redo, undo 
			var imgData = new Image();
			imgData.src = this.canvas.toDataURL("image/png");
			if(this.currentStep > 0){
				this.rawCanvasStack.splice(this.rawCanvasStack.length - this.currentStep, this.currentStep);
				this.currentStep = 0;
			}
			this.rawCanvasStack.push(imgData);
		},
		
		handleCancel(evt) {
			evt.preventDefault();
			console.log("touch cancel, currentTool: " + currentTool);
			var touches = evt.changedTouches;
			
			switch(thus.currentTool){
				case "Pencil":
					for (var i = 0; i < touches.length; i++) {
						this.ongoingTouches.splice(i, 1);  // remove it; we're done
					}
				break;
				
				case "Rect":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							ctx.beginPath();
							ctx.lineWidth = this.strokeWidth;
							ctx.strokeStyle = this.sColor;
							ctx.rect(this.shapeStartX, this.shapeStartY, touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop);
							ctx.stroke();
							if(this.fill == true){
								ctx.fillStyle = this.fColor;
								ctx.fill();
							}
						}
						this.ongoingTouches.splice(i, 1);  // remove it; we're done
					}
				break;
				
				case "Arc":
					for (var i = 0; i < touches.length; i++) {
						var idx = this.ongoingTouchIndexById(touches[i].identifier);

						if (idx >= 0) {
							ctx.beginPath();
							ctx.lineWidth = this.strokeWidth;
							ctx.strokeStyle = this.sColor;
							ctx.rect(this.shapeStartX, this.shapeStartY, touches[i].pageX - this.canvas.offsetLeft, touches[i].pageY - this.canvas.offsetTop);
							ctx.stroke();
							if(this.fill == true){
								ctx.fillStyle = this.fColor;
								ctx.fill();
							}
						}
						this.ongoingTouches.splice(i, 1);  // remove it; we're done
					}
				break;
				
				default:
				break;
			}
		},
		
		copyTouch(touch) {
			return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
		},
		
		ongoingTouchIndexById(idToFind) {
			for (var i = 0; i < this.ongoingTouches.length; i++) {
				var id = this.ongoingTouches[i].identifier;
    
				if (id == idToFind) {
					return i;
				}
			}
			return -1;    // not found
		},
				
		storeImg2(imgData){
			var imgStroage = navigator.getDeviceStorage("pictures");
			var file = this.canvas.toBlob(function(blob) {				
				var fileName = document.getElementById("fileName").value;
				var request = imgStroage.addNamed(blob, fileName + ".png");
				
				request.onsuccess = function(){
					var name = this.result;
					console.log('File "' + name + '" successfully wrote on the sdcard storage area');
					confirm('File "' + name + '" successfully wrote on the picture storage area');
				}
			
				request.onerror = function () {
					console.warn('Unable to write the file: ' + this.error);
					console.log(this.error);
					alert(this.error.name);
				}
			});	
		},
			
		onColorChange(type){
			if(type == "Stroke"){
				var strokeR = parseInt(this.sRRange.value).toString(16);
				var strokeG = parseInt(this.sGRange.value).toString(16);
				var strokeB = parseInt(this.sBRange.value).toString(16);
				if(strokeR.length < 2) strokeR = "0" + strokeR;
				if(strokeG.length < 2) strokeG = "0" + strokeG;
				if(strokeB.length < 2) strokeB = "0" + strokeB;
				
				this.tempSColor = "#" + strokeR + strokeG + strokeB;
				console.log(this.tempSColor);
				var sColorPreView = document.getElementById("sColorPreView");
				sColorPreView.innerHTML = this.tempSColor
				sColorPreView.style.backgroundColor = this.tempSColor
			}else if(type == "Fill"){
				var fillR = parseInt(this.fRRange.value).toString(16);
				var fillG = parseInt(this.fGRange.value).toString(16);
				var fillB = parseInt(this.fBRange.value).toString(16);
				if(fillR.length < 2) fillR = "0" + fillR;
				if(fillG.length < 2) fillG = "0" + fillG;
				if(fillB.length < 2) fillB = "0" + fillB;
				
				this.tempFColor = "#" + fillR + fillG + fillB;
				console.log(this.tempFColor);
				var fColorPreView = document.getElementById("fColorPreView");
				fColorPreView.innerHTML = this.tempFColor;
				fColorPreView.style.backgroundColor = this.tempFColor;
			}
		},
		
		onFileInput(){
			console.log("onFileInput");
			if(document.getElementById("openFileInput").files.length > 0){
				this.openImage = new Image();
				this.openImage.src = URL.createObjectURL(document.getElementById("openFileInput").files[0]);
				
				/*var fr = new FileReader();
				fr.onload = function () {
					//document.getElementById("inputImgPre").src = fr.result;
					//this.openImage.src = fr.result;
				}.bind(this);
				fr.readAsDataURL(document.getElementById("openFileInput").files[0]);*/
				document.getElementById("inputImgPre").src = this.openImage.src;
				document.getElementById("inputNamePre").innerHTML = "File Name: " + document.getElementById("openFileInput").files[0].name ;
				document.getElementById("inputSizePre").innerHTML = "File Size: " + document.getElementById("openFileInput").files[0].size ;
			}
		},
		
		reDraw(){//draw raw canvas image to present canvas
			//get raw canvas
			var imgData = new Image();
			imgData.src = this.rawCanvas.toDataURL("image/png");
			//console.log(imgData);
			var ctx = this.canvas.getContext("2d");
			//draw raw canvas image to present canvas
			//context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);			
			ctx.drawImage(imgData, this.presentX, this.presentY, this.canvas.width*this.presentRatio, this.canvas.height*this.zoomRatio,
								   0, 0, this.canvas.width, this.canvas.height);
								   
			console.log("redrawn");
		},
		
		onToolButtonClick(tool){
			console.log("onToolButtonClick");
			switch(tool){
				
				case "Open":
					console.log("Open Button clicked");
					this.currentTool = "Open";
					document.getElementById("zoomRatio").value = this.zoomRatio;
				break;
				
				case "Undo":
					console.log("Undo Button clicked");
					if(this.rawCanvasStack.length - this.currentStep - 1 >= 0){
						var ctx = this.canvas.getContext("2d");
						var imgData = this.rawCanvasStack[this.rawCanvasStack.length - 2 - this.currentStep]; 
						ctx.drawImage(imgData,0,0);
						this.currentStep = this.currentStep + 1;
						console.log(imgData);
					}					
					console.log(this.currentStep);
				break;
				
				case "Redo":
					console.log("Redo Button clicked");
					if(this.currentStep > 0){
						var ctx = this.canvas.getContext("2d");
						var imgData = this.rawCanvasStack[this.rawCanvasStack.length - this.currentStep]; 
						ctx.drawImage(imgData,0,0);
						this.currentStep = this.currentStep - 1;
						console.log(imgData);
					}
				break;
				
				case "Rect":
					console.log("Rect Button clicked");
					this.currentTool = "Rect";
					document.getElementById("shapeStrokeWidth").value = this.strokeWidth;
					document.getElementById("shapeFill").value = this.fill;
				break;
				
				case "Arc":
					console.log("Arc Button clicked");
					this.currentTool = "Arc";
					document.getElementById("shapeStrokeWidth").value = this.strokeWidth;
					document.getElementById("shapeFill").value = this.fill;
				break;
				
				case "StrokeColor":
					console.log("StrokeColor Button clicked");
					this.sRRange.value = parseInt(this.sColor.substring(1,3), 16);
					this.sGRange.value = parseInt(this.sColor.substring(3,5), 16);
					this.sBRange.value = parseInt(this.sColor.substring(5,7), 16);
					console.log(this.sColor);
					var sColorPreView = document.getElementById("sColorPreView");
					sColorPreView.innerHTML = this.sColor;
					sColorPreView.style.backgroundColor = this.sColor;
				break;
				
				case "FillColor":
					console.log("FillColor Button clicked");
					this.fRRange.value = parseInt(this.fColor.substring(1,3), 16);
					this.fGRange.value = parseInt(this.fColor.substring(3,5), 16);
					this.fBRange.value = parseInt(this.fColor.substring(5,7), 16);
					console.log(this.fColor);
					var fColorPreView = document.getElementById("fColorPreView");
					fColorPreView.innerHTML = this.fColor;
					fColorPreView.style.backgroundColor = this.fColor;
				break;
				
				case "PickColor":
					console.log("PickColor Button clicked");
					this.currentTool = "PickColor";
					document.getElementById("pickStroke").checked = this.pickStroke;
					document.getElementById("pickFill").checked = this.pickFill;
				break;
				
				case "Pencil":
					console.log("Pencil Button clicked");
					this.currentTool = "Pencil";
					document.getElementById("lineWidth").value = this.lineWidth;
					document.getElementById(this.lineCap + "Option").checked = true;
					document.getElementById(this.lineJoin + "Option").checked = true;
					document.getElementById("miterLimit").value = this.miterLimit;
				break;
				
				case "Line":
					console.log("Pencil Button clicked");
					this.currentTool = "Line";
					document.getElementById("lineWidth").value = this.lineWidth;
					document.getElementById(this.lineCap + "Option").checked = true;
					document.getElementById(this.lineJoin + "Option").checked = true;
					document.getElementById("miterLimit").value = this.miterLimit;
				break;
				
				case "Fill":
					this.currentTool = "Fill";
				break;
				
				default:
					console.log("NO such Tool called " + tool);
				break;
			}
		},
		
		onChangeSave(tool){
			switch(tool){
				case "Shape":
					var temp = document.getElementById("shapeStrokeWidth");
					this.strokeWidth = parseInt(temp.value);
					this.fill = document.getElementById("shapeFill").checked;
					
					console.log("Shape Settings Saved");
					console.log("strokeWidth: " + typeof(this.strokeWidth) + " " + this.strokeWidth);
					console.log("fill: " + typeof(this.fill) + " " + this.fill);
				break;
				
				case "StrokeColor":
					this.sColor = this.tempSColor;
					this.sIcon.style.color = this.sColor;
					console.log("Stroke Color Saved");
				break;
				
				case "FillColor":
					this.fColor = this.tempFColor;
					this.fIcon.style.color = this.fColor;
					console.log("Fill Color Saved");
				break;
				
				case "PickColor":
					this.pickStroke = document.getElementById("pickStroke").checked;
					this.pickFill = document.getElementById("pickFill").checked;
					console.log("Pick Color Saved");
					console.log("pickStroke: " + typeof(this.pickStroke) + " " + this.pickStroke);
					console.log("pickFill: " + typeof(this.pickFill) + " " + this.pickFill);
				break;
				
				case "Line":
					this.lineWidth = parseInt(document.getElementById("lineWidth").value);
					this.lineCap = document.querySelector('.lineCap:checked').value;
					this.lineJoin = document.querySelector('.lineJoin:checked').value;
					this.miterLimit = parseInt(document.getElementById("miterLimit").value);
					console.log("Line settings Saved values: " + typeof(this.lineWidth) + this.lineWidth + ","
															   + typeof(this.miterLimit) + this.miterLimit + "," 
															   + typeof(this.lineCap) + this.lineCap + "," 
															   + typeof(this.lineJoin) + this.lineJoin);
				break;
				
				case "Save":
					var imgData = this.canvas.toDataURL("image/png");
					this.storeImg2(imgData);
				break;
				
				case "Open":
					this.zoomRatio = parseFloat(document.getElementById("zoomRatio").value);
					console.log("Open File Saved");
				break;
				
				default:
					console.log("NO such Tool called " + tool);
				break;
			}
		},
		
		openSever(){			
			console.log("Initializing server");
			this.serverSocket = navigator.mozTCPSocket.listen(8080);
			
			this.serverSocket.onconnect = function(conn){
				console.log("connected", conn);
				conn.send("Ok. Got client on: ", conn.port);
				conn.ondata = function(ev){
					console.log("Got request: ", ev);   
				};
				conn.onclose = function(ev){
					console.log("Client left:", ev);
				}
				conn.close(); //get request and leave; HTTP thingy
			};
			this.serverSocket.onerror = function(ev){
				console.log("Failed to start: ", ev);
			};
		},
		
		connectTo(){
			console.log("connectButton clicked");
			this.hostname = document.getElementById("hostnmae").value; //hostnmae
			this.Connectsocket = navigator.mozTCPSocket.open(this.hostname, 8080);		
				// Each time the buffer is flushed
				// we try to send data again.
				this.socket.ondrain = this.sendData.bind(this);		

				this.socket.ondata = function (event) {
					if (typeof event.data === 'string') {
						console.log('Get a string: ' + event.data);
					} else {
						console.log('Get a Uint8Array');
					}
				}
		},
		
		sendData() {
			console.log("sendButton clicked");
			var data;
			do {
				data = getData();
			} while (data != null && this.connectSocket.send(data));
		},
		
		getData() {
			var data;
			// do stuff that will retrieve data
			data = this.messgaeInput.value;
			return data;
		},
		
		closeServer(){
			console.log("start to close Server");
			this.serverSocket.close();
			console.log("tried to close Server");
		},	
		
		closeConnect(){
			console.log("start to close Connect");
			this.connectSocket.close();
			console.log("tried to close Connect");
		},
		
		start(){
			//initialize canvas
			this.canvas = document.getElementById("myCanvas");
			this.canvas.width = window.screen.availWidth * 0.9;
			this.canvas.height = window.screen.availHeight * 0.8;
			this.context = this.canvas.getContext("2d");
			
			//fill white in background
			this.context.fillStyle = "#FFFFFF";
			this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
			
			this.canvas.addEventListener("touchstart", this.handleStart.bind(this), false);
			this.canvas.addEventListener("touchend", this.handleEnd.bind(this), false);
			this.canvas.addEventListener("touchcancel", this.handleCancel.bind(this), false);
			this.canvas.addEventListener("touchmove", this.handleMove.bind(this), false);
			
			//initialize tool bars
			
			//initialize undo, redo stack
			var imgData = new Image();
			imgData.src = this.canvas.toDataURL("image/png")
			//console.log(imgData);
			this.rawCanvasStack.push(imgData);
			//initialize undo button	
			var undoButton = document.getElementById("undoButton");
			undoButton.addEventListener("click", this.onToolButtonClick.bind(this, "Undo"), true);
			//initialize redo button	
			var redoButton = document.getElementById("redoButton");
			redoButton.addEventListener("click", this.onToolButtonClick.bind(this, "Redo"), true);
			
			//initialize stroke color settings //"#2E95EF"			
			var sButton = document.getElementById("strokeColorButton");
			sButton.addEventListener("click", this.onToolButtonClick.bind(this, "StrokeColor"), true);
			this.sIcon = document.getElementById("strokeColorIcon");
			this.sRRange = document.getElementById("sRRange");
			this.sRRange.addEventListener("input", this.onColorChange.bind(this, "Stroke"), false);
			this.sGRange = document.getElementById("sGRange");
			this.sGRange.addEventListener("input", this.onColorChange.bind(this, "Stroke"), false);
			this.sBRange = document.getElementById("sBRange");
			this.sBRange.addEventListener("input", this.onColorChange.bind(this, "Stroke"), false);
			var saveButton = document.getElementById("sColorSave");
			saveButton.addEventListener("click", this.onChangeSave.bind(this, "StrokeColor"), false);
			
			//initialize fill color settings //#ffa500
			var fButton = document.getElementById("fillColorButton");
			fButton.addEventListener("click", this.onToolButtonClick.bind(this, "FillColor"), true);
			this.fIcon = document.getElementById("fillColorIcon");
			this.fRRange = document.getElementById("fRRange");
			this.fRRange.addEventListener("input", this.onColorChange.bind(this, "Fill"), false);
			this.fGRange = document.getElementById("fGRange");
			this.fGRange.addEventListener("input", this.onColorChange.bind(this, "Fill"), false);
			this.fBRange = document.getElementById("fBRange");
			this.fBRange.addEventListener("input", this.onColorChange.bind(this, "Fill"), false);
			saveButton = document.getElementById("fColorSave");
			saveButton.addEventListener("click", this.onChangeSave.bind(this, "FillColor"), false);
			
			//initialize pick color settings
			var pickButton = document.getElementById("pickColorButton");
			pickButton.addEventListener("click", this.onToolButtonClick.bind(this, "PickColor"), true);
			saveButton = document.getElementById("pickSave");
			saveButton.addEventListener("click", this.onChangeSave.bind(this, "PickColor"), false);
			
			//initialize shape settings
			//rect
			var rectButton = document.getElementById("rectButton");
			rectButton.addEventListener("click", this.onToolButtonClick.bind(this, "Rect"), true);
			//arc
			var arcButton = document.getElementById("arcButton");
			arcButton.addEventListener("click", this.onToolButtonClick.bind(this, "Arc"), true);
			saveButton = document.getElementById("shapeSave");
			saveButton.addEventListener("click", this.onChangeSave.bind(this, "Shape"), false);
			
			//initialize line settings
			//line 
			var lineButton = document.getElementById("lineButton");
			lineButton.addEventListener("click", this.onToolButtonClick.bind(this, "Line"), true);
			//pencil
			var pencilButton = document.getElementById("pencilButton");
			pencilButton.addEventListener("click", this.onToolButtonClick.bind(this, "Pencil"), true);
			saveButton = document.getElementById("LineSave");
			saveButton.addEventListener("click", this.onChangeSave.bind(this, "Line"), false);
			
			//initialize open file settings
			var openButton = document.getElementById("openButton");
			openButton.addEventListener("click", this.onToolButtonClick.bind(this, "Open"), true);
			var fileInput = document.getElementById("openFileInput");
			fileInput.addEventListener("change", this.onFileInput.bind(this), false);
			saveButton = document.getElementById("openSave");
			saveButton.addEventListener("click", this.onChangeSave.bind(this, "Open"), false);
			
			//initialize save file button
			saveButton = document.getElementById("fileSave");
			saveButton.addEventListener("click", this.onChangeSave.bind(this, "Save"), false);
			
			//initialize openserver
			var openServerButton = document.getElementById("openServerButton");
			openServerButton.addEventListener("click", this.openSever.bind(this), true);
			var closeServerButton = document.getElementById("closeServer");
			closeServerButton.addEventListener("click", this.closeServer.bind(this), false);
			
			//initialize connect
			var openConnectButton = document.getElementById("connectButton");
			openConnectButton.addEventListener("click", this.connectTo.bind(this), true);
			var closeConnectButton = document.getElementById("closeConnect");
			closeConnectButton.addEventListener("click", this.closeConnect.bind(this), false);
			
			//initialize fill
			var fillButton = document.getElementById("fillButton");
			fillButton.addEventListener("click", this.onToolButtonClick.bind(this, "Fill"), true);
			
			
			console.log("initialization finished");
			
			/*
			//test
			//initialize raw Canvas
			this.rawCanvas = document.createElement('canvas'); 
			this.rawCanvas.width = window.screen.availWidth * 2;
			this.rawCanvas.height = window.screen.availHeight * 2;
			var rawContext = this.rawCanvas.getContext("2d");
			//fill white in background
			rawContext.fillStyle = "#4c4c4c";
			rawContext.fillRect(0,0,this.rawCanvas.width,this.rawCanvas.height);
			//initialize scroll bar
			saveButton = document.getElementById("canvas-container");
			var scrollBar = new ScrollBar();
			scrollBar.start(this, saveButton.clientWidth, saveButton.clientHeight);
			saveButton.addEventListener("touchstart", scrollBar.handleStart.bind(scrollBar), false);
			saveButton.addEventListener("touchend", scrollBar.handleEnd.bind(scrollBar), false);
			saveButton.addEventListener("touchcancel", scrollBar.handleCancel.bind(scrollBar), false);
			saveButton.addEventListener("touchmove", scrollBar.handleMove.bind(scrollBar), false);
			console.log("initialization finished");*/
		}
	};
	
	exports.PresentLayer = PresentLayer;
	
})(window);