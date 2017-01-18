var config = {
	dev: true, /* 调试模式 */

	yingyongbaoUrl: 'http://sj.qq.com/', // TODO 应用宝url待提供
	androidLink: 'http://www.memorhome.com/app/memorhome.apk',
	iosLink: '',
	link1: 'https://hd.ysfaisco.cn/11781254/5/zajindan.html?otherplayer=onRBzwcFkBNTtXhttK0E5sr5xYZ4&shareDeep=2&winzoom=1&code=011dv3Pa1LE4yr0VeEOa1ze3Pa1dv3P9&state=STATE&appid=wx6b37f693f9a886ff', // 首页图片的link
	link2: 'http://u3569348.viewer.maka.im/k/YAR5EYQP', // 服务首页的link
	phone_manager: '400-873-6888', // 管家电话
    cpage: 1, //当前第几页，从1开始
    pagesize: 10, //默认分页大小
    //server: location.protocol + '//' + location.host,
	//server: 'http://118.178.136.49:8080/myhome/api/',
	server: '/myhome/api/',
	bd_api_key: 'rtg1a3V6x83iiFGHSrTWukgyKrNP10T8',
	version: '0.8.10',
	devId: null,
	jpushId: null,
	// todo api title换成www.memorhome.com

    tips : {
		server: '服务器异常，请稍后再试～',
		timeout: '请求超时啦，请重试～',
		nodata: '暂无数据~',
		nomoredata: '没有更多数据啦~',
		loading: '加载中……',
		login: '登录跳转中...'
	}
}

































var Storage = (function() {
	return {
		MJ_VERSION : 'mj_VERSION',
		TMP_RM_TYPE : 'mj_TMP_RM_TYPE',
		TMP_ESTATE : 'mj_ESTATE',
		TMP_ORDER: 'mj_TMP_ORDER',
		LAST_CODE: 'mj_LAST_CODE',
		OPENID: 'mj_OPENID',
		USER_DATA : 'mj_USERDATA',
		USER_INFO : 'mj_USERINFO',
		USER_ROOM : 'mj_USERROOM',
		ROOM_LIST : 'MJ_ROOMLIST',
		TMP_BILL : 'mj_TMPBILL',
		TMP_CITY : 'MJ_TMPCITY',

		get : function(key, isSession) {
			if (!Storage.isLocalStorage()) {
				return;
			}
			var value;
			try {
				value = Storage.getStorage(isSession).getItem(key);
				return JSON.parse(value);
			} catch (e) {
				console.log(e);
				return undefined;
			}

		},
		set : function(key, value, isSession) {
			if (!Storage.isLocalStorage()) {
				return;
			}
			value = JSON.stringify(value);
			Storage.getStorage(isSession).setItem(key, value);
		},
		remove : function(key, isSession) {
			if (!Storage.isLocalStorage()) {
				return;
			}
			Storage.getStorage(isSession).removeItem(key);
		},
		getStorage: function(isSession){
			return isSession ? sessionStorage : localStorage;
		},
		isLocalStorage : function() {
			try {
				if (!window.localStorage) {
					console.log('不支持本地存储');
					return false;
				}
				localStorage.setItem('isLocalStorage', 'abc');
				localStorage.removeItem('isLocalStorage');
				return true;
			} catch (e) {
				console.log('本地存储已关闭');
				return false;
			}
		}
	};
})();


