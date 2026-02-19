
export const emailTemplates = {
  /**
   * EMAIL 1: ADMIN NOTIFICATION (NEW ORDER)
   */
  newOrder: (orderId: string, customerName: string, customerEmail: string, productQuery: { name: string, id: string, image_url: string, quantity: number, price: number }[], totalAmount: number, address: string) => {
    const productRows = productQuery.map(p => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; color: #333;">${p.name} <br> <span style="font-size: 12px; color: #777;">ID: ${p.id}</span></td>
        <td style="padding: 10px; color: #333; text-align: center;">${p.quantity}</td>
        <td style="padding: 10px; color: #333; text-align: right;">₹${p.price * p.quantity}</td>
      </tr>
    `).join('')

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin: 0;">New Order Received 🚀</h2>
            <p style="color: #7f8c8d; margin-top: 5px;">Order #${orderId}</p>
          </div>
          
          <div style="background-color: #e8f4fd; border-left: 4px solid #3498db; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #2980b9; font-weight: bold;">Action Required: Please review and confirm this order.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td colspan="2" style="padding: 10px 0; border-bottom: 2px solid #eee;">
                <h3 style="color: #333; margin: 0;">Customer Details</h3>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #555;"><strong>Name:</strong></td>
              <td style="padding: 10px 0; color: #333; text-align: right;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #555;"><strong>Email:</strong></td>
              <td style="padding: 10px 0; color: #333; text-align: right;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #555;"><strong>Address:</strong></td>
              <td style="padding: 10px 0; color: #333; text-align: right;">${address}</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left; color: #555;">Product</th>
                <th style="padding: 10px; text-align: center; color: #555;">Qty</th>
                <th style="padding: 10px; text-align: right; color: #555;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; color: #333;">Total Amount:</td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #27ae60;">₹${totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #95a5a6; font-size: 14px;">Buynic.shop Automated System</p>
          </div>
        </div>
      </div>
    `
  },

  /**
   * EMAIL 2: CUSTOMER ORDER CONFIRMATION
   */
  /**
   * EMAIL 2: CUSTOMER ORDER CONFIRMATION
   */
  orderConfirmation: (customerName: string, orderId: string, totalAmount: number, products: { name: string, image_url: string, id: string, quantity: number, price: number }[]) => {
    const productList = products.map(p => `
      <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
        <img src="${p.image_url}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
        <div style="flex-grow: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333;">${p.name}</h4>
          <p style="margin: 0; font-size: 12px; color: #888;">ID: ${p.id}</p>
        </div>
        <div style="text-align: right;">
            <p style="margin: 0; color: #333; font-weight: bold;">₹${p.price * p.quantity}</p>
            <p style="margin: 0; font-size: 12px; color: #888;">Qty: ${p.quantity}</p>
        </div>
      </div>
    `).join('')

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #2c3e50; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">Order Confirmed! 🎉</h2>
        </div>
        
        <div style="padding: 30px;">
          <h3 style="color: #333; margin-top: 0;">Hi ${customerName},</h3>
          <p style="color: #555; line-height: 1.6;">
            Thank you for confirming your order with us! We are excited to verify that your order <strong>#${orderId}</strong> has been successfully placed.
          </p>
          <p style="color: #555; line-height: 1.6;">
            Our team has started processing your items for delivery. You can track the status in your orders page.
          </p>

          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #555; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;">Order Summary</h4>
            ${productList}
            
            <div style="border-top: 2px solid #ddd; margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #555; font-weight: bold;">Total Amount (Tax incl.):</span>
                <span style="color: #2c3e50; font-size: 18px; font-weight: bold;">₹${totalAmount}</span>
            </div>

            <div style="margin-top: 15px; text-align: right;">
              <span style="background-color: #27ae60; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">STATUS: ORDERED</span>
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #333; font-weight: bold; margin: 0;">Team Buynic</p>
            <p style="color: #777; font-size: 14px; margin: 5px 0 0 0;"><a href="https://buynic.shop" style="color: #3498db; text-decoration: none;">www.buynic.shop</a></p>
          </div>
        </div>
      </div>
    `
  },

  /**
   * EMAIL 3: ORDER DELIVERED
   */
  orderCancelled: (customerName: string, orderId: string, products: { name: string, image_url: string, id: string }[]) => {
    const productList = products.map(p => `
        <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
            <img src="${p.image_url}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
            <div>
            <h4 style="margin: 0 0 5px 0; color: #333;">${p.name}</h4>
         </div>
        </div>
        `).join('')

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="background-color: #e74c3c; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">Order Cancelled</h2>
            </div>
            
            <div style="padding: 30px;">
            <h3 style="color: #333; margin-top: 0;">Hi ${customerName},</h3>
            <p style="color: #555; line-height: 1.6;">
                We are sorry to inform you that your order <strong>#${orderId}</strong> has been cancelled due to an unforeseen issue at our fulfillment center.
            </p>
            <p style="color: #555; line-height: 1.6;">
                 We sincerely apologize for this inconvenience. Please feel free to browse our store and place a new order at your convenience.
            </p>

            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="margin-top: 0; color: #555; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;">Cancelled Items</h4>
                ${productList}
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #333; font-weight: bold; margin: 0;">Team Buynic</p>
                <p style="color: #777; font-size: 14px; margin: 5px 0 0 0;"><a href="https://buynic.shop" style="color: #3498db; text-decoration: none;">www.buynic.shop</a></p>
            </div>
            </div>
        </div>
        `
  }
}
