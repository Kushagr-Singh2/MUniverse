<<<<<<< HEAD
const postBtn = document.getElementById("postBtn");
const postInput = document.getElementById("postInput");
const feed = document.getElementById("feed");
const openSidebar = document.getElementById("openSidebar")
const sidebar = document.getElementById("sidebar")
const closeSidebar = document.getElementById("closeSidebar")
// const postInput = document.getElementById("postInput")

let username = localStorage.getItem("username");

if (!username) {
    username = prompt("Enter your username") || "Guest";
    localStorage.setItem("username", username);
}





let posts = JSON.parse(localStorage.getItem("posts")) || [];






postInput.addEventListener("input",function(){
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
})





function renderPosts(){
    feed.innerHTML = "";
    posts.sort((a,b) => b.createdAt - a.createdAt);
    posts.forEach(post => {
        const postCard = document.createElement("div");
        postCard.classList.add("post-card")
        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add("post-content");
        const likeWrapper = document.createElement("div");
        likeWrapper.classList.add("like-section");
        const user = document.createElement("div");
        user.classList.add("post-user");
        user.textContent = post.username;
        const text = document.createElement("div");
        text.textContent = post.text
        const time = document.createElement("small")
        time.classList.add("timestamp")
        time.textContent = post.time;
        const menuBtn = document.createElement("button");
        menuBtn.textContent = "⋮";
        menuBtn.classList.add("menu-btn");
        const dropdown = document.createElement("div");
        const likeBtn = document.createElement("button")
        const likeCount = document.createElement("span");
        likeCount.classList.add("like-count");
        likeCount.textContent = post.likes ?? 0;
        likeBtn.classList.add("like-btn")
        // likeBtn.textContent = post.liked ? "❤️" : "🤍";
        likeBtn.textContent = "❤";
       const commentBtn = document.createElement("button");
commentBtn.classList.add("comment-btn");
commentBtn.textContent = `💬 ${post.comments?.length || 0}`;


const commentSection = document.createElement("div");
commentSection.classList.add("comment-section");

(post.comments || []).forEach(comment => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("single-comment");
    commentDiv.textContent =  `${comment.text} • ${comment.time}`;
    commentSection.appendChild(commentDiv);
});


const input = document.createElement("input");
input.placeholder = "Write a comment...";
input.classList.add("comment-input");

const addBtn = document.createElement("button");
addBtn.textContent = "Reply";
addBtn.classList.add("reply-btn");

addBtn.addEventListener("click", function (e) {
    e.stopPropagation();

    if (!input.value.trim()) return;

    const newComment = {
        id: Date.now(),
        text: input.value,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);

    localStorage.setItem("posts", JSON.stringify(posts));

    input.value = "";
    renderPosts();
});
    commentSection.appendChild(input);
        commentSection.appendChild(addBtn);

        commentBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    commentSection.classList.toggle("open");
});











if (post.liked) likeBtn.classList.add("liked");

