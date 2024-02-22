const socket = io(SERVER_URL, {
  auth: {
    token:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYXJ1bkBnbWFpbC5jb20iLCJpYXQiOjE3MDg1NzgzMTMsImV4cCI6MTcwODY2NDcxM30.YVxtNw5HdNBSVtUtWcf_9HGrHitHJhxpD6hhKgqJtms',
  },
});
function joinChat() {
  const senderName = document.getElementById('username').value;
  password = document.getElementById('password').value;
  email = document.getElementById('email').value;
  console.log('Inside join chat!!');
  socket.emit('new-user-joined', {
    email,
    username: senderName,
    password,
  });
  socket.on('registration-response', (response) => {
    if (response.success) {
      populateUserDropdown();
      const searchContainer = document.getElementById('search-container');
      searchContainer.style.display = 'block';
    } else {
      alert('Password does not match. Please try again.');
    }
  });
}

async function populateUserDropdown() {
  const senderName = document.getElementById('username').value;
  const userDropdown = document.getElementById('userDropdown');
  const response = await fetch(FETCH_USERS_URL, {
    method: 'GET',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYXJ1bkBnbWFpbC5jb20iLCJpYXQiOjE3MDg1MTc5NDUsImV4cCI6MTcwODYwNDM0NX0.BFn9qipY6jUTIhBGZ2EFT_HL1R3JXFae3JbFQ8ZmRr4',
    },
  });
  const allUsers = await response.json();
  console.log(' inside populateUserDropdown ', allUsers);
  const allUsersExceptCurrent = allUsers.filter(
    (user) => user.username !== senderName,
  );
  console.log(' allUserExceptCurrent ', allUsersExceptCurrent);
  allUsersExceptCurrent.forEach((user) => {
    const option = document.createElement('option');
    option.value = user.id;
    option.text = user.username;
    userDropdown.appendChild(option);
  });
}

async function startChat() {
  const receiverName = userDropdown.options[userDropdown.selectedIndex].text;
  const senderName = document.getElementById('username').value;
  const chatDive = document.getElementById('chatDiv');
  chatDive.innerHTML = `<div>Chat started with user ${receiverName}</div>`;
  const chatContainer = document.getElementById('chat-container');
  chatContainer.style.display = 'block';
  const senderUrl = `${FETCH_USER_USERID}${senderName}`;
  const receiverUrl = `${FETCH_USER_USERID}${receiverName}`;
  const senderUserId = await fetch(senderUrl, {
    method: 'GET',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYXJ1bkBnbWFpbC5jb20iLCJpYXQiOjE3MDg1MTc5NDUsImV4cCI6MTcwODYwNDM0NX0.BFn9qipY6jUTIhBGZ2EFT_HL1R3JXFae3JbFQ8ZmRr4',
    },
  });
  const receiverUserId = await fetch(receiverUrl, {
    method: 'GET',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYXJ1bkBnbWFpbC5jb20iLCJpYXQiOjE3MDg1MTc5NDUsImV4cCI6MTcwODYwNDM0NX0.BFn9qipY6jUTIhBGZ2EFT_HL1R3JXFae3JbFQ8ZmRr4',
    },
  });
  console.log(
    ` senderUserId ${senderUserId} and receiverUserId ${receiverUserId} `,
  );
  const sender_user_id = await senderUserId.json();
  const receiver_user_id = await receiverUserId.json();
  console.log(
    ` senderUserId ${sender_user_id} and receiverUserId ${receiver_user_id} `,
  );
  // Don't use sender_user_id  and receiver_user_id  ..
  const FETCH_HISTORY_URL = `${SERVER_URL}${FETCH_CHAT_HISTORY_PATH}sender_user_id=${sender_user_id}&receiver_user_id=${receiver_user_id}`;
  const history = await fetch(FETCH_HISTORY_URL, {
    method: 'GET',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYXJ1bkBnbWFpbC5jb20iLCJpYXQiOjE3MDg1MTc5NDUsImV4cCI6MTcwODYwNDM0NX0.BFn9qipY6jUTIhBGZ2EFT_HL1R3JXFae3JbFQ8ZmRr4',
    },
  });
  const chatHistory = await history.json();
  const chatHistoryDiv = document.getElementById('chat-history');
  chatHistoryDiv.innerHTML = '';
  if (chatHistory.data) {
    chatHistory.data.results.forEach((chat) => {
      const chatItem = document.createElement('div');
      if (chat.sender_user_id.id === sender_user_id.data)
        chatItem.textContent = `You: ${chat.message}`;
      else chatItem.textContent = `${senderName}: ${chat.message}`;
      chatHistoryDiv.appendChild(chatItem);
    });
  } else {
    // chatHistoryDiv.appendChild(chatItem);
  }
}

socket.on('receive', (data) => {
  // document.getElementById('chat-b').innerHTML +=
  //   `<p>${data.receiverName}: ${data.message}</p>`;
  document.getElementById('chat').innerHTML +=
    `<p>${data.senderName}: ${data.message}</p>`;
});

function sendMessage() {
  const senderName = document.getElementById('username').value;
  const receiverName = userDropdown.options[userDropdown.selectedIndex].text;
  // const receiverName = senderName;
  const messageInput = document.getElementById('message');
  const message = messageInput.value.trim();
  if (!message) {
    alert('Please enter something!!!');
  }
  socket.emit('send', { receiverName, senderName, message });
  document.getElementById('chat').innerHTML += `<p>You: ${message}</p>`;
}
