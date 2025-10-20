/**
 * Utility Helper Functions
 * Common utilities used across the application
 */

export function getRelativeTime(dateString) {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months}mo ago`;
    } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years}y ago`;
    }
}

export function makeUrlsClickable(text) {
    if (!text) return text;
    
    // Make URLs clickable
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let result = text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--wa-color-primary); text-decoration: underline;">${url}</a>`;
    });
    
    // Make @mentions clickable
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    result = result.replace(mentionRegex, (match, username) => {
        return `<a href="https://x.com/${username}" target="_blank" rel="noopener noreferrer" style="color: var(--wa-color-primary); text-decoration: none; font-weight: 500;">@${username}</a>`;
    });
    
    return result;
}

export function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `${type}-message`;
    messageEl.textContent = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '1rem';
    messageEl.style.right = '1rem';
    messageEl.style.zIndex = '1000';
    messageEl.style.maxWidth = '300px';
    messageEl.style.padding = '1rem';
    messageEl.style.borderRadius = 'var(--wa-border-radius)';
    messageEl.style.background = type === 'error' ? 'var(--wa-color-danger)' : 'var(--wa-color-success)';
    messageEl.style.color = 'white';
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

export function showLoading(message = 'Loading...') {
    let loadingEl = document.getElementById('global-loading');
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'global-loading';
        loadingEl.className = 'loading-state';
        loadingEl.style.position = 'fixed';
        loadingEl.style.top = '50%';
        loadingEl.style.left = '50%';
        loadingEl.style.transform = 'translate(-50%, -50%)';
        loadingEl.style.zIndex = '1000';
        loadingEl.style.background = 'var(--wa-color-surface-primary)';
        loadingEl.style.padding = '2rem';
        loadingEl.style.borderRadius = 'var(--wa-border-radius)';
        loadingEl.style.boxShadow = 'var(--wa-shadow-lg)';
        document.body.appendChild(loadingEl);
    }
    loadingEl.innerHTML = `
        <div class="spinner-fallback">⏳</div>
        <p>${message}</p>
    `;
    loadingEl.style.display = 'flex';
}

export function hideLoading() {
    const loadingEl = document.getElementById('global-loading');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}
