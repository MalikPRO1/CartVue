const app = new Vue({
    el: '#app',
    data: {
        products: products,
        cart: [],
        cartPage: false,
        searchQuery: '',
        selectedSort: 'name',
        user: {
            firstName: '',
            lastName: '',
            location: '',
            phoneNumber: '',
            email: ''
        },
        isSubmitted: false
    },
    computed: {
        cartTotal() {
            return this.cart.reduce((total, item) => total + item.quantity * item.price, 0);
        },
        //sort and search
        sortedAndFilteredProducts() {
            const query = this.searchQuery.toLowerCase();
            const productsCopy = [...this.products];

            const filteredProducts = productsCopy.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.location.toLowerCase().includes(query)
            );

            if (this.selectedSort === 'name') {
                return filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (this.selectedSort === 'name_desc') {
                return filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            } else if (this.selectedSort === 'price') {
                return filteredProducts.sort((a, b) => a.price - b.price);
            } else if (this.selectedSort === 'price_desc') {
                return filteredProducts.sort((a, b) => b.price - a.price);
            } else if (this.selectedSort === 'location') {
                return filteredProducts.sort((a, b) => a.location.localeCompare(b.location));
            } else if (this.selectedSort === 'location_desc') {
                return filteredProducts.sort((a, b) => b.location.localeCompare(a.location));
            }
        },
    },
    methods: {
        addToCart(product) {
            const cartItem = this.cart.find(item => item.id === product.id);

            if (product.quantity > 0) {
                if (cartItem) {
                    if (cartItem.quantity < 5) {
                        cartItem.quantity++;
                        product.quantity--;
                    } else {
                        alert('You have reached the maximum quantity for this item');
                    }
                } else {
                    this.cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
                    product.quantity--;
                }
            } else {
                alert('No more items available in stock');
            }
        },
        showCart() {
            this.cartPage = !this.cartPage
        },
        submitForm() {
            // Handle form submission and save the user details (you can send them to a server or use local storage)
            // For this example, we'll just mark the form as submitted and display the saved details.
            this.isSubmitted = true;
            alert('Order successful!');
            console.log('Submit form called');
            // Redirect to the homepage after a short delay (you can adjust the delay as needed)
            setTimeout(() => {
                window.location.href = 'http://127.0.0.1:5500/index.html';
            }, 2000); // Redirect after 2 seconds (2000 milliseconds)

        },
        removeFromCart(cartItem) {
            console.log(this.cart.length);

            if (this.cart.length >= 1) {
                const index = this.cart.findIndex(item => item.id === cartItem.id);
                if (index !== -1) {
                    this.cart.splice(index, 1);
                    const product = this.products.find(prod => prod.id === cartItem.id);
                    if (product) {
                        product.quantity += cartItem.quantity;
                    }
                    // Check if cart is empty after removal
                    if (this.cart.length === 0 && this.cartPage) {
                        this.cartPage = false;
                        // Use window.history to go back to the previous page
                        window.history.back();
                    }
                }
            }
        },
        clearCart() {
            // Show a confirmation prompt
            const isConfirmed = confirm('Are you sure you want to clear the cart?');

            // If the user confirms, clear the cart
            if (isConfirmed) {
                this.cart.forEach(cartItem => {
                    const product = this.products.find(product => product.id === cartItem.id);
                    if (product) {
                        product.quantity += cartItem.quantity;
                    }
                });
                // Clear the cart
                this.cart = [];
                window.location.href = 'http://127.0.0.1:5500/index.html';
            }
        },
    },
});