likeBtn.addEventListener("click", function (e) {
            e.stopPropagation(); 
            
            post.liked = !post.liked;
            
            if (post.liked) {
                post.likes++;
                likeBtn.classList.add("animate");
            } else {
                post.likes--;
            }
            
            localStorage.setItem("posts", JSON.stringify(posts));
            renderPosts();
           
        });
        
        
        menuBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            
            dropdown.classList.toggle("show");
            postCard.classList.toggle("active");    
        });
        
        
        dropdown.classList.add("dropdown");
        const deleteOption = document.createElement("div");
        deleteOption.textContent = "🗑️ Delete Post";
        deleteOption.classList.add("delete-optn");
        deleteOption.addEventListener("click", function () {

            if(!confirm("Delete this Post?")) return;
            
            posts = posts.filter(p => p.id !== post.id);
            
            localStorage.setItem("posts", JSON.stringify(posts));
            
            renderPosts();
        });
        const editOption = document.createElement("div");
        editOption.textContent = "✒️ Edit Post";
        editOption.classList.add("edit-optn");
        editOption.addEventListener("click", function(e){
            e.stopPropagation();
                dropdown.classList.remove("show")

            text.contentEditable = true;
            text.focus( );
            const originalText = post.text;

            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(text);
            range.collapse(false);

            selection.removeAllRanges();
            selection.addRange(range);

            text.addEventListener("blur",function(){

                const newText = text.innerText.trim()
                


                // if (newText.length === 0) {
                //     post.text = originalText
                //       localStorage.setItem("posts", JSON.stringify(posts));
                //     text.contentEditable = false;
                //     renderPosts();
                //     return;
                // }

                //  if (!newText) {
                //      text.innerText = originalText;
                //       text.contentEditable = false;
                //        return;
                // }

                post.text = newText;
                post.edited = true;
                post.editedAt = Date.now()
                localStorage.setItem("posts",JSON.stringify(posts));
                text.contentEditable = false;
                renderPosts()

               

            },{once: true})

            text.addEventListener("keydown",function(e){
                if(e.key === "Enter"){
                    e.preventDefault()
                    text.blur();
                }
            })


        })
        
        const date = new Date(post.createdAt)
        let timeText = date.toLocaleString([],{
           
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
            
        
        })
        if(post.edited){
            const editDate = new Date(post.editedAt)
            timeText += " • Edited"
             

        }
        time.textContent = timeText
        
        
        
        contentWrapper.appendChild(user)
        contentWrapper.appendChild(text)
        contentWrapper.appendChild(time)
        
        postCard.appendChild(menuBtn);
        postCard.appendChild(dropdown)


        postCard.appendChild(contentWrapper)
        postCard.appendChild(likeWrapper)
        likeWrapper.appendChild(likeBtn)
        likeWrapper.appendChild(likeCount)
        likeWrapper.appendChild(commentBtn)
        postCard.appendChild(commentSection);
        dropdown.appendChild(deleteOption);
        dropdown.appendChild(editOption)
        
    



        feed.appendChild(postCard)
    })
    
    
}


// Post Button
postBtn.addEventListener('click', function () {

    const text = postInput.value;

    if (text.trim() === "") {
        return;
    }

    const newPost = {
        id: Date.now(),
        username: username,
        text: text,
        likes: 0,
        liked: false,
        comments: [],
        createdAt: Date.now()
        // time: new Date().toLocaleTimeString([], {
        //     hour: "2-digit",
        //     minute: "2-digit",
        //     hour12: true
            
        // })
        
    };
    posts.push(newPost)

    localStorage.setItem("posts",JSON.stringify(posts))
    renderPosts();
    postInput.value = "";
    postInput.style.height = "45px";
    


    // newPost.classList.add("post-card");

    // const postText = document.createElement("span");
    // const time = document.createElement("small");
    // const contentWrapper = document.createElement("div");
    // contentWrapper.classList.add("post-content");
    // // const now = new Date();
    // const likeWrapper = document.createElement("div");
    // likeWrapper.classList.add("like-section");
    // const likeBtn = document.createElement("button");
    // likeBtn.textContent = "🤍";
    // likeBtn.classList.add("like-btn");

    // const likeCount = document.createElement("span");
    // likeCount.textContent = "0";
    // likeCount.classList.add("like-count");

    // let count = 0;

    // let liked = false;

    // likeBtn.addEventListener("click", function () {

    //     if (!liked) {
    //         count++;
    //         likeBtn.textContent = "❤️";
    //          likeBtn.classList.add("liked");
    //         liked = true;
    //     } else {
    //         count--;
    //         likeBtn.textContent = "🤍";
    //         likeBtn.classList.remove("liked");
    //         liked = false;
    //     }

    //     likeCount.textContent = count;
    // });

    // let hours = now.getHours()
    // let minutes = now.getMinutes()

    // if (minutes < 10) {
    //     minutes = "0" + minutes;
    // }

    // let ampm = hours;
    // if (hours >= 12) {
    //     ampm = "PM";
    // } else {
    //     ampm = "AM";
    // }
    // hours = hours % 12;
    // hours = hours ? hours : 12;

    // time.textContent = `${hours}:${minutes} ${ampm}`;
    // time.classList.add("timestamp");

    // postText.textContent = text;


    // // newPost.textContent = text;


    // const menuBtn = document.createElement("button")
    // menuBtn.textContent = " ..."
    // menuBtn.classList.add("menu-btn")

    // const dropdown = document.createElement("div");
    // dropdown.classList.add("dropdown");

    // const deleteOption = document.createElement("div");
    // deleteOption.textContent = "🗑️ Delete Post";
    // deleteOption.classList.add("delete-optn");

    // const editOption = document.createElement("div")
    // editOption.textContent = "✒️ Edit post"
    // editOption.classList.add("edit-optn");

    // dropdown.appendChild(deleteOption);
    // dropdown.appendChild(editOption)

    // menuBtn.addEventListener("click", function(e) {
    // e.stopPropagation();  // prevents closing immediately
    // dropdown.classList.toggle("show");
    // });

    // deleteOption.addEventListener("click", function() {
    // newPost.remove();
    // });

    // // editOption.addEventListener("click",function(){
    // //     postText.contentEditable = true;
    // //     postText.focus()
    // // })

    // // const deleteBtn = document.createElement("button")
    // // deleteBtn.textContent = "❌";
    // // deleteBtn.classList.add("delete-btn")

    // // deleteBtn.addEventListener("click", function () {
    // //     newPost.remove();
    // // });




    // likeWrapper.appendChild(likeBtn);
    // likeWrapper.appendChild(likeCount);




    // contentWrapper.appendChild(postText);
    // contentWrapper.appendChild(time);
    // contentWrapper.appendChild(likeWrapper);
    // newPost.appendChild(contentWrapper);
    // // newPost.appendChild(deleteBtn);
    // newPost.appendChild(menuBtn);
    // newPost.appendChild(dropdown);

    // feed.appendChild(newPost)

    postInput.value = "";


})



