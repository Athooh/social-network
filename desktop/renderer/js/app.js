// Main Application - Entry point and UI management

class MessengerApp {
    constructor() {
        this.selectedChat = null;
        this.searchQuery = '';
        this.typingTimeout = null;
        this.lastTypingTime = 0;
        this.isInitialized = false;

        // Bind methods
        this.init = this.init.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.selectChat = this.selectChat.bind(this);
    }

    async init() {
        console.log('Initializing Messenger App');

        // Wait for all services to be available
        await this.waitForServices();

        // Set up event listeners
        this.setupEventListeners();

        // Set up service listeners
        this.setupServiceListeners();

        // Initialize router
        window.router.init();

        this.isInitialized = true;
        console.log('Messenger App initialized');
    }

    async waitForServices() {
        const maxAttempts = 20;
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (window.authService && window.websocketService && window.chatService && window.router) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (attempts >= maxAttempts) {
            throw new Error('Services failed to initialize');
        }
    }

    setupEventListeners() {
        // Authentication form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin);
        }

        // Password toggle
        const passwordToggle = document.getElementById('password-toggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', this.togglePassword);
        }

        // Register link
        const registerLink = document.getElementById('register-link');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.authService.redirectToRegister();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout);
        }

        // Message form
        const messageForm = document.getElementById('message-input-form');
        if (messageForm) {
            messageForm.addEventListener('submit', this.handleSendMessage);
        }

        // Message input typing
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('input', this.handleTyping.bind(this));
        }

        // Search inputs
        const conversationSearch = document.getElementById('conversation-search');
        if (conversationSearch) {
            conversationSearch.addEventListener('input', this.handleConversationSearch.bind(this));
        }

        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', this.handleGlobalSearch.bind(this));
        }

        // New message button
        const newMessageBtn = document.getElementById('new-message-btn');
        if (newMessageBtn) {
            newMessageBtn.addEventListener('click', this.showNewMessageModal.bind(this));
        }

        // Close modals
        const closeNewMessageModal = document.getElementById('close-new-message-modal');
        if (closeNewMessageModal) {
            closeNewMessageModal.addEventListener('click', this.hideNewMessageModal.bind(this));
        }

        // Back button (mobile)
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.selectedChat = null;
                this.updateChatView();
            });
        }

        // Emoji picker
        const emojiButton = document.getElementById('emoji-button');
        if (emojiButton) {
            emojiButton.addEventListener('click', () => window.emojiPicker.toggle());
        }

        const closeEmojiPicker = document.getElementById('close-emoji-picker');
        if (closeEmojiPicker) {
            closeEmojiPicker.addEventListener('click', () => window.emojiPicker.hide());
        }

        // Emoji category tabs
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.switchEmojiCategory(category);
            });
        });

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', this.showSettings.bind(this));
        }

        // Click outside to close emoji picker
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emoji-picker');
            const emojiButton = document.getElementById('emoji-button');

            if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiButton) {
                window.emojiPicker.hide();
            }
        });
    }

    setupServiceListeners() {
        // Auth service listener
        window.authService.addListener((authState) => {
            if (authState.isAuthenticated && window.router.getCurrentRoute() === 'auth') {
                window.router.navigate('messenger');
            } else if (!authState.isAuthenticated && window.router.getCurrentRoute() === 'messenger') {
                window.router.navigate('auth');
            }
        });

        // Chat service listener
        window.chatService.addListener((chatState) => {
            this.updateConversationsList(chatState.contacts);
            this.updateMessages(chatState.messages);
            this.updateTypingIndicators(chatState.typingUsers);
            this.updateUnreadCounts(chatState.unreadCounts);
        });

        // WebSocket connection listener
        window.websocketService.subscribe('connection', (payload) => {
            console.log('WebSocket connection status:', payload.connected);
        });
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnSpinner = loginBtn.querySelector('.btn-spinner');

        // Clear previous errors
        window.formUtils.clearAllErrors();

        // Validate
        if (!window.formUtils.validateEmail(email)) {
            window.formUtils.showFieldError('email', 'Please enter a valid email address');
            return;
        }

        if (!window.formUtils.validatePassword(password)) {
            window.formUtils.showFieldError('password', 'Password must be at least 6 characters');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'flex';

        try {
            const success = await window.authService.login({ email, password });
            if (success) {
                // Clear form
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            // Hide loading state
            loginBtn.disabled = false;
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
        }
    }

    async handleLogout() {
        const confirmed = confirm('Are you sure you want to logout?');
        if (confirmed) {
            await window.authService.logout();
        }
    }

    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('.password-toggle i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }

    async handleSendMessage(e) {
        e.preventDefault();

        if (!this.selectedChat) return;

        const messageInput = document.getElementById('message-input');
        const content = messageInput.value.trim();

        if (!content) return;

        try {
            await window.chatService.sendMessage(this.selectedChat.userId, content);
            messageInput.value = '';

            // Scroll to bottom
            this.scrollToBottom();
        } catch (error) {
            console.error('Send message error:', error);
        }
    }

    handleTyping() {
        if (!this.selectedChat) return;

        const now = Date.now();
        const wasTyping = now - this.lastTypingTime < 3000;

        if (!wasTyping) {
            window.chatService.sendTypingIndicator(this.selectedChat.userId);
        }

        this.lastTypingTime = now;

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Set new timeout
        this.typingTimeout = setTimeout(() => {
            this.lastTypingTime = 0;
        }, 3000);
    }

    handleConversationSearch(e) {
        this.searchQuery = e.target.value;
        this.updateConversationsList(window.chatService.contacts);
    }

    handleGlobalSearch(e) {
        // Implement global message search
        const query = e.target.value;
        console.log('Global search:', query);
        // TODO: Implement message search across all conversations
    }

    selectChat(contact) {
        if (!contact || !contact.userId) {
            console.error('Invalid contact selected:', contact);
            return;
        }

        this.selectedChat = contact;
        this.updateChatView();

        // Load messages
        window.chatService.loadMessages(contact.userId);

        // Mark messages as read
        window.chatService.markMessagesAsRead(contact.userId);

        // Focus message input
        setTimeout(() => {
            const messageInput = document.getElementById('message-input');
            if (messageInput) {
                messageInput.focus();
            }
        }, 100);
    }

    updateChatView() {
        const noChatSelected = document.getElementById('no-chat-selected');
        const activeChat = document.getElementById('active-chat');
        const conversationsSidebar = document.getElementById('conversations-sidebar');

        if (this.selectedChat) {
            noChatSelected.style.display = 'none';
            activeChat.style.display = 'flex';

            // Update chat header
            this.updateChatHeader();

            // Hide sidebar on mobile
            if (window.innerWidth <= 768) {
                conversationsSidebar.classList.add('hidden');
            }
        } else {
            noChatSelected.style.display = 'flex';
            activeChat.style.display = 'none';

            // Show sidebar on mobile
            if (window.innerWidth <= 768) {
                conversationsSidebar.classList.remove('hidden');
            }
        }
    }

    updateChatHeader() {
        if (!this.selectedChat) return;

        const baseUrl = 'http://localhost:8080';
        const chatAvatar = document.getElementById('chat-avatar');
        const chatName = document.getElementById('chat-name');
        const chatStatus = document.getElementById('chat-status');
        const chatUserStatus = document.getElementById('chat-user-status');

        if (chatAvatar) {
            chatAvatar.src = this.selectedChat.avatar
                ? `${baseUrl}/uploads/${this.selectedChat.avatar}`
                : '/avatar.png';
        }

        if (chatName) {
            chatName.textContent = `${this.selectedChat.firstName} ${this.selectedChat.lastName}`;
        }

        if (chatStatus) {
            chatStatus.className = `status-indicator ${this.selectedChat.isOnline ? 'online' : 'offline'}`;
        }

        if (chatUserStatus) {
            chatUserStatus.textContent = this.selectedChat.isOnline ? 'Online' : 'Offline';
        }
    }

    updateConversationsList(contacts) {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;

        // Filter contacts based on search
        const filteredContacts = window.searchUtils.filterContacts(contacts, this.searchQuery);

        // Sort contacts
        const sortedContacts = this.sortContacts(filteredContacts);

        // Clear existing
        conversationsList.innerHTML = '';

        if (sortedContacts.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-state">
                    <p>No conversations found</p>
                </div>
            `;
            return;
        }

        // Create conversation elements
        sortedContacts.forEach(contact => {
            if (!contact || !contact.userId) return;

            const isSelected = this.selectedChat && this.selectedChat.userId === contact.userId;
            const conversationElement = window.conversationComponents.createConversationElement(
                contact,
                isSelected,
                window.authService.currentUser
            );

            conversationElement.addEventListener('click', () => this.selectChat(contact));
            conversationsList.appendChild(conversationElement);
        });
    }

    sortContacts(contacts) {
        return [...contacts].sort((a, b) => {
            // Prioritize by last message time, then alphabetically
            if (a.lastSent && b.lastSent) {
                const aTime = new Date(a.lastSent).getTime();
                const bTime = new Date(b.lastSent).getTime();
                if (aTime !== bTime) return bTime - aTime;
            } else if (a.lastSent) return -1;
            else if (b.lastSent) return 1;

            // Alphabetical fallback
            const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim();
            const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim();
            return aName.localeCompare(bName);
        });
    }

    updateMessages(allMessages) {
        if (!this.selectedChat || !allMessages[this.selectedChat.userId]) return;

        const messages = allMessages[this.selectedChat.userId];
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;

        // Clear existing messages
        messagesContainer.innerHTML = '';

        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-messages">
                    <p>No messages yet. Start a conversation!</p>
                </div>
            `;
            return;
        }

        // Add messages
        messages.forEach(message => {
            const isOwnMessage = message.senderId === window.authService.currentUser?.id;
            const avatar = isOwnMessage
                ? window.authService.currentUser?.avatar
                : this.selectedChat?.avatar;

            const messageElement = window.messageComponents.createMessageElement(
                message,
                isOwnMessage,
                avatar,
                window.authService.currentUser
            );

            messagesContainer.appendChild(messageElement);
        });

        // Scroll to bottom
        this.scrollToBottom();
    }

    updateTypingIndicators(typingUsers) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (!typingIndicator || !this.selectedChat) return;

        const isTyping = typingUsers[this.selectedChat.userId];

        if (isTyping) {
            typingIndicator.style.display = 'flex';
        } else {
            typingIndicator.style.display = 'none';
        }
    }

    updateUnreadCounts(unreadCounts) {
        // Update badge count in app
        const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
        window.electronAPI.setBadgeCount(totalUnread);

        // Update conversation list will be handled in updateConversationsList
    }

    scrollToBottom() {
        setTimeout(() => {
            const messagesList = document.getElementById('messages-list');
            if (messagesList) {
                messagesList.scrollTop = messagesList.scrollHeight;
            }
        }, 100);
    }

    switchEmojiCategory(category) {
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update emoji grid
        window.emojiPicker.populateEmojiGrid(category);
    }

    showNewMessageModal() {
        const modal = document.getElementById('new-message-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadContactsForModal();
        }
    }

    hideNewMessageModal() {
        const modal = document.getElementById('new-message-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async loadContactsForModal() {
        // Implementation would load available contacts for new message
        // This would integrate with your friend service
        console.log('Loading contacts for new message modal');
    }

    showSettings() {
        console.log('Show settings modal');
        // TODO: Implement settings modal
    }

    async loadInitialData() {
        try {
            // Load contacts
            await window.chatService.loadContacts();
            console.log('Initial data loaded');
        } catch (error) {
            console.error('Error loading initial data:', error);
            window.showToast('Failed to load data', 'error');
        }
    }
}