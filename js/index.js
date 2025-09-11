let currentLang = localStorage.getItem('gomoku_lang') || 'en';

function updateLangUI() {
    document.getElementById('welcomeText').textContent = LANG[currentLang].homeTitle;
    document.getElementById('playFriendBtn').textContent = LANG[currentLang].playWithFriend;
    document.getElementById('playComputerBtn').textContent = LANG[currentLang].playWithComputer;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("Current Language:", currentLang);
    updateLangUI();

    const gearBtn = document.getElementById('langGearBtn');
    const dropdown = document.getElementById('langDropdown');

    gearBtn.onclick = function(e) {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    };

    // Hide dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdown.style.display = 'none';
    });

    // Handle language selection
    document.querySelectorAll('.lang-option').forEach(function(option) {
        option.onclick = function(e) {
            e.stopPropagation();
            currentLang = this.getAttribute('data-lang');
            localStorage.setItem('gomoku_lang', currentLang);
            updateLangUI();
            dropdown.style.display = 'none';
        };
    });
});