var Tools = (function() {
	var panel, loading, timer;

	return {
		handleContract: function (orderNo, sessionId) {
			if (!orderNo)
				return;
			sessionId = sessionId ? sessionId : Storage.get(Storage.USER_DATA).sessionId;
			Ajax.submitPost({
				url: config.server + 'contract',
				method: 'orderContract',
				reqId: Tools.getRandomReq(),
				params: {
					devId: config.devId,
					jpushId: config.jpushId,
					sessionId: sessionId,
					orderNo: orderNo
				}
			}, function (data) {
				if (data.data.contractUrl) {
					var status = data.data.status;
					status = (status == 1 ? '1' : '');
					location.href = 'pdf-web/viewer.html?orderNo=' + orderNo + '&isSign=' + status + '&file=' + encodeURIComponent(data.data.contractUrl);
				} else {
					Tools.showTip('获取合同失败');
				}
			})
		},
		returnVerifyType: function (type) {
			switch (type) {
				case 0:
					return '未提交资料';
				case 1:
					return '审核中';
				case 2:
					return '审核通过';
				case 3:
					return '审核不通过';
				default:
					return '审核不通过';
			}
		},

		/* 返回证件类型 */
		returnNumType: function (typeid) {
			switch(typeid) {
				case 1:
					return '身份证';
				case 2:
					return '护照';
				case 3:
					return '港澳通行证';
				case 4:
					return '台湾通行证';
			}
		},
		/** ios内嵌需要调用方法 start **/
		setupWebViewJavascriptBridge: function (callback) {
			if (window.WebViewJavascriptBridge) {
				return callback(WebViewJavascriptBridge);
			}
			if (window.WVJBCallbacks) {
				return window.WVJBCallbacks.push(callback);
			}
			window.WVJBCallbacks = [callback];
			var WVJBIframe = document.createElement('iframe');
			WVJBIframe.style.display = 'none';
			WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
			document.documentElement.appendChild(WVJBIframe);
			setTimeout(function () {
				document.documentElement.removeChild(WVJBIframe)
			}, 0)
		},
		/** ios内嵌需要调用方法 end **/

		judgeSystem: function () { // 1->安卓 2->ios 0->other
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;

			if (/android/i.test(userAgent)) {
				return 1;
			}

			if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
				return 2;
			}

			return 0;
		},
		yyyymmdd: function () {
			var date = new Date();
			var mm = date.getMonth() + 1; // getMonth() is zero-based
			var dd = date.getDate();

			return [date.getFullYear(),
				(mm > 9 ? '' : '0') + mm,
				(dd > 9 ? '' : '0') + dd
			].join('-');
		},
		/** rem转换为px 并且返回整数 **/
		rem2px: function (remValue) {
			return parseInt(lib.flexible.rem2px(remValue));
		},
		/** 判断列表是否为空 **/
		isEmpty: function(list) {
			if (!list || list.length < 1)
				return true;
			return false;
		},
		/* 返回放空图片路径 */
		prevNullImage: function(image) {
			var str_def = '';
			if (!image) {
				return str_def;
			}
			image = [].concat(image);
			if (image.length < 1) {
				return str_def;
			}
			return image[0];
		},
		/** 返回随机字符串 **/
		getRandomReq: function() {
			return (Math.floor((Math.random() * 10000) + 1));
		},
		getTimeStamp: function() {
			return (Date.now() | 0);
		},
		dealScroll: function() {
			document.body.addEventListener('touchmove', function(evt) {
				if(!evt._isScroller) {
					evt.preventDefault();
				}
			});
			overscroll(document.querySelector('.scroll'));
		},

		/*
		 * 去除name中的省市区
		 */
		trimCity: function(name) {
			if (!name)
				return '';
			var letter = name.slice(-1);
			if (letter == '省' || letter == '市' || letter == '区') {
				name = name.slice(0, -1);
			}
			return name;
		},
		isElementInViewport: function(el) {
			if (typeof jQuery === "function" && el instanceof jQuery) {
				el = el[0];
			}
			var rect = el.getBoundingClientRect();
			return (
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
				rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
			);
		},
		onVisibilityChange: function(el, callback) {
			var old_visible;
			return function () {
				var visible = Tools.isElementInViewport(el);
				if (visible != old_visible) {
					old_visible = visible;
					if (typeof callback == 'function') {
						callback();
					}
				}
			};
		},
		calDistance: function(lng1, lat1, lng2, lat2, matID) {
			var map = new BMap.Map(matID);
			var point1 = new BMap.Point(lng1,lat1);
			var point2 = new BMap.Point(lng2,lat2);
			var distance = map.getDistance(point1,point2);
			return distance; // TODO 此方法待实际调用校验
		},
		zoomMap: function(map) { // 解决flexible跟map的viewport冲突问题
			var viewport = document.querySelector('meta[name=viewport]').content;
			viewport = viewport.slice(viewport.indexOf('initial-scale') + 14, viewport.indexOf(','));
			viewport = parseFloat(viewport);
			if (isNaN(viewport)) {
				viewport = 1;
			}
			var zoom = 1 / viewport;
			map.attr('style', 'zoom: ' + zoom + '; -moz-transform: scale(' + zoom + ');');
		},
		callKeeper: function() { // 拨打管家热线
			Tools.makePhoneCall(config.phone_manager);
		},
		makePhoneCall: function (tel) {
			location.href = 'tel:' + tel;
		},
		getQueryVariable : function(variable) {
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i=0;i<vars.length;i++) {
				var pair = vars[i].split("=");
				if(pair[0] == variable){
					return decodeURIComponent(pair[1]);
				}
			}
			return(false);
		},
		verifyMobile: function(mobile) { // 验证手机号
			if(!(/^1[3|4|5|7|8][0-9]{9}$/.test(mobile))){
				return false;
			}
			return true;
		},
		verifyIDCard: function (idCard) { // 验证身份证号
			var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
			return reg.test(idCard);
		},
		isWeixinBrowser: function() {
			return /micromessenger/.test(navigator.userAgent.toLowerCase());
		},
		showLoading: function() {
			loading = loading || $('#loading-wrapper');
			loading.show();
		},
		hideLoading: function() {
			loading = loading || $('#loading-wrapper');
			loading.hide();
		},
		/**
		 * 取的字段是name
		 * @param choices
		 * @param callback
		 */
		showSelect: function(choices, callback) {
			if (Tools.isEmpty(choices))
				return;
			$('#select-wrapper').html('');
			var list = $('#select-wrapper');
			for (var i = 0;i < choices.length; ++i) {
				list.append('<div data-id="' + i + '" class="item">' + choices[i].name + '</div>');
			}
			list.css('height', 0.8 * choices.length + 'rem');
			$('.select-wrapper .item').click(function() {
				var ref = this;
				list.hide();
				if($.isFunction(callback)) {
					callback(choices[parseInt($(ref).attr('data-id'))]);
				}

				callback = false;
				choices = false;
			});
			list.show();
		},
		showSelectTick: function (choices, callback) {
			if (Tools.isEmpty(choices))
				return;
			$('#select-wrapper').html('');
			var list = $('#select-wrapper');
			choices.forEach(function (obj, i) {
				list.append('<div data-id="' + i + '" class="item"><input class="cb-choice" type="checkbox">' + choices[i].name + '</div>');
			});
			list.append('<div class="item btn-sure">确定</div>');
			list.css('height', 0.8 * (choices.length + 1) + 'rem');
			$('.select-wrapper .btn-sure').click(function () {
				var ref = this;
				list.hide();
				if($.isFunction(callback)) {
					var cs = [];
					var css = $('.cb-choice:checked');
					for (var i = 0;i < css.length; ++i) {
						var index = $(css[i]).parent().attr('data-id');
						cs.push(choices[index].data);
					}
					callback(cs);
				}

				callback = false;
				choices = false;
			});

			list.show();
		},
		showConfirm: function(msg, yesCallback, noCallback) {
			panel = panel || $('#toast-wrapper');
			msg = msg || '是否确定?';
			panel.find('.main').html(msg);

			$('#toast-wrapper').show();

			panel.find('#btn-confirm').click(function() {
				panel.hide();
				if (typeof yesCallback == 'function') {
					yesCallback();
					yesCallback = undefined;
				}
				panel.find('#btn-confirm').unbind('click');
				msg = '';
			});

			panel.find('.btn-no').click(function() {
				panel.hide();
				if (typeof noCallback == 'function') {
					noCallback();
					noCallback = undefined;
				}
				panel.find('.btn-no').unbind('click');
				msg = '';
			});
		},
		showTip: function(msg, callback, tick) {
			panel = panel || $('#toast-wrapper');
			msg = msg || '操作成功';
			tick = tick || 3; // 默认为3秒
			if (tick < 1000) tick *= 1000;
			panel.find('.btn-no').hide();
			panel.find('.main').html(msg);
			panel.show();

			panel.find('#btn-confirm').click(function() {
				clearTimeout(timer);
				panel.find('.btn-no').show();
				panel.hide();

				if (typeof callback == 'function') {
					callback();
					callback = undefined;
				}
				tick = 0;
				panel.find('#btn-confirm').unbind('click');
				msg = '';
			});

			timer = setTimeout(function() {
				panel.find('.btn-no').show();
				panel.hide();

				if (typeof callback == 'function') {
					callback();
					callback = undefined;
				}
				tick = 0;
				panel.find('#btn-confirm').unbind('click');
				msg = '';
			}, tick);
		},
		showDarkPop: function (msg, showTick, isForever) {
			panel = $('#dark-pop');
			msg = msg || '操作成功';
			var tick = 2000; // 默认为2秒

			panel.find('.icon_tick').css('display', showTick ? 'block' : 'none');
			panel.find('.text').html(msg);
			panel.show();

			if (isForever)
				return;
			timer = setTimeout(function() {
				panel.hide();
				tick = 0;
				msg = '';
			}, tick);
		},
	};
})();

