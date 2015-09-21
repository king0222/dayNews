var request = require('request');
var BufferHelper = require('bufferhelper')
    , FeedParser = require('feedparser');
//解码需要
var iconv = require('iconv-lite');
var Post = require('../models/post.js');
var cheerio = require('cheerio');

function fetchRSS(url, typeId, callback) {
    var posts = [];
    var req = request(url, {timeout: 10000, pool: false});
    req.setMaxListeners(50);
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
    req.setHeader('accept', 'text/html,application/xhtml+xml');
    var feedparser = new FeedParser();
    req.on('error', done);

    req.on('response', function (res) {
        var stream = this;
        if (res.statusCode !== 200) {
            return this.emit('error', new ERROR('Bad start code '));
        }
        stream.pipe(feedparser);
    });
    feedparser.on('error', done);
    feedparser.on('readable', function () {
        // This is where the action is!
        var stream = this
            , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            , item;

        while (item = stream.read()) {
            posts.push(transToPostModel(item, typeId));
        }
    });
    feedparser.on('end', function (err) {
        if (err) {
            console.log(err);
            return;
        }
        callback(posts);
    });
}
/**
 * 截取单个新闻的正文
 * @param url 新闻的url 地址
 * @param tag tag 新闻在web界面开始的标签 如:<div id='content'>新闻正文</div>。 content即为tag
 * @param callback
 */
function getNewContent(url, tag, callback) {
    fetchContent(url, function (htmlData) {
        var $ = cheerio.load(htmlData);
        var content = $(tag).html();


        var img = $(tag).find("img")[0];
        var imgPath;
        if (img !== null) {
            imgPath = $(img).attr("src");  //新闻的缩略图
        }
        //回调新闻的正文 和图片
        callback(content, imgPath);
    });
}
/**
 * 抓取网页的源代码
 * @param url 网页地址
 * @param callback
 */
function fetchContent(url, callback) {
    var req = request(url, {timeout: 10000, pool: false});
    req.setMaxListeners(50);
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
    req.setHeader('accept', 'text/html,application/xhtml+xml');
    req.on('error', done);
    req.on('response', function (res) {
        var bufferHelper = new BufferHelper();
        res.on('data', function (chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function () {
            var result = iconv.decode(bufferHelper.toBuffer(), 'GBK');
            callback(result);
        });
    });
}


function transToPostModel(post, typeId) {
    //去掉多余的字符
    var index = post.description.indexOf("......");
    if (index > 0) {
        post.description = post.description.substr(0, index);
    }
    var mPost = new Post({
        title: post.title,
        link: post.link,
        description: post.description,
        pubDate: post.pubDate,
        typeId: typeId
    });
    return mPost;
}
function done(err) {
    if (err) {
        console.error(err.stack);
        // return process.exit(1);
    }
    //process.exit();
}
exports.fetchRSS = fetchRSS;
exports.fetchContent = fetchContent;
exports.getNewContent = getNewContent;