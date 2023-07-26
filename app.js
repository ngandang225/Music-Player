/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / Pause / Seek
 * 4. CD rotate
 * 5. Next / Prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 * 
 * 11. Speed
 * 12. Display duration and ... (thời lượng bài hát và thời lượng đã phát)
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'NGANNGAN-PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
// console.log(repeatBtn);


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {}, // gõ console: app.settings -> {}
    songs: [
        {
            name: '7 Rings',
            singer: 'Ariana Grande',
            path: './assets/music/7Rings.mp3',
            image: './assets/img/7Rings_ArianaGrande.jpg'
        },
        {
            name: 'Bang Bang',
            singer: 'Jessie J, Ariana Grande, Nicki Minaj',
            path: './assets/music/BangBang.mp3',
            image: './assets/img/BangBang_JessieJ_ArianaGrande_NickiMinaj.jpg'
        },
        {
            name: 'Just Give Me A Reason',
            singer: 'Pink',
            path: './assets/music/JustGiveMeAReason.mp3',
            image: './assets/img/JustGiveMeAReason_Pink.jpg'
        },
        {
            name: 'Me Too',
            singer: 'Meghan Trainor',
            path: './assets/music/MeToo.mp3',
            image: './assets/img/MeToo_MeghanTrainor.png'
        },
        {
            name: 'Never Enough',
            singer: 'The Greatest Showman',
            path: './assets/music/NeverEnough.mp3',
            image: './assets/img/NeverEnough_TheGreatestShowman.jpg'
        },
        {
            name: 'Psycho',
            singer: 'Red Velvet',
            path: './assets/music/Psycho.mp3',
            image: './assets/img/Psycho_RedVelvet.jpg'
        },
        {
            name: 'Safe & Sound',
            singer: 'Taylor Swift, The Civil Wars',
            path: './assets/music/SafeAndSound.mp3',
            image: './assets/img/SafeAndSound_TaylorSwift_TheCivilWars.webp'
        },
        {
            name: 'The Nights',
            singer: 'Avicii',
            path: './assets/music/TheNights.mp3',
            image: './assets/img/TheNights_Avicii.jpg'
        },
        {
            name: 'Waiting For Love',
            singer: 'Avicii',
            path: './assets/music/WaitingForLove.mp3',
            image: './assets/img/WaitingForLove_Avicii.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        // console.log(123);

        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" 
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        });
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        }) 
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([ // đọc doc Animate
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        });
        // console.log(cdThumbAnimate); // Ngan
        cdThumbAnimate.pause();
        
        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            // console.log(window.scrollY);
            // console.log(document.documentElement.scrollTop);

            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            // console.log(newCdWidth);

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            // console.log(Math.random);

            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua song
        progress.onchange = function(e) {
            // console.log(audio.duration / 100 * e.target.value);
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();

            _this.render(); // Có thể remove '.active' cũ rồi add lại '.active' mới
        
            _this.scrollToActiveSong();
        }

        // Khi lùi song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random song (thêm: random lại 1 bài không nhiều lần)
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom); // đọc doc toggle
        }

        // Xử lý lặp lại 1 song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            // console.log(4); // Test xem khi hết bài hát có vào function này hay không
            
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // NÂNG CAO HƠN - CHÚ Ý 
        // Lắng nghe hàng vi click vào playlist
        playlist.onclick = function(e) {
            // console.log(e.target.closest()); // đọc doc closest

            const songNode = e.target.closest('.song:not(.active)');

            // Xử lý khi click vào song
            if (songNode || e.target.closest('.option')) {
                // console.log(e.target);

                // Xử lý click vào song
                if (songNode) {
                    // console.log(songNode.dataset.index); // thay vì là songNode.getAttribute('data-index')
                
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xử lý khi click vào option - DO IT MYSELF
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    // Bị audio che khuất những bài ở trên
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center', // nearest
            });
        }, 300);
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

        // console.log(heading, cdThumb, audio);
    },
    loadConfig: function() {
        // Cách 1:
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;

        // Cách 2:
        // Có rủi ro trong tương lai, 
        // vì nếu có vài key mình không muốn hợp nhất vào this
        Object.assign(this, this.config); 
    },
    nextSong: function() {
        this.currentIndex++;
        // console.log(this.currentIndex, this.songs.length);
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)

        // console.log(newIndex); // app.playRandomSong()

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        // Gán cấu hình từ config vào object (ứng dụng)
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe và xử lý các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();


// Test