var Ajax = {

	/**
	 * 基于ajax的POST请求
	 *
	 * @param data
	 *            传入的参数
	 * @param callback
	 *            ajax请求成功后执行的回调方法
	 * @param callbackDone
	 *            ajax请求成功后最后执行的方法
	 */
	submitPost : function(data, callback, callbackDone, callbackFail, silendMode) {
		var formData;

		formData = {
			v: config.version,
			method: data.method,
			reqId: data.reqId,
			timestamp: Tools.getTimeStamp(),
			params: data.params
		};

		if (!silendMode)
			Tools.showLoading();
		$.ajax({
			'contentType': 'application/json',
			'type' : 'POST',
			'url': data.url + '?v=' + Tools.getTimeStamp(),
			'data' : JSON.stringify(formData),
			'dataType': 'json'
		}).then(function(response) {
			Tools.hideLoading();
			if(typeof response == 'string'){
				response = eval('(' + response + ')');
			}
			if(response.code != 0){
				if (!silendMode)
					Tools.showTip(response.message || '操作失败');
				if ($.isFunction(callbackFail)) {
					callbackFail(response.rtMsrg);
				}
				return;
			}
			if ($.isFunction(callback)) {
				callback(response);
			}
		}).done(function(response) {
			Tools.hideLoading();
			if ($.isFunction(callbackDone)) {
				callbackDone(response);
			}
		}).fail(function( jqXHR, textStatus, errorThrown ) {
			Tools.hideLoading();
			if (!silendMode)
				Tools.showTip(config.tips.server);
			if ($.isFunction(callbackFail)) {
				callbackFail(jqXHR);
			}
		});
	},
};

