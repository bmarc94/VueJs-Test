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
            if (!this.$refs.shellList.animate && !this.selectedShell) {
                this.gameLog = "Les jeux sont faits !";
                this.selectedShell = selectedShell;
                selectedShell.isSelected = true;
                this.getPearledShellIndexPromise().then((res) => {
                    this.pearledShell = this.$refs.shells[res];
                    this.pearledShell.isPearled = true;
                    this.gameLog = this.pearledShell === this.selectedShell ? "Gagné!" : "Perdu...";
                    this.gameOver = true;
                })
            }
        },
        getPearledShellIndexPromise() {
            return new window.Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", "https://www.random.org/integers/?num=1&min=0&max=2&col=1&base=10&format=plain&rnd=new");
                xhr.onload = function() {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(parseFloat(xhr.response));
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
                xhr.send();
            });
        },
        reset() {
            this.pearledShell.resetState();
            this.selectedShell.resetState();
            this.pearledShell = null;
            this.selectedShell = null;
            this.gameOver = false;
            this.$refs.shellList.isAnimated = true;
            this.gameLog = "Mélange";
        }
    }
})