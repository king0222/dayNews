var rssSite = require('../config/rssSite.json');
var spiderUtils = require('../service/spiderUtil');
var postService = require('./postService');
var cheerio = require('cheerio');
/**
 *
 * @param callback
 */
function rssSpider(callback) {
    console.log("spider begin....");
    var sites = rssSite.sites;
    sites.forEach(function (site) {
        site.channel.forEach(function (obj) {
            spiderUtils.fetchRSS(obj.link, obj.typeId, function (posts) {
                posts.forEach(function (post) {
                    //拿到这个对象后   拿到这个链接里面的内容
                    console.log(post.title);
                    spiderUtils.getNewContent(post.link, site.contentTag, function (content, imgPath) {
                        //newPic  是网易自带的图片
                        console.log('content isi: img path is:');
                        if (imgPath != null && imgPath.indexOf(site.newsPic) === -1) {
                            post.descImg = imgPath;
                        }
                        if (content != null && content !== "") {
                            var $ = cheerio.load(content);
                            $("iframe").remove();
                            $("img[src='" + site.removeElement + "']").remove(); //需要删除的元素，根据项目需求来
                            post.content = $.html();
                            postService.addPost(post);
                        }

                    });
                });
                callback();
            })
        });

    });
}
exports.rssSpider = rssSpider;