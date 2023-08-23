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
                .container {
                    font-family: Arial, sans-serif;
                    background-color: #F4F6F9;
                    padding: 20px;
                    border: 1px solid #DDE2E8;
                    border-radius: 5px;
                    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
                }
                
                .container button {
                    height: 40px;
                    padding: 10px 20px;
                    font-size: 16px;
                    color: white;
                    background-color: #FF7F50; /* Coral Orange */
                    border: none;
                    border-radius: 5px;
                    transition: all 0.3s;
                    cursor: pointer;
                }
                
                .container button:hover {
                    background-color: #FF6347; /* Lighter shade of Coral Orange */
                }
                
                .container ul {
                    margin-top: 20px;
                    padding: 0;
                    list-style: none;
                }
                
                .container ul li {
                    margin: 8px 0;
                    padding: 8px 16px;
                    background-color: #FFF;
                    border-radius: 5px;
                    border: 1px solid #DDE2E8;
                    transition: all 0.3s;
                    cursor: pointer;
                }
                
                .container ul li:hover {
                    background-color: #E8EAF0;
                    color: #FF7F50; /* Coral Orange */
                }
                
                .container ul li a {
                    display: block;
                    color: #232323;
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .container ul li a:hover {
                    color: #FF7F50; /* Coral Orange */
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
            const response = await fetch('http://localhost:3000/api/canvas');
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
            const response = await fetch('http://localhost:3000/api/canvas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("Sending request:", response);
            const data = await response.json();
            if (!data || !data.id) {
                throw new Error("Canvas ID is not defined in server response");
            }
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