document.addEventListener("click", function() {
    document.querySelectorAll(".dropdown").forEach(d => {
        d.classList.remove("show");
    });
});


// side bar 
openSidebar.addEventListener('click', function() {
    sidebar.classList.add("active")
    
})
document.addEventListener('click',function(e){
     if (!sidebar.contains(e.target) && 
        !openSidebar.contains(e.target)) {
        sidebar.classList.remove("active");
    }

})


=======
const postBtn = document.getElementById("postBtn");
const postInput = document.getElementById("postInput");
const feed = document.getElementById("feed");
const openSidebar = document.getElementById("openSidebar")
const sidebar = document.getElementById("sidebar")
const closeSidebar = document.getElementById("closeSidebar")
// const postInput = document.getElementById("postInput")

let username = localStorage.getItem("username");

if (!username) {
    username = prompt("Enter your username") || "Guest";
    localStorage.setItem("username", username);
}





let posts = JSON.parse(localStorage.getItem("posts")) || [];






postInput.addEventListener("input",function(){
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
})





function renderPosts(){
    feed.innerHTML = "";
    posts.sort((a,b) => b.createdAt - a.createdAt);
    posts.forEach(post => {
        const postCard = document.createElement("div");
        postCard.classList.add("post-card")
        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add("post-content");
        const likeWrapper = document.createElement("div");
        likeWrapper.classList.add("like-section");
        const user = document.createElement("div");
        user.classList.add("post-user");
        user.textContent = post.username;
        const text = document.createElement("div");
        text.textContent = post.text
        const time = document.createElement("small")
        time.classList.add("timestamp")
        time.textContent = post.time;
        const menuBtn = document.createElement("button");
        menuBtn.textContent = "⋮";
        menuBtn.classList.add("menu-btn");
        const dropdown = document.createElement("div");
        const likeBtn = document.createElement("button")
        const likeCount = document.createElement("span");
        likeCount.classList.add("like-count");
        likeCount.textContent = post.likes ?? 0;
        likeBtn.classList.add("like-btn")
        // likeBtn.textContent = post.liked ? "❤️" : "🤍";
        likeBtn.textContent = "❤";
       const commentBtn = document.createElement("button");
commentBtn.classList.add("comment-btn");
commentBtn.textContent = `💬 ${post.comments?.length || 0}`;


const commentSection = document.createElement("div");
commentSection.classList.add("comment-section");

(post.comments || []).forEach(comment => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("single-comment");
    commentDiv.textContent =  `${comment.text} • ${comment.time}`;
    commentSection.appendChild(commentDiv);
});


const input = document.createElement("input");
input.placeholder = "Write a comment...";
input.classList.add("comment-input");

const addBtn = document.createElement("button");
addBtn.textContent = "Reply";
addBtn.classList.add("reply-btn");

addBtn.addEventListener("click", function (e) {
    e.stopPropagation();

    if (!input.value.trim()) return;

    const newComment = {
        id: Date.now(),
        text: input.value,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);

    localStorage.setItem("posts", JSON.stringify(posts));

    input.value = "";
    renderPosts();
});
    commentSection.appendChild(input);
        commentSection.appendChild(addBtn);

        commentBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    commentSection.classList.toggle("open");
});











