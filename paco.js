const category  = ['新闻', '公司文件', '集团文件', '局方文件', '通知', '党群文件', '安全文件', '部门文件'];
const versionApi = 'http://localhost:5000/index.json';
const queryUri = 'https://oa.rlair.net/oa/cms/queryOnePage?id=';
const listUri = 'https://oa.rlair.net/oa/cms/queryViewPage?';

// 监听start button 点击事件
/***
 * 新增版本检测和用户名线上检测，避免未经授权用户使用本插件
 */
document.getElementById('iris').onclick = () => {
    const result = versionCheck();
    if(result.version === '2.0.0') {
        document.getElementById("dataTable").style.visibility = "visible";
        document.getElementById("dataTable").style.display = '';
        if(userCheck('王全峰')) {
            // get news list
            // FetchPage('https://training.rlair.net/training/index').then(res => {
                // handleLogin(res);
            // });
        }
    } else {
        console.log(result.info);
        document.getElementById("versionCheck").style.visibility = "visible";
        document.getElementById("versionCheck").style.display = '';
        document.getElementById('version').innerHTML = result.info;
    }
};

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

const versionCheck = () => {
    return {
        "version": "2.0.0",
        "info": "请升级您的插件！"
    };
};

const userCheck = (username) => {
    // return Fetch(url + '?name=' + username).then(res => res);
    return true;
};

/***
 * 登陆验证
 *
 * 判断在 https://oa.rlair.net/oa/cms/index 抓取到的数据有没有用户名
 * [\ue00-\u9fa5]  匹配中文字符
 *
 * @param loginData
 */
const  handleLogin = (loginData) => {
    const username = loginData.match(/class="uname" title="[\u4e00-\u9fa5]{2,}/);
    if (username != null) {
        // render(username[0], 'class', 'fault');
        document.getElementById("tableHead").style.visibility = 'visible';
        document.getElementById("tableBody").style.visibility = 'visible';
        document.getElementById("tableHead").style.display = '';
        document.getElementById("tableBody").style.display = '';
        document.getElementById('userInfo').innerHTML = username[0].substr(21);
        Category(0);
    } else {
        document.getElementById('userInfo').innerHTML = "请登陆后重试！";
    }
};

/***
 * 随机5-10秒点击一条
 * @param countFlag
 * @param max
 * @constructor
 */
const Viewer = (countFlag, max, array) => {
    const time = Math.floor(Math.random() * 5) + 5;
    console.log("开始时间:" + Math.floor(Date.now() / 1000));
    console.log("本次随机时间:" + time);
    console.log("当前countFlag:" + countFlag);
    setTimeout(() => {
        console.log("程序执行时间:" + Math.floor(Date.now() / 1000));
        let url = 'https://oa.rlair.net/oa/cms/queryViewPage?type='+ countFlag;
        console.log(url);
        console.log("");
        if (countFlag <= max) {
            Viewer(++countFlag, max, array); // ++countFlag countFlag++
        }
    }, time * 1000)
};

const Category = (index) => {
    Fetch(listUri + 'status=P,F&type=' + (index + 1) + '&page=0&pageSize=1&subject=&_='+ Math.floor(Date.now() / 1000) + getCount(index)).then(res => {
        if (res.rows.createtime.match(/-\d{2}-/)) {
            if (Number(res.rows.createtime.match(/-\d{2}-/)[0].substr(1,2)) === Number(new Date().getMonth() + 1)) {
                Viewer(0, res.rows.length, res.rows);
            }
        }
    })
};

const getCount = (index) => {
    index = Math.floor(Math.random() * 100) * 10 + index;
    if (index < 10) {
        return '00' + index;
    } else {
        if (index < 100) {
            return '0' + index;
        } else {
            return index;
        }
    }
};

// Demo(0, category.length, 3);
// Category(0);

console.log(getCount(0));