function Eajax(){

	var eRequestQueue = new Array();

	function Emap(key, value){
		this.key = key;
		this.value = value;
	}

	function RequestObject(json){
		this.async = true;
		this.method = "GET";
		this.url = null;
		this.state = null;
		this.status = null;
		this.error = null;
		this.func = (json[200] && typeof json[200] == "function") ? json[200] : null;
		this.header = new Array();
		this.user = null;
		this.password = null;
		this.data = null;
		this.execute = null;
		var notType = true;

		this.setHeader = function(... obj){
			switch(obj.length && true){
				case obj.length == 1:
					if(isJson(obj[0])){
						for(let key in obj[0]){
							if(notType && key.toLowerCase() == "content-type"){
								notType = false;
							}
							if(typeof obj[0][key] == "object" && obj[0][key].length != undefined){
								for(let value in obj[0][key]){
									this.header.push(new Emap(key, obj[0][key][value]));
								}
							}
							else{
								this.header.push(new Emap(key, obj[0][key]));
							}
						}
						break;
					}
					if(obj[0] instanceof Emap){
						this.header.push(obj[0]);
					}
					break;
				case obj.length == 2:
					this.header.push(new Emap(obj[0], obj[1]));
					break;
				case !(obj.length % 2):
					for(let i = 0; i < obj.length; i += 2){
						this.header.push(new Emap(obj[i], obj[i+1]));
					}
					break;
				default:
					break;
			}
		}

		this.setData = function(data){
			switch(true){
				case data instanceof String:
				case data instanceof Blob:
				case data instanceof ArrayBuffer:
				case data instanceof FormData:
				case data instanceof Document:
					this.data = data;
					break;
				default:
					if(isJson(data)){
						this.data = JSON.stringify(data);
					}
			}
		}

		this.setExecute = function(func){
			if(func && typeof func == "function"){
				this.execute = function(){
					let result = func();
					popRequest(this);
					return result;
				}
				return this;
			}
			return null;
		}

		this.init = function(json){
			let jkarr = Object.keys(json);
			for(let k in jkarr){
				let ko = jkarr[k];
				let key = ko.toLowerCase();
				switch(key){
					case "async":
						if(typeof json[ko] == "boolean" || typeof json[ko] == "string" ||
								json[ko].toLowerCase() == "true" || json[ko].toLowerCase() == "false"){
							this.async = json[ko];
						}
						break;
					case "method":
						if(typeof json[ko] == "string"){
							this.method = json[ko];
						}
						break;
					case "url":
						if(typeof json[ko] == "string"){
							this.url = json[ko];
						}
						break;
					case "state":
						if(isJson(json[ko])){
							this.state = json[ko];
						}
						break;
					case "status":
						if(isJson(json[ko])){
							this.state = json[ko];
						}
						break;
					case "error":
						if(typeof json[ko] == "function"){
							this.error = json[ko];
						}
						break;
					case "func":
						if(typeof json[ko] == "function"){
							this.func = json[ko];
						}
						break;
					case "header":
						if(!json[ko]){
							notType = false;
						}
						else{
							this.setHeader(json[ko]);
						}
						break;
					case "user":
						if(typeof json[ko] == "string"){
							this.user = json[ko];
						}
						break;
					case "password":
						if(typeof json[ko] == "string"){
							this.password = json[ko];
						}
						break;
					case "data":
						this.setData(json[ko]);
						break;
					default:
						break;
				}
			}
			if(notType){
				this.header.push(new Emap("Content-Type", "application/x-www-form-urlencoded"));
			}
		}

		this.init(json);
	}

	function pushRequest(... requestObject){
		let count = 0;
		for(let i in requestObject){
			if(requestObject[i] && requestObject[i] instanceof RequestObject){
				eRequestQueue.push(requestObject[i]);
				count ++;
			}
		}
		return count;
	}

	function popRequest(... requestObject){
		let count = 0;
		let poped = false;
		for(let i in requestObject){
			switch(true){
				case typeof requestObject[i] == "number" || requestObject[i] instanceof Number:
					eRequestQueue.splice(requestObject[i], 1);
					break;
				case requestObject[i] instanceof RequestObject:
					let index = eRequestQueue.indexOf(requestObject[i]);
					if(index > -1){
						eRequestQueue.splice(index, 1);
					}
					break;
				case requestObject[i]:
					eRequestQueue.shift();
					break;
				case !requestObject[i]:
					eRequestQueue.unshift();
					break;
				default:
					poped == false;
			}
			if(poped){
				count++;
			}
			poped == true
		}
		return count;
	}

	function findRequest(requestObject){
		if(requestObject instanceof RequestObject){
			if(eRequestQueue.indexOf(requestObject) > -1){
				return true;
			}
		}
		return false;
	}

	function parseJSON(json){
		let jarr = new Array();
		if(isJson(json)){
			for(let key in json){
				jarr.push(new Emap(key, json[key]));
			}
		}
		return jarr.length ? jarr : null;
	}
	
	function setRequestOnFunc(xhr, requestObject){
		if(requestObject && xhr && xhr instanceof XMLHttpRequest && requestObject instanceof RequestObject){
			let funcs = new Array();
			if(isJson(requestObject.state)){
				for(let i = 0; i < 5; i++){
					if(requestObject.state[i] && typeof requestObject.state[i] == "function"){
						funcs.push(function(){
							if(xhr.readyState == i){
								requestObject.state[i](xhr);
							}
						});
					}
				}
			}
			if(isJson(requestObject.status)){
				let keys = Object.keys(requestObject.status);
				for(let key in keys){
					if(key >= 100 && key <= 600){
						funcs.push(function(){
							if(xhr.readyState == 4){
								if(xhr.status == key){
									requestObject.status[key](xhr);
								}
							}
						});
					}
				}
			}
			if(requestObject.error){
				funcs.push(function(){
					if(xhr.readyState == 4){
						if(xhr.status != 200){
							requestObject.error(xhr);
						}
					}
				});
			}
			if(requestObject.func){
				funcs.push(function(){
					if(xhr.readyState == 4){
						if(xhr.status == 200){
							requestObject.func(xhr);
						}
					}
				});
			}
			if(funcs.length){
				xhr.onreadystatechange = function(){
					for(let i in funcs){
						funcs[i]();
					}
				}
			}
		}
		return null;
	}

	function request(requestObject){
		if(!(requestObject instanceof RequestObject)){
			return null;
		}
		let xhr = new XMLHttpRequest();
		setRequestOnFunc(xhr, requestObject);
		xhr.open(requestObject.method,requestObject.url,requestObject.async,requestObject.user,requestObject.password);
		for(let i in requestObject.header){
			xhr.setRequestHeader(requestObject.header[i].key, requestObject.header[i].value);
		}
		if(requestObject.method == "POST"){
			xhr.send(requestObject.data);
		}
		else{
			xhr.send();
		}
		return xhr;
	}

	function isJson(json){
		if(!json){
			return null;
		}
		if(typeof json == "object"){
			if(json.length == undefined){
				return true;
			}
		}
		return false;
	}

	/*	

		Example:

		$ea.eJson({
			async: true,			// 类型可以为 boolean 或者 String 的 true 或 false
			method: "POST",			// 类型为字符串的 请求方式
			url: "127.0.0.1:8080",	// 类型为字符串 的请求路径
			state: {				// 为 XMLHttpRequest.readyState 中的 5 个状态，只关注 0 - 4，其他的将被忽略
				2: function(){console.log("Hi!");},
				3: function(){console.log("bye!");}
			},
			status: {				// 位 XMLHttpRequest.status 中的 响应状态，只关注 100 - 600，其他的将被忽略
				200: function(){console.log("man!");},
				500: function(){console.log("woman!");}
			},
			error: function(){return "ERROR!";}, // 响应不为 200 则执行此函数
			200: function(){return "SUCCESS!";}, // 响应为 200 时才执行此函数
			func: function(){return "SUCCESS";}, // 效果如上 200 的另一种写法
			header: {				// 为请求附带的 请求头部信息，js/json 语法能够接受的信息将被加入到请求头部
				"content-type": "application/json",
				"content-Type": "application/xml",
				"Content-Type": ["application/css", "application/js"]
			},
			data: {					// 除GET请求外的请求附带的数据 支持 json ，默认将其转化为 new FormData()
				username: "root",	// 支持 XMLHttpRequest 请求所支持附带的所数据类型
				password: "123456"	// new String(), new Blob(), new FormData(), new ArrayBuffer(), new Document()
			},
			user: "admin",
			password: "8848"
		});

	*/

	this.eJson = function(json, requestObject){
		if(isJson(json)){
			if(JSON.stringify(json) == "{}"){
				return null;
			}
			if(!requestObject){
				requestObject = new RequestObject(json);
			}
			if(!findRequest(requestObject)){
				pushRequest(requestObject);
			}
			else{
				requestObject.init(json);
			}
			if(!requestObject.execute){
				requestObject.setExecute(function(){
					return request(requestObject);
				});
			}
			return requestObject;
		}
		return undefined;
	}

	this.run = function(){
		for(let i in eRequestQueue){
			eRequestQueue[i].execute();
		}
	}

}

$ea = new Eajax();
