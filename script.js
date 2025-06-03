// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXr_yPbeQUnYDshzGnpr8kK6zEknQjWpU",
  authDomain: "id-card-365c4.firebaseapp.com",
  databaseURL: "https://id-card-365c4-default-rtdb.firebaseio.com",
  projectId: "id-card-365c4",
  storageBucket: "id-card-365c4.firebasestorage.app",
  messagingSenderId: "219386438054",
  appId: "1:219386438054:web:cbe29f9bc31f81be29ef67"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const themeToggle = document.getElementById('themeToggle');
const loadingOverlay = document.querySelector('.loading-overlay');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const activityList = document.querySelector('.activity-list');
const exportBtn = document.querySelector('.export-btn');
const toastContainer = document.querySelector('.toast-container');

// Navigation Buttons
const navButtons = {
    dashboard: document.querySelector('li a[href="#"]:has(.bi-speedometer2)'),
    students: document.querySelector('li a[href="#"]:has(.bi-people-fill)'),
    attendance: document.querySelector('li a[href="#"]:has(.bi-calendar-check)'),
    reports: document.querySelector('li a[href="#"]:has(.bi-file-earmark-bar-graph)'),
    settings: document.querySelector('li a[href="#"]:has(.bi-gear-fill)')
};

// Action Buttons
const viewAllBtn = document.querySelector('.view-all');
const notificationsBtn = document.querySelector('.notifications');
const filterBtn = document.querySelector('.filter-btn');
const applyFilterBtn = document.querySelector('.apply-filter');
const pageButtons = document.querySelectorAll('.page-btn');

// Sample Data
const sampleStudents = [
    { id: 'S001', name: 'John Doe', class: 'CS101', status: 'present', time: '09:15 AM' },
    { id: 'S002', name: 'Jane Smith', class: 'CS101', status: 'absent', time: '' },
    { id: 'S003', name: 'Michael Johnson', class: 'CS201', status: 'present', time: '09:20 AM' },
    { id: 'S004', name: 'Emily Davis', class: 'CS201', status: 'late', time: '10:05 AM' },
    { id: 'S005', name: 'Robert Wilson', class: 'CS101', status: 'present', time: '09:18 AM' },
    { id: 'S006', name: 'Sarah Miller', class: 'CS301', status: 'absent', time: '' },
    { id: 'S007', name: 'David Taylor', class: 'CS301', status: 'present', time: '09:22 AM' },
    { id: 'S008', name: 'Jessica Brown', class: 'CS201', status: 'present', time: '09:25 AM' },
    { id: 'S009', name: 'Thomas Anderson', class: 'CS101', status: 'late', time: '10:15 AM' },
    { id: 'S010', name: 'Lisa Martinez', class: 'CS301', status: 'present', time: '09:30 AM' }
];

const sampleActivities = [
    { name: 'John Doe', class: 'CS101', time: '09:15 AM', status: 'present' },
    { name: 'Michael Johnson', class: 'CS201', time: '09:20 AM', status: 'present' },
    { name: 'Emily Davis', class: 'CS201', time: '10:05 AM', status: 'late' },
    { name: 'Robert Wilson', class: 'CS101', time: '09:18 AM', status: 'present' },
    { name: 'David Taylor', class: 'CS301', time: '09:22 AM', status: 'present' }
];

// Current View State
let currentView = 'dashboard';
let currentFilter = {
    present: true,
    absent: true,
    late: true
};
let currentPage = 1;
const itemsPerPage = 5;

// Initialize Dashboard
function initDashboard() {
    // Simulate loading
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        initAnimations();
        renderAttendanceTable();
        renderRecentActivities();
        initCharts();
        showToast('Dashboard loaded successfully!', 'success');
        setupEventListeners();
        
        // In a real app, you would fetch data from Firebase here
        // fetchAttendanceData();
    }, 1500);
}

