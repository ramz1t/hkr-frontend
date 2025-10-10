const postsContainer = document.getElementById("posts");
const loader = document.getElementById("loader");
const posts = [];

let offset = 0;
const limit = 5;
let loading = false;
let hasError = false;

async function fetchPosts(offset) {
    if (hasError) return;
    loading = true;
    loader.style.opacity = 1;
    const newPosts = [];

    try {
        const postRes = await fetch(`https://dummyjson.com/posts?limit=${limit}&skip=${offset}`);

        if (!postRes.ok) {
            throw new Error(`Failed to load posts: ${postRes.status}`);
        }

        const postData = await postRes.json();

        if (!postData.posts.length) {
            loader.textContent = "No more posts to load.";
            observer.disconnect();
            return;
        }

        for (const p of postData.posts) {
            const post = {
                id: p.id,
                title: p.title,
                body: p.body,
                username: null,
                tags: p.tags,
                reactions: { likes: p.reactions.likes, dislikes: p.reactions.dislikes },
                comments: [],
            };

            try {
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

                post.comments = commentsData.comments || [];
                console.log(userData);
                post.user = {
                    fullName: `${userData.firstName} ${userData.lastName}`,
                    birthday: userData.birthDate,
                    address: `${userData.address.address}, ${userData.address.city}, ${userData.address.country}`,
                    email: userData.email,
                    id: userData.id,
                    username: userData.username,
                    phone: userData.phone
                };

                posts.push(post);
                newPosts.push(post);

                loader.style.opacity = 0;
            } catch (e) {
                throw new Error("Failed to get comments or user for a post");
            }
        }

        renderPosts(newPosts);

    } catch (error) {
        hasError = true;
        loader.textContent = `Failed to load data: ${error}`;
        observer.disconnect();
    } finally {
        loading = false;
    }
}

function renderPosts(newPosts) {
    for (const post of newPosts) {
        const li = document.createElement("li");
        li.className = "rounded-lg bg-slate-100 p-5 grid gap-4";
        li.innerHTML = `
            <h2 class="font-semibold text-2xl">${post.title}</h2>
            <p>${post.body}</p>

            <button class="w-fit text-blue-600 hover:underline" data-user='${JSON.stringify(post.user)}'>
                User: ${post.user.username}
            </button>

            <ul class="flex flex-wrap gap-2">
                ${post.tags
                .map(
                    tag => `
                    <li class="bg-amber-700 rounded-full px-3 py-1 text-white font-semibold">
                        ${tag}
                    </li>`
                )
                .join("")}
            </ul>

            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined">thumb_up</span>
                ${post.reactions.likes}
                <span style="margin-left: 15px" class="material-symbols-outlined">thumb_down</span>
                ${post.reactions.dislikes}
            </div>

            <details>
                <summary>Comments (${post.comments.length})</summary>
                ${post.comments.length > 0 ? post.comments.map(c => `<p style="padding-top: 5px;">${c.body} - <strong>${c.user.username}</strong></p>`).join("") : '<p style="padding-top: 5px;">No comments found. Be the first to express your thoughts!</p>'}
            </details>
        `;

        li.querySelector("button[data-user]").addEventListener("click", (e) => {
            const user = JSON.parse(e.target.dataset.user);
            showUserModal(user);
        });

        postsContainer.appendChild(li);
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    const suffix =
        day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
                ? "nd"
                : day % 10 === 3 && day !== 13
                    ? "rd"
                    : "th";

    return `${day}${suffix} ${month} ${year}`;
}

const showUserModal = (user) => {
    disableScroll();

    modalName.textContent = user.fullName;
    modalUsername.textContent = user.username;
    modalEmail.textContent = user.email;
    modalBirthday.textContent = formatDate(user.birthday);
    modalAddress.textContent = user.address;
    modalPhone.textContent = user.phone;

    userModal.showModal();
}

const disableScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft
    window.onscroll = () => window.scrollTo(scrollLeft, scrollTop)
}

closeModal.onclick = () => {
    window.onscroll = () => { };
    userModal.close();
}

const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && !loading) {
        offset += limit;
        await fetchPosts(offset);
    }
}, { threshold: 1.0 });

observer.observe(loader);

fetchPosts(offset);