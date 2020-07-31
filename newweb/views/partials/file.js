function openTextFile() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "text/plain"; // 확장자가 xxx, yyy 일때, ".xxx, .yyy"
    input.onchange = function (event) {
        processFile(event.target.files[0]);
    };
    input.click();
}

function processFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
        text = reader.result;
        textByLine = text.split("\r\n");
        output.innerText = text;
    };
    reader.readAsText(file, "utf-8");
}