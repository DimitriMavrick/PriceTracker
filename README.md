This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

docker-compose logs -f app

# Stop containers
docker-compose down

# Rebuild and start
docker-compose up --build


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


GET http://localhost:3000/prices

Response:
{
    "data": [
        {
            "token": "ETH",
            "price": 3500.25,
            "timestamp": "2024-03-27T10:35:00.000Z"
        },
        {
            "token": "MATIC",
            "price": 0.85,
            "timestamp": "2024-03-27T10:35:00.000Z"
        }
    ]
}


GET http://localhost:3000/prices/hourly

Response:
{
    "data": [
        {
            "token": "ETH",
            "hour": "2024-03-27T10:00:00.000Z",
            "avg_price": 3500.25
        },
        {
            "token": "MATIC",
            "hour": "2024-03-27T10:00:00.000Z",
            "avg_price": 0.85
        }
        // ... more hourly data
    ]
}

GET http://localhost:3000/prices/swap-rate?amount=1

Response:
{
    "input": {
        "amount": 1,
        "currency": "ETH"
    },
    "output": {
        "amount": "0.05923451",
        "currency": "BTC"
    },
    "exchangeRates": {
        "ETH_USD": "3500.25",
        "BTC_USD": "59084.30"
    },
    "fees": {
        "percentage": "0.03%",
        "eth": "0.000300",
        "usd": "1.05"
    },
    "timestamp": "2024-03-27T10:35:00.000Z"
}

POST http://localhost:3000/alerts

Headers:
Content-Type: application/json

Body:
{
    "token": "ETH",
    "targetPrice": 3000,
    "email": "your-email@example.com"
}

Response:
{
    "id": 1,
    "token": "ETH",
    "target_price": 3000,
    "email": "your-email@example.com",
    "created_at": "2024-03-27T10:30:00.000Z"
}

GET http://localhost:3000/alerts?email=your-email@example.com

Response:
{
    "data": [
        {
            "id": 1,
            "token": "ETH",
            "target_price": 3000,
            "email": "your-email@example.com",
            "created_at": "2024-03-27T10:30:00.000Z"
        }
        // ... more alerts
    ]
}