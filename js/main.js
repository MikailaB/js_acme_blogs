function createElemWithText(elemType = "p", x = "", className) {
    const myElem1 = document.createElement(elemType);
    myElem1.textContent = x;
    if (className) myElem1.classList.add(className);
    return myElem1;
}

function createSelectOptions(users){
    if(!users){
        return;
    }
    optionArray = [];
    for(const user of users){
        console.log(user);
        var opt = document.createElement('option');
        opt.value = user.id;
        opt.textContent = user.name;
        optionArray.push(opt);
    }
    return optionArray;

}

function toggleCommentSection(postId) {
    if (!postId) {
        return;
    }
    const comments = document.querySelector(`section[data-post-id="${postId}"]`);
    if(!comments) {
        return null;
    }
    if (comments) {
        comments.classList.toggle('hide');
    }
    return comments;
}

function toggleCommentButton(postId) {
    if (!postId) {
        return;
    }
    else {
        const comButton = document.querySelector(`button[data-post-id="${postId}"]`);
        if (comButton == null) {
            return comButton;
        }
        else {
                if (comButton.textContent == "Show Comments") {
                    comButton.textContent = "Hide Comments";
                }
                else {
                    comButton.textContent = "Show Comments";
                } 
        }
        return comButton;
    }
}
function deleteChildElements(parentElement) {
    if(!parentElement || !parentElement.nodeType) {
        return;
    }
    let childVar = parentElement.lastElementChild;
    while (childVar) {
        parentElement.removeChild(childVar);
        childVar = parentElement.lastElementChild;
    }
    return parentElement;
}


function addButtonListeners() {
    const buttons = document.querySelectorAll('main button')
    buttons.forEach(button => {
        const postId = button.dataset.postId;
        button.addEventListener('click', () => {
            toggleComments(event, postId);
        });
    });

    return buttons; 
}

function removeButtonListeners() {
    const buttons = document.querySelectorAll("main")[0].querySelectorAll('button');
    if (buttons.length > 0) {
        buttons.forEach((button) => {
            const postId = button.dataset.postId;
            button.removeEventListener("click", function () {
                toggleComments(event, postId);
            })
        })
    }
    return buttons;
}

function createComments(comments) {
    if (!comments) {
        return;
    }
    const frag = document.createDocumentFragment();
    for (const comment of comments) {
        const article = document.createElement('article');
        const h3 = createElemWithText('h3', comment.name);
        const p1 = createElemWithText('p', comment.body);
        const p2 = createElemWithText('p', `From: ${comment.email}`);
        article.append(h3, p1, p2);
        frag.append(article);
    }
    return frag;
}

function populateSelectMenu(users) {
    if(!users) {
        return;
    }
    const menu = document.querySelector('#selectMenu');
    const options = users.map(user => {
        const option = document.createElement('option');
        option.textContent = user.name;
        option.value = user.id;
        return option;
    });
    options.forEach(option => menu.append(option));
    return menu;
}

async function getUsers() {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users`);
        const users = await response.json();
        return users;
    }
    catch (e){
        console.error(e);
    }
}

async function getUserPosts(userId) {
    if(!userId){
        return;
    }
    try {
        let response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}/posts`);
        return response.json();
    }
    catch (e) {
        console.error(e);
    }
}

async function getUser(userId) {
    if(!userId){
        return;
    }
    try {
        let response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        return response.json();
    }
    catch (e){
        console.error(e);
    }
}

async function getPostComments(postId) {
    if(!postId) {
        return;
    }
    try {
        let response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
        return response.json();
    }
    catch (e){
        console.error(e);
    }
}

async function displayComments(postId) {
    if(!postId) {
        return;
    }
    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');
    let comments = await getPostComments(postId);
    let frag = createComments(comments);
    section.append(frag);
    return section;
}

async function createPosts(posts) {
    if(!posts){
        return;
    }
    const frag = document.createDocumentFragment();
    for (const post of posts){
        const article = document.createElement('article');
        const h2 = createElemWithText('h2', post.title);
        const p1 = createElemWithText('p', post.body);
        const p2 = createElemWithText('p', `Post ID: ${post.id}`);
        const author = await getUser(post.userId);
        const p3 = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const p4 = createElemWithText('p', author.company.catchPhrase);
        const button = createElemWithText('button', 'Show Comments');
        button.dataset.postId = post.id;
        article.append(h2, p1, p2, p3, p4, button);
        const section = await displayComments(post.id);
        article.append(section);
        frag.append(article);
    }
    return frag;
}

async function displayPosts(posts) {
    let mainElem = document.querySelector("main");
    let element  = (posts) ? await createPosts(posts) : document.querySelector("main p");
    mainElem.append(element);
    return element;
}

function toggleComments(event, postId) {
    if(!event || !postId){
        return;
    }
    event.target.listener = true;
    let section = toggleCommentSection(postId);
    let button = toggleCommentButton(postId);
    return [section, button];
}

async function refreshPosts(posts) {
    if(!posts) {
        return;
    }
    let removeButtons = removeButtonListeners();
    let mainElem = deleteChildElements(document.querySelector('main'));
    let frag = await displayPosts(posts);
    let addButtons = addButtonListeners();
    return [removeButtons, mainElem, frag, addButtons];
}

async function selectMenuChangeEventHandler(event) {
    if(!event) {
        return;
    }
    let userId = event.target.value || 1;
    let posts = await getUserPosts(userId);
    let refreshPostsArray = await refreshPosts(posts);
    return [userId, posts, refreshPostsArray];
}

async function initPage() {
    let users = await getUsers();
    let select = await populateSelectMenu(users);
    return [users, select];
}

function initApp() {
    initPage();
    let select = document.getElementById('#selectMenu');
    select.addEventListener("change", selectMenuChangeEventHandler, false);
}

document.addEventListener("DOMContentLoaded", initApp);