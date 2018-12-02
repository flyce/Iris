const category  = ['新闻', '公司文件', '集团文件', '局方文件', '通知', '党群文件', '安全文件', '部门文件'];
const versionApi = 'https://store.flyce.cn/paco/version.json';
const queryUri = 'https://oa.rlair.net/oa/cms/queryOnePage?id=';
const listUri = 'https://oa.rlair.net/oa/cms/queryViewPage?';
const detialUri = 'https://oa.rlair.net/oa/cms/queryDetail?id=';
const userInfoUri = 'https://training.rlair.net/training/index';
let clickCount = '1';

const Fetch = (url) => {
    return fetch(url, {
        method: 'GET'
    }).then(response => {
        return response.json();
    });
};

const FetchPage = (url) => {
    return fetch(url, {
        method: 'GET'
    }).then(response => {
        return response.text();
    });
};

// 监听start button 点击事件
/***
 * 新增版本检测和用户名线上检测，避免未经授权用户使用本插件
 */
document.getElementById('iris').onclick = () => {
    versionCheck();
};

const versionCheck = () => {
    Fetch(versionApi).then(
        versionApiRes => {
            console.log(versionApiRes);
            if (versionApiRes.version === '0.3.0') {
                document.getElementById("dataTable").style.visibility = "visible";
                document.getElementById("dataTable").style.display = '';
                FetchPage(userInfoUri).then(res => {
                    handleLogin(res, versionApiRes.userUri);
                });
            } else {
                document.getElementById("versionCheck").style.visibility = "visible";
                document.getElementById("versionCheck").style.display = '';
                document.getElementById('version').innerHTML = versionApiRes.version;
            }
        }
    )
};

/***
 * 登陆验证
 *
 * 判断在 https://oa.rlair.net/oa/cms/index 抓取到的数据有没有用户名
 * [\ue00-\u9fa5]  匹配中文字符
 *
 * @param loginData
 */
const  handleLogin = (loginData, userUri) => {
    const username = loginData.match(/class="uname" title="[\u4e00-\u9fa5]{2,}/)[0].substr(21);
    if (username === null) {
        document.getElementById('userInfo').innerHTML = "请登陆后重试！";
    } else {
        userCheck(username, userUri);
    }
};

const userCheck = (username, userUri) => {
    Fetch(userUri + '?name=' + username).then(res => {
        if (res.success) {
            document.getElementById("tableHead").style.visibility = 'visible';
            document.getElementById("tableBody").style.visibility = 'visible';
            document.getElementById("tableHead").style.display = '';
            document.getElementById("tableBody").style.display = '';
            document.getElementById('userInfo').innerHTML = username;
            Category(1);
        } else {
            document.getElementById('userInfo').innerHTML = "您的账号不允许使用该服务！";
        }
    });
};

const Category = (index) => {
    const pageSize = document.getElementById("newsNumber").value === '' ? '21' : document.getElementById("newsNumber").value;
    const uri = listUri + 'status=P,F&type=' + index + '&page=0&pageSize=' + pageSize +'&subject=&_=' + getCount(clickCount);
    Fetch(uri).then(res => {
        render('<th>'+ category[index-1] + '</th><th>开始</th>', 'class', "success");
        res.rows.map((value) => {
            let newsTitle = value.abstracttext == null ? value.subject : value.abstracttext;
            newsTitle = newsTitle.length > 35 ? newsTitle.substr(0, 35) + '...' : newsTitle;
            render('<td><a href="https://oa.rlair.net/oa/cms/queryOnePage?id=' + value.id + '" target="_blank">' + newsTitle +
                '</a></td><th scope="row"><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span></th>', 'id', value.id);
        });
        Viewer(0, res.rows.length - 1, res.rows, index);
    });
};

const getCount = (index) => {
    if (index.length === 1) {
        index = Math.floor(Math.random() * 100) + index;
        if (index < 99) {
            index = '0' + index;
        }
        index = Math.floor(Date.now() / 1000) + index;
    } else {
        index = Number(index) + 1 ;
    }
    clickCount = Number(index);
    return index;
};

/***
 * 随机5-10秒点击一条
 * @param countFlag
 * @param max
 * @constructor
 */
const Viewer = (countFlag, max, jsonArray, categoryIndex) => {
    const time = Math.floor(Math.random() * 5) + 5;
    document.getElementById(jsonArray[countFlag].id)
        .lastChild.firstChild.innerHTML = time + ' S';
    document.getElementById(jsonArray[countFlag].id)
        .lastChild.firstChild.setAttribute('class', '');
    setTimeout(() => {
        let url = detialUri + jsonArray[countFlag].id;
        if (jsonArray[countFlag].createtime.match(/-\d{2}-/)) {
            if (Number(jsonArray[countFlag].createtime.match(/-\d{2}-/)[0].substr(1,2)) === Number(new Date().getMonth())) {
                // FetchPage(url).then(res => {
                Fetch(url).then(res => {
                    if (res.data.id === jsonArray[countFlag].id) {
                        document.getElementById(url.match(/[\w]{32}/) || url.match(/[\d]{4}/))
                            .lastChild.firstChild.setAttribute('class', 'glyphicon glyphicon-ok');
                        document.getElementById(jsonArray[countFlag].id)
                            .lastChild.firstChild.innerHTML = '';
                    }
                });

                // })
            } else {
                document.getElementById(jsonArray[countFlag].id)
                    .lastChild.firstChild.innerHTML = 'out of date';
            }
        }
        if (countFlag < max) {
            Viewer(++countFlag, max, jsonArray, categoryIndex); // ++countFlag countFlag++
        } else {
            if (categoryIndex < 8) {
                render('<th>'+ category[categoryIndex - 1] + '</th><th>结束</th>', 'class', "warning");
                Category(++categoryIndex)
            }
        }
    }, time * 1000)
};



/***
 * 渲染数据
 *
 * 把msg在start button下显示，并设定一组属性key => value
 * @param msg 需要显示的信息
 * @param key
 * @param value
 */
const render = (msg, key, value) => {
    const div = document.createElement("tr");
    div.innerHTML = msg;
    if(key && value) {
        div.setAttribute(key, value);
    }
    document.getElementById('tableBody').appendChild(div);
};