/* ============================================================
   CHECKOUT ADAPTER
   ------------------------------------------------------------
   The cart, totals, shipping form and validation are all live.
   Only the payment authorisation step is unwired.

   To connect a processor, replace the body of Processor.charge()
   below. It receives:
     order = {
       items:   [{sku, name, mg, qty, unitPrice, lineTotal}],
       subtotal, shipping, total,          // all in USD
       customer:{name,email,phone},
       ship:{line1,line2,city,state,zip,country},
       acknowledged: true
     }
   and must return a Promise resolving to
     { ok:true, reference:'<processor order id>' }
   or rejecting with an Error whose message is shown to the buyer.

   NOTE ON PROCESSORS: Stripe, PayPal, Square and Shopify Payments
   all prohibit research chemicals and peptides in their acceptable
   use policies. A high-risk merchant account is required for this
   category. Do not wire a prohibited processor — accounts in this
   category get frozen with the balance held.
   ============================================================ */

const Processor = {
  connected: false,

  async charge(order){
    if(!this.connected){
      throw new Error(
        'Online payment is not connected yet. Your order details have been saved below — ' +
        'send them to support@semprevivalabs.com or call (816) 641-7377 to complete the order.'
      );
    }
    /* ---- INTEGRATION POINT -------------------------------
       const res = await fetch('/api/checkout', {
         method:'POST',
         headers:{'Content-Type':'application/json'},
         body: JSON.stringify(order)
       });
       if(!res.ok) throw new Error(await res.text());
       return await res.json();      // { ok:true, reference:'...' }
       ------------------------------------------------------ */
  }
};

const Checkout = {
  buildOrder(form){
    const items = Cart.detailed().map(i=>({
      sku:i.sku, name:i.product.name, mg:i.mg,
      size: i.size.label || (i.mg + ' mg'),   // blends carry their real split
      qty:i.qty, unitPrice:i.size.price, lineTotal:i.line
    }));
    return {
      items,
      subtotal: Cart.subtotal(),
      shipping: Cart.shipping(),
      total: Cart.total(),
      customer:{ name:form.name, email:form.email, phone:form.phone },
      ship:{ line1:form.line1, line2:form.line2, city:form.city,
             state:form.state, zip:form.zip, country:'US' },
      acknowledged: form.ack,
      placedAt: new Date().toISOString()
    };
  },

  summarise(order){
    const L = [];
    L.push('ORDER — SempreViva Labs');
    L.push('Placed: ' + new Date(order.placedAt).toLocaleString());
    L.push('');
    order.items.forEach(i=>{
      L.push(`${i.qty} x  ${i.name}  ${i.size}   ${money(i.unitPrice)}   = ${money(i.lineTotal)}`);
    });
    L.push('');
    L.push('Subtotal  ' + money(order.subtotal));
    L.push('Shipping  ' + (order.shipping ? money(order.shipping) : 'Free'));
    L.push('Total     ' + money(order.total));
    L.push('');
    L.push(order.customer.name);
    L.push(order.customer.email + '  ' + order.customer.phone);
    L.push(order.ship.line1 + (order.ship.line2 ? ', ' + order.ship.line2 : ''));
    L.push(order.ship.city + ', ' + order.ship.state + ' ' + order.ship.zip);
    L.push('');
    L.push('Research use only acknowledged: yes');
    return L.join('\n');
  }
};