// Initialize Animations
function initAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translate(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Render Attendance Table
function renderAttendanceTable() {
    attendanceTableBody.innerHTML = '';
    
    // Apply filters
    const filteredStudents = sampleStudents.filter(student => {
        return (currentFilter.present && student.status === 'present') ||
               (currentFilter.absent && student.status === 'absent') ||
               (currentFilter.late && student.status === 'late');
    });
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);
    
    // Update table info
    document.querySelector('.current-entries').textContent = startIndex + 1;
    document.querySelector('.total-entries').textContent = Math.min(startIndex + itemsPerPage, filteredStudents.length);
    document.querySelector('.all-entries').textContent = filteredStudents.length;
    
    // Update pagination buttons
    updatePagination(filteredStudents.length);
    
    // Render rows
    paginatedStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>${student.time || '-'}</td>
            <td><span class="status-badge ${student.status}">${student.status}</span></td>
            <td>
                <button class="action-btn" title="Edit"><i class="bi bi-pencil-square"></i></button>
                <button class="action-btn" title="Delete"><i class="bi bi-trash"></i></button>
            </td>
        `;
        attendanceTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.querySelector('i').classList.contains('bi-pencil-square') ? 'edit' : 'delete';
            const studentId = btn.closest('tr').querySelector('td').textContent;
            handleStudentAction(action, studentId);
        });
    });
}

// Update Pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    // Clear existing buttons (keep prev/next)
    pagination.innerHTML = `
        <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}"><i class="bi bi-chevron-left"></i></button>
    `;
    
    // Add page numbers
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderAttendanceTable();
        });
        pagination.appendChild(btn);
    }
    
    // Add next button
    const nextBtn = document.createElement('button');
    nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderAttendanceTable();
        }
    });
    pagination.appendChild(nextBtn);
    
    // Add previous button functionality
    const prevBtn = pagination.querySelector('.page-btn');
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderAttendanceTable();
        }
    });
}

// Render Recent Activities
function renderRecentActivities() {
    activityList.innerHTML = '';
    
    sampleActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const iconClass = activity.status === 'present' ? 'present' : 
                         activity.status === 'absent' ? 'absent' : 'late';
        
        activityItem.innerHTML = `
            <div class="activity-icon ${iconClass}">
                <i class="bi ${iconClass === 'present' ? 'bi-check-lg' : 
                              iconClass === 'absent' ? 'bi-x-lg' : 'bi-clock'}"></i>
            </div>
            <div class="activity-details">
                <h4>${activity.name}</h4>
                <p>${activity.class} • ${activity.time}</p>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Initialize Charts
function initCharts() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [
                {
                    label: 'Present',
                    data: [320, 340, 365, 358, 390, 210],
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Absent',
                    data: [45, 32, 28, 40, 25, 15],
                    borderColor: '#f94144',
                    backgroundColor: 'rgba(249, 65, 68, 0.1)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                }
            ]
        },
        options: getChartOptions()
    });
}

// Get Chart Options (dynamic for theme)
function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--border-color'),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                }
            }
        }
    };
}

// Setup Event Listeners
function setupEventListeners() {
    // Menu Toggle for Mobile
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Navigation Buttons
    Object.entries(navButtons).forEach(([view, button]) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveView(view);
        });
    });
    
    // Export Button
    exportBtn.addEventListener('click', exportToCSV);
    
    // View All Button
    viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Showing all recent activities', 'success');
    });
    
    // Notifications Button
    notificationsBtn.addEventListener('click', showNotifications);
    
    // Filter Dropdown
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelector('.dropdown-content').classList.toggle('show');
    });
    
    // Apply Filter Button
    applyFilterBtn.addEventListener('click', applyFilters);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        const dropdown = document.querySelector('.dropdown-content');
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    });
}

// Set Active View
function setActiveView(view) {
    currentView = view;
    
    // Update active nav item
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.classList.remove('active');
    });
    navButtons[view].parentElement.classList.add('active');
    
    // Update main content title
    document.querySelector('.main-header h2').textContent = 
        `${view.charAt(0).toUpperCase() + view.slice(1)} Overview`;
    
    // Show appropriate content
    showToast(`${view.charAt(0).toUpperCase() + view.slice(1)} view loaded`, 'success');
    
    // In a real app, you would load the appropriate content for each view here
}

// Toggle Theme
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    
    const isDark = document.documentElement.classList.contains('dark');
    showToast(`Switched to ${isDark ? 'dark' : 'light'} mode`, 'success');
    
    // Reinitialize charts to update their theme
    initCharts();
}

// Apply Filters
function applyFilters() {
    currentFilter = {
        present: document.querySelector('.dropdown-content input[type="checkbox"]:nth-child(1)').checked,
        absent: document.querySelector('.dropdown-content input[type="checkbox"]:nth-child(2)').checked,
        late: document.querySelector('.dropdown-content input[type="checkbox"]:nth-child(3)').checked
    };
    
    currentPage = 1;
    renderAttendanceTable();
    document.querySelector('.dropdown-content').classList.remove('show');
    showToast('Filters applied successfully', 'success');
}

