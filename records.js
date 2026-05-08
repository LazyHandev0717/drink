const MAX_PLAYS = 2;

function getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getPlayRecords() {
    const records = localStorage.getItem('playRecords');
    return records ? JSON.parse(records) : {};
}

function savePlayRecords(data) {
    localStorage.setItem('playRecords', JSON.stringify(data));
}

function getTypeName(type) {
    switch(type) {
        case 'free': return '免费参与';
        case 'paid': return '付费参与';
        case 'drink': return '购饮赠送';
        default: return type;
    }
}

function getTypeBadge(type) {
    switch(type) {
        case 'free': return '<span class="player-type-badge player-type-free">免费</span>';
        case 'paid': return '<span class="player-type-badge player-type-paid">付费</span>';
        case 'drink': return '<span class="player-type-badge player-type-drink">购饮</span>';
        default: return type;
    }
}

function loadRecords() {
    const data = getPlayRecords();
    renderTable(data);
}

function renderTable(data) {
    const tbody = document.getElementById('records-body');
    
    if (!data || Object.keys(data).length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">暂无记录</td></tr>';
        return;
    }
    
    const records = [];
    for (const key in data) {
        const [date, studentId] = key.split('_');
        records.push({
            date,
            studentId,
            count: data[key],
            type: 'free'
        });
    }
    
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    records.forEach(record => {
        const isToday = record.date === getTodayDate();
        const remaining = MAX_PLAYS - record.count;
        
        let status = '<span class="badge badge-ok">正常</span>';
        if (isToday && remaining <= 0) {
            status = '<span class="badge badge-limited">已用完</span>';
        }
        
        html += `
            <tr>
                <td>${record.date}</td>
                <td>${record.studentId}</td>
                <td>${record.count}次 ${status}</td>
                <td>${getTypeBadge(record.type)}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 6px 15px; font-size: 0.8rem;" onclick="deleteRecord('${record.date}', '${record.studentId}')">删除</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function showAddModal() {
    document.getElementById('add-date').value = getTodayDate();
    document.getElementById('add-student-id').value = '';
    document.getElementById('add-player-type').value = 'free';
    document.getElementById('add-modal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('add-modal').classList.remove('active');
}

function addRecord() {
    const date = document.getElementById('add-date').value;
    const studentId = document.getElementById('add-student-id').value.trim();
    const playerType = document.getElementById('add-player-type').value;
    
    if (!date || !studentId) {
        alert('请填写完整信息！');
        return;
    }
    
    const data = getPlayRecords();
    const key = `${date}_${studentId}`;
    
    if (!data[key]) {
        data[key] = 0;
    }
    
    if (data[key] >= MAX_PLAYS) {
        alert('该学号当日次数已达上限！');
        return;
    }
    
    data[key]++;
    savePlayRecords(data);
    
    closeAddModal();
    loadRecords();
    alert('添加成功！');
}

function deleteRecord(date, studentId) {
    document.getElementById('confirm-message').textContent = '确定要删除这条记录吗？';
    document.getElementById('confirm-btn').onclick = function() {
        const data = getPlayRecords();
        const key = `${date}_${studentId}`;
        delete data[key];
        savePlayRecords(data);
        
        closeConfirmModal();
        loadRecords();
    };
    document.getElementById('confirm-modal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.remove('active');
}

function confirmClear() {
    document.getElementById('confirm-message').textContent = '确定要清空所有记录吗？此操作不可撤销！';
    document.getElementById('confirm-btn').onclick = function() {
        localStorage.removeItem('playRecords');
        closeConfirmModal();
        loadRecords();
        alert('清空成功！');
    };
    document.getElementById('confirm-modal').classList.add('active');
}

function exportCSV() {
    const data = getPlayRecords();
    
    let csv = '\uFEFF日期,学号,游戏次数\n';
    for (const key in data) {
        const [date, studentId] = key.split('_');
        csv += `${date},${studentId},${data[key]}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `游戏记录_${getTodayDate()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', loadRecords);