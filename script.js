const blockList = document.getElementById("block-list");
const audio = new Audio("coin-drop.mp3");
const BLOCKS_TO_DISPLAY = 10;
let newBlocks = [];

function displayBlock(block, initial, delay = 0) {
    const existingBlock = blockList.querySelector(`li[data-hash="${block.hash}"]`);

    if (existingBlock) {
        return;
    }

    setTimeout(() => {
        const listItem = document.createElement("li");

        if (!initial) {
            listItem.classList.add("new-block");
            listItem.classList.add("fade-in");
        }

        const blockTitle = document.createElement("span");
        blockTitle.textContent = initial ? "" : "";
        blockTitle.classList.add("block-title");
        listItem.appendChild(blockTitle);

        const blockHash = document.createElement("span");
        let cleanHash = block.hash.replace(/^(block|undefined)\s*/i, "");
        blockHash.textContent = cleanHash;
        blockHash.classList.add("block-hash");
        listItem.appendChild(blockHash);

        listItem.setAttribute("data-hash", block.hash);

        if (!initial) {
            blockList.removeChild(blockList.lastChild);
        }

        blockList.insertBefore(listItem, blockList.firstChild);
    }, delay);
}

async function getLatestBlocks(initial = false) {
    try {
        const response = await axios.get(`https://api.blockchair.com/bitcoin/blocks?limit=${BLOCKS_TO_DISPLAY}`);
        const data = response.data.data;

        data.forEach((block, index) => {
            const delay = initial ? index * 1000 : 0;
            displayBlock(block, initial, delay);
        });
    } catch (error) {
        console.error("Error fetching block data:", error);
    }
}

function playCoinDropSound() {
    audio.play();
}

const socket = new WebSocket(`wss://${window.location.host}`);

let intervalId;

socket.addEventListener("open", (event) => {
    console.log("WebSocket connection opened:", event);
});

socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "block") {
        playCoinDropSound();
        displayBlock(data.attributes, false);
    }
});

socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event);
});

socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
});

document.getElementById("start-button").addEventListener("click", () => {
    getLatestBlocks(true);
    intervalId = setInterval(getLatestBlocks, 10000);
});

document.getElementById("stop-button").addEventListener("click", () => {
    clearInterval(intervalId);
});
