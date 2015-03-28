(function(){
	window.Moon = function(){
		for(var key in Moon){
			window[key] = Moon[key];
		}
	};
	Moon.createClass = function (superClass, obj) {
        var newClass = function () {
            this.initialize.apply(this, arguments);
        };
        if (typeof superClass == "function" && typeof obj == "object") {
            newClass.prototype = Object.create(superClass.prototype);
            newClass.prototype.inherit = function () {                
                this.initialize = this.superClass.prototype.initialize;
                this.superClass = this.superClass.prototype.superClass;
                if(this.initialize)
                    this.initialize.apply(this, arguments);
            };
        } else if (typeof superClass == "object" && obj == void 0) {
            obj = superClass;
        }
        for (var key in obj) {
            newClass.prototype[key] = obj[key];
        }
        newClass.prototype.superClass = superClass;
        return newClass;
    };
    Moon.extendClass = function (targetclass,obj){
        for(var key in obj){
            targetclass.prototype[key] = obj[key];
        }
    };
    Moon.View = Moon.createClass({
    	initialize:function(opt){
    		for(var i in opt){
    			this[i] = opt[i];
                //Object.defineProperty(this,i,this.createDescriptor(i,opt[i]));
    		}
    	},
    	getDataByString:function(s){
            var o = this.data;
            s = s.replace(/\[(\w+)\]/g, '.$1');  // convert indexes to properties
            s = s.replace(/^\./, ''); // strip leading dot
            var a = s.split('.');
            while (a.length) {
                var n = a.shift();
                if (n in o) {
                    o = o[n];
                } else {
                    return;
                }
            }
            return o;
    	},
    	resolveLoop:function(html){
    		var loop = /<!-- BEGIN (.+?):loop -->(([\n\r\t]|.)*?)<!-- END (.+?):loop -->/g;
    		var touch = /<!-- BEGIN (\w+):touch#(\w+) -->(([\n\r\t]|.)*?)<!-- END (\w+):touch#(\w+) -->/g;
            var veil = /<!-- BEGIN (\w+):veil -->(([\n\r\t]|.)*?)<!-- END (\w+):veil -->/g;
    		var that = this;
    		/*ループ文解決*/
    		html = html.replace(loop,function(m,key,val){
    			var keys = that.getDataByString(key);
                var ret = "";
    			var tpl = val;
    			for(var i = 0,n = keys.length; i < n; i++){
    				/*タッチブロック解決*/
	    			var tmp = tpl.replace(touch,function(m,key2,val,next){
	    				if(keys[i][key2] == val){
	    					return next;
	    				}else{
	    					return "";
	    				}
	    			});
                    /*ベイルブロック解決*/
                    var tmp = tmp.replace(veil,function(m,key2,val,next){
                        console.log(keys[i][key2],next);
                        if(keys[i][key2]){
                            return next;
                        }else{
                            return "";
                        }
                    })
	    			/*ループ内変数解決*/
    				ret += tmp.replace(/{(\w+)}/g,function(n,key3){
    					if(key3 == "i"){
    						return i;
    					}else{
    						if(keys[i][key3]){
    							return keys[i][key3];
    						}else{
    							return n;
    						}
    					}
    				});
    			}
    			/*エスケープ削除*/
    			ret = ret.replace(/\\/g,"");
    			return ret;
    		});
    		return html;
    	},
    	hasLoop:function(txt){
    		var loop = /<!-- BEGIN (.+?):loop -->(([\n\r\t]|.)*?)<!-- END (.+?):loop -->/g;
    		if(txt.match(loop)){
    			return true;
    		}else{
    			return false;
    		}
    	},
    	update:function(txt){
    		var $template = $("#"+this.id);
    		var html = $template.html();
    		var data = this.data;
    		/*ループ解決*/
    		while(this.hasLoop(html)){
    			html = this.resolveLoop(html);
    		}
    		/*変数解決*/
    		html = html.replace(/{(\w+)}/g,function(m,key){
    			if(data[key])
    				return data[key];
    			else
    				return m;
    		});
            /*空行削除*/
            html = html.replace(/^(\t.)*\n/gm,"");
    		if(txt == "text"){
    			$("[data-id='"+this.id+"']").text(html);
    		}else{
    			$("[data-id='"+this.id+"']").html(html);
    		}
    	},
    	remove:function(path){
            var object = this.data;
            var stack = path.split('.');
            while(stack.length>1){
                object = object[stack.shift()];
            }
            var shift = stack.shift();
            if(shift.match(/^\d+$/)){
                object.splice(Number(shift),1);
            }else{
                delete object[shift];
            }
    	}
    });
})();