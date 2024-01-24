const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const api = new WooCommerceRestApi({
    url: 'http://10.1.0.88/wordpress', // Your store URL
    consumerKey: 'ck_339498c847ca4ebc1e485bb71f12ab8384cbecab', // Your consumer key
    consumerSecret: 'cs_442d8fdee7ee8b934e79ac40446364fcf11ee32b', // Your consumer secret
    version: 'wc/v3' // WooCommerce API version
  });

  const data = {
    id: null,
    name: "Premium Quality",
    type: "simple",
    regular_price: "21.99",
    description: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.",
    short_description: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
    categories: [
      {
        id: 9
      },
      {
        id: 14
      }
    ],
    images: [
      {
        src: "http://demo.woothemes.com/woocommerce/wp-content/uploads/sites/56/2013/06/T_2_front.jpg"
      },
      {
        src: "http://demo.woothemes.com/woocommerce/wp-content/uploads/sites/56/2013/06/T_2_back.jpg"
      }
    ]
  };
  
  api.post("products", data)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error.response.data);
    });