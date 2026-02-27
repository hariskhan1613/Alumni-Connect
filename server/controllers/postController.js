import Post from '../models/Post.js';

export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';
        const post = await Post.create({ user: req.user._id, content, image });
        const populated = await post.populate('user', 'name profilePic jobRole company');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFeedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const total = await Post.countDocuments();
        const posts = await Post.find()
            .populate('user', 'name profilePic jobRole company')
            .populate('comments.user', 'name profilePic')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ posts, total, pages: Math.ceil(total / limit), page: Number(page) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'name profilePic jobRole company')
            .populate('comments.user', 'name profilePic');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        post.content = req.body.content || post.content;
        if (req.file) post.image = `/uploads/${req.file.filename}`;
        await post.save();
        const populated = await post.populate('user', 'name profilePic jobRole company');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const idx = post.likes.indexOf(req.user._id);
        if (idx === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(idx, 1);
        }
        await post.save();
        res.json({ likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        post.comments.push({ user: req.user._id, text: req.body.text });
        await post.save();
        const populated = await post.populate('comments.user', 'name profilePic');
        res.json(populated.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'name profilePic jobRole company')
            .populate('comments.user', 'name profilePic')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
