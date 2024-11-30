let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;

const terminal = document.getElementById("terminal");
const baudRateSelector = document.getElementById("baudRate");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const inputData = document.getElementById("inputData");
const sendBtn = document.getElementById("sendBtn");

// Function to log data to the terminal
function logToTerminal(data) {
    terminal.textContent += data + "\n";
    terminal.scrollTop = terminal.scrollHeight;
}

// Connect to the serial port
connectBtn.addEventListener("click", async () => {
    try {
        port = await navigator.serial.requestPort();
        const baudRate = parseInt(baudRateSelector.value, 10);
        await port.open({ baudRate });
        logToTerminal("Connected to the serial port!");

        // Setup streams
        inputStream = port.readable.getReader();
        outputStream = port.writable.getWriter();
        disconnectBtn.disabled = false;
        connectBtn.disabled = true;

        // Read data from the port
        while (true) {
            const { value, done } = await inputStream.read();
            if (done) break;
            logToTerminal(new TextDecoder().decode(value));
        }
    } catch (err) {
        logToTerminal("Error: " + err.message);
    }
});

// Disconnect from the serial port
disconnectBtn.addEventListener("click", async () => {
    try {
        inputStream.cancel();
        outputStream.releaseLock();
        await port.close();
        logToTerminal("Disconnected from the serial port.");
    } catch (err) {
        logToTerminal("Error: " + err.message);
    }
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
});

// Send data to the serial port
sendBtn.addEventListener("click", async () => {
    const data = inputData.value;
    if (data && outputStream) {
        const encoder = new TextEncoder();
        await outputStream.write(encoder.encode(data));
        logToTerminal(`Sent: ${data}`);
        inputData.value = "";
    }
});
