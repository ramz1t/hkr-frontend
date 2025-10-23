const fetchPostBatch = async (offset, limit) => {
    const postRes = await fetch(`https://dummyjson.com/posts?limit=${limit}&skip=${offset}`);
    if (!postRes.ok) {
        throw new Error(`Failed to load posts: ${postRes.status}`);
    }
    return await postRes.json();
}

const fetchPostDetails = async (p) => {
    const [commentsRes, userRes] = await Promise.all([
        fetch(`https://dummyjson.com/comments/post/${p.id}`),
        fetch(`https://dummyjson.com/users/${p.userId}`),
    ]);
    if (!commentsRes.ok) {
        throw new Error(`Failed to load comments data: ${commentsRes.status}`);
    }
    if (!userRes.ok) {
        throw new Error(`Failed to load user data: ${userRes.status}`);
    }
    const commentsData = await commentsRes.json();
    const userData = await userRes.json();
    return { commentsData, userData };
}

const createPostObject = (p, userData, commentsData) => {
    return {
        id: p.id,
        title: p.title,
        body: p.body,
        username: null,
        tags: p.tags,
        reactions: { likes: p.reactions.likes, dislikes: p.reactions.dislikes },
        comments: commentsData.comments || [],
        user: {
            fullName: `${userData.firstName} ${userData.lastName}`,
            birthday: userData.birthDate,
            address: `${userData.address.address}, ${userData.address.city}, ${userData.address.country}`,
            email: userData.email,
            id: userData.id,
            username: userData.username,
            phone: userData.phone
        }
    };
}

const fetchPosts = async (offset) => {
    if (hasError) return;
    loading = true;
    loader.style.opacity = 1;
    const newPosts = [];
    try {
        const postData = await fetchPostBatch(offset, limit);
        if (!postData.posts.length) {
            loader.textContent = "No more posts to load.";
            observer.disconnect();
            return;
        }
        for (const p of postData.posts) {
            try {
                const { commentsData, userData } = await fetchPostDetails(p);
                const post = createPostObject(p, userData, commentsData);
                posts.push(post);
                newPosts.push(post);
            } catch (e) {
                throw e;
            }
        }
        renderPosts(newPosts);
        loader.style.opacity = 0;
    } catch (error) {
        hasError = true;
        loader.textContent = `Failed to load data: ${error}`;
        observer.disconnect();
    } finally {
        loading = false;
    }
}
