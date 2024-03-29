function class_tab(obj) {
	$(obj).addClass("active").siblings().removeClass("active");
};

//依赖构造函数
var Dragfn = function(ele, opt) {
	this.$element = ele;
	this.options = opt;
};
var _zIndex = 50;
//构造函数方法
Dragfn.prototype = {
	init: function(obj) {
		var self = this;
		self.ele = self.$element;
		self.handle = $(obj); //手柄
		self.options = self.options;
		self._start = false;
		self._move = false;
		self._end = false;

		self.s_handle = $(obj).find(".coor"); //伸缩手柄
		self.s_start = false; //拖动伸缩开始
		self.s_move = false; //拖动伸缩进行
		self.s_end = false; //伸缩结束
		self.modX = 0;
		self.modY = 0;
		self.modW = 0;
		self.modH = 0;
		self.modW_H = $(obj).data("scale") ? $(obj).data("scale"):1; //宽高比例

		self.disX = 0;
		self.disY = 0;
		//							self.zIndex = zIndex;
		self.moving = false;
		self.moves = "";

		//父级
		self.box = $.type(self.options.scope) === "string" ? self.options.scope : null;
		self.minSize = $.type(self.options.minSize) === "array" ? self.options.minSize : [0, 0];
		self.$box = $(obj).closest(self.box);

		//三个事件
		self.handle.on("mousedown", function(ev) {
			self.start(ev, obj);
			obj.setCapture && obj.setCapture();
			return false;
		});

		self.s_handle.on("mousedown", function(ev) {
			self.sStart(ev, obj);
			obj.setCapture && obj.setCapture();
			return false;
		});

		$(document).on("mousemove", function(ev) {
			self.move(ev, obj);
			self.sMove(ev, obj);
		});
		$(document).on("mouseup", function(ev) {
			self.end(ev, obj);
			self.sEnd(ev, obj);
		});
	},
	//jquery调取函数时候用
	loadJqueryfn: function() {
		var self = this;
		$.extend({
			//返回按照index排序的回调函数
			sortBox: function(obj) {
				var arr = [];
				for(var s = 0; s < $(obj).length; s++) {
					arr.push($(obj).eq(s));
				}
				for(var i = 0; i < arr.length; i++) {
					for(var j = i + 1; j < arr.length; j++) {
						if(Number(arr[i].attr("index")) > Number(arr[j].attr("index"))) {
							var temp = arr[i];
							arr[i] = arr[j];
							arr[j] = temp;
						}
					}
				}
				return arr
			},
			//随机排序函数
			randomfn: function(obj) {
				self.pack($(obj), true);
			},
			//返回当前最大的zindex
			toTop: function(obj, top) {
				return _zIndex;
			},
			//返回当前坐标最大、最小值
			pointRule: function(obj) {
				return self.collTestBox(obj, self.box);
			},
		});
	},
	start: function(ev, obj) {
		var self = this;
		self.moved = obj;
		self._start = true;
		var oEvent = ev || event;
		self.disX = oEvent.clientX - obj.offsetLeft;
		self.disY = oEvent.clientY - obj.offsetTop;
		if(self.options.ifTop) $(obj).css("z-index", _zIndex++);
		self.options.cbStart(obj, self);
		class_tab(obj); //切换class
	},
	move: function(ev, obj) {
		var self = this;
		if(self._start != true) {
			return false
		}
		if(obj != self.moved) {
			return false
		}
		self._move = true;
		var oEvent = ev || event;
		var l = oEvent.clientX - self.disX;
		var t = oEvent.clientY - self.disY;
		//有父级限制
		if(self.box != null) {
			var rule = self.collTestBox(obj, self.box);
			if(l > rule.lmax) {
				l = rule.lmax;
			} else if(l < rule.lmin) {
				l = rule.lmin;
			}
			if(t > rule.tmax) {
				t = rule.tmax;
			} else if(t < rule.tmin) {
				t = rule.tmin;
			}
		}
		obj.style.left = self.grid(obj, l, t).left + 'px';
		obj.style.top = self.grid(obj, l, t).top + 'px';
		
		self.options.cbMove(obj, self);

	},
	end: function(ev, obj) {
		var self = this;
		if(self._start != true) {
			return false
		}
		self.options.cbEnd(obj, self);
		if(self.options.handle != null) {
			$(obj).find(self.options.handle).unbind("onmousemove");
			$(obj).find(self.options.handle).unbind("onmouseup");
		} else {
			$(obj).unbind("onmousemove");
			$(obj).unbind("onmouseup");
		}
		obj.releaseCapture && obj.releaseCapture();
		self._start = false;

	},
	//算父级的宽高
	collTestBox: function(obj, obj2) {
		var self = this;
		var l1 = 0 - self.options.deviation[0]; //取的l最小值;
		var t1 = 0 - self.options.deviation[1]; //取的t最小值;
		var l2 = $(obj2).innerWidth() - $(obj).outerWidth() + self.options.deviation[0]; //取的l最大值;
		var t2 = $(obj2).innerHeight() - $(obj).outerHeight() + self.options.deviation[1]; //取的t最大值;
		return {
			lmin: l1, //取的l最小值
			tmin: t1, //取的t最小值
			lmax: l2, //取的l最大值
			tmax: t2 //取的t最大值
		}
	},
	//算父级宽高时候干掉margin
	grid: function(obj, l, t) { //cur:[width,height]
		var self = this;
		var json = {
			left: l,
			top: t
		};
		if($.isArray(self.options.grid) && self.options.grid.length == 2) {
			var gx = self.options.grid[0];
			var gy = self.options.grid[1];
			json.left = Math.floor((l + gx / 2) / gx) * gx;
			json.top = Math.floor((t + gy / 2) / gy) * gy;
			return json
		} else if(self.options.grid == null) {
			return json
		} else {
			console.log("grid参数传递格式错误");
			return false
		}
	},
	//初始布局转换
	pack: function(ele, click) {
		var self = this;
		for(var i = 0; i < ele.length; i++) {
			$(ele[i]).css("position", "absolute");
			$(ele[i]).css("margin", "0");
			self.init(ele[i]);
		}
	},
	getStyle: function(obj, name) {
		return(obj.currentStyle || getComputedStyle(obj, false))[name];
	},
	//随机数
	rnd: function(n, m) {
		return parseInt(Math.random() * (m - n) + n);
	},
	//在数组中找
	finInArr: function(arr, n) {
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] == n) { //存在
				return true;
			}
		}
		return false;
	},
	//放大缩小
	sStart: function(ev, obj) {
		var self = this;
		self.stretched = obj;
		self.s_start = true;

		self._start = false; //禁止模块移动

		var oEvent = ev || event;
		self.modX = oEvent.clientX;
		self.modY = oEvent.clientY;
		self.modW = $(obj).innerWidth();
		self.modH = $(obj).innerHeight();
		self.modW_H = $(obj).attr("data-scale")?$(obj).attr("data-scale"):1;
		self.options.stStart(obj, self);
	},
	sRule: function(obj, obj2) {
		var self = this;
		var w1 = self.minSize[0];
		var h1 = self.minSize[1];
		var w2 = $(obj2).innerWidth() - $(obj)[0].offsetLeft;
		var h2 = $(obj2).innerHeight() - $(obj)[0].offsetTop;
		return {
			wmin: w1, //取的w最小值
			hmin: h1, //取的h最小值
			wmax: w2, //取的w最大值
			hmax: h2 //取的h最大值
		}
	},
	sgrid: function(obj, w, h) {
		var self = this;
		var json = {
			width: w,
			height: h
		};
		if($.isArray(self.options.grid) && self.options.grid.length == 2) {
			var gw = self.options.grid[0];
			var gh = self.options.grid[1];
			json.width = Math.floor((w + gw / 2) / gw) * gw;
			json.height = Math.floor((h + gh / 2) / gh) * gh;
			return json
		} else if(self.options.grid == null) {
			return json
		} else {
			console.log("grid参数传递格式错误");
			return false
		}
	},
	sMove: function(ev, obj) {
		var self = this;
		if(self.s_start != true) {
			return false
		}
		if(obj != self.stretched) {
			return false
		}

		self.s_move = true;
		var oEvent = ev || event;
		var w = self.modW + (oEvent.clientX - self.modX);
		var h = self.options.scale ? w/self.modW_H : self.modH + (oEvent.clientY - self.modY);
		
//							var scale_w,scale_h;
//							if(self.options.scale) {
//								scale_w
//							}
		//有父级限制
		if(self.box != null) {
			var rule = self.sRule(obj, self.box);
			if(w > rule.wmax) {
				w = rule.wmax;
				if(self.options.scale) h = w/self.modW_H;
			} else if(w < rule.wmin) {
				w = rule.wmin;
				if(self.options.scale) h = w/self.modW_H;
			}
			if(h > rule.hmax) {
				h = rule.hmax;
				if(self.options.scale) w = h*self.modW_H;
			} else if(h < rule.hmin) {
				h = rule.hmin;
				if(self.options.scale) w = h*self.modW_H;
			}
		}
		obj.style.width = self.sgrid(obj, w, h).width + 'px';
		obj.style.height = self.sgrid(obj, w, h).height + 'px';
		self.options.stMove(obj, self); //伸缩后回调函数
	},
	sEnd: function(ev, obj) {
		var self = this;
		if(self.s_start != true) {
			return false
		}
		self.options.stEnd(obj, self); //伸缩后回调函数
		$(obj).unbind("onmousemove");
		$(obj).unbind("onmouseup");
		obj.releaseCapture && obj.releaseCapture();
		self.s_start = false;
	}
}

