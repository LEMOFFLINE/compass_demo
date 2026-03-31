// 获取DOM元素
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const sidebar = document.getElementById('sidebar');
const chatSection = document.getElementById('chatSection');
const outputSection = document.getElementById('outputSection');
const conversationList = document.getElementById('conversationList');
const newChatBtn = document.getElementById('newChatBtn');

// 状态管理
let hasUserResponded = false;
let conversations = [
    {
        id: 1,
        title: '新对话',
        time: '刚刚',
        messages: [
            { type: 'ai', content: '你好，我是你的创业助手。有什么我可以帮你的吗？' }
        ],
        files: []
    },
    {
        id: 2,
        title: '商业模式设计',
        time: '2小时前',
        messages: [
            { type: 'ai', content: '你好，我是你的创业助手。有什么我可以帮你的吗？' },
            { type: 'user', content: '帮我设计一个SaaS产品的商业模式' },
            { type: 'ai', content: '好的！让我帮你设计一个SaaS商业模式。我们需要考虑目标市场、定价策略、获客渠道等关键要素...' }
        ],
        files: [
            { name: 'src', type: 'folder' },
            { name: 'business-model.md', type: 'file' },
            { name: 'market-analysis.md', type: 'file' },
            { name: 'pricing-strategy.md', type: 'file' }
        ]
    },
    {
        id: 3,
        title: '融资计划书',
        time: '昨天',
        messages: [
            { type: 'ai', content: '你好，我是你的创业助手。有什么我可以帮你的吗？' },
            { type: 'user', content: '如何撰写天使轮融资计划书？' },
            { type: 'ai', content: '天使轮融资计划书需要包含以下核心内容：团队介绍、市场痛点、解决方案、商业模式、财务预测等...' }
        ],
        files: [
            { name: 'pitch-deck', type: 'folder' },
            { name: 'pitch-deck/slides.md', type: 'file' },
            { name: 'financial-projection.xlsx', type: 'file' },
            { name: 'team-profiles.md', type: 'file' },
            { name: 'investor-FAQ.md', type: 'file' }
        ]
    }
];
let currentConversationId = 1;

// 移动端标签切换
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // 更新标签状态
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 切换内容区域
        sidebar.classList.remove('active');
        chatSection.classList.remove('active');
        outputSection.classList.remove('active');

        if (tab === 'sidebar') {
            sidebar.classList.add('active');
        } else if (tab === 'chat') {
            chatSection.classList.add('active');
        } else if (tab === 'output') {
            outputSection.classList.add('active');
        }
    });
});

// 初始化移动端显示状态
function initMobileView() {
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        chatSection.classList.add('active');
        outputSection.classList.remove('active');
    }
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        chatSection.classList.remove('active');
        outputSection.classList.remove('active');
    } else {
        // 保持当前选中的标签
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            activeTab.click();
        }
    }
});

// 输入框自适应高度
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
});