// Export to CSV
function exportToCSV() {
    let csv = 'Student ID,Name,Class,Time,Status\n';
    
    sampleStudents.forEach(student => {
        csv += `${student.id},${student.name},${student.class},${student.time || ''},${student.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast('Attendance data exported successfully', 'success');
}

// Handle Student Actions
function handleStudentAction(action, studentId) {
    if (action === 'edit') {
        showEditStudentModal(studentId);
    } else {
        if (confirm(`Are you sure you want to delete student ${studentId}?`)) {
            showToast(`Student ${studentId} deleted`, 'success');
            // In a real app, you would delete from Firebase here
        }
    }
}

// Show Edit Student Modal
function showEditStudentModal(studentId) {
    const student = sampleStudents.find(s => s.id === studentId);
    
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Student</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Student ID</label>
                        <input type="text" value="${student.id}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" value="${student.name}" id="editStudentName">
                    </div>
                    <div class="form-group">
                        <label>Class</label>
                        <input type="text" value="${student.class}" id="editStudentClass">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="editStudentStatus">
                            <option value="present" ${student.status === 'present' ? 'selected' : ''}>Present</option>
                            <option value="absent" ${student.status === 'absent' ? 'selected' : ''}>Absent</option>
                            <option value="late" ${student.status === 'late' ? 'selected' : ''}>Late</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel">Cancel</button>
                    <button class="btn-save">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.btn-cancel').addEventListener('click', closeModal);
    document.querySelector('.btn-save').addEventListener('click', () => {
        // In a real app, you would save to Firebase here
        showToast(`Student ${studentId} updated`, 'success');
        closeModal();
    });
}

// Show Notifications
function showNotifications() {
    const notifications = [
        { text: 'Attendance threshold exceeded in CS101', time: '10 mins ago', read: false },
        { text: 'New student registered: Alex Johnson', time: '2 hours ago', read: true },
        { text: 'System backup completed', time: 'Yesterday', read: true }
    ];

    const panelHTML = `
        <div class="notifications-panel">
            <div class="panel-header">
                <h4>Notifications</h4>
                <button class="panel-close">&times;</button>
            </div>
            <div class="panel-body">
                ${notifications.map(notif => `
                    <div class="notification-item ${notif.read ? 'read' : ''}">
                        <p>${notif.text}</p>
                        <small>${notif.time}</small>
                    </div>
                `).join('')}
            </div>
            <div class="panel-footer">
                <button class="mark-all-read">Mark all as read</button>
            </div>
        </div>
    `;

    const existingPanel = document.querySelector('.notifications-panel');
    if (existingPanel) {
        existingPanel.remove();
        return;
    }

    document.body.insertAdjacentHTML('beforeend', panelHTML);

    // Position the panel
    const panel = document.querySelector('.notifications-panel');
    const btnRect = notificationsBtn.getBoundingClientRect();
    panel.style.top = `${btnRect.bottom + window.scrollY}px`;
    panel.style.right = `${window.innerWidth - btnRect.right}px`;

    // Add event listeners
    document.querySelector('.panel-close').addEventListener('click', () => {
        panel.remove();
    });

    document.querySelector('.mark-all-read').addEventListener('click', () => {
        document.querySelectorAll('.notification-item').forEach(item => {
            item.classList.add('read');
        });
        notificationsBtn.querySelector('.badge').style.display = 'none';
    });
}

// Close Modal
function closeModal() {
    document.querySelector('.modal-overlay').remove();
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'bi-check-circle-fill' :
                 type === 'warning' ? 'bi-exclamation-triangle-fill' :
                 'bi-x-circle-fill';
    
    toast.innerHTML = `
        <i class="bi ${icon}"></i>
        <span>${message}</span>
        <button class="toast-close"><i class="bi bi-x"></i></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
    
    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });
}

// Fetch Data from Firebase (Example)
function fetchAttendanceData() {
    const attendanceRef = database.ref('attendance');
    
    attendanceRef.on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            // Process and display the data
            console.log('Attendance data:', data);
            // Update your UI with the real data
        } else {
            console.log('No attendance data available');
        }
    }, (error) => {
        console.error('Error fetching attendance data:', error);
        showToast('Error loading attendance data', 'error');
    });
}

// Check for saved theme preference
if (localStorage.getItem('darkMode') === 'true' || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);
