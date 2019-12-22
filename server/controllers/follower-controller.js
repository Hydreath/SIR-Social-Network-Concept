const { verifyParameters, formatResponse } = require('../utils/utils');
const Follower = require('../models/follower');
const User = require('../models/user');


async function getFollowerCount(req, res, next) {
    let {id} = verifyParameters(req.params, 'id', next);
    let user = await User.query().findById(id).limit(1);
    if(user instanceof User){
        let x = await user.$relatedQuery('followers').count({follower_cont: '*'}).limit(1);
        res.status(200).json(formatResponse(false, 'User follower count', x[0]));
    }
    else {
        res.status(404).json(formatResponse(true, 'User not found!'));
    }
}

async function getFollowingCount(req, res, next) {
    let {id} = verifyParameters(req.params, 'id', next);
    let user = await User.query().findById(id).limit(1);
    if(user instanceof User){
        let x = await user.$relatedQuery('follows').count({follower_cont: '*'}).limit(1);
        res.status(200).json(formatResponse(false, 'User following count', x[0]));
    }
    else {
        res.status(404).json(formatResponse(true, 'User not found!'));
    }
}

async function getFollowerList(req, res, next) {
    let {id} = verifyParameters(req.params, 'id', next);
    let user = await User.query().findById(id);
    if (user instanceof User) {
        let x = await user.$relatedQuery('followers').select('id', 'name', 'handle', 'description', 'start_following_date');
        res.status(200).json(formatResponse(false, 'List of users that follow this user', x));
    } else {
        res.status(404).json(formatResponse(true, 'User not found!'));
    }
}

async function getFollowingList(res, req, next) {
    let {id} = verifyParameters(req.params, 'id', next);
    let user = await User.query().findById(id);
    if (user instanceof User) {
        let x = await user.$relatedQuery('follows').select('id', 'name', 'handle', 'description', 'start_following_date');
        res.status(200).json(formatResponse(false, 'List of users that that this user follows', x));
    } else {
        res.status(404).json(formatResponse(true, 'User not found!'));
    }
}

async function followUser(req, res, next) {
    let me = verifyParameters(req.user, 'id', next).id;
    let {id} = verifyParameters(req.body, 'id', next);

    let follow = await Follower.query().insert({user_id: id, followed_by_id: me});
    if(follow instanceof Follower){
        res.status(200).json(formatResponse(false, 'User followed!'));
    }
    else {
        res.status(400).json(formatResponse(true, 'Something went wrong'));
    }
}

async function unfollowUser(req, res, next) {
    let me = verifyParameters(req.user, 'id', next).id;
    let {id} = verifyParameters(req.body, 'id', next);

    let follow = await Follower.query().deleteById([id, me]);
    if (follow >= 1) {
        res.status(200).json(formatResponse(false, 'User unfollowed!'));
    } else {
        res.status(400).json(formatResponse(true, 'Something went wrong'));
    }
}

async function acceptFollow(req, res, next) {
    let {id} = verifyParameters(req.param, 'id', next);
    let me = verifyParameters(req.user, 'id', next).id;

    let follow = await Follower.query().findById([me, id]).patch({accepted: true, accepted_date: Follower.knex().fn.now()});

    if(follow > 0){
        res.status(200).json(formatResponse(false, 'User follow accepted!'));
    }else{
        res.status(400).json(formatResponse(false, 'Something wrong happened!'));
    }

}

module.exports = {
    getFollowerCount,
    getFollowingCount,
    followUser,
    unfollowUser,
    acceptFollow,
    getFollowerList,
    getFollowingList
};