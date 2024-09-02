class Chunk {
  constructor(id) {
    this.id = id;
    this.path = document.getElementById(`path-${id}`);
    this.cmd = new Command(`cmd-${id}`);
    this.output = document.getElementById(`output-${id}`);

    this.path.style.opacity = 0;
    this.output.style.opacity = 0;
  }

  setup(key) {
    this.path.style.opacity = 1;
    this.cmd.type(key, this.output);
  }

  skip(key) {
    this.cmd.skip(key);
    this.output.style.opacity = 1;
  }
}

class Command {
  constructor(id) {
    this.id = id;
    this.element = document.getElementById(id);
    this.HTML = document.getElementById(id).innerHTML;
    this.cursorPosition = 0;
    this.tag = "";
    this.writingTag = false;
    this.tagOpen = false;
    this.typeSpeed = 150;
    this.isWriting = false;
    this.timeout;
    this.interval;

    document.getElementById(this.id).innerHTML = "";
  }

  skip(key) {
    clearTimeout(this.timeout);
    clearInterval(this.interval);

    this.element.classList.remove("writing");
    this.element.classList.add("done");

    this.element.innerHTML = this.HTML.slice(1);

    const chunkComplete = new CustomEvent("chunkComplete", {
      detail: { key: key },
    });
    document.dispatchEvent(chunkComplete);
  }

  type(key, output) {
    var t = document.getElementById(this.id);
    document.getElementById(this.id).classList.remove("done");

    this.timeout = setTimeout(() => {
      t.classList.add("writing");
      this.interval = setInterval(
        () => {
          this.cursorPosition += 1;
          if (this.writingTag === true) {
            this.tag += this.HTML[this.cursorPosition];
          }

          if (t.innerHTML[this.cursorPosition] === "<") {
            this.tempTypeSpeed = 0;
            if (this.tagOpen) {
              this.tagOpen = false;
              this.writingTag = true;
            } else {
              this.tag = "";
              this.tagOpen = true;
              this.writingTag = true;
              this.tag += this.HTML[this.cursorPosition];
            }
          }
          if (!this.writingTag && this.tagOpen) {
            this.tag.innerHTML += this.HTML[this.cursorPosition];
          }
          if (!this.writingTag && !this.tagOpen) {
            t.innerHTML += this.HTML[this.cursorPosition];
          }
          if (
            this.writingTag === true &&
            this.HTML[this.cursorPosition] === ">"
          ) {
            this.writingTag = false;
            if (this.tagOpen) {
              var newSpan = document.createElement("span");
              t.appendChild(newSpan);
              newSpan.innerHTML = this.tag;
              this.tag = newSpan.firstChild;
            }
          }
          if (this.cursorPosition >= this.HTML.length - 1) {
            clearInterval(this.interval);
            t.classList.remove("writing");

            setTimeout(
              () => {
                t.classList.add("done");
                output.style.opacity = 1;

                const chunkComplete = new CustomEvent("chunkComplete", {
                  detail: { key: key },
                });
                document.dispatchEvent(chunkComplete);
              },
              Math.random() * 100 + 750,
            );
          }
        },
        Math.random() * this.typeSpeed + 50,
      );
    }, 1230);
  }
}

window.addEventListener("load", () => {
  var chunks = [
    new Chunk("welcome"),
    new Chunk("whoami"),
    new Chunk("sherlock"),
    new Chunk("footer"),
  ];
  var n = 0;

  chunks[n].setup(n);

  document.addEventListener("chunkComplete", (e) => {
    if (e.detail.key < n) return;

    if (n >= chunks.length - 1) {
      document.getElementById("tip").classList.add("hidden");
    } else {
      chunks[n + 1].setup(n + 1);
      n += 1;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (n <= chunks.length - 1 && (e.code == "Space" || e.code == "Enter")) {
      chunks[n].skip(n);
    }
  });
});
