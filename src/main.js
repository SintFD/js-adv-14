// import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

import axios from "axios";
class PostService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  async fetchPosts() {
    const { data } = await axios.get(`${this.baseUrl}/posts`);
    return data;
  }

  async fetchUsers() {
    const { data } = await axios.get(`${this.baseUrl}/users`);
    return data;
  }

  async fetchComments(id) {
    const { data } = await axios.get(`${this.baseUrl}/comments?postId=${id}`);
    return data;
  }
}
class PostUI {
  constructor(postsContainer, userSelect) {
    this.postsContainer = postsContainer;
    this.userSelect = userSelect;
  }

  renderPosts(posts) {
    this.postsContainer.innerHTML = "";
    posts.forEach((post) => {
      const li = document.createElement("li");
      li.innerHTML = `<h3>${post.title}</h3>`;
      this.postsContainer.append(li);
      console.log(post.userId);
    });
  }

  renderComments(posts) {
    this.postsContainer.innerHTML = "";
    posts.forEach((post) => {
      const li = document.createElement("li");
      li.innerHTML = `<h3>${post.body}</h3>`;
      this.postsContainer.append(li);
      console.log(post.userId);
    });
  }

  renderUser(users) {
    users.forEach((user) => {
      const option = document.createElement("option");
      option.textContent = user.name;
      option.value = user.id;
      this.userSelect.append(option);
      console.log(user);
    });

    // this.userSelect.addEventListener("change", (event) => {
    //   console.dir(+event.target.value);
    // });
  }
}
class App {
  constructor() {
    this.postService = new PostService("https://jsonplaceholder.typicode.com");
    this.postUI = new PostUI(
      document.querySelector(".list"),
      document.querySelector(".users")
    );
    this.posts = [];
    this.users = [];
  }
  async init() {
    this.posts = await this.postService.fetchPosts();
    this.users = await this.postService.fetchUsers();
    this.postUI.renderPosts(this.posts);
    this.postUI.renderUser(this.users);

    document.querySelector(".users").addEventListener("change", (e) => {
      const userId = e.target.value;
      const filtered =
        userId === "all"
          ? this.posts
          : this.posts.filter((p) => p.userId === Number(userId));
      this.postUI.renderPosts(filtered);
    });
  }

  async loadComments(postId) {
    this.comments = await this.postService.fetchComments(postId);
  }
}
const app = new App();
app.init();
