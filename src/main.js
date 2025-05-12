import axios from "axios";
// class PostService {
//   constructor(baseUrl) {
//     this.baseUrl = baseUrl;
//   }
//   async fetchPosts() {
//     const { data } = await axios.get(`${this.baseUrl}/posts`);
//     return data;
//   }

//   async fetchUsers() {
//     const { data } = await axios.get(`${this.baseUrl}/users`);
//     return data;
//   }

//   async fetchComments(id = "") {
//     const { data } = await axios.get(`${this.baseUrl}/comments?postId=${id}`);
//     return data;
//   }
// }
// class PostUI {
//   constructor(postsContainer, userSelect) {
//     this.postsContainer = postsContainer;
//     this.userSelect = userSelect;
//   }

//   renderPosts(posts) {
//     this.postsContainer.innerHTML = "";
//     posts.forEach((post) => {
//       const li = document.createElement("li");
//       li.innerHTML = post.title;
//       li.value = post.id;
//       this.postsContainer.append(li);
//     });
//     this.postsContainer.style.display = "grid";
//     this.postsContainer.style.gap = "10px";
//   }

//   renderComments(comments, e) {
//     const div = document.createElement("div");
//     comments.forEach(({ body }, i) => {
//       const p = document.createElement("p");
//       p.textContent = `${i + 1}) ${body}`;
//       div.style.border = "1px black solid";
//       div.style.borderRadius = "10px";
//       div.style.padding = "10px";
//       div.append(p);
//     });

//     console.dir(e.target);
//     if (
//       e.target.nextSibling === null ||
//       e.target.nextSibling.nodeName !== "DIV"
//     ) {
//       e.target.after(div);
//     } else {
//       e.target.nextSibling.remove();
//     }
//   }

//   renderUser(users) {
//     users.forEach((user) => {
//       const option = document.createElement("option");
//       option.textContent = user.name;
//       option.value = user.id;
//       this.userSelect.append(option);
//     });
//   }

//   filterPosts(handler) {
//     this.userSelect.addEventListener("change", handler);
//   }

//   openComment(handler) {
//     this.postsContainer.addEventListener("click", handler);
//   }
// }

// class App {
//   constructor() {
//     this.postService = new PostService("https://jsonplaceholder.typicode.com");
//     this.postUI = new PostUI(
//       document.querySelector(".list"),
//       document.querySelector(".users")
//     );
//     this.posts = [];
//     this.users = [];
//   }

//   handleFilter(e) {
//     const userId = e.target.value;
//     const filtered =
//       userId === "all"
//         ? this.posts
//         : this.posts.filter((p) => p.userId === Number(userId));
//     this.postUI.renderPosts(filtered);
//   }

//   async postsCommentOpen(e) {
//     const comments = await this.postService.fetchComments(e.target.value);
//     this.postUI.renderComments(comments, e);
//   }

//   async init() {
//     this.posts = await this.postService.fetchPosts();
//     this.users = await this.postService.fetchUsers();
//     this.postUI.renderPosts(this.posts);
//     this.postUI.renderUser(this.users);
//     this.postUI.filterPosts(this.handleFilter.bind(this));
//     this.postUI.openComment(this.postsCommentOpen.bind(this));
//   }
// }
// const app = new App();
// app.init();

// ----------------------------------------------------------------------------------------------

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

  async fetchComments(postId) {
    const { data } = await axios.get(
      `${this.baseUrl}/comments?postId=${postId}`
    );

    return data;
  }
}

class PostModel {
  #posts;
  #users;

  constructor(service) {
    this.service = service;
    this.#posts = [];
    this.#users = [];
  }
  async loadInitialData() {
    const [posts, users] = await Promise.all([
      this.service.fetchPosts(),
      this.service.fetchUsers(),
    ]);
    this.#posts = posts;
    this.#users = users;
  }

  getUsers() {
    return this.#users;
  }

  getPostsByUser(userId) {
    console.log("this.#posts", this.#posts);
    return userId === "all"
      ? this.#posts
      : this.#posts.filter((p) => p.userId === Number(userId));
  }

  getComments(postId) {
    this.service.fetchComments(postId);
  }
}

class PostView {
  constructor(container, select) {
    this.container = container;
    this.select = select;
  }

  renderPosts(posts, users, onPostClick) {
    this.container.innerHTML = "";
    posts.forEach((post) => {
      const user = users.find((u) => u.id === post.userId);
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        <small>Автор: ${user?.name || "Неизвестен"}</small>
        <div class="comments" data-id="${post.id}"></div>
      `;
      div.addEventListener("click", () =>
        onPostClick(post.id, document.querySelector(".comments"))
      );
      this.container.appendChild(div);
    });
  }

  renderUserOptions(users) {
    this.select.innerHTML = '<option value="all">Все авторы</option>';
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      this.select.appendChild(option);
    });
  }

  renderComments(comments, container) {
    container.innerHTML =
      "<h2>Comments</h2>" +
      comments
        .map((c) => {
          return `<div><h2> ${c.body}</h2><p>${c.email}</p></div>`;
        })
        .join("");
  }

  bindFilterChange(handler) {
    this.select.addEventListener("change", handler);
  }
}

class PostController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async init() {
    await this.model.loadInitialData();
    this.view.renderUserOptions(this.model.getUsers());
    this.view.renderPosts(
      this.model.getPostsByUser("all"),
      this.model.getUsers(),
      this.handlePostClick.bind(this)
    );

    this.view.bindFilterChange(this.handleUserChange.bind(this));
  }

  handleUserChange(e) {
    const posts = this.model.getPostsByUser(e.target.value);
    this.view.renderPosts(
      posts,
      this.model.getUsers(),
      this.handlePostClick.bind(this)
    );
  }

  async handlePostClick(postId, container) {
    const comments = await this.model.getComments(postId);
    this.view.renderComments(comments, container);
  }
}
const container = document.querySelector(".list");
const select = document.querySelector("#user-filter");
const service = new PostService("https://jsonplaceholder.typicode.com/");
const model = new PostModel(service);
const view = new PostView(container, select);
const app = new PostController(model, view);

app.init();