var Auth = (function () { 
	return {
		setFakeOpenId: function () { // 创造假的openId
			if (!config.dev) {
				return;
			}
			Storage.set(Storage.OPENID, 'onRBzwXIWvHbQzVRbOaztq7qBNyc');
		},
		setFakeUserObj: function () { // 创造假的sessionId
			if (!config.dev) {
				return;
			}

			Storage.set(Storage.USER_DATA, {
				"sessionId": "w47DdXZ7ZJIGjvPJty+apvXNvFiaH64a9g1ujq6euhfGFWwNUWTfNikBS/55JDCDWLdAfdIRa6hXTwjx9qLH7LkeLL8gdCFOd/yidvyP+LoYeyQGXzEczM+F4BRQVoAE",
				"customerId": 103
			});
		},
		setFakeUserInfo: function () { // 创造假的用户数据
			if (!config.dev) {
				return;
			}
			Storage.set(Storage.USER_DATA, {
				"customerId": 10000,
				"customerName": "abc",
				"nickName": "abc",
				"mobile": "13512345678",
				"gender": 1,
				"verificationStatus": 1
			});
		},
		setFakeRoomObj: function () { // 创造假的房间信息
			if (!config.dev) {
				return;
			}
			Storage.set(Storage.USER_DATA, {
				"roomId": 1,
				"roomNo": "82015",
				"estateId": 1,
				"estateName": "靖源国际",
				"buildingId": 1,
				"buildingName": "1号楼",
				"floorId": 1,
				"floorNum": 2,
				"status": 0,
				"endDate": "2016/12/12",
				"isMaster": true,
				"masterName": null,
				"guestMobile": "15058571100"
			})
		},
		setFakeRoomList: function () { // 创造假的房间列表
			if (!config.dev) {
				return;
			}
			Storage.set(Storage.USER_DATA, [
				{
					"roomId": 1,
					"roomNo": "82015",
					"estateId": 1,
					"estateName": "靖源国际",
					"buildingId": 1,
					"buildingName": "1号楼",
					"floorId": 1,
					"floorNum": 2,
					"status": 0,
					"endDate": "2016/12/12",
					"isMaster": true,
					"masterName": null,
					"guestMobile": "15058571100"
				},
				{
					"roomId": 2,
					"roomNo": "82016",
					"estateId": 1,
					"estateName": "靖源国际",
					"buildingId": 1,
					"buildingName": "1号楼",
					"floorId": 1,
					"floorNum": 2,
					"status": 1,
					"endDate": "2016/12/12",
					"isMaster": true,
					"masterName": null,
					"guestMobile": "15058571100"
				},
				{
					"roomId": 3,
					"roomNo": "82017",
					"estateId": 1,
					"estateName": "靖源国际",
					"buildingId": 1,
					"buildingName": "1号楼",
					"floorId": 1,
					"floorNum": 2,
					"status": 2,
					"endDate": "2016/12/12",
					"isMaster": false,
					"masterName": "测试房主",
					"guestMobile": "15058571100"
				},
				{
					"roomId": 4,
					"roomNo": "82018",
					"estateId": 1,
					"estateName": "靖源国际",
					"buildingId": 1,
					"buildingName": "1号楼",
					"floorId": 1,
					"floorNum": 2,
					"status": 3,
					"endDate": "2016/12/12",
					"isMaster": true,
					"masterName": null,
					"guestMobile": "15058571100"
				},
				{
					"roomId": 5,
					"roomNo": "82029",
					"estateId": 1,
					"estateName": "靖源国际",
					"buildingId": 1,
					"buildingName": "1号楼",
					"floorId": 1,
					"floorNum": 2,
					"status": 1,
					"endDate": "2016/12/12",
					"isMaster": true,
					"masterName": null,
					"guestMobile": "15058571100"
				},
				{
					"roomId": 6,
					"roomNo": "82039",
					"estateId": 1,
					"estateName": "靖源国际",
					"buildingId": 1,
					"buildingName": "1号楼",
					"floorId": 1,
					"floorNum": 2,
					"status": 1,
					"endDate": "2016/12/12",
					"isMaster": true,
					"masterName": null,
					"guestMobile": "15058571100"
				},
				{
					"roomId": 7,
					"roomNo": "82066",
					"estateId": 1,
					"estateName": "靖源国际",
					"buildingId": 1,
					"buildingName": "1号楼",
					"floorId": 1,
					"floorNum": 2,
					"status": 1,
					"endDate": "2016/12/12",
					"isMaster": true,
					"masterName": null,
					"guestMobile": "15058571100"
				}
			]);
		},
		getLastCode: function () {
			return Storage.get(Storage.LAST_CODE)
		},
		clearData: function () { // 清除所有缓存数据
			Storage.remove(Storage.OPENID);
			Storage.remove(Storage.USER_DATA);
			Storage.remove(Storage.USER_INFO);
			Storage.remove(Storage.USER_ROOM);
			Storage.remove(Storage.ROOM_LIST);
		},
		detectAuth: function (callback) {
			var code = Tools.getQueryVariable('code');

			var version  = Storage.get(Storage.MJ_VERSION);
			if (!version || version != config.version) {
				Auth.clearData();
			}
			Storage.set(Storage.MJ_VERSION, config.version);

			if (!code || code == Storage.get(Storage.LAST_CODE)) {
				if (Storage.get(Storage.USER_DATA)) {
					if($.isFunction(callback)) {
						callback(true);
						callback = false;
					}
				} else {
					if($.isFunction(callback)) {
						callback(false);
						callback = false;
					}
				}
			}

			Storage.set(Storage.LAST_CODE, code);
			// 静默获取openid
			Ajax.submitPost({
				url: config.server + 'wechat',
				method: 'wechatAccessToken',
				reqId: Tools.getRandomReq(),
				params: {
					devId: config.devId,
					jpushId: config.jpushId,
					code: code
				}
			}, function (data) {
				if (data.data.wechatResult && data.data.wechatResult.openid) { // 授权成功
					var openid = data.data.wechatResult.openid;
					var openidOld = Storage.get(Storage.OPENID);
					if (openidOld) {
						if(openidOld != openid) {
							Auth.clearData();
							console.log('用户切换账号 清空数据');
						} else {
							if($.isFunction(callback)) {
								callback(true);
								callback = false
							}
						}
					}
					Storage.set(Storage.OPENID, openid);

					// 静默微信登录
					Ajax.submitPost({
						url: config.server + 'wechat',
						method: 'wachatLogin',
						reqId: Tools.getRandomReq(),
						params: {
							devId: config.devId,
							jpushId: config.jpushId,
							openId: openid
						}
					}, function (data) {
						if (data.data) {
							Storage.set(Storage.USER_DATA, data.data); // userobj就sessionId跟customerId 2个字段
							if($.isFunction(callback)) {
								callback(true);
								callback = false;
							}
						} else {
							if($.isFunction(callback)) {
								callback(false);
								callback = false;
								location.href = 'index.html?redirect=' + encodeURIComponent(location.href);
							}
						}
					}, false, function () { // 登录失败 此用户授权了 但是没有注册
						if($.isFunction(callback)) {
							callback(false);
							callback = false;
							location.href = 'index.html?redirect=' + encodeURIComponent(location.href);
						}
					}, true);
				} else {
					if (Storage.get(Storage.USER_DATA)) {
						if($.isFunction(callback)) {
							callback(true);
							callback = false;
						}
					} else {
						if($.isFunction(callback)) {
							callback(false);
							callback = false;
						}
					}
				}
			}, false, function () { // code换openid失败 可能是因为code是随便添上去的
				if (Storage.get(Storage.USER_DATA)) {
					if($.isFunction(callback)) {
						callback(true);
						callback = false;
					}
				} else {
					if($.isFunction(callback)) {
						callback(false);
						callback = false;
					}
				}
			}, true);

			return true
		},
		getUserData: function () {
			return Storage.get(Storage.USER_DATA);
		},
		fetchUserData: function (callback, isForce) {
			var userObj = Storage.get(Storage.USER_INFO);
			if (!isForce) {
				if (userObj && userObj.customerId) {
					if ($.isFunction(callback)) {
						callback(userObj);
						callback = false;
					}
					return;
				}
			}
			Ajax.submitPost({ // 获取用户信息
				url: config.server + 'customer',
				method: 'getCustomerInfo',
				reqId: Tools.getRandomReq(),
				params: {
					devId: config.devId,
					jpushId: config.jpushId,
					sessionId: Auth.getUserData().sessionId,
					openId: Storage.get(Storage.OPENID) + ''
				}
			}, function (data) {
				if (data.data) {
					userObj = data.data;
					Storage.set(Storage.USER_INFO, userObj);
					if ($.isFunction(callback)) {
						callback(userObj);
						callback = false;
					}
				}
			});
		}
	};
})();
//Auth.detectAuth();

