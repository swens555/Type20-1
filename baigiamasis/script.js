const endpoint = 'https://65cee647bdb50d5e5f5a1733.mockapi.io/thetask/product';
const err = document.querySelector("#errors");

function navigate(page, productId) {

	if (page !== undefined) {
		let url = '?page=' + page + '&product=' + productId;
		window.location.search = url;
	} else {
		const urlParams = new URLSearchParams(window.location.search);
		const page = urlParams.has('page') ? urlParams.get('page') : 'catalog';

		switch (page) {
		case 'catalog':
			const section = document.querySelector('#sectionCatalog');
			section.classList.add('section__active')
			loadProducts();
			break;
		case 'product':
			const productId = urlParams.has('product') ? parseInt(urlParams.get('product')) : 0;

			if (productId) { // show product
				const section = document.querySelector('#sectionProduct');
				section.classList.add('section__active')
				loadProduct(productId);

			} else { // add new product
				const section = document.querySelector('#sectionForm');
				section.classList.add('section__active')
				showForm();
			}
			break;
		}

		
	}


}


function addProduct(productData, callback) {
	fetch(endpoint, {
		method: 'POST',
		headers: {'content-type':'application/json'},
		// Send your data in the request body as JSON
		body: JSON.stringify(productData)
	}).then(res => {
		if (res.ok) {
			return res.json();
		}
		// handle error
	}).then(product => {
		callback(product);
	}).catch(error => {
		err.innerHTML = "Error: " + error.toString();
	})
}

function loadProducts() {
	fetch(endpoint + '?sortBy=price&order=asc', {
		method: 'GET',
		headers: {'content-type':'application/json'},
	}).then(res => {
		if (res.ok) {
			return res.json();
		}
	}).then(products => {
		showProducts(products);
	}).catch(error => {
		err.innerHTML = "Error: " + error.toString();
	})
}

function showProducts(products) {
	const container = document.querySelector('#catalog');
	const productTemplate = document.querySelector('#catalogItem');

	container.innerHTML = '';

	if (products.length) {
		products.forEach(product => {
			var productItem = productTemplate.content.cloneNode(true);
			productItem.querySelector(".catalog-item_image").src = product.imageUrl;
			productItem.querySelector(".catalog-item_title").textContent = product.name;
			productItem.querySelector(".catalog-item_price").textContent = product.price;
			productItem.querySelector(".catalog-item").addEventListener('click', event => {
				navigate('product', product.id);
			});
			container.appendChild(productItem);
		});
	}
}

function loadProduct(id) {
	fetch(endpoint + '/' + id, {
		method: 'GET',
		headers: {'content-type':'application/json'},
	}).then(res => {
		if (res.ok) {
			return res.json();
		}
	}).then(product => {
		showProduct(product);
	}).catch(error => {
		err.innerHTML = "Error: " + error.toString();
	})
}

function removeProduct(id, callback) {
	fetch(endpoint + '/' + id, {
		method: 'DELETE',
	}).then(res => {
		if (res.ok) {
			return res.json();
		}
	}).then(product => {
		callback(true);
	}).catch(error => {
		err.innerHTML = "Error: " + error.toString();
	})
}

function showProduct(product) {
	const productInfo = document.querySelector('#productItem');
	productInfo.querySelector(".product-item_image").src = product.imageUrl;
	productInfo.querySelector(".product-item_title").textContent = product.name;
	productInfo.querySelector(".product-item_price").textContent = product.price;
	productInfo.querySelector(".product-item_description").textContent = product.description;
	productInfo.querySelector(".product-item_place").textContent = product.place;
	productInfo.querySelector('.product-item_action[href="#remove"]').addEventListener('click', event => {
		event.preventDefault();
		removeProduct(product.id, res => {
			if (res) {
				const actionMessage = document.createElement("div");
				actionMessage.classList.add("product-item_action-message");
				actionMessage.textContent = 'The product has been deleted!'
				event.target.replaceWith(actionMessage);
				setTimeout(()=>{navigate('catalog');
			},5000)
			}
		});
	});

	productInfo.classList.add('product-item__active');
}

function showForm() {
	const productForm = document.querySelector('#productForm');

	productForm.querySelector('.product-form_action[href="#add"]').addEventListener('click', event => {
		event.preventDefault();
		const productData = Object.fromEntries(new FormData(productForm));
		if (validateProductData(productData)) {
			addProduct(productData, product => {
				if (product) {
					const actionMessage = document.createElement("div");
					actionMessage.classList.add("product-item_action-message");
					actionMessage.innerHTML = 'The product has been successfully added!<br>Opening product page...'
					event.target.replaceWith(actionMessage);

					setTimeout(() => {
						navigate('product', product.id);
					}, 5000);
					;
				}
			});
		}
	});

}

function validateProductData(productData) {
	for (let i in productData) {
		if (productData[i]) {

		} else {
			err.innerHTML = "Error validating data: field <strong><em>" + i + "</em></strong> is empty!";
			return false;
		}
	}

	return true;
}


// const productData = {
//   name: 'Test product',
//   imageUrl: 'https://lazyhouse.lt/wp-content/plugins/product-badges-for-woocommerce/assets/img/badge1.png',
//   price: 20,
//   description: 'Best product',
//   place: 'Vilnius',
// };
