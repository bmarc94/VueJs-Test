Vue.component('shellList', {
    template: `
    <div>
        <shell ref="shells" class="shell animated" v-for="shell in shellLength" @onSelect="onShellSelect"></shell>
    </div>    
    `,
    /*check si il y a pas mieux à faire avec le parseFloat*/
    props: ['shellLength'],

    data() {
        return {
            selectedShell: null,
            isShuffling: true
        }
    },
    mounted() {
        this.$refs.shells[0].$el.addEventListener("animationend", () => {
            this.isShuffling = false;
            this.$emit('shuffleEnd');
        });
    },
    methods: {
        onShellSelect(shell) {
            if (!this.isShuffling) {
                this.$emit('validateSelection', this.$refs.shells, shell);
            }
        },
    }
});

Vue.component('shell', {
    template: `
    <div @click="onClick"  
    :class="{'selected': isSelected, 
             'pearled':isPearled,
             'correct': isSelected && isPearled,
             'wrong': !isSelected && isPearled 
            }">
    </div>
    `,

    data() {
        return {
            isSelected: false,
            isPearled: false,
        }
    },
    methods: {
        onClick() {
            this.$emit('onSelect', this);
        }
    },
})


new Vue({
    el: '#bonneteau',
    template: `
    <div v-if="!loading" class="bonneteau">
        <shellList :shellLength = 3
        @validateSelection = 'validate'
        @shuffleEnd = 'onShuffleEnd'
        ></shellList>

        <span class="bonneteauLog">{{ gameLog }}</span> <br />
        <button v-if="displayResetButton" @click="reset()" >Recommencer</button>
    </div>
    <div v-else>Loading...</div>
    `,
    data: {
        gameLog: "Mélange",
        loading: true,
        gameOver: false,
        displayResetButton: false
    },

    mounted() {
        /*A revoir aussi. */
        this.loading = false;
    },

    methods: {
        onShuffleEnd() {
            this.gameLog = "Faites vos jeux";
        },
        validate(shells, selectedShell) {
            if (!this.gameOver) {
                this.gameOver = true;
                this.gameLog = "Les jeux sont faits !";
                selectedShell.isSelected = true;

                this.getPearledShellIndexPromise().then((res) => {
                    shells[res].isPearled = true;
                    this.displayResetButton = true;
                    this.gameLog = shells.indexOf(selectedShell) === res ? "Gagné!" : "Perdu...";
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
            /*A revoir, je suppose... */
            this.gameOver = false;
            this.loading = true;
            this.displayResetButton = false;
            this.gameLog = "Mélange";
            window.setTimeout(() => {
                this.loading = false;
            }, 250)
        }
    }
})