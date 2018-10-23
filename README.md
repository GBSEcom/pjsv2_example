# PaymentJS V2: Merchant Server

## Getting Started

1. Add credentials to env.js

2. Install packages.
~~~
npm install
~~~

3. Compile
~~~
npm run build
~~~

4. Start Server
~~~
npm run start
~~~

5. Merchant URL
~~~
https://localhost:3001/
~~~

## Integration

Each PaymentJS field requires an empty html element to hold the iframe. Match label `for` to the empty html `id` to include focus support.

~~~html
<label for="cc-name">Card Holder Name</label>
<div id="cc-name" data-cc-name></div>
~~~

Load the PaymentJS library.
~~~javascript
<script src="https://prod.paymentjs.firstdata.com/js/payment-v2.0.0.js"></script>
<script>
  firstdata.paymentFields
    .create(/* ... */)
    .then(/* ... */);
</script>
~~~

### Create
Returns promise after all iframes ready.
* `create` — required
  * `fields` - required
  * `classes` - optional
  * `styles` - optional<br><br>
  
  ~~~javascript
  firstdata.paymentFields
    .create({
      fields: {
        name: {
          selector: '[data-cc-name]',
          placeholder: 'Full Name',
        },
        card: {
          selector: '[data-cc-card]',
        },
        cvv: {
          selector: '[data-cc-cvv]',
        },
        exp: {
          selector: '[data-cc-exp]',
        },
      },
      classes: {
        empty: 'empty',
        focus: 'focus',
        invalid: 'invalid',
        valid: 'valid',
      },    
      styles: {
        input: {
          'font-size': '16px',
          color: '#00a9e0',
          'font-family': 'monospace',
          background: 'black',
        },
        '.card': {
          'font-family': 'monospace',
        },
        ':focus': {
          color: '#00a9e0',
        },
        '.valid': {
          color: '#43B02A',
        },
        '.invalid': {
          color: '#C01324',
        },
        '@media screen and (max-width: 700px)': {
          input: {
            'font-size': '18px',
          },
        },
        'input:-webkit-autofill': {
          '-webkit-box-shadow': '0 0 0 50px white inset',
        },
        'input:focus:-webkit-autofill': {
          '-webkit-text-fill-color': '#00a9e0',
        },
        'input.valid:-webkit-autofill': {
          '-webkit-text-fill-color': '#43B02A',
        },
        'input.invalid:-webkit-autofill': {
          '-webkit-text-fill-color': '#C01324',
        },
        'input::placeholder': {
          color: '#aaa',
        },
      },    
    }).then((res) => { 
      console.log(res);
    });
  ~~~

  #### Fields

  `fields` — required

  * `name`, `card`, `cvv`, `exp` — required
    * `selector` — required — string — used in window.document.querySelector
    * `placeholder` — optional<br><br>

  ~~~javascript
  fields: {
    name: {
      selector: '[data-cc-name]',
      placeholder: 'Full Name',
    },
    card: {
      selector: '[data-cc-card]',
    },
    cvv: {
      selector: '[data-cc-cvv]',
    },
    exp: {
      selector: '[data-cc-exp]',
    },
  },
  ~~~

  #### Classes

  `classes` — optional CSS behavioral classes to override in iframes and labels.

  ~~~javascript
  classes: {
    empty: 'firstdata-field-empty',
    focus: 'firstdata-field-focus',
    invalid: 'firstdata-field-invalid',
    valid: 'firstdata-field-valid',
  },
  ~~~

  #### Styles

  `styles` — optional css properties that can be applied to each iframe.

  ~~~javascript
  -moz-appearance
  -moz-osx-font-smoothing
  -moz-tap-highlight-color
  -moz-transition
  -webkit-appearance
  -webkit-font-smoothing
  -webkit-tap-highlight-color
  -webkit-transition
  -webkit-box-shadow
  -webkit-text-fill-color
  background-color
  appearance
  color
  direction
  font
  font-family
  font-size
  font-size-adjust
  font-stretch
  font-style
  font-variant
  font-variant-alternates
  font-variant-caps
  font-variant-east-asian
  font-variant-ligatures
  font-variant-numeric
  font-weight
  letter-spacing
  line-height
  opacity
  outline
  text-shadow
  transition
  ~~~


### On Event

Custom user events.

~~~javascript
firstdata.paymentFields
  .on(event, (res) => { 
    console.log(res);
  });
~~~

* event — string — `focus|blur|change|cardType`

### Form Validity State

~~~javascript
firstdata.paymentFields
  .isFormValid()
  .then((res) => {
    if (res.error) {
      throw new Error('form not valid');
    } else {
      return res;
    }
  });
~~~

### Tokenize

Encrypts iframes and submits tokenization request to PaymentJS server.

~~~javascript
firstdata.paymentFields
  .tokenize(clientToken)
  .then((res) => { 
    console.log(res);
  });
~~~

* clientToken — required — response value received from merchants server side api call to `https://prod.paymentjs.firstdata.com/merchant/authorize-client`.

### Get State

~~~javascript
firstdata.paymentFields
  .getState()
  .then((res) => { 
    console.log(res);
  });
~~~

### Reset

Resets payment field state and css behavioral classes.

~~~javascript
firstdata.paymentFields
  .reset()
  .then((res) => { 
    console.log(res);
  });
~~~

### Destroy

Removes iframes from dom.

~~~javascript
firstdata.paymentFields
  .destroy()
  .then((res) => { 
    console.log(res);
  });
~~~


## Browsers

PaymentJS is dependent on crypto for RSA encryption.
