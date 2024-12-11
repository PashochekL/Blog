export const showNotification = (message, type = "danger") => {
    const notification = document.createElement('div');
    notification.classList.add('alert', 'alert-dismissible', 'fade', 'show', 'mb-2', `alert-${type}`);
    notification.setAttribute('role', 'alert');
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <div>${message}</div>
        </div>
    `;

    const container = document.getElementById('notificationContainer');
    container.appendChild(notification);

    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';

    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('fade');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
};