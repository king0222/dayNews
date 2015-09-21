var express = require('express');
var router = express.Router();

var rssSite = require('../config/rssSite.json');
var sites = rssSite.sites;
var postService = require('../service/postService');
var async = require('async');

/* GET home page. */
module.exports = function(app) {
	app.get('/', function (req, res) {
	    res.render('index');
	});

	app.get('/news_list', function (req, res) {
	    var newsList = new Array();
	    var queue = async.queue(worker, 5);
	    sites.forEach(function (site) {
	        site.channel.forEach(function (obj) {  //配置文件中 channel 配置
	            queue.push(obj, function (result) {//result 是worker返回的结果
	                newsList.push(result);
	            });
	        });
	    });
	    //表示任务执行完成
	    queue.drain = function () {
	        console.log(newsList);
	        res.render('news_list', {"newsList": newsList});
	    }

	});

	app.get('/getNewsPage', function (req, res) {
		console.log('get news page!');
	    var page = parseInt(req.query.page, 10);
	    var maxNums = parseInt(req.query.maxNums, 10);
	    //是否需要图片
	    var needPic = false;
	    if (req.query.pic != null) {
	        needPic = true;
	    }
	    if (page < 0 || maxNums < 0) {
	        //请求参数错误
	        res.json({'error': 1});
	    } else {
	        postService.getNewsPage(page, maxNums, req.query.typeId, needPic, function (data) {
	            res.json(data);
	        });
	    }
	});

	app.get('/newsRecord', function (req, res) {
		console.log('news record!');
	    var postId = req.query.id;
	    var userId = req.query.userId;
	    var jsonResult = req.query.json;
	    postService.findPost(postId, userId, function (post) {
	        console.log(post != null)
	        if (post != null) {
	            var data = {"title": post.title, "content": post.content};
	            if (jsonResult == "true") {
	                res.json(data);
	            }
	            res.render("news", data);
	        } else {
	            res.render("index");
	        }
	    });
	});


	/**
	 *   工作内容
	 * @param task  这个task 就是 queue中pust 进去的 obj
	 * @param callback
	 */
	function worker(task, callback) {
	    var news = {};
	    postService.getNewsPage(1, 5, task.typeId, true, function (data) {
	        news.typeName = task.title;
	        news.posts = data.posts;
	        callback(news);
	    });
	}

};






