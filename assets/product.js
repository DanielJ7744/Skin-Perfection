/*
    © 2022 EcomGraduates.com
    https://www.ecomgraduates.com
*/

// Ajax 'Add To Cart' (ATC) forms
window.onSubmitAtcForm = async (form, event) => {
    event.preventDefault()

    const btn = form.querySelector('button[name="add"]')
    btn.innerHTML = `
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `

    await fetch('/cart/add.js', { method: 'POST', body: new FormData(form) })

    btn.innerHTML = window.themeStrings.addToCart

    if (document.querySelector('#offcanvas-cart')) {
        bootstrap.Offcanvas.getOrCreateInstance('#offcanvas-cart').show()
    }

    window.refreshCartContents()
}

// Product Options - listen for onchange events
window.onChangeProductOption = async (input) => {
    const productWrapper = input.closest('.product')
    const addToCartBtn = productWrapper.querySelector('[name="add"]')

    const response = await fetch(`/products/${input.dataset.productHandle}.js`)
    const productData = await response.json()

    const productOptions = []

    productWrapper.querySelectorAll('.product-option').forEach(el => {
        productOptions.push(el.value)
    })

    const selectedVariant = productData.variants.find(variant =>
        variant.title.includes(productOptions.toString().replace(',', ' / '))
    )

    console.log(selectedVariant)

    if (selectedVariant) {
        productWrapper.querySelector('[name="id"]').value = selectedVariant.id

        if (selectedVariant.available) {
            addToCartBtn.disabled = false
            addToCartBtn.innerHTML = window.themeStrings.addToCart
        } else {
            addToCartBtn.disabled = true
            addToCartBtn.innerHTML = window.themeStrings.soldOut
        }

        if (selectedVariant.compare_at_price) {
            productWrapper.querySelector('.product-price-compare').style.display = 'inline-block'
            productWrapper.querySelector('.product-price-compare s').textContent = window.formatMoney(selectedVariant.compare_at_price)
            productWrapper.querySelector('.product-price-final').classList.add('text-success')
            productWrapper.querySelector('.product-price-final').textContent = window.formatMoney(selectedVariant.price)
        } else {
            productWrapper.querySelector('.product-price-compare').style.display = 'none'
            productWrapper.querySelector('.product-price-compare s').textContent = ''
            productWrapper.querySelector('.product-price-final').classList.remove('text-success')
            productWrapper.querySelector('.product-price-final').textContent = window.formatMoney(selectedVariant.price)
        }

        bootstrap.Carousel.getOrCreateInstance('#product-carousel')
            ?.to(selectedVariant.featured_media.position - 1)

        const url = new URL(window.location)
        url.searchParams.set('variant', selectedVariant.id)
        window.history.replaceState({}, '', url)
    } else {
        addToCartBtn.disabled = true
        addToCartBtn.innerHTML = window.themeStrings.unavailable
    }
}

// 'Buy it now' buttons
window.onClickBuyBtn = (btn) => {
    btn.innerHTML = `
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `
    const form = btn.closest('form')
    const variantId = form.querySelector('[name="id"]').value
    const qty = Number(form.querySelector('input[name="quantity"]').value || 1)
    window.location.href = `/cart/${variantId}:${qty}`
}

// New Product Media gallery with SplideJS
const initProductMediaGallery = () => {
    const mainElement = document.querySelector('#product-media-slider-main')
    const thumbsElement = document.querySelector('#product-media-slider-thumbs')

    if (!mainElement && !thumbsElement) {
        return
    }

    const startIndex = Number(mainElement.dataset.currentMediaPosition - 1)

    const main = new Splide(mainElement, {
        pagination: true,
        arrows: true,
        mediaQuery: 'min',
        breakpoints: {
            576: {
                pagination: false
            }
        },
        start: startIndex
    })

    const thumbs = new Splide(thumbsElement, {
        direction: 'ttb',
        isNavigation: true,
        arrows: false,
        pagination: false,
        wheel: true,
        wheelSleep: 750,
        focus: thumbsElement.dataset.focus,
        cover: true,
        width: 80,
        gap: 5,
        height: '100%',
        fixedWidth: 80,
        fixedHeight: 80,
        start: startIndex
    })

    main.on('move', (newIndex, prevIndex) => {
        mainElement.querySelectorAll('video').forEach((video) => {
            video.pause()
        })
        setTimeout(() => {
            mainElement.querySelector('.splide__slide.is-active video')?.play()
        }, 500)
    })

    main.on('pagination:mounted', (data, item) => {
        const currentSlideIndex = data.items.findIndex((element) => element === item)

        document.querySelector('#product-media-slider-main').insertAdjacentHTML('beforeend', `
            <div class="splide-custom-pagination">
                <span>${currentSlideIndex + 1}</span>/${data.items.length}
            </div>
        `)

        document.querySelector('#product-media-slider-main .splide__pagination')?.remove()
    })

    main.on('move', (newIndex, prevIndex) => {
        if (document.querySelector('#product-media-slider-main .splide-custom-pagination')) {
            document.querySelector('#product-media-slider-main .splide-custom-pagination span')
                .textContent = newIndex + 1
        }
    })

    window.addEventListener('slideProductMediaGalleryTo', (e) => {
        main.go(e.detail)
    }, false)

    main.sync(thumbs).mount()
    thumbs.mount()

    document.querySelector('#product-media-slider-wrapper').style.maxHeight =
        document.querySelector('#product-media-slider-main .splide__track').clientHeight + 'px'
}
initProductMediaGallery()

// Product Media Gallery - Sticky position on scroll (only in desktop)
if (window.matchMedia('(min-width: 1200px)').matches) {
    const stickyElement = document.querySelector('#template-product-content')

    if (stickyElement) {
        const navbarHeight = document.querySelector('#shopify-section-navbar.sticky-top')?.clientHeight || 0
        stickyElement.style.position = 'sticky'
        stickyElement.style.top = `${navbarHeight + 20}px`
    }
}

// Handle Ingredients
const handleIngredients = async () => {
    const ingredientsBlock = document.querySelector('.product-block-ingredients')

    if (ingredientsBlock) {
        const response = await fetch(ingredientsBlock.dataset.jsonFile)
        const data = await response.json()
        console.log(data)

        document.querySelectorAll('.ingredients-list-item').forEach((item) => {
            const ingredientData = data.find(dataElement => dataElement.title === item.dataset.ingredient)

            if (ingredientData) {
                item.querySelector('.ingrdients-list-score').innerHTML = ingredientData.score
                item.querySelector('.ingrdients-list-score').style.backgroundColor = ingredientData.score > 2 ? 'orange' : 'green'

                item.querySelector('[data-ingredient-origin]').innerHTML = ingredientData.origin
                item.querySelector('[data-ingredient-description]').innerHTML = ingredientData.description
            }
        })

        document.querySelectorAll('.btn-ingredients-show-all').forEach((btn) => {
            btn.addEventListener('click', () => {
                btn.closest('.accordion-body').querySelectorAll('.ingredients-list-item').forEach(item => {
                    item.style.display = 'flex'
                })
                btn.remove()
            })
        })
    }
}
handleIngredients()