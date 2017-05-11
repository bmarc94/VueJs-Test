var shellList = {
    components: { shell },
    template: `
    <div :class="['bonneteauItem',computedClassName]">
        <slot></slot>
    </div>
    `,
    computed: {
        computedClassName() {
            return {
                animated: this.isAnimated
            }
        }
    },
    data() {
        return {
            isAnimated: true
        }
    },
    mounted() {
        this.$el.addEventListener("animationend", () => {
            /*WIP Call for every child... :( */
            if (this.isAnimated) {
                this.isAnimated = false;
                this.$emit('onAnimationEnded')
            }
        });
    }
}

var shell = {
    name: "shell",
    template: `
        <div @click="onClick"  
        :class="[className, comutedClassName]">
        </div>
    `,
    props: {
        className: { type: String, default: 'shell' }
    },
    computed: {
        comutedClassName() {
            return {
                selected: this.isSelected,
                pearled: this.isPearled,
                correct: this.isSelected && this.isPearled,
                wrong: !this.isSelected && this.isPearled
            }
        }
    },
    data() {
        return {
            isSelected: false,
            isPearled: false,
        }
    },
    methods: {
        onClick() {
            this.$emit('onSelect', this);
        },
        resetState() {
            this.isSelected = false;
            this.isPearled = false;
        }
    },
}

var vm = new Vue({
    el: '#bonneteau',
    components: { shellList, shell },
    template: `
    <div class="bonneteau">
        <shellList ref="shellList" @onAnimationEnded="onShuffleEnded">
            <shell ref="shells" v-for="shell in length" @onSelect="onShellSelect"></shell>
        </shellList>
        
        <span class="bonneteauLog">{{ gameLog }}</span> <br />
        <button v-if="gameOver" @click="reset()" >Recommencer</button>
    </div>
    `,
    props: {
        length: { type: Number, default: 3 }
    },

    data: {
        gameLog: "Mélange",
        gameOver: false,
        isShuffling: true,
        selectedShell: null,
        pearledShell: null,

    },

    methods: {
        onShuffleEnded() {
            this.gameLog = 'Faites vos jeux !';
        },

        onShellSelect(selectedShell) {
            if (!this.$refs.shellList.isAnimated && !this.selectedShell) {
                this.gameLog = "Les jeux sont faits !";
                this.selectedShell = selectedShell;
                selectedShell.isSelected = true;
                XMLHttpRequestPromise({
                    url: "https://www.random.org/integers/?num=1&min=0&max=2&col=1&base=10&format=plain&rnd=new"

                }).then((res) => {
                    this.validate(parseFloat(res));
                }).catch(() => {
                    window.setTimeout(() => {
                        this.validate(parseFloat(this.localRandom()));
                    }, 1500)
                })
            }
        },

        validate(winShellIndex) {
            this.pearledShell = this.$refs.shells[winShellIndex];
            this.pearledShell.isPearled = true;
            this.gameLog = this.pearledShell === this.selectedShell ? "Gagné!" : "Perdu...";
            this.gameOver = true;
        },

        reset() {
            this.pearledShell.resetState();
            this.selectedShell.resetState();
            this.pearledShell = null;
            this.selectedShell = null;
            this.gameOver = false;
            this.$refs.shellList.isAnimated = true;
            this.gameLog = "Mélange";
        },

        localRandom() {
            return 0;
        }
    }
})

/*utils*/
function XMLHttpRequestPromise(opts) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method || "GET", opts.url);
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function() {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        if (opts.headers) {
            Object.keys(opts.headers).forEach(function(key) {
                xhr.setRequestHeader(key, opts.headers[key]);
            });
        }
        var params = opts.params;
        // We'll need to stringify if we've been given an object
        // If we have a string, this is skipped.
        if (params && typeof params === 'object') {
            params = Object.keys(params).map(function(key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');
        }
        xhr.send(params);
    });
}