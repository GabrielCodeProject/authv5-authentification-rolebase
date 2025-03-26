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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## usefull documentation used or knowledge learned

server action vs api route
https://www.youtube.com/watch?v=RadgkoJrhu0
https://www.youtube.com/watch?v=kIhdI9Fsp-w
server action use to mutation and not recommanded pour faire des query de donner (data fetching)
car elle sont queued (process une actions a la fois)
donc si tu appel 3 fois fetchRandomNumber qui est la meme fonction
il va avoir un delais entre chaque appel car il attend la reponse de la derniere appel avant dexecuter la prochaine
designed for mutation only

api route elle va etre tous appeler en meme temps et avoir la reponse directement

other userfull tutoriel use to create this auth project part 1 to 4
https://www.youtube.com/watch?v=5a9yo09W4rQ

email verification with resend
https://www.youtube.com/watch?v=QyGJLm55EDk

feature a ajouter pour creation de post pour le blog avec AI
outil avec le ai permetant d'aider a trouver un sujet pour poster sur le blog
le ai va
formater le post pour que le sujet sois simple a comprendre.
le ai va demander a l'admin qui cree le post cest connaissance sur le sujet afin de mieu generer ca reponse
