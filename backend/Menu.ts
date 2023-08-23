class MenuPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.fetchCanvasSessions();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .container button {
                    height: 38px;
                    margin-left: 8px;
                    padding: 2px 4px;
                    color: white;
                    background-color: cornflowerblue;
                    border: solid 2px cornflowerblue;
                    border-radius: 4px;
                }
                .container button:hover{
                    background-color: #4c7ace;
                    cursor: pointer;
                }
                .container ul {
                    margin-top: 20px;
                    padding: 0;
                    list-style: none;
                }
                .container ul li {
                    margin: 8px;
                    padding: 2px 4px;
                    color: white;
                    background-color: cornflowerblue;
                    border-radius: 4px;
                }
                .container ul li:hover {
                    background-color: #4c7ace;
                    cursor: pointer;
                }
                .container ul li a {
                    display: inline-block;
                    width: 100%;
                }
            </style>
            <div class="container">
                <button>Create Canvas</button>
                <ul></ul>
            </div>
        `;

        this.shadowRoot.querySelector('button').addEventListener('click', this.createCanvas.bind(this));
    }

    async fetchCanvasSessions() {
        try {
            const response = await fetch('/api/canvas');
            const data = await response.json();
            const ul = this.shadowRoot.querySelector('ul');
            data.forEach((canvas, index) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.addEventListener('click', () => this.redirect(canvas));
                a.textContent = `Canvas-Session ${index + 1}`;
                li.appendChild(a);
                ul.appendChild(li);
            });
        } catch (error) {
            console.error("Failed to fetch canvas sessions:", error);
        }
    }

    async createCanvas() {
        try {
            const response = await fetch('/api/canvas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            this.redirect(data);
        } catch (error) {
            console.error("Failed to create canvas:", error);
        }
    }

    redirect(canvas) {
        history.pushState(canvas, 'DrawArea', '/canvas/' + canvas.id);
        dispatchEvent(new PopStateEvent('popstate', { state: canvas }));
    }
}

customElements.define('menu-page', MenuPage);
