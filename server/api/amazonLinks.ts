import { Router } from "express";

const router = Router();

const affiliateLinks: Record<string, { product: string; url: string }[]> = {
  skincare: [
    { product: "Mighty Patch", url: "https://www.amazon.com/dp/B07YPBX9Y7?tag=sgottshall199-20" },
  ],
  tech: [
    { product: "Apple Watch SE (2nd Gen)", url: "https://www.amazon.com/dp/B0BDJG949Z?tag=sgottshall199-20" },
  ],
  fashion: [
    { product: "Costaric Shirt Dress", url: "https://www.amazon.com/dp/B0BLC7S4JY?tag=sgottshall199-20" },
  ],
  fitness: [
    { product: "Hex Dumbbells", url: "https://www.amazon.com/dp/B074DY6VJ4?tag=sgottshall199-20" },
  ],
  kitchen: [
    { product: "8 QT Air Fryer", url: "https://www.amazon.com/dp/B0C6WR7M9M?tag=sgottshall199-20" },
  ],
  travel: [
    { product: "Packing Cubes Set", url: "https://www.amazon.com/dp/B01E7AVSKG?tag=sgottshall199-20" },
  ],
  pets: [
    { product: "Chik 'n Hide Twists", url: "https://www.amazon.com/dp/B01CPJ38RY?tag=sgottshall199-20" },
  ]
};

router.get("/", (req, res) => {
  const niche = req.query.niche?.toString().toLowerCase();

  if (!niche || !affiliateLinks[niche]) {
    return res.status(400).json({ error: "Invalid or missing niche parameter." });
  }

  res.json({ niche, links: affiliateLinks[niche] });
});

export const amazonLinksRouter = router;