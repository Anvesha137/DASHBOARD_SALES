exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('expenses', {
        product_link: { type: 'text' },
        invoice_url: { type: 'text' },
        expiry_date: { type: 'date' }
    });
};

exports.down = pgm => {
    pgm.dropColumns('expenses', ['product_link', 'invoice_url', 'expiry_date']);
};
