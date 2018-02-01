var category  = ['新闻', '公司文件', '集团文件', '局方文件', '通知', '党群文件', '安全文件'];

// 监听start button 点击事件
document.getElementById('iris').onclick = function() {
    document.getElementById("dataTable").style.visibility = "visible";
    document.getElementById("dataTable").style.display = '';
    fetchData('https://oa.rlair.net/oa/cms/index', handleLogin);
};

/***
 * 登陆验证
 *
 * 判断在 https://oa.rlair.net/oa/cms/index 抓取到的数据有没有用户名
 * [\ue00-\u9fa5]  匹配中文字符
 *
 * @param loginData
 */
function handleLogin(loginData) {
    var username = loginData.match(/[\u4e00-\u9fa5]{2,}-[\u4e00-\u9fa5]{2,}-[\u4e00-\u9fa5]{2,}-[\u4e00-\u9fa5]{2,}/);
    if (username != null) {
        // render(username[0], 'class', 'fault');
        document.getElementById("tableHead").style.visibility = 'visible';
        document.getElementById("tableBody").style.visibility = 'visible';
        document.getElementById("tableHead").style.display = '';
        document.getElementById("tableBody").style.display = '';
        document.getElementById('userInfo').innerHTML = username[0];
        console.log(username[0]);
        var pageSize = document.getElementById('newsNumber').value;
        pageSize = pageSize == '' ? 15 : pageSize;
        for (var i = 1; i < 8; ++i) {
            var url = 'https://oa.rlair.net/oa/cms/queryViewPage?type='+ i +'&page=0&pageSize=' + pageSize;
            fetchData(url, showResult, i);
        }

    } else {
        document.getElementById('userInfo').innerHTML = "请登陆后重试！";
    }
}

/***
 * 渲染数据
 *
 * 把msg在start button下显示，并设定一组属性key => value
 * @param msg 需要显示的信息
 * @param key
 * @param value
 */
function render(msg, key, value) {
    var div = document.createElement("tr");
    div.innerHTML = msg;
    if(key && value) {
        div.setAttribute(key, value);
    }
    document.getElementById('tableBody').appendChild(div);
}

/***
 * 列举出获取到的新闻，并调用fetchData访问新闻页面
 * @param result
 * @param index
 */
function showResult(result, index) {
    render('<th>'+ category[index-1] + '</th><th>开始</th>', 'class', "success");
    console.log(category[index-1]);
    result = JSON.parse(result); // text to json
	var arr = result.rows;
	arr.forEach(function(item, index){
	    var newsTitle = item.abstracttext == null ? item.subject : item.abstracttext;
	    newsTitle = newsTitle.length > 35 ? newsTitle.substr(0, 35) + '...' : newsTitle;
        render('<td><a href="https://oa.rlair.net/oa/cms/queryOnePage?id=' + item.id + '" target="_blank">' + newsTitle +
            '</a></td><th scope="row"><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span></th>', 'id', item.id);
		fetchData("https://oa.rlair.net/oa/cms/queryOnePage?id=" + item.id, Echo);
		console.log(newsTitle);
	});
    render('<th>'+ category[index-1] + '</th><th>结束</th>', 'class', "warning");
}

/***
 * 验证函数
 * 验证url是否被打开，如果是，则在对应的新闻上加上 阅读完成！
 * @param result
 * @param index
 * @param url
 * @constructor
 */
function Echo(result, index, url) {
    var newsTitle = result.match(/<title>.{2,}<\/title>/);
    if (newsTitle[0].length > 15) {
        // 3b39c66bb31c43228d614f392a6f530a \w
        // 3123 \d
        // 文章的id分为两类 一类是md5 另一类是四位数字
        document.getElementById(url.match(/[\w]{32}/) || url.match(/[\d]{4}/))
            .lastChild.firstChild.setAttribute('class', 'glyphicon glyphicon-ok');
    }
}

/***
 * 获取数据 封装的XMLHttpRequest
 * @param url 需访问的网址
 * @param callback 回调函数
 * @param index 新闻分类索引
 */
function fetchData(url, callback, index) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(xhr.responseText, index, url);
        }
    };
    xhr.send();
}
