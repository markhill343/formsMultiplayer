class AppElement extends HTMLElement {

    constructor() {
        super();

        this.attachShadowAndStyles();

        // Initial redirect based on current URL
        this.handleInitialRedirect();

        // Attach event listener
        this.addPopstateListener();
    }

    attachShadowAndStyles() {
        const shadow = this.attachShadow({mode: 'open'});
        const container = document.createElement('div');
        container.setAttribute('id', 'container');
        const style = document.createElement('style');
        style.textContent = `
            #container {
                width: 100%;
                height: 100%;
            }
            a {
                cursor: pointer;
            }
        `;
        shadow.appendChild(style);
        shadow.appendChild(container);
    }

    handleInitialRedirect() {
        const url = window.location.hash;
        if (url.includes('canvas')) {
            const canvasId = url.split('/').pop();
            this.redirect({id: canvasId}, 'DrawArea', `/${url}`);
        } else {
            this.redirect(null, 'Menu', '/');
        }
    }

    addPopstateListener() {
        window.addEventListener('popstate', ({state}) => {
            const container = this.shadowRoot.getElementById('container');
            if (state === null) {
                container.innerHTML = '<menu-page></menu-page>';
            } else if (state.id) {
                container.innerHTML = `<draw-area id="${state.id}"></draw-area>`;
            }
        });
    }

    redirect(state, title, url) {
        history.pushState(state, title, url);
        dispatchEvent(new PopStateEvent('popstate', {state: state}));
    }
}

customElements.define('app-element', AppElement);