if (post.liked) likeBtn.classList.add("liked");

likeBtn.addEventListener("click", function (e) {
            e.stopPropagation(); 
            
            post.liked = !post.liked;
            
            if (post.liked) {
                post.likes++;
                likeBtn.classList.add("animate");
            } else {
                post.likes--;
            }
            
            localStorage.setItem("posts", JSON.stringify(posts));
            renderPosts();
           
        });
        
        
        menuBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            
            dropdown.classList.toggle("show");
            postCard.classList.toggle("active");    
        });
        
        
        dropdown.classList.add("dropdown");
        const deleteOption = document.createElement("div");
        deleteOption.textContent = "🗑️ Delete Post";
        deleteOption.classList.add("delete-optn");
        deleteOption.addEventListener("click", function () {

            if(!confirm("Delete this Post?")) return;
            
            posts = posts.filter(p => p.id !== post.id);
            
            localStorage.setItem("posts", JSON.stringify(posts));
            
            renderPosts();
        });
        const editOption = document.createElement("div");
        editOption.textContent = "✒️ Edit Post";
        editOption.classList.add("edit-optn");
        editOption.addEventListener("click", function(e){
            e.stopPropagation();
                dropdown.classList.remove("show")

            text.contentEditable = true;
            text.focus( );
            const originalText = post.text;

            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(text);
            range.collapse(false);

            selection.removeAllRanges();
            selection.addRange(range);

            text.addEventListener("blur",function(){

                const newText = text.innerText.trim()
                


                // if (newText.length === 0) {
                //     post.text = originalText
                //       localStorage.setItem("posts", JSON.stringify(posts));
                //     text.contentEditable = false;
                //     renderPosts();
                //     return;
                // }

                //  if (!newText) {
                //      text.innerText = originalText;
                //       text.contentEditable = false;
                //        return;
                // }

                post.text = newText;
                post.edited = true;
                post.editedAt = Date.now()
                localStorage.setItem("posts",JSON.stringify(posts));
                text.contentEditable = false;
                renderPosts()

               

            },{once: true})

            text.addEventListener("keydown",function(e){
                if(e.key === "Enter"){
                    e.preventDefault()
                    text.blur();
                }
            })


        })
        
        const date = new Date(post.createdAt)
        let timeText = date.toLocaleString([],{
           
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
            
        
        })
        if(post.edited){
            const editDate = new Date(post.editedAt)
            timeText += " • Edited"
             

        }
        time.textContent = timeText
        
        
        
        contentWrapper.appendChild(user)
        contentWrapper.appendChild(text)
        contentWrapper.appendChild(time)
        
        postCard.appendChild(menuBtn);
        postCard.appendChild(dropdown)


        postCard.appendChild(contentWrapper)
        postCard.appendChild(likeWrapper)
        likeWrapper.appendChild(likeBtn)
        likeWrapper.appendChild(likeCount)
        likeWrapper.appendChild(commentBtn)
        postCard.appendChild(commentSection);
        dropdown.appendChild(deleteOption);
        dropdown.appendChild(editOption)
        
    



        feed.appendChild(postCard)
    })
    
    
}


