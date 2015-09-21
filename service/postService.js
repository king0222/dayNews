var Post = require('../models/post');

function getPost(title, link, typeId) {
    var mPost = new Post({
        title: title,
        link: link,
        typeId: typeId
    });
    return mPost;
}
/**
 * 保存一个post 对象
 * @param title
 * @param link
 * @param typeId
 */
exports.savePost = function (title, link, typeId) {
    var post = getPost(title, link, typeId);
    post.save(function (err) {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log(post.title);
    });
}
exports.addPost = function (post) {
    post.save(function (err) {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log(post.title);
    });
    Post.find(function(err, posts) {
        if (!err) {
            if (posts.length > 100) {
                Post.findOneAndRemove({},{sort : 'pubDate', select : 'pubDate'},function (err, post){
                    if (!err) {
                        console.log(post.title + " removed");
                        // Simon Holmes removed
                    };
                });
            }
        }
    });
    
}
exports.savePosts = function (posts) {
    posts.forEach(function (post) {
            addPost(post);
        }
    );
}
/**
 * 获取新闻列表
 * @param page
 * @param maxPostPerPage
 * @param typeId
 * @param needPic
 * @param callback
 */
exports.getNewsPage = function (page, maxPostPerPage, typeId, needPic, callback) {
    var fieldArr = 'link descImg title';
    var filter = {
        typeId: typeId,
        descImg: {"$exists": needPic }
    };
    Post.find(filter, fieldArr)
        .sort({"_id": -1})
        .skip(page * maxPostPerPage)
        .limit(maxPostPerPage)
        .exec(function (err, posts) {
            if (err) {
                console.err(err);
                return;
            }
            callback({"posts": posts, "page": page});
        });
}
/*
 记录用户的习惯
 */
function updatePost(postId, userId) {
    Post.update({"_id": postId}, {"$addToSet": {"records": userId}}, function (err) {
        if (err) {
            console.log(err)
            throw err;
        }
    })
}
exports.findPost = function (postId, userId, callback) {
    updatePost(postId, userId);
    Post.findOne({"_id": postId}, 'content title').exec(function (err, post) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (post != null) {
            callback(post);
        } else {
            callback(null)
        }
    });


}