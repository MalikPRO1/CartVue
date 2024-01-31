new Vue({
    el: "#app",
  
    data() {
      return {
        // State variables
        loading: false,
        error: null,
        url: "http://cartvuebackend.eu-north-1.elasticbeanstalk.com",
        searchText: "",
        sortBy: "subject",
        orderBy: "asc",
        sortOptions: ["subject", "location", "price", "availability"],
        orders: [
          { text: "Ascending", value: "asc" },
          { text: "Descending", value: "desc" }
        ],
        cart: [],
        isCartDisplaying: false,
        checkedOut: false,
        checkoutForm: {
          name: { value: "", error: "" },
          phone: { value: "", error: "" }
        },
        lessons: []
      };
    },
    
  
    methods: {
      async getLessons() {
        try {
          this.loading = true;
  
          const url = `${this.url}/lessons/?search=${this.searchText}`;
  
          const response = await fetch(url);
  
          this.lessons = await response.json();
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      async createNewOrder(order) {
        try {
          this.loading = true;
  
          const url = `${this.url}/orders`;
  
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
          });
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      async updateLesson({ lesson_id, spaces }) {
        try {
          this.loading = true;
  
          const url = `${this.url}/lessons/${lesson_id}`;
  
          const response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              spaces: spaces,
            }),
          });
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      updateLessonSpaces(type, _id) {
        switch (type) {
          case "decrease":
            this.lessons = this.lessons.map((item) => {
              if (item._id === _id && item.spaces > 0)
                return { ...item, spaces: --item.spaces };
  
              return item;
            });
            break;
  
          case "reset":
            this.lessons = this.lessons.map((item) => {
              if (item._id === _id) return { ...item, spaces: 5 };
  
              return item;
            });
            break;
  
          default:
            break;
        }
      },
      isItemInCart(_id) {
        return !!this.cart.find((item) => item._id === _id);
      },
      addToCart(_id) {
        const lesson = this.lessons.find((lesson) => lesson._id === _id);
  
        if (!this.isItemInCart(lesson._id)) {
          this.cart.push({
            ...lesson,
            spaces: 1,
          });
        } else {
          if (lesson.spaces > 0) {
            this.cart = this.cart.map((item) => {
              if (item._id === _id)
                return { ...item, spaces: ++item.spaces };
              return item;
            });
          }
        }
  
        this.updateLessonSpaces("decrease", lesson._id);
      },
      removeFromCart(_id) {
        // get index of cart item
        const index = this.cart.findIndex((item) => item._id === _id);
  
        // remove item from cart
        this.cart.splice(index, 1);
  
        // update lesson spaces
        this.updateLessonSpaces("reset", _id);
  
        // toggle cart display if no item is in cart
        if (!this.cart.length) this.toggleCartDisplay();
      },
      toggleCartDisplay() {
        this.isCartDisplaying = !this.isCartDisplaying;
      },
      checkout() {
        this.cart.forEach(async (item) => {
          await this.createNewOrder({
            name: this.checkoutForm.name.value,
            phone: this.checkoutForm.phone.value,
            lesson_id: item._id,
            spaces: item.spaces,
          });
  
          await this.updateLesson({
            lesson_id: item._id,
            spaces: item.spaces,
          });
        });
  
        this.checkedOut = true;
  
        this.toggleCartDisplay();
  
        this.cart = [];
  
        Object.keys(this.checkoutForm).every(
          (key) => (this.checkoutForm[key].value = "")
        );
  
        setTimeout(() => {
          this.checkedOut = false;
        }, 3000);
      },
    },
    computed: {
      // Computes the total length of items in the cart
      cartLength() {
        if (this.cart.length > 0) {
          return this.cart.reduce((total, item) => total + item.spaces, 0);
        }
        return 0;
      },
      // Filters and sorts lessons based on the selected criteria
      filteredLessons() {
        if (this.lessons.length <= 0) return [];
    
        const lessons = this.lessons;
    
        if (this.orderBy === "asc") {
          // Sort in ascending order based on the selected criteria
          switch (this.sortBy) {
            case "subject":
              return lessons.sort((a, b) => a.subject.toLowerCase().localeCompare(b.subject.toLowerCase()));
            case "location":
              return lessons.sort((a, b) => a.location.toLowerCase().localeCompare(b.location.toLowerCase()));
            case "price":
              return lessons.sort((a, b) => a.price - b.price);
            case "availability":
              return lessons.sort((a, b) => a.spaces - b.spaces);
          }
        } else if (this.orderBy === "desc") {
          // Sort in descending order based on the selected criteria
          switch (this.sortBy) {
            case "subject":
              return lessons.sort((a, b) => b.subject.toLowerCase().localeCompare(a.subject.toLowerCase()));
            case "location":
              return lessons.sort((a, b) => b.location.toLowerCase().localeCompare(a.location.toLowerCase()));
            case "price":
              return lessons.sort((a, b) => b.price - a.price);
            case "availability":
              return lessons.sort((a, b) => b.spaces - a.spaces);
          }
        }
      },
      // Checks if the checkout form fields are valid
      isCheckoutFormValid() {
        return Object.keys(this.checkoutForm).every(
          (key) => this.checkoutForm[key].value && !this.checkoutForm[key].error
        );
      },
    },
    
    created() {
      // Fetch lessons when the component is created
      this.getLessons();
    },
    
    watch: {
      // Watch for changes in searchText and fetch lessons accordingly
      searchText: {
        handler(val) {
          this.getLessons();
        },
      },
      // Watch for changes in checkoutForm.name field and perform validation
      "checkoutForm.name": {
        handler(val) {
          const validationRegex = /^[A-Za-z\s]*$/;
    
          if (!val.value) val.error = "Please enter your name";
          else if (!validationRegex.test(val.value))
            val.error = "Your name must only contain letters";
          else val.error = "";
        },
        deep: true,
      },
      // Watch for changes in checkoutForm.phone field and perform validation
      "checkoutForm.phone": {
        handler(val) {
          const validationRegex = /^((\+44)|(0)) ?\d{4} ?\d{6}$/;
    
          if (!val.value) val.error = "Please enter your phone number";
          else if (!validationRegex.test(val.value))
            val.error = "Please enter a valid UK phone number";
          else val.error = "";
        },
        deep: true,
      },
    },    
  });