var City = (function () {
	return {
		list: [{"cityName":"北京市","cityId":110100},{"cityName":"天津市","cityId":120100},{"cityName":"石家庄市","cityId":130100},{"cityName":"唐山市","cityId":130200},{"cityName":"秦皇岛市","cityId":130300},{"cityName":"邯郸市","cityId":130400},{"cityName":"邢台市","cityId":130500},{"cityName":"保定市","cityId":130600},{"cityName":"张家口市","cityId":130700},{"cityName":"承德市","cityId":130800},{"cityName":"沧州市","cityId":130900},{"cityName":"廊坊市","cityId":131000},{"cityName":"衡水市","cityId":131100},{"cityName":"太原市","cityId":140100},{"cityName":"大同市","cityId":140200},{"cityName":"阳泉市","cityId":140300},{"cityName":"长治市","cityId":140400},{"cityName":"晋城市","cityId":140500},{"cityName":"朔州市","cityId":140600},{"cityName":"晋中市","cityId":140700},{"cityName":"运城市","cityId":140800},{"cityName":"忻州市","cityId":140900},{"cityName":"临汾市","cityId":141000},{"cityName":"吕梁市","cityId":141100},{"cityName":"呼和浩特市","cityId":150100},{"cityName":"包头市","cityId":150200},{"cityName":"乌海市","cityId":150300},{"cityName":"赤峰市","cityId":150400},{"cityName":"通辽市","cityId":150500},{"cityName":"鄂尔多斯市","cityId":150600},{"cityName":"呼伦贝尔市","cityId":150700},{"cityName":"巴彦淖尔市","cityId":150800},{"cityName":"乌兰察布市","cityId":150900},{"cityName":"兴安盟","cityId":152200},{"cityName":"锡林郭勒盟","cityId":152500},{"cityName":"阿拉善盟","cityId":152900},{"cityName":"沈阳市","cityId":210100},{"cityName":"大连市","cityId":210200},{"cityName":"鞍山市","cityId":210300},{"cityName":"抚顺市","cityId":210400},{"cityName":"本溪市","cityId":210500},{"cityName":"丹东市","cityId":210600},{"cityName":"锦州市","cityId":210700},{"cityName":"营口市","cityId":210800},{"cityName":"阜新市","cityId":210900},{"cityName":"辽阳市","cityId":211000},{"cityName":"盘锦市","cityId":211100},{"cityName":"铁岭市","cityId":211200},{"cityName":"朝阳市","cityId":211300},{"cityName":"葫芦岛市","cityId":211400},{"cityName":"长春市","cityId":220100},{"cityName":"吉林市","cityId":220200},{"cityName":"四平市","cityId":220300},{"cityName":"辽源市","cityId":220400},{"cityName":"通化市","cityId":220500},{"cityName":"白山市","cityId":220600},{"cityName":"松原市","cityId":220700},{"cityName":"白城市","cityId":220800},{"cityName":"延边朝鲜族自治州","cityId":222400},{"cityName":"哈尔滨市","cityId":230100},{"cityName":"齐齐哈尔市","cityId":230200},{"cityName":"鸡西市","cityId":230300},{"cityName":"鹤岗市","cityId":230400},{"cityName":"双鸭山市","cityId":230500},{"cityName":"大庆市","cityId":230600},{"cityName":"伊春市","cityId":230700},{"cityName":"佳木斯市","cityId":230800},{"cityName":"七台河市","cityId":230900},{"cityName":"牡丹江市","cityId":231000},{"cityName":"黑河市","cityId":231100},{"cityName":"绥化市","cityId":231200},{"cityName":"大兴安岭地区","cityId":232700},{"cityName":"上海市","cityId":310100},{"cityName":"南京市","cityId":320100},{"cityName":"无锡市","cityId":320200},{"cityName":"徐州市","cityId":320300},{"cityName":"常州市","cityId":320400},{"cityName":"苏州市","cityId":320500},{"cityName":"南通市","cityId":320600},{"cityName":"连云港市","cityId":320700},{"cityName":"淮安市","cityId":320800},{"cityName":"盐城市","cityId":320900},{"cityName":"扬州市","cityId":321000},{"cityName":"镇江市","cityId":321100},{"cityName":"泰州市","cityId":321200},{"cityName":"宿迁市","cityId":321300},{"cityName":"杭州市","cityId":330100},{"cityName":"宁波市","cityId":330200},{"cityName":"温州市","cityId":330300},{"cityName":"嘉兴市","cityId":330400},{"cityName":"湖州市","cityId":330500},{"cityName":"绍兴市","cityId":330600},{"cityName":"金华市","cityId":330700},{"cityName":"衢州市","cityId":330800},{"cityName":"舟山市","cityId":330900},{"cityName":"台州市","cityId":331000},{"cityName":"丽水市","cityId":331100},{"cityName":"合肥市","cityId":340100},{"cityName":"芜湖市","cityId":340200},{"cityName":"蚌埠市","cityId":340300},{"cityName":"淮南市","cityId":340400},{"cityName":"马鞍山市","cityId":340500},{"cityName":"淮北市","cityId":340600},{"cityName":"铜陵市","cityId":340700},{"cityName":"安庆市","cityId":340800},{"cityName":"黄山市","cityId":341000},{"cityName":"滁州市","cityId":341100},{"cityName":"阜阳市","cityId":341200},{"cityName":"宿州市","cityId":341300},{"cityName":"六安市","cityId":341500},{"cityName":"亳州市","cityId":341600},{"cityName":"池州市","cityId":341700},{"cityName":"宣城市","cityId":341800},{"cityName":"福州市","cityId":350100},{"cityName":"厦门市","cityId":350200},{"cityName":"莆田市","cityId":350300},{"cityName":"三明市","cityId":350400},{"cityName":"泉州市","cityId":350500},{"cityName":"漳州市","cityId":350600},{"cityName":"南平市","cityId":350700},{"cityName":"龙岩市","cityId":350800},{"cityName":"宁德市","cityId":350900},{"cityName":"南昌市","cityId":360100},{"cityName":"景德镇市","cityId":360200},{"cityName":"萍乡市","cityId":360300},{"cityName":"九江市","cityId":360400},{"cityName":"新余市","cityId":360500},{"cityName":"鹰潭市","cityId":360600},{"cityName":"赣州市","cityId":360700},{"cityName":"吉安市","cityId":360800},{"cityName":"宜春市","cityId":360900},{"cityName":"抚州市","cityId":361000},{"cityName":"上饶市","cityId":361100},{"cityName":"济南市","cityId":370100},{"cityName":"青岛市","cityId":370200},{"cityName":"淄博市","cityId":370300},{"cityName":"枣庄市","cityId":370400},{"cityName":"东营市","cityId":370500},{"cityName":"烟台市","cityId":370600},{"cityName":"潍坊市","cityId":370700},{"cityName":"济宁市","cityId":370800},{"cityName":"泰安市","cityId":370900},{"cityName":"威海市","cityId":371000},{"cityName":"日照市","cityId":371100},{"cityName":"莱芜市","cityId":371200},{"cityName":"临沂市","cityId":371300},{"cityName":"德州市","cityId":371400},{"cityName":"聊城市","cityId":371500},{"cityName":"滨州市","cityId":371600},{"cityName":"菏泽市","cityId":371700},{"cityName":"郑州市","cityId":410100},{"cityName":"开封市","cityId":410200},{"cityName":"洛阳市","cityId":410300},{"cityName":"平顶山市","cityId":410400},{"cityName":"安阳市","cityId":410500},{"cityName":"鹤壁市","cityId":410600},{"cityName":"新乡市","cityId":410700},{"cityName":"焦作市","cityId":410800},{"cityName":"濮阳市","cityId":410900},{"cityName":"许昌市","cityId":411000},{"cityName":"漯河市","cityId":411100},{"cityName":"三门峡市","cityId":411200},{"cityName":"南阳市","cityId":411300},{"cityName":"商丘市","cityId":411400},{"cityName":"信阳市","cityId":411500},{"cityName":"周口市","cityId":411600},{"cityName":"驻马店市","cityId":411700},{"cityName":"武汉市","cityId":420100},{"cityName":"黄石市","cityId":420200},{"cityName":"十堰市","cityId":420300},{"cityName":"宜昌市","cityId":420500},{"cityName":"襄阳市","cityId":420600},{"cityName":"鄂州市","cityId":420700},{"cityName":"荆门市","cityId":420800},{"cityName":"孝感市","cityId":420900},{"cityName":"荆州市","cityId":421000},{"cityName":"黄冈市","cityId":421100},{"cityName":"咸宁市","cityId":421200},{"cityName":"随州市","cityId":421300},{"cityName":"恩施土家族苗族自治州","cityId":422800},{"cityName":"长沙市","cityId":430100},{"cityName":"株洲市","cityId":430200},{"cityName":"湘潭市","cityId":430300},{"cityName":"衡阳市","cityId":430400},{"cityName":"邵阳市","cityId":430500},{"cityName":"岳阳市","cityId":430600},{"cityName":"常德市","cityId":430700},{"cityName":"张家界市","cityId":430800},{"cityName":"益阳市","cityId":430900},{"cityName":"郴州市","cityId":431000},{"cityName":"永州市","cityId":431100},{"cityName":"怀化市","cityId":431200},{"cityName":"娄底市","cityId":431300},{"cityName":"湘西土家族苗族自治州","cityId":433100},{"cityName":"广州市","cityId":440100},{"cityName":"韶关市","cityId":440200},{"cityName":"深圳市","cityId":440300},{"cityName":"珠海市","cityId":440400},{"cityName":"汕头市","cityId":440500},{"cityName":"佛山市","cityId":440600},{"cityName":"江门市","cityId":440700},{"cityName":"湛江市","cityId":440800},{"cityName":"茂名市","cityId":440900},{"cityName":"肇庆市","cityId":441200},{"cityName":"惠州市","cityId":441300},{"cityName":"梅州市","cityId":441400},{"cityName":"汕尾市","cityId":441500},{"cityName":"河源市","cityId":441600},{"cityName":"阳江市","cityId":441700},{"cityName":"清远市","cityId":441800},{"cityName":"东莞市","cityId":441900},{"cityName":"中山市","cityId":442000},{"cityName":"东沙群岛","cityId":442101},{"cityName":"潮州市","cityId":445100},{"cityName":"揭阳市","cityId":445200},{"cityName":"云浮市","cityId":445300},{"cityName":"南宁市","cityId":450100},{"cityName":"柳州市","cityId":450200},{"cityName":"桂林市","cityId":450300},{"cityName":"梧州市","cityId":450400},{"cityName":"北海市","cityId":450500},{"cityName":"防城港市","cityId":450600},{"cityName":"钦州市","cityId":450700},{"cityName":"贵港市","cityId":450800},{"cityName":"玉林市","cityId":450900},{"cityName":"百色市","cityId":451000},{"cityName":"贺州市","cityId":451100},{"cityName":"河池市","cityId":451200},{"cityName":"来宾市","cityId":451300},{"cityName":"崇左市","cityId":451400},{"cityName":"海口市","cityId":460100},{"cityName":"三亚市","cityId":460200},{"cityName":"三沙市","cityId":460300},{"cityName":"重庆市","cityId":500100},{"cityName":"成都市","cityId":510100},{"cityName":"自贡市","cityId":510300},{"cityName":"攀枝花市","cityId":510400},{"cityName":"泸州市","cityId":510500},{"cityName":"德阳市","cityId":510600},{"cityName":"绵阳市","cityId":510700},{"cityName":"广元市","cityId":510800},{"cityName":"遂宁市","cityId":510900},{"cityName":"内江市","cityId":511000},{"cityName":"乐山市","cityId":511100},{"cityName":"南充市","cityId":511300},{"cityName":"眉山市","cityId":511400},{"cityName":"宜宾市","cityId":511500},{"cityName":"广安市","cityId":511600},{"cityName":"达州市","cityId":511700},{"cityName":"雅安市","cityId":511800},{"cityName":"巴中市","cityId":511900},{"cityName":"资阳市","cityId":512000},{"cityName":"阿坝藏族羌族自治州","cityId":513200},{"cityName":"甘孜藏族自治州","cityId":513300},{"cityName":"凉山彝族自治州","cityId":513400},{"cityName":"贵阳市","cityId":520100},{"cityName":"六盘水市","cityId":520200},{"cityName":"遵义市","cityId":520300},{"cityName":"安顺市","cityId":520400},{"cityName":"铜仁市","cityId":522200},{"cityName":"黔西南布依族苗族自治州","cityId":522300},{"cityName":"毕节市","cityId":522400},{"cityName":"黔东南苗族侗族自治州","cityId":522600},{"cityName":"黔南布依族苗族自治州","cityId":522700},{"cityName":"昆明市","cityId":530100},{"cityName":"曲靖市","cityId":530300},{"cityName":"玉溪市","cityId":530400},{"cityName":"保山市","cityId":530500},{"cityName":"昭通市","cityId":530600},{"cityName":"丽江市","cityId":530700},{"cityName":"普洱市","cityId":530800},{"cityName":"临沧市","cityId":530900},{"cityName":"楚雄彝族自治州","cityId":532300},{"cityName":"红河哈尼族彝族自治州","cityId":532500},{"cityName":"文山壮族苗族自治州","cityId":532600},{"cityName":"西双版纳傣族自治州","cityId":532800},{"cityName":"大理白族自治州","cityId":532900},{"cityName":"德宏傣族景颇族自治州","cityId":533100},{"cityName":"怒江傈僳族自治州","cityId":533300},{"cityName":"迪庆藏族自治州","cityId":533400},{"cityName":"拉萨市","cityId":540100},{"cityName":"昌都市","cityId":542100},{"cityName":"山南地区","cityId":542200},{"cityName":"日喀则市","cityId":542300},{"cityName":"那曲地区","cityId":542400},{"cityName":"阿里地区","cityId":542500},{"cityName":"林芝市","cityId":542600},{"cityName":"西安市","cityId":610100},{"cityName":"铜川市","cityId":610200},{"cityName":"宝鸡市","cityId":610300},{"cityName":"咸阳市","cityId":610400},{"cityName":"渭南市","cityId":610500},{"cityName":"延安市","cityId":610600},{"cityName":"汉中市","cityId":610700},{"cityName":"榆林市","cityId":610800},{"cityName":"安康市","cityId":610900},{"cityName":"商洛市","cityId":611000},{"cityName":"兰州市","cityId":620100},{"cityName":"嘉峪关市","cityId":620200},{"cityName":"金昌市","cityId":620300},{"cityName":"白银市","cityId":620400},{"cityName":"天水市","cityId":620500},{"cityName":"武威市","cityId":620600},{"cityName":"张掖市","cityId":620700},{"cityName":"平凉市","cityId":620800},{"cityName":"酒泉市","cityId":620900},{"cityName":"庆阳市","cityId":621000},{"cityName":"定西市","cityId":621100},{"cityName":"陇南市","cityId":621200},{"cityName":"临夏回族自治州","cityId":622900},{"cityName":"甘南藏族自治州","cityId":623000},{"cityName":"西宁市","cityId":630100},{"cityName":"海东市","cityId":632100},{"cityName":"海北藏族自治州","cityId":632200},{"cityName":"黄南藏族自治州","cityId":632300},{"cityName":"海南藏族自治州","cityId":632500},{"cityName":"果洛藏族自治州","cityId":632600},{"cityName":"玉树藏族自治州","cityId":632700},{"cityName":"海西蒙古族藏族自治州","cityId":632800},{"cityName":"银川市","cityId":640100},{"cityName":"石嘴山市","cityId":640200},{"cityName":"吴忠市","cityId":640300},{"cityName":"固原市","cityId":640400},{"cityName":"中卫市","cityId":640500},{"cityName":"乌鲁木齐市","cityId":650100},{"cityName":"克拉玛依市","cityId":650200},{"cityName":"吐鲁番市","cityId":652100},{"cityName":"哈密地区","cityId":652200},{"cityName":"昌吉回族自治州","cityId":652300},{"cityName":"博尔塔拉蒙古自治州","cityId":652700},{"cityName":"巴音郭楞蒙古自治州","cityId":652800},{"cityName":"阿克苏地区","cityId":652900},{"cityName":"克孜勒苏柯尔克孜自治州","cityId":653000},{"cityName":"喀什地区","cityId":653100},{"cityName":"和田地区","cityId":653200},{"cityName":"伊犁哈萨克自治州","cityId":654000},{"cityName":"塔城地区","cityId":654200},{"cityName":"阿勒泰地区","cityId":654300},{"cityName":"可克达拉市","cityId":659000},{"cityName":"台北市","cityId":710100},{"cityName":"高雄市","cityId":710200},{"cityName":"台南市","cityId":710300},{"cityName":"台中市","cityId":710400},{"cityName":"金门县","cityId":710500},{"cityName":"南投县","cityId":710600},{"cityName":"基隆市","cityId":710700},{"cityName":"新竹市","cityId":710800},{"cityName":"嘉义市","cityId":710900},{"cityName":"新北市","cityId":711100},{"cityName":"宜兰县","cityId":711200},{"cityName":"新竹县","cityId":711300},{"cityName":"桃园县","cityId":711400},{"cityName":"苗栗县","cityId":711500},{"cityName":"彰化县","cityId":711700},{"cityName":"嘉义县","cityId":711900},{"cityName":"云林县","cityId":712100},{"cityName":"屏东县","cityId":712400},{"cityName":"台东县","cityId":712500},{"cityName":"花莲县","cityId":712600},{"cityName":"澎湖县","cityId":712700},{"cityName":"连江县","cityId":712800},{"cityName":"香港岛","cityId":810100},{"cityName":"九龙","cityId":810200},{"cityName":"新界","cityId":810300},{"cityName":"澳门半岛","cityId":820100},{"cityName":"离岛","cityId":820200},{"cityName":"海外","cityId":990100}]
	};
})();















































