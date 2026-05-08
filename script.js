const MAX_PLAYS = 2;
let currentTarget = '';

function getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getPlayCount(studentId) {
    const today = getTodayDate();
    const records = localStorage.getItem('playRecords');
    const data = records ? JSON.parse(records) : {};
    return data[`${today}_${studentId}`] || 0;
}

function incrementPlayCount(studentId) {
    const today = getTodayDate();
    const records = localStorage.getItem('playRecords');
    const data = records ? JSON.parse(records) : {};
    const key = `${today}_${studentId}`;
    
    if (data[key] >= MAX_PLAYS) return false;
    
    data[key] = (data[key] || 0) + 1;
    localStorage.setItem('playRecords', JSON.stringify(data));
    return true;
}

function showGameModal() {
    document.getElementById('game-player-type').value = 'free';
    document.getElementById('game-student-id').value = '';
    toggleStudentId();
    updateRemainingCount();
    document.getElementById('game-modal').classList.add('active');
}

function closeGameModal() {
    document.getElementById('game-modal').classList.remove('active');
}

function toggleStudentId() {
    const type = document.getElementById('game-player-type').value;
    const studentIdField = document.getElementById('student-id-field');
    const remainingField = document.getElementById('remaining-field');
    
    if (type === 'free') {
        studentIdField.style.display = 'block';
        remainingField.style.display = 'block';
    } else {
        studentIdField.style.display = 'none';
        remainingField.style.display = 'none';
    }
}

function updateRemainingCount() {
    const studentId = document.getElementById('game-student-id').value.trim();
    const badge = document.getElementById('remaining-count');
    
    if (!studentId) {
        badge.textContent = '请输入学号查看';
        badge.className = 'badge badge-limited';
        return;
    }
    
    const count = getPlayCount(studentId);
    const remaining = MAX_PLAYS - count;
    
    if (remaining > 0) {
        badge.textContent = `剩余次数：${remaining}次`;
        badge.className = 'badge badge-ok';
    } else {
        badge.textContent = '今日次数已用完';
        badge.className = 'badge badge-limited';
    }
}

function startGame() {
    const playerType = document.getElementById('game-player-type').value;
    const studentId = document.getElementById('game-student-id').value.trim();
    
    if (playerType === 'paid') {
        currentTarget = 'flappy';
        showPayment('flappy', 2, '笨鸟先飞游戏');
        closeGameModal();
        return;
    }
    
    if (playerType === 'free') {
        if (!studentId) {
            showAlert('请输入学号！');
            return;
        }
        if (!/^\d{8,12}$/.test(studentId)) {
            showAlert('学号格式不正确！请输入8-12位数字');
            return;
        }
        
        if (!incrementPlayCount(studentId)) {
            showAlert('今日游戏次数已用完！');
            return;
        }
    }
    
    closeGameModal();
    window.open(`flappy.html?type=${playerType}&id=${studentId}`, '_blank');
}

function showPayment(target, amount, description) {
    currentTarget = target;
    document.getElementById('payment-amount').textContent = '¥' + amount;
    document.getElementById('payment-hint').textContent = description;
    document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
    currentTarget = '';
}

function confirmPayment() {
    const urls = {
        'buy2get1': 'buy2get1.html',
        'groupbuy': 'groupbuy.html',
        'flashsale': 'flashsale.html',
        'dice': 'dice.html',
        'scratch': 'scratch.html',
        'wheel': 'wheel.html',
        'flappy': 'flappy.html?type=paid'
    };
    
    if (urls[currentTarget]) {
        window.open(urls[currentTarget], '_blank');
    }
    closePaymentModal();
}

function showAlert(message) {
    document.getElementById('alert-message').textContent = message;
    document.getElementById('alert-modal').classList.add('active');
}

function closeAlert() {
    document.getElementById('alert-modal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const studentIdInput = document.getElementById('game-student-id');
    if (studentIdInput) {
        studentIdInput.addEventListener('input', updateRemainingCount);
    }
});