// Post Button
postBtn.addEventListener('click', function () {

    const text = postInput.value;

    if (text.trim() === "") {
        return;
    }

    const newPost = {
        id: Date.now(),
        username: username,
        text: text,
        likes: 0,
        liked: false,
        comments: [],
        createdAt: Date.now()
        // time: new Date().toLocaleTimeString([], {
        //     hour: "2-digit",
        //     minute: "2-digit",
        //     hour12: true
            
        // })
        
    };
    posts.push(newPost)

    localStorage.setItem("posts",JSON.stringify(posts))
    renderPosts();
    postInput.value = "";
    postInput.style.height = "45px";
    


    // newPost.classList.add("post-card");

    // const postText = document.createElement("span");
    // const time = document.createElement("small");
    // const contentWrapper = document.createElement("div");
    // contentWrapper.classList.add("post-content");
    // // const now = new Date();
    // const likeWrapper = document.createElement("div");
    // likeWrapper.classList.add("like-section");
    // const likeBtn = document.createElement("button");
    // likeBtn.textContent = "🤍";
    // likeBtn.classList.add("like-btn");

    // const likeCount = document.createElement("span");
    // likeCount.textContent = "0";
    // likeCount.classList.add("like-count");

    // let count = 0;

    // let liked = false;

    // likeBtn.addEventListener("click", function () {

    //     if (!liked) {
    //         count++;
    //         likeBtn.textContent = "❤️";
    //          likeBtn.classList.add("liked");
    //         liked = true;
    //     } else {
    //         count--;
    //         likeBtn.textContent = "🤍";
    //         likeBtn.classList.remove("liked");
    //         liked = false;
    //     }

    //     likeCount.textContent = count;
    // });

    // let hours = now.getHours()
    // let minutes = now.getMinutes()

    // if (minutes < 10) {
    //     minutes = "0" + minutes;
    // }

    // let ampm = hours;
    // if (hours >= 12) {
    //     ampm = "PM";
    // } else {
    //     ampm = "AM";
    // }
    // hours = hours % 12;
    // hours = hours ? hours : 12;

    // time.textContent = `${hours}:${minutes} ${ampm}`;
    // time.classList.add("timestamp");

    // postText.textContent = text;


    // // newPost.textContent = text;


    // const menuBtn = document.createElement("button")
    // menuBtn.textContent = " ..."
    // menuBtn.classList.add("menu-btn")

    // const dropdown = document.createElement("div");
    // dropdown.classList.add("dropdown");

    // const deleteOption = document.createElement("div");
    // deleteOption.textContent = "🗑️ Delete Post";
    // deleteOption.classList.add("delete-optn");

    // const editOption = document.createElement("div")
    // editOption.textContent = "✒️ Edit post"
    // editOption.classList.add("edit-optn");

    // dropdown.appendChild(deleteOption);
    // dropdown.appendChild(editOption)

    // menuBtn.addEventListener("click", function(e) {
    // e.stopPropagation();  // prevents closing immediately
    // dropdown.classList.toggle("show");
    // });

    // deleteOption.addEventListener("click", function() {
    // newPost.remove();
    // });

    // // editOption.addEventListener("click",function(){
    // //     postText.contentEditable = true;
    // //     postText.focus()
    // // })

    // // const deleteBtn = document.createElement("button")
    // // deleteBtn.textContent = "❌";
    // // deleteBtn.classList.add("delete-btn")

    // // deleteBtn.addEventListener("click", function () {
    // //     newPost.remove();
    // // });




    // likeWrapper.appendChild(likeBtn);
    // likeWrapper.appendChild(likeCount);




    // contentWrapper.appendChild(postText);
    // contentWrapper.appendChild(time);
    // contentWrapper.appendChild(likeWrapper);
    // newPost.appendChild(contentWrapper);
    // // newPost.appendChild(deleteBtn);
    // newPost.appendChild(menuBtn);
    // newPost.appendChild(dropdown);

    // feed.appendChild(newPost)

    postInput.value = "";


})



document.addEventListener("click", function() {
    document.querySelectorAll(".dropdown").forEach(d => {
        d.classList.remove("show");
    });
});


// side bar 
openSidebar.addEventListener('click', function() {
    sidebar.classList.add("active")
    
})
document.addEventListener('click',function(e){
     if (!sidebar.contains(e.target) && 
        !openSidebar.contains(e.target)) {
        sidebar.classList.remove("active");
    }

})


>>>>>>> 41b9c2cc0a9c157eea8c0e71e6bb908bd2418ef9
renderPosts();