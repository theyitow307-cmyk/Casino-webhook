const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Usar Webhook Secret de variable de entorno
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.use(bodyParser.json());

app.post('/api/nowpayments/webhook', (req, res) => {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-nowpayments-signature'];

    // Validar HMAC
    const hash = crypto.createHmac('sha512', WEBHOOK_SECRET)
                       .update(payload)
                       .digest('hex');

    if (hash !== signature) {
        console.log('Firma inválida');
        return res.status(403).send('Firma inválida');
    }

    // Leer datos del pago
    const { order_id, payment_status, price_amount, pay_address, payin_hash, pay_currency } = req.body;
    console.log(`Webhook recibido: ${order_id} - ${payment_status}`);

    // Lógica para Base44
    if (payment_status === 'finished') {
        console.log(`Acreditar ${price_amount} a usuario ${order_id}`);
        // TODO: actualizar saldo en Base44
    } else if (payment_status === 'failed') {
        console.log(`Depósito fallido para ${order_id}`);
        // TODO: marcar como fallido en Base44
    }

    // Responder 200 OK
    res.status(200).send('Webhook recibido');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
