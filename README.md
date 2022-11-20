# eajax.js
 简化 ajax 的请求发送

```
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
```