$.fn.myDrag = function(opt) {
	var call = {
		scope: null, //父级
		handle: null, //手柄
		grid: null, //网格
		deviation: [0, 0], //模块可以超出边界的部分像素值
		cbStart: function() {}, //移动前的回调函数
		cbMove: function() {}, //移动中的回调函数
		cbEnd: function() {}, //移动结束时候的回调函数
		stStart: function() {}, //伸缩前的回调函数
		stEnd: function() {}, //伸缩后的回调函数
		stMove: function(){}, //伸缩中的回调函数
		ifTop: true, //是否点击置顶
		scale: false, //按宽高比例伸展
	};
	var dragfn = new Dragfn(this, opt);
	if(opt && $.isEmptyObject(opt) == false) {
		dragfn.options = $.extend(call, opt);
	} else {
		dragfn.options = call;
	}
	dragfn.firstRandom = true;
	var ele = dragfn.$element;
		$box = ele.closest(box);
	var box = opt.scope ? opt.scope : ".drag_box";
	var item = opt.target ? opt.target : ".drag_item";
//						var ele = element.parent(box).find(item),
//							$box = element.closest(box);

	if($box.css("position") == "static") $box.css("position", "relative");
	dragfn.pack(ele, false);
	//加载拓展jquery的函数
	dragfn.loadJqueryfn()
};
