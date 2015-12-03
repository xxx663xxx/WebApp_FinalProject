'use strict';

(function(exports) {
	
	var PresentLayer = function(){
		this.canvas = null;
		this.context = null;
		this.ongoingTouches = new Array();
		
		//Download Image
		this.aTag = null;
		
		//setImage test
		this.aTag2 = null;
	};
	
	PresentLayer.prototype={
		
		handleStart(evt){
			evt.preventDefault();
			console.log("touchstart.");
			var el = this.canvas;
			var ctx = el.getContext("2d");
			var touches = evt.changedTouches;
			
			for (var i = 0; i < touches.length; i++) {
				//console.log("touchstart:" + i + "...");
				this.ongoingTouches.push(this.copyTouch(touches[i]));
				var color = this.colorForTouch(touches[i]);
				ctx.beginPath();
				ctx.arc(touches[i].pageX - el.offsetLeft, touches[i].pageY - el.offsetTop, 4, 0, 2 * Math.PI, false);  // a circle at the start
				ctx.fillStyle = color;
				ctx.fill();
				//console.log("touchstart:" + i + ".");
			}			
		},
		
		handleMove(evt) {
			evt.preventDefault();
			var el = this.canvas;
			var ctx = el.getContext("2d");
			var touches = evt.changedTouches;

			for (var i = 0; i < touches.length; i++) {
				var color = this.colorForTouch(touches[i]);
				var idx = this.ongoingTouchIndexById(touches[i].identifier);

				if (idx >= 0) {
					//console.log("continuing touch "+idx);
					ctx.beginPath();
					//console.log("ctx.moveTo(" + this.ongoingTouches[idx].pageX + ", " + this.ongoingTouches[idx].pageY + ");");
					ctx.moveTo(this.ongoingTouches[idx].pageX - el.offsetLeft, this.ongoingTouches[idx].pageY - el.offsetTop);
					//console.log("ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");");
					ctx.lineTo(touches[i].pageX - el.offsetLeft, touches[i].pageY - el.offsetTop);
					ctx.lineWidth = 4;
					ctx.strokeStyle = color;
					ctx.stroke();
					
					//test
					ctx.beginPath();
					ctx.arc(touches[i].pageX - el.offsetLeft, touches[i].pageY - el.offsetTop, 2, 0, 2 * Math.PI, false);  // a circle at the start
					ctx.fillStyle = color;
					ctx.fill();

					this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));  // swap in the new touch record
					//console.log(".");
				} else {
					//console.log("can't figure out which touch to continue");
				}
			}
		},
		
		handleEnd(evt) {
			evt.preventDefault();
			//console.log("touchend");
			var el = this.canvas;
			var ctx = el.getContext("2d");
			var touches = evt.changedTouches;

			for (var i = 0; i < touches.length; i++) {
				var color = this.colorForTouch(touches[i]);
				var idx = this.ongoingTouchIndexById(touches[i].identifier);

				if (idx >= 0) {
					ctx.lineWidth = 4;
					ctx.fillStyle = color;
					ctx.beginPath();
					ctx.moveTo(this.ongoingTouches[idx].pageX - el.offsetLeft, this.ongoingTouches[idx].pageY - el.offsetTop);
					ctx.lineTo(touches[i].pageX - el.offsetLeft, touches[i].pageY - el.offsetTop);
					ctx.fillRect(touches[i].pageX - 4  - el.offsetLeft, touches[i].pageY - 4  - el.offsetTop, 8, 8);  // and a square at the end
					this.ongoingTouches.splice(idx, 1);  // remove it; we're done
				} else {
					//console.log("can't figure out which touch to end");
				}
			}
		},
		
		handleCancel(evt) {
			evt.preventDefault();
			//console.log("touchcancel.");
			var touches = evt.changedTouches;
  
			for (var i = 0; i < touches.length; i++) {
				this.ongoingTouches.splice(i, 1);  // remove it; we're done
			}
		},
		
		colorForTouch(touch) {
			var r = touch.identifier % 16;
			var g = Math.floor(touch.identifier / 3) % 16;
			var b = Math.floor(touch.identifier / 7) % 16;
			r = r.toString(16); // make it a hex digit
			g = g.toString(16); // make it a hex digit
			b = b.toString(16); // make it a hex digit
			var color = "#" + r + g + b;
			console.log("color for touch with identifier " + touch.identifier + " = " + color);
			return color;
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
		
		showImg(){
			var imgTag = document.getElementById("img");
			
			var files = navigator.getDeviceStorage("pictures");
			var cusor = files.enumerate();
			
			cusor.onsuccess = function(){
				var file = this.result;
				if(file != null){
					imgTag.src = window.URL.createObjectURL(file);
				}
			}
		},
		
		setImg(){
			var files = navigator.getDeviceStorage("pictures");
			var cusor = files.enumerate();
			
			var tempContext = this.context;
			cusor.onsuccess = function(){
				var file = this.result;
				if(file != null){
					var imgURL = window.URL.createObjectURL(file);
					var img  = new Image();
					img.addEventListener("load", function() {
							tempContext.drawImage(img,0,0);
					}, false);
					img.src = imgURL;
				}
			}			
		},
		
		storeImg2(imgData){
			var imgStroage = navigator.getDeviceStorage("pictures");
			var file = new Blob(imgData, {type: "image/jpeg"});
			
			var request = imgStroage.addNamed(file, "img1");
			
			request.onsuccess = function(){
				var name = this.result;
				console.log('File "' + name + '" successfully wrote on the sdcard storage area');
			}
			
			request.onerror = function () {
				console.warn('Unable to write the file: ' + this.error);
			}
		},
		
		storeImg3(imgData){
			this.aTag.download = "abc/test.png";
			this.aTag.href = this.canvas.toDataURL();
		},
		
		storeImg(imgData){
			var IDBReq = indexedDB.open("myFileStorageDataBase");
			
			// If necessary, let's create a datastore for the files
			IDBReq.onupgradeneeded = function () {
				this.result.createObjectStore('files');
			}
			
			IDBReq.onsuccess = function(){
				var DB = this.result;
				var buildHandle = DB.mozCreateFileHandle("test.jpg", "image/jpeg");
    
				buildHandle.onsuccess = function(){
					var myFileHandle = this.result;
					// Get a LockedFile object from the handle
					var myFile = myFileHandle.open('readwrite');

					// Start a writing operation
					var writing = myFile.append(imgData);

					writing.onsuccess = function () {
						console.log('Writing operation successful');
					
						var saving = myFile.flush();

						saving.onsuccess = function () {
							console.log('The file has been successfully stored');
						}
					}

					writing.onerror = function () {
						console.log('Something goes wrong in the writing process: ' + this.error);
					};
				
				
					var store = DB.transaction(['files'], 'readwrite').objectStore('files');
					// Let's store the file permanently
					// HINT: it could be handy to use the file name as the storage key
					var storeReq = store.add(myFileHandle, myFileHandle.name);

					storeReq.onsuccess = function () {
						console.log('The file has been successfully stored and can be retrieved anytime.')
					};
				}
			}
		},
		
		start(){
			//initialize canvas
			this.canvas = document.getElementById("myCanvas");
			this.canvas.width = window.screen.availWidth;
			this.canvas.height = window.screen.availHeight;
			this.context = this.canvas.getContext("2d");
			
			//fill white in background
			this.context.fillStyle = "#FFFFFF";
			this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
			
			//this.canvas.addEventListener("touchstart", this.showImg.bind(this), false);
			this.canvas.addEventListener("touchstart", this.handleStart.bind(this), false);
			this.canvas.addEventListener("touchend", this.handleEnd.bind(this), false);
			this.canvas.addEventListener("touchcancel", this.handleCancel.bind(this), false);
			this.canvas.addEventListener("touchmove", this.handleMove.bind(this), false);
			
			//Download image
			this.aTag = document.getElementById("aTag");
			this.aTag.addEventListener("click", this.storeImg3.bind(this), false);
			
			//SetImage test
			this.aTag2 = document.getElementById("aTag2");
			this.aTag2.addEventListener("click", this.setImg.bind(this), false);
		}
	};
	
	exports.PresentLayer = PresentLayer;
	
})(window);