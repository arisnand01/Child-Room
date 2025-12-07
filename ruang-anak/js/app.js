// Ruang Anak - Main JavaScript Application

class RuangAnakApp {
    constructor() {
        this.currentUser = null;
        this.testResults = [];
        this.artworks = [];
        this.selectedColor = '#000000';
        this.brushSize = 3;
        this.currentTool = 'pen';
        this.isDrawing = false;
        this.canvas = null;
        this.ctx = null;
        this.init();
    }

    init() {
        this.initializeCanvas();
        this.loadSampleData();
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    // Initialize drawing canvas
    initializeCanvas() {
        this.canvas = document.getElementById('drawingCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setupDrawingEvents();
        }
    }

    // Setup drawing events
    setupDrawingEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                this.selectedColor = e.target.value;
            });
        }

        // Brush size
        const brushSize = document.getElementById('brushSize');
        if (brushSize) {
            brushSize.addEventListener('change', (e) => {
                this.brushSize = e.target.value;
            });
        }
    }

    // Drawing functions
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';

        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.selectedColor;
        }

        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    // Tool selection
    selectTool(tool) {
        this.currentTool = tool;
        this.updateToolButtons();
    }

    updateToolButtons() {
        document.querySelectorAll('.btn-group button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    // Clear canvas
    clearCanvas() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // Save artwork
    saveArtwork() {
        if (!this.canvas) return;

        const dataURL = this.canvas.toDataURL('image/png');
        const artwork = {
            id: Date.now(),
            title: `Karya Anak - ${new Date().toLocaleDateString()}`,
            image: dataURL,
            date: new Date().toISOString(),
            artist: this.currentUser?.name || 'Anonim'
        };

        this.artworks.push(artwork);
        this.saveToLocalStorage();
        this.showToast('Karya berhasil disimpan!', 'success');
        this.updateArtGallery();
    }

    // Self-Recognition Test Functions
    startSelfTest() {
        const modal = new bootstrap.Modal(document.getElementById('selfTestModal'));
        this.loadTestQuestions();
        modal.show();
    }

    loadTestQuestions() {
        const testContent = document.getElementById('testContent');
        const questions = this.generateTestQuestions();
        
        let html = '<div class="test-container">';
        html += '<h4 class="mb-4">Tes Mengenali Diri Anak (Usia 5-13 Tahun)</h4>';
        html += '<div class="progress mb-4">';
        html += '<div class="progress-bar progress-bar-striped" role="progressbar" style="width: 0%" id="testProgress"></div>';
        html += '</div>';
        
        questions.forEach((q, index) => {
            html += `
                <div class="question-card" id="question-${index}" style="display: ${index === 0 ? 'block' : 'none'}">
                    <h5>Pertanyaan ${index + 1}: ${q.question}</h5>
                    <div class="options">
                        ${q.options.map((option, optIndex) => `
                            <button class="option-button" onclick="app.selectAnswer(${index}, ${optIndex}, '${option}')">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '<div class="text-center mt-4">';
        html += '<button class="btn btn-primary" onclick="app.nextQuestion()" id="nextBtn" style="display: none;">Lanjut</button>';
        html += '<button class="btn btn-success" onclick="app.finishTest()" id="finishBtn" style="display: none;">Selesaikan Tes</button>';
        html += '</div>';
        html += '</div>';
        
        testContent.innerHTML = html;
        this.currentQuestion = 0;
        this.testAnswers = [];
    }

    generateTestQuestions() {
        return [
            {
                question: "Apa warna favoritmu?",
                options: ["Merah", "Biru", "Hijau", "Kuning", "Ungu"],
                type: "personality"
            },
            {
                question: "Berapa hasil dari 5 + 3?",
                options: ["6", "7", "8", "9", "10"],
                type: "knowledge"
            },
            {
                question: "Apa hobi yang paling kamu suka?",
                options: ["Menggambar", "Bercerita", "Bermain bola", "Membaca", "Bernyanyi"],
                type: "personality"
            },
            {
                question: "Hari apa setelah hari Senin?",
                options: ["Minggu", "Selasa", "Rabu", "Kamis", "Jumat"],
                type: "knowledge"
            },
            {
                question: "Ketika sedih, kamu biasanya...",
                options: ["Menyendiri", "Mencari teman", "Menggambar", "Bermain", "Bercerita"],
                type: "personality"
            }
        ];
    }

    selectAnswer(questionIndex, optionIndex, answer) {
        this.testAnswers[questionIndex] = answer;
        
        // Update UI
        document.querySelectorAll(`#question-${questionIndex} .option-button`).forEach((btn, index) => {
            btn.classList.toggle('selected', index === optionIndex);
        });

        // Show next button
        const nextBtn = document.getElementById('nextBtn');
        const finishBtn = document.getElementById('finishBtn');
        
        if (questionIndex < this.generateTestQuestions().length - 1) {
            nextBtn.style.display = 'inline-block';
        } else {
            finishBtn.style.display = 'inline-block';
        }

        // Update progress
        const progress = ((questionIndex + 1) / this.generateTestQuestions().length) * 100;
        document.getElementById('testProgress').style.width = progress + '%';
    }

    nextQuestion() {
        if (this.currentQuestion < this.generateTestQuestions().length - 1) {
            document.getElementById(`question-${this.currentQuestion}`).style.display = 'none';
            this.currentQuestion++;
            document.getElementById(`question-${this.currentQuestion}`).style.display = 'block';
            document.getElementById('nextBtn').style.display = 'none';
        }
    }

    finishTest() {
        this.calculateTestResults();
    }

    calculateTestResults() {
        const knowledgeScore = this.testAnswers.filter((_, index) => 
            this.generateTestQuestions()[index].type === 'knowledge'
        ).length;

        const personalityType = this.analyzePersonality();
        
        const results = {
            knowledgeScore: knowledgeScore * 20,
            personalityType: personalityType,
            date: new Date().toISOString()
        };

        this.testResults.push(results);
        this.saveToLocalStorage();
        this.displayTestResults(results);
    }

    analyzePersonality() {
        // Simple personality analysis based on answers
        const personalityTypes = {
            creative: "Kreatif dan Artistik",
            social: "Sosial dan Ekstrovert",
            analytical: "Analitis dan Logis",
            empathetic: "Empatis dan Peduli",
            adventurous: "Petualang dan Energik"
        };

        // This would normally analyze the actual answers
        const types = Object.keys(personalityTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        return personalityTypes[randomType];
    }

    displayTestResults(results) {
        const testContent = document.getElementById('testContent');
        
        let html = `
            <div class="result-card text-center">
                <h4>Hasil Tes Selesai!</h4>
                <div class="result-score">${results.knowledgeScore}%</div>
                <p>Skor Pengetahuan Umum</p>
                
                <div class="result-interpretation">
                    <h5>Tipe Kepribadian: ${results.personalityType}</h5>
                    <p>Berdasarkan jawaban Anda, anak memiliki tipe kepribadian ${results.personalityType.toLowerCase()}. 
                    Terus kembangkan potensi ini dengan kegiatan yang sesuai!</p>
                </div>
                
                <div class="mt-4">
                    <button class="btn btn-light" onclick="app.printResults()">Cetak Hasil</button>
                    <button class="btn btn-warning" onclick="app.shareResults()">Bagikan Hasil</button>
                </div>
            </div>
        `;
        
        testContent.innerHTML = html;
    }

    // Video Call Functions
    startVideoCall(type) {
        const modal = new bootstrap.Modal(document.getElementById('videoCallModal'));
        const callTitle = document.getElementById('callTitle');
        
        if (type === 'art') {
            callTitle.textContent = 'Kelas Seni Online';
        } else if (type === 'consultation') {
            callTitle.textContent = 'Konsultasi Parenting';
        }
        
        modal.show();
        this.showToast('Memulai panggilan video...', 'info');
        
        // Simulate video connection
        setTimeout(() => {
            document.getElementById('videoContainer').innerHTML = `
                <div class="text-center text-white">
                    <i class="fas fa-user-circle fa-5x mb-3"></i>
                    <h5>${callTitle.textContent}</h5>
                    <p>Sedang menghubungi...</p>
                </div>
            `;
        }, 2000);
    }

    endVideoCall() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('videoCallModal'));
        modal.hide();
        this.showToast('Panggilan video diakhiri', 'info');
    }

    toggleMute() {
        this.showToast('Mute/Unmute audio', 'info');
    }

    toggleVideo() {
        this.showToast('On/Off kamera', 'info');
    }

    // Payment Functions
    showPaymentModal() {
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    }

    processPayment() {
        const name = document.getElementById('donorName').value;
        const email = document.getElementById('donorEmail').value;
        const amount = document.getElementById('donationAmount').value;
        const method = document.getElementById('paymentMethod').value;

        if (!name || !email || !amount) {
            this.showToast('Mohon lengkapi semua field', 'error');
            return;
        }

        // Simulate payment processing
        this.showToast('Memproses pembayaran...', 'info');
        
        setTimeout(() => {
            this.showToast(`Terima kasih ${name}! Dukungan sebesar Rp ${amount} telah diterima.`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
            
            // Clear form
            document.getElementById('donorName').value = '';
            document.getElementById('donorEmail').value = '';
            document.getElementById('donationAmount').value = '';
        }, 2000);
    }

    // Social Media Integration
    shareToSocial(platform, content) {
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}&url=${encodeURIComponent(window.location.href)}`,
            instagram: `https://www.instagram.com/`,
            tiktok: `https://www.tiktok.com/`,
            youtube: `https://www.youtube.com/`
        };

        window.open(urls[platform], '_blank', 'width=600,height=400');
    }

    // Gallery Functions
    updateArtGallery() {
        const gallery = document.getElementById('artGallery');
        if (!gallery) return;

        let html = '';
        this.artworks.forEach(artwork => {
            html += `
                <div class="col-md-4">
                    <div class="artwork-card">
                        <img src="${artwork.image}" alt="${artwork.title}">
                        <div class="artwork-overlay">
                            <h6>${artwork.title}</h6>
                            <p>Seniman: ${artwork.artist}</p>
                            <div class="social-share">
                                <a href="#" class="social-btn social-facebook" onclick="app.shareToSocial('facebook', 'Lihat karya amazing ini!')">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" class="social-btn social-instagram" onclick="app.shareToSocial('instagram', 'Karya seni yang luar biasa!')">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="#" class="social-btn social-tiktok" onclick="app.shareToSocial('tiktok', 'Check out this artwork!')">
                                    <i class="fab fa-tiktok"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        gallery.innerHTML = html || '<p class="text-center">Belum ada karya. Mulai membuat karya pertama Anda!</p>';
    }

    // Books Library Functions
    showDigitalBooks() {
        const books = [
            { title: "Panduan Seni Lukis Untuk Pemula", author: "Tim Ruang Anak", pages: 120 },
            { title: "Kreativitas Anak Melalui Seni Rupa", author: "Dr. Arti Pendidikan", pages: 150 },
            { title: "Teknik Menggambar Dasar", author: "Guru Seni Ruang Anak", pages: 100 }
        ];

        let html = '<div class="row">';
        books.forEach(book => {
            html += `
                <div class="col-md-4 mb-4">
                    <div class="book-card">
                        <div class="book-cover" style="background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-book fa-3x text-white"></i>
                        </div>
                        <h6>${book.title}</h6>
                        <p class="text-muted">${book.author}</p>
                        <p class="small">${book.pages} halaman</p>
                        <button class="btn btn-primary btn-sm" onclick="app.downloadBook('${book.title}')">
                            <i class="fas fa-download"></i> Unduh PDF
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        this.showModal('Buku Digital Gratis', html);
    }

    showPrintBooks() {
        const books = [
            { title: "Seni Lukis Komplit", price: 125000, isbn: "978-123-456-789" },
            { title: "Album Karya Anak Indonesia", price: 150000, isbn: "978-123-456-790" }
        ];

        let html = '<div class="row">';
        books.forEach(book => {
            html += `
                <div class="col-md-6 mb-4">
                    <div class="book-card">
                        <div class="book-cover" style="background: linear-gradient(135deg, #f093fb, #f5576c); display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-book fa-3x text-white"></i>
                        </div>
                        <h6>${book.title}</h6>
                        <p class="text-danger">Rp ${book.price.toLocaleString()}</p>
                        <p class="small text-muted">ISBN: ${book.isbn}</p>
                        <button class="btn btn-success btn-sm" onclick="app.orderPrintBook('${book.title}')">
                            <i class="fas fa-shopping-cart"></i> Pesan Cetak
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        this.showModal('Buku Cetak Berbayar', html);
    }

    downloadBook(title) {
        this.showToast(`Mengunduh "${title}"...`, 'info');
        setTimeout(() => {
            this.showToast(`"${title}" berhasil diunduh!`, 'success');
        }, 2000);
    }

    orderPrintBook(title) {
        this.showToast(`Memproses pemesanan "${title}"...`, 'info');
        setTimeout(() => {
            this.showToast(`"${title}" berhasil dipesan! Kami akan menghubungi Anda segera.`, 'success');
        }, 2000);
    }

    // Video Library Functions
    showVideoLibrary() {
        const videos = [
            { title: "Belajar Menggambar Dasar", duration: "15:30", category: "Teknik Dasar" },
            { title: "Warna-Warni Ceria", duration: "20:15", category: "Teori Warna" },
            { title: "Menggambar Pemandangan", duration: "25:45", category: "Praktek" }
        ];

        let html = '<div class="row">';
        videos.forEach(video => {
            html += `
                <div class="col-md-4 mb-4">
                    <div class="video-card">
                        <div class="video-thumbnail" style="background: linear-gradient(135deg, #667eea, #764ba2); position: relative;">
                            <div class="video-play-btn" onclick="app.playVideo('${video.title}')">
                                <i class="fas fa-play text-primary"></i>
                            </div>
                        </div>
                        <div class="card-body">
                            <h6>${video.title}</h6>
                            <p class="text-muted small">${video.category} • ${video.duration}</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-primary" onclick="app.playVideo('${video.title}')">
                                    <i class="fas fa-play"></i> Putar
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="app.downloadVideo('${video.title}')">
                                    <i class="fas fa-download"></i> Unduh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        this.showModal('Perpustakaan Video', html);
    }

    playVideo(title) {
        this.showToast(`Memutar video: ${title}`, 'info');
    }

    downloadVideo(title) {
        this.showToast(`Mengunduh video: ${title}`, 'info');
    }

    // Feedback Functions
    showFeedbackModal() {
        const html = `
            <div class="feedback-form">
                <h5>Kirim Feedback Anda</h5>
                <div class="mb-3">
                    <label class="form-label">Nama:</label>
                    <input type="text" class="form-control" id="feedbackName">
                </div>
                <div class="mb-3">
                    <label class="form-label">Email:</label>
                    <input type="email" class="form-control" id="feedbackEmail">
                </div>
                <div class="mb-3">
                    <label class="form-label">Kategori:</label>
                    <select class="form-control" id="feedbackCategory">
                        <option value="saran">Saran</option>
                        <option value="kritik">Kritik</option>
                        <option value="keluhan">Keluhan</option>
                        <option value="pujian">Pujian</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Pesan Anda:</label>
                    <textarea class="feedback-textarea" id="feedbackMessage" placeholder="Tulis pesan Anda di sini..."></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">
                        <input type="checkbox" id="videoFeedback"> Saya ingin mengirim feedback via video
                    </label>
                </div>
                <button class="btn btn-primary" onclick="app.submitFeedback()">Kirim Feedback</button>
            </div>
        `;

        this.showModal('Hubungi Kami', html);
    }

    submitFeedback() {
        const name = document.getElementById('feedbackName').value;
        const email = document.getElementById('feedbackEmail').value;
        const category = document.getElementById('feedbackCategory').value;
        const message = document.getElementById('feedbackMessage').value;
        const videoFeedback = document.getElementById('videoFeedback').checked;

        if (!name || !email || !message) {
            this.showToast('Mohon lengkapi semua field yang diperlukan', 'error');
            return;
        }

        if (videoFeedback) {
            this.startVideoCall('feedback');
        } else {
            this.showToast('Feedback Anda telah terkirim! Terima kasih.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('genericModal')).hide();
        }
    }

    // Utility Functions
    showModal(title, content) {
        const modalHtml = `
            <div class="modal fade" id="genericModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('genericModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('genericModal'));
        modal.show();
    }

    showToast(message, type = 'info') {
        const toastHtml = `
            <div class="custom-toast toast-${type}">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Create toast container if doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Add toast
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        // Remove toast after 3 seconds
        setTimeout(() => {
            const toast = toastContainer.lastElementChild;
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showToast('Selamat datang di Ruang Anak! Platform kreativitas untuk anak Indonesia.', 'info');
        }, 1000);
    }

    // Local Storage Functions
    saveToLocalStorage() {
        localStorage.setItem('ruangAnak_artworks', JSON.stringify(this.artworks));
        localStorage.setItem('ruangAnak_testResults', JSON.stringify(this.testResults));
    }

    loadFromLocalStorage() {
        const artworks = localStorage.getItem('ruangAnak_artworks');
        const testResults = localStorage.getItem('ruangAnak_testResults');

        if (artworks) this.artworks = JSON.parse(artworks);
        if (testResults) this.testResults = JSON.parse(testResults);
    }

    loadSampleData() {
        this.loadFromLocalStorage();
        
        // Load sample artworks if none exist
        if (this.artworks.length === 0) {
            this.loadSampleArtworks();
        }
        
        this.updateArtGallery();
    }

    loadSampleArtworks() {
        // Generate sample artwork placeholders
        const sampleArtworks = [
            {
                id: Date.now() + 1,
                title: 'Pemandangan Indah',
                image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%2366eea" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white">Sample 1</text></svg>',
                date: new Date().toISOString(),
                artist: 'Anak Seniman 1'
            },
            {
                id: Date.now() + 2,
                title: 'Pelangi Ceria',
                image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23f093fb" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white">Sample 2</text></svg>',
                date: new Date().toISOString(),
                artist: 'Anak Seniman 2'
            }
        ];

        this.artworks = sampleArtworks;
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            // Handle form submissions
        });
    }

    // Print results
    printResults() {
        window.print();
    }

    // Share results
    shareResults() {
        const text = 'Saya baru saja menyelesaikan tes di Ruang Anak! Hasilnya amazing!';
        this.shareToSocial('facebook', text);
    }
}

// Global functions for onclick handlers
let app;

function showTestModal() {
    app.startSelfTest();
}

function showArtTestModal() {
    const modal = new bootstrap.Modal(document.getElementById('artTestModal'));
    modal.show();
}

function startSelfTest() {
    app.startSelfTest();
}

function startArtTest() {
    showArtTestModal();
}

function selectTool(tool) {
    app.selectTool(tool);
}

function clearCanvas() {
    app.clearCanvas();
}

function saveArtwork() {
    app.saveArtwork();
}

function showPaymentModal() {
    app.showPaymentModal();
}

function processPayment() {
    app.processPayment();
}

function bookArtClass() {
    app.startVideoCall('art');
}

function bookConsultation() {
    app.startVideoCall('consultation');
}

function startVideoCall() {
    app.startVideoCall();
}

function endVideoCall() {
    app.endVideoCall();
}

function toggleMute() {
    app.toggleMute();
}

function toggleVideo() {
    app.toggleVideo();
}

function showDigitalBooks() {
    app.showDigitalBooks();
}

function showPrintBooks() {
    app.showPrintBooks();
}

function showVideoLibrary() {
    app.showVideoLibrary();
}

function showFeedbackModal() {
    app.showFeedbackModal();
}

function submitFeedback() {
    app.submitFeedback();
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    app = new RuangAnakApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuangAnakApp;
}