const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
const userId = localStorage.getItem('userId');
let activeContactId = null;

if (!token) {
    window.location.href = '/login';
}

document.getElementById('loggedInUser').innerText = username;

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/login';
});

// Contacts list load karna
async function loadContacts() {
    try {
        const res = await fetch('/api/contacts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = '';

        if (data.contacts.length === 0) {
            contactsList.innerHTML = '<p style="font-size: 13px; color: #888;">No contacts yet</p>';
            return;
        }

        data.contacts.forEach(contact => {
            const div = document.createElement('div');
            div.classList.add('contact-item');
            div.textContent = contact.username;
            div.dataset.contactId = contact._id;

            div.addEventListener('click', async () => {
                activeContactId = contact._id;

                messages.innerHTML = '';

                document.querySelectorAll('.contact-item').forEach(item => item.style.background = '');
                div.style.background = '#cce5ff';

                // Chat UI dikhao
                document.getElementById('chatHeader').style.display = 'flex';
                document.getElementById('activeChatName').innerText = contact.username;
                document.getElementById('chatForm').style.display = 'flex';
                document.getElementById('noChatSelected').style.display = 'none';

                // PURANI CHAT HISTORY LOAD KARO
                try {
                    const res = await fetch(`/api/messages/${contact._id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();

                    data.messages.forEach(msg => {
                        const msgDiv = document.createElement('div');
                        msgDiv.classList.add('message');

                        let senderName;
                        if (msg.from === userId) {
                            senderName = username;
                            msgDiv.classList.add('own-message');
                        } else {
                            senderName = contact.username;
                            msgDiv.classList.add('other-message');
                        }

                        msgDiv.innerHTML = `<span class="sender">${senderName}</span><p>${msg.text}</p>`;
                        messages.appendChild(msgDiv);
                    });
                } catch (error) {
                    console.log('Error loading history:', error);
                }
            });

            contactsList.appendChild(div);
        });

    } catch (error) {
        console.log('Error loading contacts:', error);
    }
}

loadContacts();

document.getElementById('addContactBtn').addEventListener('click', async () => {
    const contactEmail = document.getElementById('contactEmail').value;

    try {
        const res = await fetch('/api/contacts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ contactEmail })
        });

        const data = await res.json();
        document.getElementById('contactMsg').innerText = data.message;

        if (res.ok) {
            loadContacts();
        }

    } catch (error) {
        document.getElementById('contactMsg').innerText = 'Something went wrong';
    }
});

const socket = io({
    auth: {
        token: token
    }
});

const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() === '') return;

    if (!activeContactId) {
        alert('Pehle koi contact select karo!');
        return;
    }

    socket.emit('chat-message', {
        text: input.value,
        toUserId: activeContactId
    });
    input.value = '';
});

socket.on('chat-message', (data) => {
    if (data.fromUserId !== activeContactId && data.user !== username) {
        return;
    }

    const div = document.createElement('div');
    div.classList.add('message');

    if (data.user === username) {
        div.classList.add('own-message');
    } else {
        div.classList.add('other-message');
    }

    div.innerHTML = `<span class="sender">${data.user}</span><p>${data.text}</p>`;
    messages.appendChild(div);
});

document.getElementById('closeChatBtn').addEventListener('click', () => {
    activeContactId = null;
    messages.innerHTML = '';

    document.getElementById('chatHeader').style.display = 'none';
    document.getElementById('chatForm').style.display = 'none';
    document.getElementById('noChatSelected').style.display = 'block';

    document.querySelectorAll('.contact-item').forEach(item => item.style.background = '');
});