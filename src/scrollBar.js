'use strict';

(function(exports) {
	
	var ScrollBar = function(){
		
		this.presentLayer = null;
		this.ongoingTouches = new Array();
		this.width = 0;
		this.height = 0;
		this.startX = 0;	
		this.startY = 0;
		
	};
	
	ScrollBar.prototype={
		
		handleStart(evt){
			evt.preventDefault();
			var touches = evt.changedTouches;
			console.log("scrollbar touchstart");
			
			for (var i = 0; i < touches.length; i++) {
				this.ongoingTouches.push(this.copyTouch(touches[i]));
				
				//record start coordinate
				this.startX = touches[i].pageX;
				this.startY = touches[i].pageY;
			}
			
			
		},
		
		handleMove(evt) {
			evt.preventDefault();
			var touches = evt.changedTouches;
			
			//console.log("scrollBar onMove");
			
			for (var i = 0; i < touches.length; i++) {
				var idx = this.ongoingTouchIndexById(touches[i].identifier);

				if (idx >= 0) {
					if(this.ongoingTouches[idx].pageY > this.presentLayer.canvas.offsetTop + this.presentLayer.canvas.height - 20){ //x
						//console.log("Y" + this.ongoingTouches[idx].pageY + " > " + this.presentLayer.canvas.offsetTop  + " + " + this.presentLayer.canvas.height);
						
						var xOffset = this.ongoingTouches[idx].pageX - this.startX;
						var presentXOffset = xOffset/this.width * this.presentLayer.rawCanvas.width;
						this.presentLayer.presentX = this.presentLayer.presentX + presentXOffset;
						
						if(this.presentLayer.presentX < 0 ){
							this.presentLayer.presentX = 0;
						}
						if(this.presentLayer.presentX > this.presentLayer.rawCanvas.width - this.presentLayer.canvas.width){
							this.presentLayer.presentX = this.presentLayer.rawCanvas.width - this.presentLayer.canvas.width;
						}
					}
					
					if(this.ongoingTouches[idx].pageX > this.presentLayer.canvas.offsetLeft + this.presentLayer.canvas.width ){
						//console.log("X:" + this.ongoingTouches[idx].pageX + " > " + this.presentLayer.canvas.offsetLeft + " + " + this.presentLayer.canvas.width );
						
						var yOffset = this.ongoingTouches[idx].pageY - this.startY;
						var presentYOffset = yOffset/this.height * this.presentLayer.rawCanvas.height;
						this.presentLayer.presentY = this.presentLayer.presentY + presentYOffset;
						
						if(this.presentLayer.presentY  < 0 ){
							this.presentLayer.presentY = 0;
						}
						if(this.presentLayer.presentY  > this.presentLayer.rawCanvas.height - this.presentLayer.canvas.height){
							this.presentLayer.presentY = this.presentLayer.rawCanvas.height - this.presentLayer.canvas.height;
						}
						//console.log(typeof(presentYOffset) + presentYOffset);
					}
					
					console.log("(" + parseInt(this.presentLayer.presentX) + "," + parseInt(this.presentLayer.presentY) + ")")
						
					this.ongoingTouches.splice(idx, 1, this.copyTouch(touches[i]));  // swap in the new touch record
				} else {
					//console.log("can't figure out which touch to continue");
				}
			}
			this.presentLayer.reDraw.bind(this.presentLayer)();	
				
		},
		
		handleEnd(evt) {
			evt.preventDefault();
			var touches = evt.changedTouches;
			
			console.log("scrollBar touchEnd");
			
			for (var i = 0; i < touches.length; i++) {
				var idx = this.ongoingTouchIndexById(touches[i].identifier);

				if (idx >= 0) {							
					this.ongoingTouches.splice(idx, 1);  // remove it; we're done
				}
			}
		},
		
		handleCancel(evt) {
			evt.preventDefault();
			var touches = evt.changedTouches;
			
			console.log("scrollBar touchEnd");
			
			for (var i = 0; i < touches.length; i++) {
				var idx = this.ongoingTouchIndexById(touches[i].identifier);

				if (idx >= 0) {							
					this.ongoingTouches.splice(idx, 1);  // remove it; we're done
				}
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
		
		
		start(presentLayer, width, height){
			this.presentLayer = presentLayer;
			this.width = width;
			this.height = height;
			//console.log("width:" + this.width + " height: " + this.height );
		}
	};
	
	exports.ScrollBar = ScrollBar;
	
})(window);