// 添加用户消息
function addUserMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';

    messageDiv.innerHTML = `
        <div class="message-avatar">我</div>
        <div class="message-content">${escapeHtml(content)}</div>
    `;

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// 添加AI消息
function addAIMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';

    messageDiv.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">${escapeHtml(content)}</div>
    `;

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// HTML转义，防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 滚动到底部
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 初始化
initMobileView();
renderConversationList();
const initialConv = conversations.find(c => c.id === currentConversationId);
if (initialConv) {
    renderFiles(initialConv.files || []);
}

// 渲染对话列表
function renderConversationList() {
    conversationList.innerHTML = '';
    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = `conversation-item ${conv.id === currentConversationId ? 'active' : ''}`;
        item.dataset.id = conv.id;
        item.innerHTML = `
            <div class="conversation-title">${escapeHtml(conv.title)}</div>
            <div class="conversation-time">${conv.time}</div>
        `;
        item.addEventListener('click', () => switchConversation(conv.id));
        conversationList.appendChild(item);
    });
}

// 切换对话
function switchConversation(id) {
    currentConversationId = id;
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    // 更新UI
    renderConversationList();
    renderMessages(conv.messages);
    renderFiles(conv.files || []);

    // 移动端：切换到对话视图
    if (window.innerWidth <= 768) {
        document.querySelector('[data-tab="chat"]').click();
    }
}

// 渲染消息
function renderMessages(messages) {
    chatMessages.innerHTML = '';
    messages.forEach(msg => {
        if (msg.type === 'ai') {
            addAIMessage(msg.content);
        } else {
            addUserMessage(msg.content);
        }
    });
}

// 渲染文件列表
function renderFiles(files) {
    const outputList = document.getElementById('outputList');
    if (!outputList) return;

    outputList.innerHTML = '';

    if (!files || files.length === 0) {
        // 显示空状态
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon">✨</div>
            <p>AI将在这里生成计划文件</p>
        `;
        outputList.appendChild(emptyState);
        return;
    }

    // 创建项目容器
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';

    const currentConv = conversations.find(c => c.id === currentConversationId);

    // 项目头部
    const projectHeader = document.createElement('div');
    projectHeader.className = 'project-header';
    projectHeader.innerHTML = `
        <div class="project-icon">📁</div>
        <div class="project-info">
            <h3>${currentConv ? currentConv.title : '项目文件'}</h3>
            <p>创建于 ${currentConv ? currentConv.time : '刚刚'}</p>
        </div>
    `;
    projectItem.appendChild(projectHeader);

    // 文件树
    const fileTree = document.createElement('div');
    fileTree.className = 'file-tree';

    files.forEach(file => {
        const treeItem = document.createElement('div');
        treeItem.className = `tree-item ${file.type}`;
        const icon = file.type === 'folder' ? '📂' : '📄';
        treeItem.innerHTML = `
            <span class="tree-icon">${icon}</span>
            <span class="tree-name">${file.name}</span>
        `;
        treeItem.addEventListener('click', () => {
            console.log('点击了文件:', file.name);
            // 这里可以添加打开文件的逻辑
        });
        fileTree.appendChild(treeItem);
    });

    projectItem.appendChild(fileTree);
    outputList.appendChild(projectItem);
}

// 新建对话
newChatBtn.addEventListener('click', () => {
    const newId = Math.max(...conversations.map(c => c.id)) + 1;
    const newConv = {
        id: newId,
        title: '新对话',
        time: '刚刚',
        messages: [
            { type: 'ai', content: '你好，我是你的创业助手。有什么我可以帮你的吗？' }
        ],
        files: []
    };
    conversations.unshift(newConv);
    switchConversation(newId);

    // 移动端：切换到对话视图
    if (window.innerWidth <= 768) {
        document.querySelector('[data-tab="chat"]').click();
    }
});

// 更新对话标题（根据第一条用户消息）
function updateConversationTitle(conversation) {
    const firstUserMsg = conversation.messages.find(m => m.type === 'user');
    if (firstUserMsg) {
        conversation.title = firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '');
        renderConversationList();
    }
}

// 发送消息
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;

    const conv = conversations.find(c => c.id === currentConversationId);
    if (!conv) return;

    // 添加用户消息
    addUserMessage(content);
    conv.messages.push({ type: 'user', content });

    // 更新对话标题
    if (conv.messages.filter(m => m.type === 'user').length === 1) {
        updateConversationTitle(conv);
    }

    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // 标记用户已回复
    hasUserResponded = true;

    // AI不再回复（根据需求）
}

// 发送按钮点击事件
sendBtn.addEventListener('click', sendMessage);

// 回车发送（Shift+Enter换行）
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 文件树项点击事件（示例）
document.querySelectorAll('.tree-item').forEach(item => {
    item.addEventListener('click', () => {
        const fileName = item.querySelector('.tree-name').textContent;
        console.log('点击了文件:', fileName);
        // 这里可以添加打开文件或预览的逻辑
    });
});

// 新建文件按钮
document.getElementById('newFileBtn')?.addEventListener('click', () => {
    console.log('创建新文件');
    // 这里可以添加创建新文件的逻辑
});
