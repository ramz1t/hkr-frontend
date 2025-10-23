const postsContainer = document.getElementById("posts");
const loader = document.getElementById("loader");
const posts = [];

let offset = 0;
const limit = 5;
let loading = false;
let hasError = false;

const createReactionSection = (post) => {
    const divReactions = document.createElement("div");
    divReactions.className = "flex items-center gap-2";

    const iconClassname = "material-symbols-outlined hover:text-amber-700 hover:scale-110 origin-center cursor-pointer";

    const spanLike = document.createElement("span");
    spanLike.className = iconClassname;
    spanLike.textContent = "thumb_up";
    divReactions.appendChild(spanLike);

    const likesText = document.createTextNode(`${post.reactions.likes}`);
    divReactions.appendChild(likesText);

    const spanDislike = document.createElement("span");
    spanDislike.className = iconClassname;
    spanDislike.style.marginLeft = "15px";
    spanDislike.textContent = "thumb_down";
    divReactions.appendChild(spanDislike);

    const dislikesText = document.createTextNode(`${post.reactions.dislikes}`);
    divReactions.appendChild(dislikesText);
    return divReactions;
}

const createTagList = (tags) => {
    const ulTags = document.createElement("ul");
    ulTags.className = "flex flex-wrap gap-2";
    tags.forEach(tag => {
        const liTag = document.createElement("li");
        liTag.className = "bg-amber-700 rounded-full px-3 py-1 text-white font-semibold";
        liTag.textContent = tag;
        ulTags.appendChild(liTag);
    });
    return ulTags;
}

const createCommentsSection = (post) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = `Comments (${post.comments.length})`;
    summary.className = "cursor-pointer select-none";
    details.appendChild(summary);
    if (post.comments.length > 0) {
        post.comments.forEach(c => {
            const pComment = document.createElement("p");
            pComment.style.paddingTop = "5px";
            pComment.innerHTML = `${c.body} - <strong>${c.user.username}</strong>`;
            details.appendChild(pComment);
        });
    } else {
        const pNoComments = document.createElement("p");
        pNoComments.style.paddingTop = "5px";
        pNoComments.textContent = "No comments found. Be the first to express your thoughts!";
        details.appendChild(pNoComments);
    }
    return details;
}

const createUserButton = (post) => {
    const userBtn = document.createElement("button");
    userBtn.className =
        "flex items-center gap-2 w-fit text-amber-700 hover:text-amber-800 show-modal font-semibold";

    const userIcon = document.createElement("span");
    userIcon.className = "material-symbols-outlined";
    userIcon.textContent = "person";

    const userText = document.createElement("span");
    userText.textContent = post.user.username;

    userBtn.appendChild(userIcon);
    userBtn.appendChild(userText);
    userBtn.addEventListener("click", () => showUserModal(post.user));

    return userBtn;
}

const createPostElement = (post) => {
    const li = document.createElement("li");
    li.className = "rounded-lg bg-white p-5 grid gap-4";

    // title
    const h2 = document.createElement("h2");
    h2.className = "font-semibold text-2xl";
    h2.textContent = post.title;
    li.appendChild(h2);

    // body
    const pBody = document.createElement("p");
    pBody.textContent = post.body;
    li.appendChild(pBody);

    li.appendChild(createUserButton(post));
    li.appendChild(createTagList(post.tags));
    li.appendChild(createReactionSection(post));
    li.appendChild(createCommentsSection(post));
    return li;
}

const renderPosts = (newPosts) =>
    newPosts.forEach(p => postsContainer.appendChild(createPostElement(p)));

const formatDate = (dateStr) => {
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