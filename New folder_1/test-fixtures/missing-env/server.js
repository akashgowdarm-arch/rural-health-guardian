const dbUrl = process.env.DATABASE_URL;
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not set in process.env');
}

console.log('Connected to database:', dbUrl);
