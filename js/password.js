const secret = document.getElementById('secret');
const lengthinp = document.getElementById('lengthinp');
const rangeLabel = document.getElementById("rangeLabel");
const toggleBtn = document.getElementById('toggle-visibility');
const manualInput = document.getElementById('manualInput');

let length = 24;
let specialChars = false;
let password = "";
let isPasswordVisible = true;


lengthinp.value = length;

const DefaultOptions = {
    length,
    ambiguous: false,
    number: true,
    minNumber: 1,
    uppercase: true,
    minUppercase: 0,
    lowercase: true,
    minLowercase: 0,
    special: specialChars,
    minSpecial: 1,
    numWords: 3,
    wordSeparator: "-",
    capitalize: false,
    includeNumber: false,
};
function generatePassword(options) {
    const o = { ...DefaultOptions, ...options };
    if (!o.special) o.minSpecial = 0;
    sanitizePasswordLength(o);
    const positions = shuffleArray(generatePositions(o));
    const charSets = buildCharacterSets(o);
    return positions.map(pos => randomChar(charSets[pos] || charSets.all)).join('');
}

function generatePositions(options) {
    return [
        ...Array(options.minLowercase).fill("lowercase"),
        ...Array(options.minUppercase).fill("uppercase"),
        ...Array(options.minNumber).fill("numbers"),
        ...Array(options.minSpecial).fill("special"),
        ...Array(Math.max(0, options.length - (
            options.minLowercase + options.minUppercase + options.minNumber + options.minSpecial
        ))).fill("all")
    ];
}

function buildCharacterSets({ lowercase, uppercase, number, special, ambiguous }) {
    return {
        lowercase: "abcdefghijkmnopqrstuvwxyz" + (ambiguous ? "l" : ""),
        uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ" + (ambiguous ? "IO" : ""),
        numbers: "23456789" + (ambiguous ? "01" : ""),
        special: "!@#$%^&*",
        all: (lowercase ? "abcdefghijkmnopqrstuvwxyz" : "") +
             (uppercase ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "") +
             (number ? "23456789" : "") +
             (special ? "!@#$%^&*" : "")
    };
}

const randomChar = set => set[Math.floor(Math.random() * set.length)];

function sanitizePasswordLength(options) {
    options.length = Math.max(
        options.length,
        options.uppercase ? Math.max(1, options.minUppercase) : 0,
        options.lowercase ? Math.max(1, options.minLowercase) : 0,
        options.number ? Math.max(1, options.minNumber) : 0,
        options.special ? Math.max(1, options.minSpecial) : 0
    );
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}
function updateRangeDisplay() {
    const val = +lengthinp.value;
    const percent = (val - lengthinp.min) / (lengthinp.max - lengthinp.min);
    const sliderWidth = lengthinp.offsetWidth;
    const trackWidth = sliderWidth - 16;
    const thumbCenterX = percent * trackWidth + 8;

    rangeLabel.textContent = val;
    rangeLabel.style.left = `${Math.max(Math.min(thumbCenterX, sliderWidth - rangeLabel.offsetWidth / 2), rangeLabel.offsetWidth / 2) - rangeLabel.offsetWidth / 2}px`;

    lengthinp.style.setProperty("--percent", `${(thumbCenterX / sliderWidth) * 100}%`);

    length = val;
    regeneratePass();
}
function resizeInput() {
    const span = document.getElementById("hidden-span");
    span.textContent = secret.value || " ";
    secret.style.width = `${span.offsetWidth + 50}px`;
    secret.style.height = 'auto'; 
    secret.style.height = secret.scrollHeight + 'px';
}

window.regeneratePass = () => {
    password = generatePassword({ length, special: specialChars });
    if (isPasswordVisible) {
        secret.value = password;
    } else {
        secret.value = "•".repeat(password.length);
    }
    
    resizeInput();
}

lengthinp.addEventListener('input', updateRangeDisplay);
secret.addEventListener('input', resizeInput);

window.addEventListener('load', () => {
    regeneratePass();
    updateRangeDisplay();
});

window.setSpecial = (addChars) => {
    specialChars = addChars;
    document.querySelector('#yes').classList.toggle('toggled', addChars);
    document.querySelector('#no').classList.toggle('toggled', !addChars);
    regeneratePass();
};

window.setSpecial(specialChars);

async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Copiado!');
    } catch {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    Object.assign(textArea.style, { top: "0", left: "0", position: "fixed" });
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Erro ao copiar', err);
    }
    document.body.removeChild(textArea);
}

secret.addEventListener('click', () => copyTextToClipboard(password));

if (typeof tippy !== 'undefined') {
    tippy('#secret', {
        content: "Copiado!",
        trigger: 'click',
        animation: 'shift-away',
        hideOnClick: false,
        theme: 'translucent',
        offset: [0, -12.5],
        onShow(instance) {
            setTimeout(() => instance.hide(), 500);
        }
    });
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isPasswordVisible = !isPasswordVisible;
        
        if (isPasswordVisible) {
            secret.value = password;
        } else {
            secret.value = "•".repeat(password.length); 
        }
        
        toggleBtn.innerHTML = isPasswordVisible 
            ? `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>` 
            : `<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;
        
        resizeInput(); 
    });
}

if (manualInput) {
    lengthinp.addEventListener('dblclick', () => {
        lengthinp.style.display = 'none';
        rangeLabel.style.display = 'none';
        manualInput.style.display = 'block';
        manualInput.value = length;
        manualInput.focus();
        manualInput.select();
    });

    manualInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        if (parseInt(e.target.value) > 255) {
            e.target.value = "255";
        }
        if (e.target.value !== "" && parseInt(e.target.value) < 1) {
           e.target.value = "4"; 
        }
    });

    manualInput.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    function closeManualInput() {
        let newVal = parseInt(manualInput.value);
        
        if (isNaN(newVal) || newVal < 4) newVal = 4;
        if (newVal > 255) newVal = 255;

        length = newVal;
        lengthinp.value = newVal;
        
        manualInput.style.display = 'none';
        lengthinp.style.display = 'block';
        rangeLabel.style.display = 'block';
        
        updateRangeDisplay();
    }

    manualInput.addEventListener('blur', closeManualInput);
    manualInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            closeManualInput();
        }
    });
}